import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MyNFT from "@/pages/MyNFT";
import Explore from "@/pages/Explore";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";

function Router() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/my-nfts" component={MyNFT} />
        <Route path="/explore" component={Explore} />
        <Route component={NotFound} />
      </Switch>
      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
