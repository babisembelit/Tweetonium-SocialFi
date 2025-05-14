import { useState } from "react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ConnectXModal from "@/components/ConnectXModal";
import MintNFTModal from "@/components/MintNFTModal";
import NFTCard, { NFT } from "@/components/NFTCard";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [connectOpen, setConnectOpen] = useState(false);
  const [mintOpen, setMintOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  
  const handlePostToX = () => {
    const postText = encodeURIComponent("Check out my artwork! @tweetonium_xyz #NFT #Web3");
    window.open(`https://twitter.com/intent/tweet?text=${postText}`, "_blank");
  };

  const { data: featuredNfts, isLoading: featuredLoading } = useQuery<NFT[]>({
    queryKey: ["/api/explore", { tab: "featured" }],
    enabled: isAuthenticated,
  });

  const { data: newNfts, isLoading: newLoading } = useQuery<NFT[]>({
    queryKey: ["/api/explore", { tab: "new" }],
    enabled: isAuthenticated,
  });
  
  console.log("Featured NFTs:", featuredNfts);

  if (!isAuthenticated) {
    return (
      <main className="flex-grow">
        <div className="h-full flex flex-col items-center justify-center px-4 py-12 md:py-20">
          <div className="mb-8">
            <Logo size="lg" />
          </div>
          
          <p className="text-center max-w-lg mb-10 text-lg">
            Create X post of your artwork and tag @tweetonium_xyz to transform it into NFTs on the Solana Blockchain.
          </p>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full border-2 border-white px-6 py-6 text-lg font-medium hover:bg-white hover:text-black"
            onClick={() => setConnectOpen(true)}
          >
            Connect X (Twitter) Account
          </Button>
          
          <ConnectXModal open={connectOpen} onOpenChange={setConnectOpen} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 text-center">
        <h2 className="text-3xl md:text-4xl mb-6 pixel-font">MINT NFT</h2>
        <p className="mb-8 max-w-md mx-auto">
          Create X post of your artwork and tag @tweetonium_xyz to transform it into NFTs on the Solana Blockchain.
        </p>
        <Button 
          variant="default" 
          size="lg" 
          className="rounded-full px-6 py-6 text-lg font-medium bg-purple-600 hover:bg-purple-700 text-white"
          onClick={handlePostToX}
        >
          Tag your artwork to @tweetonium_xyz
        </Button>
        
        <MintNFTModal open={mintOpen} onOpenChange={setMintOpen} />
      </section>

      {/* Featured NFTs Section */}
      {featuredNfts?.length > 0 && (
        <section className="py-8 px-4 md:px-8">
          <h3 className="text-2xl mb-6 font-medium">Featured NFTs</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredNfts.map((nft: any) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </section>
      )}

      {/* New NFTs Section */}
      {newNfts?.length > 0 && (
        <section className="py-8 px-4 md:px-8">
          <h3 className="text-2xl mb-6 font-medium">New NFTs</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newNfts.map((nft: any) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
