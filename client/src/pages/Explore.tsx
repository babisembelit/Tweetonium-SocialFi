import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import NFTCard from "@/components/NFTCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"featured" | "new">("new");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: nfts, isLoading } = useQuery({
    queryKey: [`/api/explore?tab=${activeTab}&sort=${sortOrder}&creator=${creatorFilter}`],
  });
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ 
        queryKey: [`/api/explore?tab=${activeTab}&sort=${sortOrder}&creator=${creatorFilter}`] 
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const filteredNfts = nfts 
    ? nfts.filter((nft: any) => {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return (
          nft.title.toLowerCase().includes(term) || 
          nft.creator.toLowerCase().includes(term)
        );
      })
    : [];

  return (
    <main className="flex-grow">
      <div className="py-8 px-4 md:px-8">
        <h2 className="text-3xl mb-6 pixel-font">EXPLORE</h2>
        
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Search NFTs by title or creator"
                className="w-full px-4 py-2 bg-secondary border border-gray-800 rounded-lg text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="bg-secondary border-gray-800 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-gray-800 text-white">
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                <SelectTrigger className="bg-secondary border-gray-800 text-white">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent className="bg-secondary border-gray-800 text-white">
                  <SelectItem value="all">All Creators</SelectItem>
                  <SelectItem value="followed">Creators I Follow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-800">
          <div className="flex space-x-8">
            <button 
              className={cn(
                "pb-2 hover:text-white transition-colors", 
                activeTab === "featured" 
                  ? "border-b-2 border-white font-medium" 
                  : "border-b-0 text-gray-400"
              )}
              onClick={() => setActiveTab("featured")}
            >
              Featured
            </button>
            <button 
              className={cn(
                "pb-2 hover:text-white transition-colors", 
                activeTab === "new" 
                  ? "border-b-2 border-white font-medium" 
                  : "border-b-0 text-gray-400"
              )}
              onClick={() => setActiveTab("new")}
            >
              New
            </button>
          </div>
        </div>
        
        {/* NFT Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, index) => (
              <div key={index} className="border border-gray-800 rounded-lg overflow-hidden bg-secondary">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredNfts.map((nft: any) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl mb-4">No NFTs found</h3>
            <p className="text-gray-400">
              {searchTerm 
                ? "Try a different search term"
                : "There are no NFTs available in this category"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
