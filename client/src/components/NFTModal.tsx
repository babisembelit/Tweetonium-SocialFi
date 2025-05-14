import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { X } from "lucide-react";
import { type NFT } from "./NFTCard";

interface NFTModalProps {
  nft: NFT;
  isUserNFT?: boolean;
}

export default function NFTModal({ nft, isUserNFT = false }: NFTModalProps) {
  return (
    <DialogContent className="w-[95%] max-w-4xl mx-auto bg-secondary border border-gray-800 text-white p-0 overflow-hidden">
      {/* Removed redundant close icon - DialogClose is already provided by the Dialog component */}
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 flex items-center justify-center bg-gray-900 relative h-auto" style={{ minHeight: '300px' }}>
          <img 
            src={nft.image} 
            alt={nft.title}
            className="max-w-full max-h-[80vh] md:max-h-[500px] object-contain p-4"
          />
        </div>
        <div className="md:w-1/2 p-4 sm:p-6">
          <DialogHeader className="text-left mb-3 md:mb-4">
            <div className="flex flex-col">
              <DialogTitle className="text-xl sm:text-2xl font-medium">{nft.title}</DialogTitle>
              {isUserNFT ? (
                <DialogDescription className="text-gray-400 text-sm">
                  Minted on {nft.mintDate}
                </DialogDescription>
              ) : (
                <div className="flex justify-between items-center mt-1">
                  <DialogDescription className="text-gray-400 text-sm m-0">
                    {nft.creator}
                  </DialogDescription>
                  {nft.floorPrice && (
                    <span className="text-sm font-semibold text-purple-500">
                      {nft.floorPrice} SOL
                    </span>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>
          
          <div className="mb-4 md:mb-6">
            <h4 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Description</h4>
            <p className="text-sm sm:text-base text-gray-300">{nft.description || "No description provided"}</p>
          </div>
          
          <div className="mb-4 md:mb-6">
            <h4 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Details</h4>
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between">
                <span className="text-gray-400">Mint Date</span>
                <span className="text-right max-w-[60%] break-words">{nft.mintDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Blockchain</span>
                <span>Solana</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wallet</span>
                <span className="text-right max-w-[60%] break-all text-xs sm:text-sm">{nft.walletAddress}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Activity</h4>
            <div className="border border-gray-800 rounded-lg p-3 sm:p-4">
              <div className="flex justify-between items-center mb-1 sm:mb-2 text-sm sm:text-base">
                <span className="text-gray-400">Views</span>
                <span>{nft.views || 0}</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                {nft.transactions || `Minted on ${nft.mintDate}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
