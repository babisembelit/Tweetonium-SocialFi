import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  profileImage: text("profile_image"),
  twitterId: text("twitter_id").unique(), // Twitter/X user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(), // In production would be securely encrypted
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  creator: integer("creator").references(() => users.id).notNull(),
  walletAddress: text("wallet_address").notNull(),
  mintDate: timestamp("mint_date").defaultNow().notNull(),
  tokenId: text("token_id"),
  tweetId: text("tweet_id"), // ID of the tweet this NFT was created from
  metadata: json("metadata"),
  isMinted: integer("is_minted").default(0), // 0 = lazy minted, 1 = on-chain minted
  featured: integer("featured").default(0), // 0 = not featured, 1 = featured
  views: integer("views").default(0),
  transactions: text("transactions"),
  floorPrice: text("floor_price"), // Price in SOL for the NFT
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true });
export const insertNftSchema = createInsertSchema(nfts).omit({ 
  id: true, 
  mintDate: true, 
  views: true,
  isMinted: true, 
  featured: true 
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertNft = z.infer<typeof insertNftSchema>;
export type NFT = typeof nfts.$inferSelect;
