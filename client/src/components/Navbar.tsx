import { useLocation, Link } from "wouter";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useState } from "react";
import ConnectXModal from "@/components/ConnectXModal";
import { shortenAddress } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user, wallet, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

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
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 border border-gray-800 rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-900 transition-colors">
                  <span className="text-sm">{shortenAddress(wallet?.publicKey || "")}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm">@{user?.username}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-secondary border border-gray-800 text-white">
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
              <AlertDialogContent className="bg-secondary border border-gray-800 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    You will need to connect your X account again to access your NFTs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 hover:text-white">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </nav>
  );
}
