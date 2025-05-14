import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { type NFT } from "./NFTCard";

interface NFTModalProps {
  nft: NFT;
  isUserNFT?: boolean;
}

export default function NFTModal({ nft, isUserNFT = false }: NFTModalProps) {
  return (
    <DialogContent className="w-[95%] max-w-5xl mx-auto bg-secondary border border-gray-800 text-white p-0 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="md:w-1/2 flex items-center justify-center bg-gray-900 relative h-auto" style={{ minHeight: '300px' }}>
          <img 
            src={nft.image} 
            alt={nft.title}
            className="max-w-full max-h-[80vh] md:max-h-[500px] object-contain p-4"
          />
        </div>
        
        {/* Right side - Info */}
        <div className="md:w-1/2 p-5 sm:p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {nft.title}
              </h2>
              
              <div className="flex items-center mt-1 text-gray-400">
                <span className="text-sm font-medium">{nft.creator}</span>
                {/* Add a blue verification badge to simulate the verified creator */}
                <span className="text-blue-500 ml-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
            
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Market data section */}
          <div className="grid grid-cols-2 gap-4 mb-6 border-b border-gray-800 pb-6">
            <div>
              <div className="text-xs text-gray-400 uppercase">Top Offer</div>
              <div className="text-md font-semibold mt-1">
                {nft.floorPrice || "0.0"} SOL
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase">Last Sale</div>
              <div className="text-md font-semibold mt-1">
                {nft.floorPrice ? (Number(nft.floorPrice) * 0.82).toFixed(3) : "0.0"} SOL
              </div>
            </div>
          </div>
          
          {/* Buy now section */}
          <div className="mb-6 border-b border-gray-800 pb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-400">Buy for</div>
              <div className="text-xs text-gray-500">Ending in 1 month</div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold">
                {nft.floorPrice || "0.0"} SOL
              </div>
              <div className="text-xs text-gray-500">(≈ ${nft.floorPrice ? (Number(nft.floorPrice) * 150).toFixed(2) : "0.00"})</div>
            </div>
            
            <div className="flex gap-2">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Buy now
              </Button>
              <Button variant="outline" className="px-4">
                Make offer
              </Button>
            </div>
          </div>
          
          {/* Tabs section */}
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="space-y-4">
              <div className="flex items-center justify-between p-3 border-b border-gray-800">
                <div className="flex items-center">
                  <div className="mr-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16m10-10 2-2m-2 2-2-2m-8 4 2-2m-2 2-2-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Collection Offer</div>
                    <div className="text-gray-400 text-xs">{nft.floorPrice} SOL</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {nft.creator?.replace('@', '')}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border-b border-gray-800">
                <div className="flex items-center">
                  <div className="mr-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 12h12m-6-6v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Minted</div>
                    <div className="text-gray-400 text-xs">{nft.mintDate}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {nft.views || 0} views
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="offers">
              <div className="text-sm text-gray-400 text-center py-6">
                No offers yet
              </div>
            </TabsContent>
            
            <TabsContent value="about">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-300">{nft.description || "No description provided"}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mint Date</span>
                      <span>{nft.mintDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blockchain</span>
                      <span>Solana</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creator</span>
                      <span>{nft.creator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wallet</span>
                      <span className="text-right max-w-[60%] break-all text-xs">{nft.walletAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DialogContent>
  );
}
