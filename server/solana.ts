/**
 * This file contains utilities for interacting with the Solana blockchain
 * and handling NFT-related operations.
 */
import { Keypair, Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import CryptoJS from 'crypto-js';

// This is the encryption secret key - in production, this would be stored securely
// and loaded from environment variables, not hard-coded
const ENCRYPTION_KEY = 'tweetonium-wallet-encryption-key-2025';

// Our pre-funded wallet for backend operations
// In production this would be loaded from secure environment variables
let BACKEND_WALLET: Keypair | null = null;

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  creator?: string;
  symbol?: string;
  seller_fee_basis_points?: number;
}

interface KeypairResult {
  publicKey: string;
  privateKey: string;
}

/**
 * Encrypts a private key using AES encryption
 * @param privateKey The private key to encrypt
 * @returns The encrypted private key as a string
 */
export function encryptPrivateKey(privateKey: string): string {
  return CryptoJS.AES.encrypt(privateKey, ENCRYPTION_KEY).toString();
}

/**
 * Decrypts an encrypted private key
 * @param encryptedPrivateKey The encrypted private key
 * @returns The decrypted private key as a string
 */
export function decryptPrivateKey(encryptedPrivateKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Generates a new Solana keypair for user wallets.
 * Uses actual Solana keypair generation with encryption for private keys.
 */
export function generateKeypair(): KeypairResult {
  // Generate a real Solana keypair
  const keypair = Keypair.generate();
  
  // Get the public key as a base58 string
  const publicKey = keypair.publicKey.toBase58();
  
  // Get the private key (secret key) as a base58 string and encrypt it
  const privateKeyBytes = keypair.secretKey;
  const privateKey = bs58.encode(privateKeyBytes);
  const encryptedPrivateKey = encryptPrivateKey(privateKey);
  
  return {
    publicKey: publicKey,
    privateKey: encryptedPrivateKey, // Store encrypted private key
  };
}

/**
 * Creates metadata for an NFT based on input parameters.
 */
export function createNFTMetadata(params: {
  title: string;
  description: string;
  imageUrl: string;
  creator: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}): NFTMetadata {
  return {
    name: params.title,
    description: params.description,
    image: params.imageUrl,
    attributes: [
      ...(params.attributes || []),
      {
        trait_type: "Creator",
        value: params.creator,
      },
      {
        trait_type: "Platform",
        value: "Tweetonium",
      },
    ],
    creator: params.creator,
    symbol: "TWEET",
    seller_fee_basis_points: 500, // 5% royalty
  };
}

/**
 * Prepares metadata for a lazy-minted NFT.
 * This doesn't actually mint the NFT on-chain but prepares it for future minting.
 */
export async function prepareLazyMint(params: {
  metadata: NFTMetadata;
  creatorId: number;
  walletAddress: string;
}): Promise<{tokenId: string; metadataHash: string}> {
  // Generate a unique token ID and metadata hash for future on-chain minting
  const timestamp = Date.now().toString();
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const tokenId = `${timestamp}${randomNum}`;
  
  // In a real implementation, this would:
  // 1. Sign the metadata with the creator's wallet
  // 2. Store the metadata in decentralized storage (IPFS/Arweave)
  // 3. Return the metadata URI and a signature that can be used for on-chain minting later
  
  // Generate a simulated metadata hash (would be the IPFS CID in production)
  const metadataHash = `ipfs://${Buffer.from(JSON.stringify(params.metadata)).toString('base64').substring(0, 46)}`;
  
  return { 
    tokenId,
    metadataHash
  };
}

/**
 * Actually mints an NFT on-chain when it's sold or transferred.
 * For the MVP, this simulates the process of minting a previously lazy-minted NFT.
 */
export async function finalizeNFTMinting(params: {
  tokenId: string;
  metadataHash: string;
  buyerWalletAddress: string;
}): Promise<{transactionId: string}> {
  // In a real implementation, this would:
  // 1. Connect to Solana
  // 2. Create the on-chain NFT token with Metaplex
  // 3. Transfer to the buyer's wallet
  // 4. Return transaction details
  
  // For the MVP, simulate a transaction ID
  const txId = `${Date.now().toString(16)}${Math.random().toString(16).substring(2, 8)}`;
  
  return {
    transactionId: txId
  };
}

/**
 * Legacy function maintained for compatibility.
 * Now performs a lazy mint by default.
 */
export async function mintNFT(params: {
  metadata: NFTMetadata;
  creatorId: number;
  walletAddress: string;
}): Promise<{tokenId: string}> {
  const result = await prepareLazyMint(params);
  return { tokenId: result.tokenId };
}

/**
 * Reconstruct a Solana Keypair from an encrypted private key and public key
 * @param encryptedPrivateKey The encrypted private key
 * @param publicKey The public key
 * @returns The reconstructed Solana Keypair
 */
export function getKeypairFromEncryptedPrivateKey(encryptedPrivateKey: string, publicKey: string): Keypair {
  // Decrypt the private key
  const privateKeyString = decryptPrivateKey(encryptedPrivateKey);
  
  // Convert from base58 string to Uint8Array
  const privateKeyBytes = bs58.decode(privateKeyString);
  
  // Create a keypair from the private key bytes
  return Keypair.fromSecretKey(privateKeyBytes);
}

/**
 * Gets the balance of a Solana wallet (in Lamports).
 * @param publicKey The public key of the wallet to check
 * @returns The wallet balance in lamports
 */
export async function getWalletBalance(publicKey: string): Promise<number> {
  try {
    // Connect to Solana devnet
    const connection = new Connection(clusterApiUrl('devnet'));
    const publicKeyObj = new PublicKey(publicKey);
    
    // Get actual balance from network
    return await connection.getBalance(publicKeyObj);
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    // Fallback to simulated balance if connection fails
    return 1000000000; // 1 SOL
  }
}
