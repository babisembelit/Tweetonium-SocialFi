import { useLocation, Link } from "wouter";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useState } from "react";
import ConnectXModal from "@/components/ConnectXModal";
import { shortenAddress } from "@/lib/utils";
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
        <Sheet>
          <SheetTrigger asChild className="md:hidden ml-4">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-secondary border-r border-gray-800 text-white w-[250px] pt-10">
            {({ setOpen }) => (
              <nav className="flex flex-col gap-4">
                <Link href="/">
                  <a 
                    className={`px-2 py-1 rounded hover:bg-gray-800 transition-colors ${location === "/" ? "bg-gray-900 font-medium" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </a>
                </Link>
                <Link href="/explore">
                  <a 
                    className={`px-2 py-1 rounded hover:bg-gray-800 transition-colors ${location === "/explore" ? "bg-gray-900 font-medium" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    Explore
                  </a>
                </Link>
                {isAuthenticated && (
                  <Link href="/my-nfts">
                    <a 
                      className={`px-2 py-1 rounded hover:bg-gray-800 transition-colors ${location === "/my-nfts" ? "bg-gray-900 font-medium" : ""}`}
                      onClick={() => setOpen(false)}
                    >
                      My NFTs
                    </a>
                  </Link>
                )}
              </nav>
            )}
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
              <DialogContent className="sm:max-w-md bg-secondary border border-gray-800 text-white">
                <DialogClose className="absolute right-4 top-4 text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </DialogClose>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-medium mb-2">Wallet Details</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Your Solana wallet on the Devnet network.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="mb-6">
                    <h4 className="text-sm text-gray-400 mb-1">Wallet Address</h4>
                    <div className="flex items-center justify-between bg-black p-3 rounded-lg border border-gray-800 break-all">
                      <span className="text-sm">{wallet?.publicKey}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2 text-gray-400 hover:text-white"
                        onClick={copyWalletAddress}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm text-gray-400 mb-1">Network</h4>
                    <p className="text-sm bg-black p-3 rounded-lg border border-gray-800">Solana Devnet</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm text-gray-400 mb-1">Balance</h4>
                    <p className="text-sm bg-black p-3 rounded-lg border border-gray-800">1.0 SOL (simulated)</p>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={openInSolanaExplorer}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Solana Explorer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Logout Confirmation Dialog */}
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
