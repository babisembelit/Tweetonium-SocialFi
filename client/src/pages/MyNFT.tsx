import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NFTCard from "@/components/NFTCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import MintNFTModal from "@/components/MintNFTModal";

export default function MyNFT() {
  const [mintOpen, setMintOpen] = useState(false);
  const { data: nfts, isLoading } = useQuery({
    queryKey: ["/api/my-nfts"],
  });
  
  const handlePostToX = () => {
    const postText = encodeURIComponent("Check out my artwork! @tweetonium_xyz #NFT #Web3");
    window.open(`https://twitter.com/intent/tweet?text=${postText}`, "_blank");
  };

  return (
    <main className="flex-grow">
      <div className="py-8 px-4 md:px-8">
        <h2 className="text-3xl mb-8 pixel-font">MY NFTS</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="border border-gray-800 rounded-lg overflow-hidden bg-secondary">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : nfts?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts.map((nft: any) => (
              <NFTCard key={nft.id} nft={nft} isUserNFT={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl mb-4">You haven't minted any NFTs yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first NFT by minting an image from your X posts
            </p>
            <div className="mb-6">
              <Button 
                variant="default" 
                size="lg" 
                className="rounded-full px-6 py-6 text-lg font-medium bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handlePostToX}
              >
                Tag your artwork to @tweetonium_xyz
              </Button>
            </div>
          </div>
        )}
      </div>
      <MintNFTModal open={mintOpen} onOpenChange={setMintOpen} />
    </main>
  );
}
