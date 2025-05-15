import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import NFTModal from "./NFTModal";

export interface NFT {
  id: number;
  title: string;
  creator: string;
  image: string;
  description?: string;
  mintDate: string;
  walletAddress: string;
  views?: number;
  transactions?: string;
  floorPrice?: string;
  tokenId?: string;
  isMinted?: number; // 0 = lazy minted, 1 = on-chain minted
  metadata?: any;
}

interface NFTCardProps {
  nft: NFT;
  isUserNFT?: boolean;
}

export default function NFTCard({ nft, isUserNFT = false }: NFTCardProps) {
  // Determine if this NFT is lazily minted
  const isLazyMinted = nft.isMinted === 0;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="nft-card border-gray-800 bg-secondary overflow-hidden cursor-pointer h-full">
          <div className="w-full relative">
            <AspectRatio ratio={1 / 1}>
              <img 
                src={nft.image} 
                alt={nft.title}
                className="w-full h-full object-cover"
              />
            </AspectRatio>
            
            {/* Minting Status Badge */}
            {isLazyMinted && (
              <Badge className="absolute top-2 right-2 bg-yellow-600 text-xs">
                Lazy Minted
              </Badge>
            )}
            {nft.isMinted === 1 && (
              <Badge className="absolute top-2 right-2 bg-green-600 text-xs">
                On-Chain
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <h4 className="font-medium mb-1 truncate">{nft.title}</h4>
            {isUserNFT ? (
              <p className="text-sm text-gray-400">Minted on {nft.mintDate}</p>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">{nft.creator}</p>
                {nft.floorPrice && (
                  <p className="text-sm font-semibold text-purple-500">
                    {nft.floorPrice} SOL
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <NFTModal nft={nft} isUserNFT={isUserNFT} />
    </Dialog>
  );
}
