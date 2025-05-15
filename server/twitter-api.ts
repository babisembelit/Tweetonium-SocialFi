/**
 * Twitter/X API integration module
 * Uses Free X API v2 to periodically check for mentions of the Tweetonium account
 */

import axios from 'axios';
import { storage } from './storage';
import { createNFTMetadata, prepareLazyMint, mintNFT } from './solana';
import { formatISO } from 'date-fns';
import { log } from './vite';

// Base configuration for Twitter API v2
const API_BASE_URL = 'https://api.twitter.com/2';
const TWEETONIUM_USERNAME = 'tweetonium_xyz'; // Replace with actual handle if different
let LAST_CHECK_TIME: string | null = null;

// API key configuration - use environment variables in production
interface TwitterAPIConfig {
  bearerToken: string;
}

const getTwitterConfig = (): TwitterAPIConfig => {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  // Use real Twitter API if token is available
  
  if (!bearerToken) {
    log('Twitter API bearer token not configured', 'warning');
    // Return a dummy token for development if missing
    return { bearerToken: 'DUMMY_TOKEN_FOR_DEVELOPMENT' };
  }
  
  return { bearerToken: bearerToken || '' };
};

/**
 * Search for recent mentions of our Tweetonium handle
 */
export async function searchRecentMentions(): Promise<TwitterAPIResponse> {
  try {
    const config = getTwitterConfig();
    
    // For development/demo, return mock data if no token is available
    if (config.bearerToken === 'DUMMY_TOKEN_FOR_DEVELOPMENT') {
      log('Using mock Twitter data (no API token configured)', 'warning');
      return getMockTweets();
    }
    
    // Construct the search query to find tweets mentioning our handle
    const query = `@${TWEETONIUM_USERNAME}`;
    
    // Add time constraint if this isn't the first check
    let queryParams = `query=${encodeURIComponent(query)}&max_results=10`;
    if (LAST_CHECK_TIME) {
      queryParams += `&start_time=${encodeURIComponent(LAST_CHECK_TIME)}`;
    }
    
    // Update the last check time for next time
    LAST_CHECK_TIME = new Date().toISOString();
    
    // Make the API request to Twitter with media expansions
    const response = await axios.get(
      `${API_BASE_URL}/tweets/search/recent?${queryParams}&tweet.fields=created_at,author_id,entities,attachments&expansions=author_id,attachments.media_keys&user.fields=username,profile_image_url&media.fields=url,preview_image_url,type`,
      {
        headers: {
          'Authorization': `Bearer ${config.bearerToken}`
        }
      }
    );
    
    if (response.data && response.data.data) {
      // Return full response object to access media and includes
      return response.data;
    }
    
    // For development, check if we should use mock data
    if (config.bearerToken === 'DUMMY_TOKEN_FOR_DEVELOPMENT') {
      return getMockTweets();
    }
    
    return { data: [], includes: { users: [], media: [] } };
  } catch (error) {
    console.error('Error searching Twitter mentions:', error);
    log('Failed to fetch Twitter mentions', 'error');
    
    // For development, use mock data if API fails
    if (getTwitterConfig().bearerToken === 'DUMMY_TOKEN_FOR_DEVELOPMENT') {
      return getMockTweets();
    }
    
    return { data: [], includes: { users: [], media: [] } };
  }
}

/**
 * Extract title and description from tweet text
 * Parses for patterns like #title or uses smart extraction
 */
function extractMetadataFromText(text: string): { title: string, description: string } {
  // Remove the @tweetonium_xyz mention
  const cleanText = text.replace(/@tweetonium_xyz/gi, '').trim();
  
  // Check for explicit title/description format
  const titleMatch = cleanText.match(/#title\s+([^\n#]+)/i);
  const descMatch = cleanText.match(/#description\s+([^\n#]+)/i);
  
  if (titleMatch && descMatch) {
    return {
      title: titleMatch[1].trim(),
      description: descMatch[1].trim()
    };
  }
  
  // Check for "Title: X | Description: Y" format
  const formatMatch = cleanText.match(/Title:\s*([^|]+)\s*\|\s*Description:\s*(.+)/i);
  if (formatMatch) {
    return {
      title: formatMatch[1].trim(),
      description: formatMatch[2].trim()
    };
  }
  
  // Smart extraction - first sentence as title, rest as description
  const sentences = cleanText.split(/[.!?]/).filter(s => s.trim().length > 0);
  
  if (sentences.length >= 2) {
    return {
      title: sentences[0].trim(),
      description: sentences.slice(1).join('. ').trim()
    };
  }
  
  // If all else fails, use the whole text as both title and description
  return {
    title: cleanText.substring(0, Math.min(50, cleanText.length)) + (cleanText.length > 50 ? '...' : ''),
    description: cleanText
  };
}

/**
 * Process tweets mentioning Tweetonium and mint NFTs
 */
export async function processTweetMentions(): Promise<void> {
  try {
    log('Checking for new X/Twitter mentions...', 'info');
    const response = await searchRecentMentions();
    
    if (!response.data || response.data.length === 0) {
      log('No new mentions found', 'info');
      return;
    }
    
    const tweets = response.data;
    log(`Found ${tweets.length} mentions to process`, 'info');
    
    // Process each tweet that mentions us
    for (const tweet of tweets) {
      try {
        // Check if this tweet has already been processed
        const existingNFTs = await storage.getNFTsByTweetId(tweet.id);
        if (existingNFTs && existingNFTs.length > 0) {
          log(`Tweet ${tweet.id} already processed, skipping`, 'info');
          continue;
        }
        
        // Verify that tweet mentions @tweetonium_xyz
        if (!tweet.text.toLowerCase().includes('@tweetonium_xyz')) {
          log(`Tweet ${tweet.id} does not mention @tweetonium_xyz, skipping`, 'info');
          continue;
        }
        
        // Get or create the user
        let user = await storage.getUserByTwitterId(tweet.author_id);
        if (!user) {
          // Find the user in the includes section
          const twitterUser = response.includes?.users?.find((u: any) => u.id === tweet.author_id) || {
            username: 'user_' + tweet.author_id,
            profile_image_url: null
          };
          
          user = await storage.createUser({
            username: twitterUser.username,
            profileImage: twitterUser.profile_image_url,
            twitterId: tweet.author_id
          });
          
          // Create a wallet for this user
          await storage.createWalletForUser(user.id);
        }
        
        // Get user's wallet
        const wallet = await storage.getWalletByUserId(user.id);
        if (!wallet) {
          log(`No wallet found for user ${user.id}, skipping tweet`, 'error');
          continue;
        }
        
        // Extract image from tweet - REQUIRED for NFT creation
        let imageUrl = null;
        let imageFound = false;
        
        // Check for media attachments (primary method)
        if (tweet.attachments && tweet.attachments.media_keys) {
          const mediaKeys = tweet.attachments.media_keys;
          // Find the media in the includes section
          const mediaItems = response.includes?.media || [];
          
          // Find first image - ONLY accept photo type
          const mediaItem = mediaItems.find((m: any) => 
            mediaKeys.includes(m.media_key) && 
            m.type === 'photo'  // Strict photo requirement
          );
          
          if (mediaItem) {
            imageUrl = mediaItem.url || mediaItem.preview_image_url;
            imageFound = true;
            log(`Found attached image in tweet ${tweet.id}`, 'info');
          }
        }
        
        // If no image found, check entities for direct image URLs
        if (!imageUrl && tweet.entities && tweet.entities.urls) {
          // Look for explicit image URLs in the tweet
          const urlEntity = tweet.entities.urls.find((u: any) => 
            u.expanded_url && 
            (u.expanded_url.endsWith('.jpg') || 
             u.expanded_url.endsWith('.jpeg') || 
             u.expanded_url.endsWith('.png'))
          );
          
          if (urlEntity) {
            imageUrl = urlEntity.expanded_url;
            imageFound = true;
            log(`Found image URL in tweet ${tweet.id}`, 'info');
          }
        }
        
        // If no image found, skip this tweet - images are REQUIRED
        if (!imageUrl) {
          log(`No image found in tweet ${tweet.id}, skipping NFT creation`, 'warning');
          continue; // Skip to next tweet
        }
        
        // Extract title and description from tweet text
        const { title, description } = extractMetadataFromText(tweet.text);
        
        // Prepare NFT metadata
        const metadata = createNFTMetadata({
          title: title || `Tweet NFT by @${user.username}`,
          description: description || tweet.text,
          imageUrl: imageUrl,
          creator: user.username,
          attributes: [
            { trait_type: 'Tweet ID', value: tweet.id },
            { trait_type: 'Posted', value: tweet.created_at || new Date().toISOString() }
          ]
        });
        
        // Lazy mint the NFT
        const lazyMintResult = await prepareLazyMint({
          metadata,
          creatorId: user.id, 
          walletAddress: wallet.publicKey
        });
        
        // Create NFT record in our database as lazy minted (isMinted = 0)
        await storage.createNFT({
          title: metadata.name,
          description: metadata.description,
          imageUrl: metadata.image,
          creator: user.id,
          walletAddress: wallet.publicKey,
          tokenId: lazyMintResult.tokenId,
          tweetId: tweet.id,
          metadata: {
            ...metadata as any,
            metadataHash: lazyMintResult.metadataHash
          },
          featured: Math.random() > 0.5 ? 1 : 0, // Randomly feature some NFTs
          isMinted: 0, // 0 = lazy minted
          transactions: `Lazy minted on ${formatISO(new Date()).split("T")[0]}`
        });
        
        log(`Successfully minted NFT for tweet ${tweet.id} by @${user.username}`, 'info');
      } catch (tweetError) {
        console.error(`Error processing tweet ${tweet.id}:`, tweetError);
        log(`Failed to process tweet ${tweet.id}`, 'error');
      }
    }
    
    log('Finished processing Twitter mentions', 'info');
  } catch (error) {
    console.error('Error in processTweetMentions:', error);
    log('Failed to process Twitter mentions', 'error');
  }
}

/**
 * Start periodic checking for Twitter mentions
 * @param intervalMinutes How often to check for new mentions (in minutes)
 */
export function startPeriodicMentionChecking(intervalMinutes = 5): void {
  // Immediate first check
  processTweetMentions();
  
  // Set up periodic checking
  const intervalMs = intervalMinutes * 60 * 1000;
  setInterval(processTweetMentions, intervalMs);
  
  log(`Periodic Twitter mention checking started (every ${intervalMinutes} minutes)`, 'info');
}

// Define a response type for clarity
interface TwitterAPIResponse {
  data: Array<{
    id: string;
    text: string;
    author_id: string;
    created_at: string;
    attachments?: {
      media_keys: string[];
    };
    entities?: {
      urls?: Array<{
        expanded_url: string;
      }>;
    };
  }>;
  includes: {
    users: Array<{
      id: string;
      username: string;
      profile_image_url: string;
    }>;
    media?: Array<{
      media_key: string;
      type: string;
      url?: string;
      preview_image_url?: string;
    }>;
  };
}

/**
 * Get mock tweets for development/demo purposes
 * Includes examples of:
 * 1. Valid tweet with photo attachment
 * 2. Valid tweet with image URL
 * 3. Invalid tweet without image (will be skipped)
 */
function getMockTweets(): TwitterAPIResponse {
  const mockTweetId = 'mock_tweet_' + Date.now();
  const mockUserId = 'mock_user_1';
  const mediaKey = 'mock_media_1';
  
  return {
    data: [
      // Tweet 1: Valid with image attachment
      {
        id: mockTweetId,
        text: 'Title: My Amazing Digital Art | Description: Check out this amazing digital art I created! @tweetonium_xyz mint this for me! #NFT #DigitalArt',
        author_id: mockUserId,
        created_at: new Date().toISOString(),
        attachments: {
          media_keys: [mediaKey]
        }
      },
      // Tweet 2: Valid with direct image URL
      {
        id: 'mock_tweet_' + (Date.now() + 1),
        text: 'Just created this abstract piece! #title Abstract Dreams #description A journey through colors and shapes @tweetonium_xyz #NFT',
        author_id: mockUserId,
        created_at: new Date().toISOString(),
        entities: {
          urls: [
            { 
              expanded_url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead.jpg'
            }
          ]
        }
      },
      // Tweet 3: Invalid - no image (will be skipped by processor)
      {
        id: 'mock_tweet_' + (Date.now() + 2),
        text: 'Hey @tweetonium_xyz can you help me mint an NFT? I forgot to attach an image though.',
        author_id: mockUserId,
        created_at: new Date().toISOString()
        // No attachments or image URLs
      }
    ],
    includes: {
      users: [
        {
          id: mockUserId,
          username: 'creativedigitalartist',
          profile_image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
        }
      ],
      media: [
        {
          media_key: mediaKey,
          type: 'photo',
          url: 'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5',
          preview_image_url: 'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5'
        }
      ]
    }
  };
}