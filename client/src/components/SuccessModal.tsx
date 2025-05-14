import { X, Check } from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nft: {
    id: number;
    title: string;
    walletAddress: string;
    mintDate: string;
  } | null;
}

export default function SuccessModal({ open, onOpenChange, nft }: SuccessModalProps) {
  const [, setLocation] = useLocation();
  
  if (!nft) return null;

  const handleViewNFT = () => {
    onOpenChange(false);
    setLocation("/my-nft");
  };

  const handleShareTwitter = () => {
    // This would normally link to Twitter share URL
    window.open(
      `https://twitter.com/intent/tweet?text=I just minted "${nft.title}" as an NFT on Solana with @tweetonium_xyz! Check it out!`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-md mx-auto bg-secondary border border-gray-800 text-white p-4 sm:p-6">
        <DialogClose className="absolute right-3 top-3 text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </DialogClose>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500 mb-4">
            <Check className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl sm:text-2xl font-medium text-center">NFT Minted Successfully!</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base text-center">
              Your artwork has been successfully minted as an NFT on the Solana blockchain.
            </DialogDescription>
          </DialogHeader>
          
          <div className="border border-gray-800 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6 text-left">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-400">NFT Title</span>
              <span className="text-right max-w-[60%] break-words">{nft.title}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-400">Wallet</span>
              <span>{shortenAddress(nft.walletAddress)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Mint Date</span>
              <span>{nft.mintDate}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
            <Button 
              variant="default" 
              className="sm:flex-1" 
              onClick={handleViewNFT}
            >
              <span className="text-sm">View NFT</span>
            </Button>
            <Button 
              variant="outline" 
              className="sm:flex-1" 
              onClick={handleShareTwitter}
            >
              <span className="text-sm">Share on X</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
