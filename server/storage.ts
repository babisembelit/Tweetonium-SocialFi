import {
  users,
  type User,
  type InsertUser,
  wallets,
  type Wallet,
  type InsertWallet,
  nfts,
  type NFT,
  type InsertNft,
} from "@shared/schema";
import { json } from "drizzle-orm/pg-core";

type Json = ReturnType<typeof json>;

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTwitterId(twitterId: string): Promise<User | undefined>;
  createUser(user: InsertUser & { twitterId?: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  createWalletForUser(userId: number): Promise<Wallet>;

  // NFT operations
  getNFT(id: number): Promise<NFT | undefined>;
  getNFTsByCreator(creatorId: number): Promise<NFT[]>;
  getNFTsByTweetId(tweetId: string): Promise<NFT[]>;
  createNFT(
    nft: InsertNft & { tweetId?: string; featured?: number },
  ): Promise<NFT>;
  getFeaturedNFTs(): Promise<NFT[]>;
  getNewNFTs(): Promise<NFT[]>;
  incrementNFTViews(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  // Making these properties protected to allow our reset function to access them
  protected usersData: Map<number, User>;
  protected walletsData: Map<number, Wallet>;
  protected nftsData: Map<number, NFT>;
  protected currentUserId: number;
  protected currentWalletId: number;
  protected currentNftId: number;

  // Additional indexes for quick lookups
  protected usernameToUserMap: Map<string, number>; // username -> userId
  protected twitterIdToUserMap: Map<string, number>; // twitterId -> userId
  protected userToWalletMap: Map<number, number>; // userId -> walletId
  protected tweetToNftMap: Map<string, number[]>; // tweetId -> nftIds
  protected creatorToNftMap: Map<number, number[]>; // creatorId -> nftIds

  constructor() {
    this.usersData = new Map();
    this.walletsData = new Map();
    this.nftsData = new Map();
    this.currentUserId = 1;
    this.currentWalletId = 1;
    this.currentNftId = 1;

    // Initialize indexes
    this.usernameToUserMap = new Map();
    this.twitterIdToUserMap = new Map();
    this.userToWalletMap = new Map();
    this.tweetToNftMap = new Map();
    this.creatorToNftMap = new Map();

    // Initialize with sample data for demo purposes
    this.initSampleData();
  }

  initSampleData() {
    // Sample artists
    const artist1 = this.createUser({
      username: "artist_one",
      profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=artist_one",
    });

    const artist2 = this.createUser({
      username: "future_artist",
      profileImage:
        "https://api.dicebear.com/7.x/initials/svg?seed=future_artist",
    });

    const artist3 = this.createUser({
      username: "pixel_master",
      profileImage:
        "https://api.dicebear.com/7.x/initials/svg?seed=pixel_master",
    });

    const artist4 = this.createUser({
      username: "neon_walker",
      profileImage:
        "https://api.dicebear.com/7.x/initials/svg?seed=neon_walker",
    });

    const artist5 = this.createUser({
      username: "cosmos_dev",
      profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=cosmos_dev",
    });

    // Sample wallets
    const wallet1 = this.createWallet({
      userId: artist1.id,
      publicKey: "8Kd7dKnfeNqXcZGPqp5VXsXQdvsMPi7N3EwCmXKFNdPP",
      privateKey: "sample_private_key_1",
    });

    const wallet2 = this.createWallet({
      userId: artist2.id,
      publicKey: "5ZVJtqPNYW2jcsTvhy3MLabyDaJUvGzjAR1Zcwde6MkX",
      privateKey: "sample_private_key_2",
    });

    const wallet3 = this.createWallet({
      userId: artist3.id,
      publicKey: "HN9FFGGQAhLPY6QQP5Xq9Hm42JFSPrQZSjz4yrpKBL1D",
      privateKey: "sample_private_key_3",
    });

    const wallet4 = this.createWallet({
      userId: artist4.id,
      publicKey: "JH8FFBcQMpTrF6AAP5cw9Hn24JGSPrQZzzj4yrZkBL7F",
      privateKey: "sample_private_key_4",
    });

    const wallet5 = this.createWallet({
      userId: artist5.id,
      publicKey: "6YJKtqPNEW2jdsTUgy7RLzbyDaJFvGpjZW1Adwde9MzA",
      privateKey: "sample_private_key_5",
    });

    // Sample NFTs - Featured
    this.createNFT({
      title: "Geometric Dreams",
      description:
        "An exploration of geometric shapes and neon colors in digital space. This piece represents the intersection of mathematics and art.",
      imageUrl:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist1.id,
      walletAddress: wallet1.publicKey,
      metadata: { name: "Geometric Dreams" } as any,
      tokenId: "sample_token_1",
      featured: 1,
      floorPrice: "2.45",
    });

    this.createNFT({
      title: "Cyber City 2077",
      description:
        "A futuristic cityscape inspired by cyberpunk aesthetics and sci-fi visions of tomorrow. Each building tells a story of the future.",
      imageUrl:
        "https://images.unsplash.com/photo-1622737133809-d95047b9e673?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist2.id,
      walletAddress: wallet2.publicKey,
      metadata: { name: "Cyber City 2077" } as any,
      tokenId: "sample_token_2",
      featured: 1,
      floorPrice: "5.89",
    });

    // More featured NFTs
    this.createNFT({
      title: "Digital Dreamscape",
      description:
        "A surreal landscape that blends digital and natural elements into a dreamlike scene. The boundaries between reality and imagination blur in this piece.",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist3.id,
      walletAddress: wallet3.publicKey,
      metadata: { name: "Digital Dreamscape" } as any,
      tokenId: "sample_token_3",
      featured: 1,
      floorPrice: "1.24",
    });

    this.createNFT({
      title: "Abstract Reality",
      description:
        "An abstract exploration of form, color, and texture that challenges perceptions of reality. The piece invites viewers to find their own meaning.",
      imageUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist4.id,
      walletAddress: wallet4.publicKey,
      metadata: { name: "Abstract Reality" } as any,
      tokenId: "sample_token_4",
      featured: 1,
      floorPrice: "2.76",
    });

    this.createNFT({
      title: "Neon Genesis",
      description:
        "A vibrant explosion of neon colors and geometric forms that pays homage to the aesthetics of 80s cyberpunk and anime visuals.",
      imageUrl:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist5.id,
      walletAddress: wallet5.publicKey,
      metadata: { name: "Neon Genesis" } as any,
      tokenId: "sample_token_5",
      featured: 1,
      floorPrice: "7.12",
    });

    // Sample NFTs - New Releases (not featured)
    this.createNFT({
      title: "Quantum Pixels",
      description:
        "A digital exploration of quantum mechanics visualized through pixel art. Each pixel represents a potential quantum state.",
      imageUrl:
        "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist1.id,
      walletAddress: wallet1.publicKey,
      metadata: { name: "Quantum Pixels" } as any,
      tokenId: "sample_token_6",
      featured: 0,
      floorPrice: "0.89",
    });

    this.createNFT({
      title: "Digital Renaissance",
      description:
        "A modern reinterpretation of Renaissance art using digital techniques. Classical forms meet contemporary aesthetics.",
      imageUrl:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist2.id,
      walletAddress: wallet2.publicKey,
      metadata: { name: "Digital Renaissance" } as any,
      tokenId: "sample_token_7",
      featured: 0,
      floorPrice: "1.55",
    });

    this.createNFT({
      title: "Pixel Dreams",
      description:
        "A nostalgic journey through pixel art that celebrates the visual aesthetics of early computer graphics and video games.",
      imageUrl:
        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist3.id,
      walletAddress: wallet3.publicKey,
      metadata: { name: "Pixel Dreams" } as any,
      tokenId: "sample_token_8",
      featured: 0,
      floorPrice: "3.21",
    });

    this.createNFT({
      title: "Virtual Horizons",
      description:
        "An expansive digital landscape that explores the horizon between reality and virtual existence. The future meets the present in this piece.",
      imageUrl:
        "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist4.id,
      walletAddress: wallet4.publicKey,
      metadata: { name: "Virtual Horizons" } as any,
      tokenId: "sample_token_9",
      featured: 0,
      floorPrice: "4.33",
    });

    this.createNFT({
      title: "Cosmic Algorithm",
      description:
        "A visual representation of cosmic algorithms and patterns found in nature, rendered as digital art. The piece connects the microscopic with the astronomical.",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160588-241658c0f566?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist5.id,
      walletAddress: wallet5.publicKey,
      metadata: { name: "Cosmic Algorithm" } as any,
      tokenId: "sample_token_10",
      featured: 1,
      floorPrice: "6.78",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Use the index for faster lookup if available
    const userId = this.usernameToUserMap.get(username);
    if (userId !== undefined) {
      return this.usersData.get(userId);
    }

    // Fallback to iterating if not in index
    for (const user of this.usersData.values()) {
      if (user.username === username) {
        // Update the index for future lookups
        this.usernameToUserMap.set(user.username, user.id);
        return user;
      }
    }
    return undefined;
  }

  async getUserByTwitterId(twitterId: string): Promise<User | undefined> {
    // Use the index for faster lookup if available
    const userId = this.twitterIdToUserMap.get(twitterId);
    if (userId !== undefined) {
      return this.usersData.get(userId);
    }

    // Fallback to iterating if not in index
    for (const user of this.usersData.values()) {
      if (user.twitterId === twitterId) {
        // Update the index for future lookups
        this.twitterIdToUserMap.set(twitterId, user.id);
        return user;
      }
    }
    return undefined;
  }

  async createUser(
    insertUser: InsertUser & { twitterId?: string },
  ): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = {
      id,
      username: insertUser.username,
      profileImage: insertUser.profileImage || null,
      twitterId: insertUser.twitterId || null,
      createdAt,
    };

    this.usersData.set(id, user);

    // Update indexes
    this.usernameToUserMap.set(user.username, id);
    if (user.twitterId) {
      this.twitterIdToUserMap.set(user.twitterId, id);
    }

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.walletsData.get(id);
  }

  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    // Use the index for faster lookup if available
    const walletId = this.userToWalletMap.get(userId);
    if (walletId !== undefined) {
      return this.walletsData.get(walletId);
    }

    // Fallback to iterating if not in index
    for (const wallet of this.walletsData.values()) {
      if (wallet.userId === userId) {
        // Update the index for future lookups
        this.userToWalletMap.set(userId, wallet.id);
        return wallet;
      }
    }
    return undefined;
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.currentWalletId++;
    const createdAt = new Date();
    const wallet: Wallet = {
      id,
      userId: insertWallet.userId,
      publicKey: insertWallet.publicKey,
      privateKey: insertWallet.privateKey,
      createdAt,
    };

    this.walletsData.set(id, wallet);

    // Update the index
    this.userToWalletMap.set(wallet.userId, id);

    return wallet;
  }

  async createWalletForUser(userId: number): Promise<Wallet> {
    // Check if user exists
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Check if user already has a wallet
    const existingWallet = await this.getWalletByUserId(userId);
    if (existingWallet) {
      return existingWallet;
    }

    // Generate a simple wallet (in a real app, this would call the Solana API)
    // Here we're just using a random public/private key pair for demo
    const publicKey = `wallet_${Math.random().toString(36).substring(2, 15)}`;
    const privateKey = `private_${Math.random().toString(36).substring(2, 15)}`;

    // Create and store the wallet
    const wallet = await this.createWallet({
      userId,
      publicKey,
      privateKey,
    });

    return wallet;
  }

  async getNFT(id: number): Promise<NFT | undefined> {
    return this.nftsData.get(id);
  }

  async getNFTsByCreator(creatorId: number): Promise<NFT[]> {
    // Use the index for faster lookup if available
    const nftIds = this.creatorToNftMap.get(creatorId);
    if (nftIds && nftIds.length > 0) {
      return nftIds.map((id) => this.nftsData.get(id)).filter(Boolean) as NFT[];
    }

    // Fallback to iterating if not in index
    const result: NFT[] = [];
    for (const nft of this.nftsData.values()) {
      if (nft.creator === creatorId) {
        result.push(nft);

        // Update the index for future lookups
        if (!this.creatorToNftMap.has(creatorId)) {
          this.creatorToNftMap.set(creatorId, []);
        }
        if (!this.creatorToNftMap.get(creatorId)?.includes(nft.id)) {
          this.creatorToNftMap.get(creatorId)?.push(nft.id);
        }
      }
    }

    return result;
  }

  async getNFTsByTweetId(tweetId: string): Promise<NFT[]> {
    // Use the index for faster lookup if available
    const nftIds = this.tweetToNftMap.get(tweetId);
    if (nftIds && nftIds.length > 0) {
      return nftIds.map((id) => this.nftsData.get(id)).filter(Boolean) as NFT[];
    }

    // Fallback to iterating if not in index
    const result: NFT[] = [];
    for (const nft of this.nftsData.values()) {
      if (nft.tweetId === tweetId) {
        result.push(nft);

        // Update the index for future lookups
        if (!this.tweetToNftMap.has(tweetId)) {
          this.tweetToNftMap.set(tweetId, []);
        }
        if (!this.tweetToNftMap.get(tweetId)?.includes(nft.id)) {
          this.tweetToNftMap.get(tweetId)?.push(nft.id);
        }
      }
    }

    return result;
  }

  async createNFT(
    insertNft: InsertNft & { featured?: number; tweetId?: string },
  ): Promise<NFT> {
    const id = this.currentNftId++;
    const mintDate = new Date();
    const nft: NFT = {
      id,
      title: insertNft.title,
      description: insertNft.description || null,
      imageUrl: insertNft.imageUrl,
      creator: insertNft.creator,
      walletAddress: insertNft.walletAddress,
      tokenId: insertNft.tokenId || null,
      tweetId: insertNft.tweetId || null,
      metadata: insertNft.metadata as any,
      mintDate,
      isMinted: insertNft.isMinted || 0,
      featured: insertNft.featured || 0,
      views: 0,
      transactions: insertNft.transactions || null,
      floorPrice: insertNft.floorPrice || null,
    };

    this.nftsData.set(id, nft);

    // Update indexes
    // Creator -> NFT index
    if (!this.creatorToNftMap.has(nft.creator)) {
      this.creatorToNftMap.set(nft.creator, []);
    }
    this.creatorToNftMap.get(nft.creator)?.push(id);

    // Tweet -> NFT index
    if (nft.tweetId) {
      if (!this.tweetToNftMap.has(nft.tweetId)) {
        this.tweetToNftMap.set(nft.tweetId, []);
      }
      this.tweetToNftMap.get(nft.tweetId)?.push(id);
    }

    return nft;
  }

  async getFeaturedNFTs(): Promise<NFT[]> {
    return Array.from(this.nftsData.values()).filter(
      (nft) => nft.featured === 1,
    );
  }

  async getNewNFTs(): Promise<NFT[]> {
    return Array.from(this.nftsData.values()).sort(
      (a, b) => b.mintDate.getTime() - a.mintDate.getTime(),
    );
  }

  async incrementNFTViews(id: number): Promise<void> {
    const nft = this.nftsData.get(id);
    if (nft) {
      nft.views = (nft.views || 0) + 1;
      this.nftsData.set(id, nft);
    }
  }
}

// Extend the MemStorage class to add reset functionality
class ResetableMemStorage extends MemStorage {
  async resetData() {
    console.log("Reinitializing sample data...");
    // Clear existing data
    this.usersData.clear();
    this.walletsData.clear();
    this.nftsData.clear();

    // Clear indexes
    this.usernameToUserMap.clear();
    this.twitterIdToUserMap.clear();
    this.userToWalletMap.clear();
    this.tweetToNftMap.clear();
    this.creatorToNftMap.clear();

    // Reset IDs
    this.currentUserId = 1;
    this.currentWalletId = 1;
    this.currentNftId = 1;

    // Reinitialize
    this.initSampleData();

    // Check featured NFTs
    const featuredNfts = await this.getFeaturedNFTs();
    console.log(
      `After reinitialization: Found ${featuredNfts.length} featured NFTs`,
    );
    return featuredNfts.length;
  }
}

// Initialize storage with sample data using the resettable storage
const storage = new ResetableMemStorage();

// Reset the data to ensure it's properly initialized
(async () => {
  try {
    await (storage as ResetableMemStorage).resetData();
  } catch (error) {
    console.error("Error initializing storage:", error);
  }
})();

export { storage };
