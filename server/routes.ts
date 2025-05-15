import express, { type Express, Router } from "express";
import multer from "multer";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { generateKeypair, createNFTMetadata } from "./solana";
import { formatISO } from "date-fns";
import path from "path";
import fs from "fs/promises";
import { startPeriodicMentionChecking } from "./twitter-api";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Connect X account (simulated)
  apiRouter.post("/connect", async (req, res) => {
    try {
      // Validate request body
      const connectSchema = z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      });
      
      const validatedData = connectSchema.parse(req.body);
      
      // Check if user exists
      let user = await storage.getUserByUsername(validatedData.username);
      
      // If not, create user
      if (!user) {
        user = await storage.createUser({
          username: validatedData.username,
          profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${validatedData.username}`,
        });
      }
      
      // Check if user has wallet, if not create one
      let wallet = await storage.getWalletByUserId(user.id);
      
      if (!wallet) {
        // Generate Solana keypair
        const keypair = generateKeypair();
        
        wallet = await storage.createWallet({
          userId: user.id,
          publicKey: keypair.publicKey,
          privateKey: keypair.privateKey,
        });
      }
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
        },
        wallet: {
          publicKey: wallet.publicKey,
        }
      });
    } catch (error) {
      console.error("Connect error:", error);
      res.status(400).json({ message: "Failed to connect account" });
    }
  });
  
  // Mint NFT from image upload
  apiRouter.post("/mint", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }
      
      const { title, description } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      // For demo purposes, simulate a user session with the first user
      const users = await storage.getAllUsers();
      if (users.length === 0) {
        return res.status(401).json({ message: "No authenticated user found" });
      }
      
      const user = users[0];
      const wallet = await storage.getWalletByUserId(user.id);
      
      if (!wallet) {
        return res.status(400).json({ message: "User wallet not found" });
      }
      
      // Save image file to upload directory
      const uploadDir = path.resolve(process.cwd(), "uploads");
      
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      
      const fileExtension = req.file.originalname.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);
      
      await fs.writeFile(filePath, req.file.buffer);
      
      // Create relative path for serving the image
      const imageUrl = `/uploads/${fileName}`;
      
      // Create NFT metadata
      const metadata = createNFTMetadata({
        name: title,
        description: description || "",
        image: imageUrl,
        creator: user.username,
      });
      
      // Save NFT to database (lazy minting)
      const nft = await storage.createNFT({
        title,
        description: description || "",
        imageUrl,
        creator: user.id,
        walletAddress: wallet.publicKey,
        metadata,
        tokenId: null,
        isMinted: 0, // Lazy minted initially
      });
      
      res.status(201).json({
        id: nft.id,
        title: nft.title,
        walletAddress: nft.walletAddress,
        mintDate: formatISO(nft.mintDate),
        imageUrl: nft.imageUrl,
      });
    } catch (error) {
      console.error("Mint error:", error);
      res.status(400).json({ message: "Failed to mint NFT" });
    }
  });
  
  // Get user's NFTs
  apiRouter.get("/my-nfts", async (req, res) => {
    try {
      // For demo purposes, simulate a user session with the first user
      const users = await storage.getAllUsers();
      if (users.length === 0) {
        return res.status(401).json({ message: "No authenticated user found" });
      }
      
      const user = users[0];
      const nfts = await storage.getNFTsByCreator(user.id);
      
      // Format the NFTs for the frontend
      const formattedNfts = nfts.map(nft => ({
        id: nft.id,
        title: nft.title,
        description: nft.description,
        image: nft.imageUrl,
        creator: `@${user.username}`,
        mintDate: formatISO(nft.mintDate).split("T")[0],
        walletAddress: nft.walletAddress,
        views: nft.views,
        transactions: nft.transactions,
        floorPrice: nft.floorPrice || (Math.random() * 6 + 0.1).toFixed(2), // Generate random price between 0.1 and 6 SOL
      }));
      
      res.json(formattedNfts);
    } catch (error) {
      console.error("Get my NFTs error:", error);
      res.status(400).json({ message: "Failed to get NFTs" });
    }
  });
  
  // Explore NFTs
  apiRouter.get("/explore", async (req, res) => {
    try {
      const tab = req.query.tab as string || "featured";
      const sort = req.query.sort as string || "newest";
      
      console.log(`Fetching NFTs with tab: ${tab}, sort: ${sort}`);
      
      let nfts;
      if (tab === "featured") {
        nfts = await storage.getFeaturedNFTs();
        console.log(`Found ${nfts.length} featured NFTs`);
      } else {
        nfts = await storage.getNewNFTs();
        console.log(`Found ${nfts.length} new NFTs`);
      }
      
      // Sort NFTs
      if (sort === "oldest") {
        nfts.sort((a, b) => a.mintDate.getTime() - b.mintDate.getTime());
      } else {
        // Default to newest first
        nfts.sort((a, b) => b.mintDate.getTime() - a.mintDate.getTime());
      }
      
      // Get creators for each NFT
      const formattedNfts = await Promise.all(nfts.map(async nft => {
        const creator = await storage.getUser(nft.creator);
        
        return {
          id: nft.id,
          title: nft.title,
          description: nft.description,
          image: nft.imageUrl,
          creator: creator ? `@${creator.username}` : `@${["creativegenix", "digitalartpro", "nftcreator3d", "pixelmaster", "cryptoartist"][Math.floor(Math.random() * 5)]}`,
          mintDate: formatISO(nft.mintDate).split("T")[0],
          walletAddress: nft.walletAddress,
          views: nft.views,
          transactions: nft.transactions,
          floorPrice: nft.floorPrice || (Math.random() * 6 + 0.1).toFixed(2), // Generate random price between 0.1 and 6 SOL
        };
      }));
      
      console.log(`Returning ${formattedNfts.length} formatted NFTs`);
      res.json(formattedNfts);
    } catch (error) {
      console.error("Explore NFTs error:", error);
      res.status(400).json({ message: "Failed to get NFTs" });
    }
  });
  
  // Get NFT details
  apiRouter.get("/nft/:id", async (req, res) => {
    try {
      const nftId = parseInt(req.params.id);
      if (isNaN(nftId)) {
        return res.status(400).json({ message: "Invalid NFT ID" });
      }
      
      const nft = await storage.getNFT(nftId);
      if (!nft) {
        return res.status(404).json({ message: "NFT not found" });
      }
      
      const creator = await storage.getUser(nft.creator);
      
      // Increment views
      await storage.incrementNFTViews(nftId);
      
      const formattedNft = {
        id: nft.id,
        title: nft.title,
        description: nft.description,
        image: nft.imageUrl,
        creator: creator ? `@${creator.username}` : `@${["creativegenix", "digitalartpro", "nftcreator3d", "pixelmaster", "cryptoartist"][Math.floor(Math.random() * 5)]}`,
        mintDate: formatISO(nft.mintDate).split("T")[0],
        walletAddress: nft.walletAddress,
        views: nft.views + 1, // Include the current view
        transactions: nft.transactions || `Minted on ${formatISO(nft.mintDate).split("T")[0]}`,
        metadata: nft.metadata,
        floorPrice: nft.floorPrice || (Math.random() * 6 + 0.1).toFixed(2), // Generate random price between 0.1 and 6 SOL
      };
      
      res.json(formattedNft);
    } catch (error) {
      console.error("Get NFT error:", error);
      res.status(400).json({ message: "Failed to get NFT details" });
    }
  });
  
  // Serve uploaded files
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  
  // Register the API router with prefix
  app.use("/api", apiRouter);
  
  // Start periodic Twitter mention checking if API key is available
  if (process.env.TWITTER_BEARER_TOKEN) {
    startPeriodicMentionChecking(5); // Check every 5 minutes
    console.log("Twitter mention checking initialized");
  } else {
    console.log("Warning: TWITTER_BEARER_TOKEN not found, automatic tweet detection is disabled");
  }

  const httpServer = createServer(app);

  return httpServer;
}
