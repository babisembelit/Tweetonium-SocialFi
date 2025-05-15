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
  
  if (!bearerToken) {
    log('Twitter API bearer token not configured', 'warning');
    // Return a dummy token for development if missing
    return { bearerToken: 'DUMMY_TOKEN_FOR_DEVELOPMENT' };
  }
  
  return { bearerToken };
};

/**
 * Search for recent mentions of our Tweetonium handle
 */
export async function searchRecentMentions(): Promise<any[]> {
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
    
    // Make the API request to Twitter
    const response = await axios.get(
      `${API_BASE_URL}/tweets/search/recent?${queryParams}&tweet.fields=created_at,author_id,entities&expansions=author_id&user.fields=username,profile_image_url`,
      {
        headers: {
          'Authorization': `Bearer ${config.bearerToken}`
        }
      }
    );
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching Twitter mentions:', error);
    log('Failed to fetch Twitter mentions', 'error');
    return [];
  }
}

/**
 * Process tweets mentioning Tweetonium and mint NFTs
 */
export async function processTweetMentions(): Promise<void> {
  try {
    log('Checking for new X/Twitter mentions...', 'info');
    const tweets = await searchRecentMentions();
    
    if (tweets.length === 0) {
      log('No new mentions found', 'info');
      return;
    }
    
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
        
        // Get or create the user
        let user = await storage.getUserByTwitterId(tweet.author_id);
        if (!user) {
          // Create a new user based on Twitter info
          const twitterUser = tweet.includes?.users?.find((u: any) => u.id === tweet.author_id) || {
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
        
        // Prepare NFT metadata
        const metadata = createNFTMetadata({
          title: `Tweet by @${user.username}`,
          description: tweet.text,
          imageUrl: tweet.entities?.media?.[0]?.url || 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb',
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

/**
 * Get mock tweets for development/demo purposes
 */
function getMockTweets(): any[] {
  const mockTweets = [
    {
      id: 'mock_tweet_' + Date.now(),
      text: 'Check out this amazing digital art I created! @tweetonium_xyz mint this for me! #NFT #DigitalArt',
      author_id: 'mock_user_1',
      created_at: new Date().toISOString(),
      entities: {
        media: [
          { url: 'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5' }
        ]
      },
      includes: {
        users: [
          {
            id: 'mock_user_1',
            username: 'creativedigitalartist',
            profile_image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
          }
        ]
      }
    }
  ];
  
  return mockTweets;
}