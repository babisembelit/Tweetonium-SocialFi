import { useLocation, Link } from "wouter";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useState } from "react";
import ConnectXModal from "@/components/ConnectXModal";
import { shortenAddress } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user, wallet } = useAuthStore();

  return (
    <nav className="px-4 py-3 md:px-8 flex justify-between items-center border-b border-gray-800">
      <div className="flex items-center">
        <Link href="/">
          <a className="flex items-center" aria-label="Tweetonium Home">
            <Logo size="sm" />
          </a>
        </Link>

        {isAuthenticated && (
          <div className="ml-8 space-x-6 hidden md:flex">
            <Link href="/my-nft">
              <a className={`hover:text-gray-300 transition-colors ${location === "/my-nft" ? "font-medium" : ""}`}>
                My NFT
              </a>
            </Link>
            <Link href="/explore">
              <a className={`hover:text-gray-300 transition-colors ${location === "/explore" ? "font-medium" : ""}`}>
                Explore
              </a>
            </Link>
          </div>
        )}
      </div>

      <div>
        {!isAuthenticated ? (
          <>
            <Button 
              variant="outline" 
              className="rounded-full" 
              onClick={() => setIsOpen(true)}
            >
              Connect X
            </Button>
            <ConnectXModal open={isOpen} onOpenChange={setIsOpen} />
          </>
        ) : (
          <div className="flex items-center space-x-2 border border-gray-800 rounded-full px-3 py-1.5">
            <span className="text-sm">{shortenAddress(wallet?.publicKey || "")}</span>
            <span className="text-gray-400">|</span>
            <span className="text-sm">@{user?.username}</span>
          </div>
        )}
      </div>
    </nav>
  );
}
