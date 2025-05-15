import { useLocation, Link } from "wouter";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ConnectXModal from "@/components/ConnectXModal";
import { shortenAddress } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
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
import { LogOut, Copy, X, ExternalLink, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

// Wallet Balance Component
interface WalletBalanceProps {
  publicKey: string;
}

function WalletBalance({ publicKey }: WalletBalanceProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/wallet', publicKey, 'balance'],
    queryFn: async () => {
      if (!publicKey) return null;
      const response = await fetch(`/api/wallet/${publicKey}/balance`);
      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance');
      }
      return response.json();
    },
    enabled: !!publicKey,
    refetchInterval: 60000, // Refetch every minute
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-black p-2 sm:p-3 rounded-lg border border-gray-800 h-[40px]">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="ml-2 text-xs sm:text-sm text-gray-400">Loading balance...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-xs sm:text-sm bg-black p-2 sm:p-3 rounded-lg border border-gray-800 text-gray-400">
        Unable to fetch balance
      </p>
    );
  }

  return (
    <p className="text-xs sm:text-sm bg-black p-2 sm:p-3 rounded-lg border border-gray-800">
      {data.solBalance} SOL{" "}
      <span className="text-gray-500 text-xs">({Number(data.balance).toLocaleString()} lamports)</span>
    </p>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user, wallet, logout } = useAuthStore();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const copyWalletAddress = () => {
    if (wallet?.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey);
      toast({
        title: "Wallet address copied",
        description: "Your wallet address has been copied to clipboard",
      });
    }
  };

  const openInSolanaExplorer = () => {
    if (wallet?.publicKey) {
      window.open(`https://explorer.solana.com/address/${wallet.publicKey}?cluster=devnet`, "_blank");
    }
  };

  const [sheetOpen, setSheetOpen] = useState(false);
  
  const closeSheet = () => {
    setSheetOpen(false);
  };
  
  return (
    <nav className="px-4 py-3 md:px-8 flex justify-between items-center border-b border-gray-800">
      <div className="flex items-center">
        <Link href="/">
          <a className="flex items-center" aria-label="Tweetonium Home">
            <Logo size="sm" />
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="ml-8 space-x-6 hidden md:flex">
          <Link href="/explore">
            <a className={`hover:text-gray-300 transition-colors ${location === "/explore" ? "font-medium" : ""}`}>
              Explore
            </a>
          </Link>
          
          {isAuthenticated && (
            <Link href="/my-nfts">
              <a className={`hover:text-gray-300 transition-colors ${location === "/my-nfts" ? "font-medium" : ""}`}>
                My NFTs
              </a>
            </Link>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild className="md:hidden ml-4">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-secondary border-r border-gray-800 text-white w-[250px] pt-10">
            <nav className="flex flex-col gap-4">
              <Link href="/">
                <a 
                  className={`px-2 py-1 rounded hover:bg-gray-800 transition-colors ${location === "/" ? "bg-gray-900 font-medium" : ""}`}
                  onClick={closeSheet}
                >
                  Home
                </a>
              </Link>
              <Link href="/explore">
                <a 
                  className={`px-2 py-1 rounded hover:bg-gray-800 transition-colors ${location === "/explore" ? "bg-gray-900 font-medium" : ""}`}
                  onClick={closeSheet}
                >
                  Explore
                </a>
              </Link>
              {isAuthenticated && (
                <Link href="/my-nfts">
                  <a 
                    className={`px-2 py-1 rounded hover:bg-gray-800 transition-colors ${location === "/my-nfts" ? "bg-gray-900 font-medium" : ""}`}
                    onClick={closeSheet}
                  >
                    My NFTs
                  </a>
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
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
            <div className="flex items-center space-x-2 border border-gray-800 rounded-full px-3 py-1.5">
              {/* Wallet Address - Opens Wallet Details */}
              <button 
                className="text-sm hover:underline"
                onClick={() => setShowWalletDetails(true)}
              >
                {shortenAddress(wallet?.publicKey || "")}
              </button>
              <span className="text-gray-400">|</span>
              
              {/* Twitter Username - Opens Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm hover:underline">
                    @{user?.username}
                  </button>
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
            </div>

            {/* Wallet Details Dialog */}
            <Dialog open={showWalletDetails} onOpenChange={setShowWalletDetails}>
              <DialogContent className="w-[90%] max-w-md mx-auto bg-secondary border border-gray-800 text-white p-4 sm:p-6">
                <DialogClose className="absolute right-3 top-3 text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </DialogClose>
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-medium mb-2">Wallet Details</DialogTitle>
                  <DialogDescription className="text-gray-300 text-sm sm:text-base">
                    Your Solana wallet on the Devnet network.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-sm text-gray-400 mb-1">Wallet Address</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center bg-black p-2 sm:p-3 rounded-lg border border-gray-800">
                      <span className="text-xs sm:text-sm break-all mb-2 sm:mb-0">{wallet?.publicKey}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-auto text-gray-400 hover:text-white"
                        onClick={copyWalletAddress}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-sm text-gray-400 mb-1">Network</h4>
                    <p className="text-xs sm:text-sm bg-black p-2 sm:p-3 rounded-lg border border-gray-800">Solana Devnet</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-400 mb-1">Balance</h4>
                    <WalletBalance publicKey={wallet?.publicKey || ""} />
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={openInSolanaExplorer}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span className="text-sm">View on Solana Explorer</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
              <AlertDialogContent className="w-[90%] max-w-md mx-auto bg-secondary border border-gray-800 text-white p-4 sm:p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl sm:text-2xl font-medium">Are you sure you want to sign out?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400 text-sm sm:text-base">
                    You will need to connect your X account again to access your NFTs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 pt-4">
                  <AlertDialogCancel className="w-full sm:w-auto bg-transparent border border-gray-700 text-white hover:bg-gray-800 hover:text-white">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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
