import { users, type User, type InsertUser, wallets, type Wallet, type InsertWallet, nfts, type NFT, type InsertNft } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;

  // NFT operations
  getNFT(id: number): Promise<NFT | undefined>;
  getNFTsByCreator(creatorId: number): Promise<NFT[]>;
  createNFT(nft: InsertNft): Promise<NFT>;
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

  constructor() {
    this.usersData = new Map();
    this.walletsData = new Map();
    this.nftsData = new Map();
    this.currentUserId = 1;
    this.currentWalletId = 1;
    this.currentNftId = 1;

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
      profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=future_artist",
    });

    const artist3 = this.createUser({
      username: "pixel_master",
      profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=pixel_master",
    });

    const artist4 = this.createUser({
      username: "neon_walker",
      profileImage: "https://api.dicebear.com/7.x/initials/svg?seed=neon_walker",
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
      description: "An exploration of geometric shapes and neon colors in digital space. This piece represents the intersection of mathematics and art.",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist1.id,
      walletAddress: wallet1.publicKey,
      metadata: { name: "Geometric Dreams" },
      tokenId: "sample_token_1",
      featured: 1,
    });

    this.createNFT({
      title: "Cyber City 2077",
      description: "A futuristic cityscape inspired by cyberpunk aesthetics and sci-fi visions of tomorrow. Each building tells a story of the future.",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist2.id,
      walletAddress: wallet2.publicKey,
      metadata: { name: "Cyber City 2077" },
      tokenId: "sample_token_2",
      featured: 1,
    });

    this.createNFT({
      title: "Retro Pixel Hero",
      description: "A colorful pixel art character inspired by retro gaming aesthetic. This nostalgic piece brings back memories of 8-bit adventures.",
      imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist3.id,
      walletAddress: wallet3.publicKey,
      metadata: { name: "Retro Pixel Hero" },
      tokenId: "sample_token_3",
      featured: 1,
    });

    this.createNFT({
      title: "Dreamscape",
      description: "A surreal digital painting featuring dreamlike elements and flowing composition. Enter a world where reality bends to imagination.",
      imageUrl: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist1.id,
      walletAddress: wallet1.publicKey,
      metadata: { name: "Dreamscape" },
      tokenId: "sample_token_4",
      featured: 1,
    });

    this.createNFT({
      title: "Neon Horizon",
      description: "A vibrant landscape with glowing neon elements inspired by synthwave aesthetics and retro-futuristic dreams.",
      imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist4.id,
      walletAddress: wallet4.publicKey,
      metadata: { name: "Neon Horizon" },
      tokenId: "sample_token_9",
      featured: 1,
    });

    this.createNFT({
      title: "Cosmic Journey",
      description: "An artistic interpretation of deep space with swirling galaxies and nebulae. A meditation on our place in the universe.",
      imageUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist5.id,
      walletAddress: wallet5.publicKey,
      metadata: { name: "Cosmic Journey" },
      tokenId: "sample_token_10",
      featured: 1,
    });

    this.createNFT({
      title: "Digital Forest",
      description: "A peaceful virtual forest with data trees and binary leaves. Nature reimagined through the lens of technology.",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist3.id,
      walletAddress: wallet3.publicKey,
      metadata: { name: "Digital Forest" },
      tokenId: "sample_token_11",
      featured: 1,
    });

    this.createNFT({
      title: "Abstract Emotions",
      description: "A series of abstract shapes and colors representing the full spectrum of human emotions. Each viewer may find different meanings.",
      imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist2.id,
      walletAddress: wallet2.publicKey,
      metadata: { name: "Abstract Emotions" },
      tokenId: "sample_token_12",
      featured: 1,
    });

    this.createNFT({
      title: "Virtual Sculpture",
      description: "A 3D sculpture that could never exist in physical space due to impossible geometries. Digital art breaks the rules of reality.",
      imageUrl: "https://images.unsplash.com/photo-1559030623-0226b1241edd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist5.id,
      walletAddress: wallet5.publicKey,
      metadata: { name: "Virtual Sculpture" },
      tokenId: "sample_token_13",
      featured: 1,
    });

    // Sample NFTs - New
    this.createNFT({
      title: "Minimal Shapes",
      description: "A minimalist digital artwork with bold lines and shapes. Simplicity speaks volumes in this careful composition.",
      imageUrl: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist2.id,
      walletAddress: wallet2.publicKey,
      metadata: { name: "Minimal Shapes" },
      tokenId: "sample_token_5",
      featured: 0,
    });

    this.createNFT({
      title: "Digital Sculpture #42",
      description: "A 3D rendered abstract sculpture in vibrant colors. Digital techniques bring this impossible form to life.",
      imageUrl: "https://images.unsplash.com/photo-1633109741715-f64664cf9b7f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist3.id,
      walletAddress: wallet3.publicKey,
      metadata: { name: "Digital Sculpture #42" },
      tokenId: "sample_token_6",
      featured: 0,
    });

    this.createNFT({
      title: "Flow State",
      description: "A colorful generative art piece with flowing patterns created through algorithmic processes and artistic direction.",
      imageUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist1.id,
      walletAddress: wallet1.publicKey,
      metadata: { name: "Flow State" },
      tokenId: "sample_token_7",
      featured: 0,
    });

    this.createNFT({
      title: "Digital Collage #7",
      description: "A digital collage combining photography and abstract elements. The juxtaposition creates new meanings and interpretations.",
      imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist2.id,
      walletAddress: wallet2.publicKey,
      metadata: { name: "Digital Collage #7" },
      tokenId: "sample_token_8",
      featured: 0,
    });

    this.createNFT({
      title: "Cybernetic Dreams",
      description: "An exploration of the relationship between humans and technology in a digitized future where the boundaries blur.",
      imageUrl: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800",
      creator: artist4.id,
      walletAddress: wallet4.publicKey,
      metadata: { name: "Cybernetic Dreams" },
      tokenId: "sample_token_14",
      featured: 0,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.usersData.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersData.values());
  }

  // Wallet operations
  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.walletsData.get(id);
  }

  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.walletsData.values()).find(
      (wallet) => wallet.userId === userId,
    );
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.currentWalletId++;
    const createdAt = new Date();
    const wallet: Wallet = { ...insertWallet, id, createdAt };
    this.walletsData.set(id, wallet);
    return wallet;
  }

  // NFT operations
  async getNFT(id: number): Promise<NFT | undefined> {
    return this.nftsData.get(id);
  }

  async getNFTsByCreator(creatorId: number): Promise<NFT[]> {
    return Array.from(this.nftsData.values()).filter(
      (nft) => nft.creator === creatorId,
    );
  }

  async createNFT(insertNft: InsertNft & { featured?: number }): Promise<NFT> {
    const id = this.currentNftId++;
    const mintDate = new Date();
    const views = 0;
    const featured = (insertNft as any).featured ?? 0;
    const nft: NFT = { 
      ...insertNft, 
      id, 
      mintDate, 
      views, 
      featured, 
      isMinted: (insertNft as any).isMinted ?? 0 
    };
    this.nftsData.set(id, nft);
    return nft;
  }

  async getFeaturedNFTs(): Promise<NFT[]> {
    return Array.from(this.nftsData.values()).filter(
      (nft) => nft.featured === 1,
    );
  }

  async getNewNFTs(): Promise<NFT[]> {
    // Get all NFTs sorted by mint date (newest first)
    return Array.from(this.nftsData.values())
      .sort((a, b) => b.mintDate.getTime() - a.mintDate.getTime());
  }

  async incrementNFTViews(id: number): Promise<void> {
    const nft = this.nftsData.get(id);
    if (nft) {
      nft.views += 1;
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
    
    // Reset IDs
    this.currentUserId = 1;
    this.currentWalletId = 1;
    this.currentNftId = 1;
    
    // Reinitialize
    this.initSampleData();
    
    // Check featured NFTs
    const featuredNfts = await this.getFeaturedNFTs();
    console.log(`After reinitialization: Found ${featuredNfts.length} featured NFTs`);
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
