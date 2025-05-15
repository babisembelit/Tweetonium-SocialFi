import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAuthStore } from "@/hooks/useAuthStore";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MyNFT from "@/pages/MyNFT";
import Explore from "@/pages/Explore";
import Navbar from "@/components/Navbar";

// Protected route component that redirects to home if not authenticated
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuthStore();
  
  // While still checking auth status, render nothing
  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  // If authenticated, render the component
  if (isAuthenticated) {
    return <Component />;
  }
  
  // Otherwise redirect to home
  return <Redirect to="/" />;
}

function Router() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/my-nfts">
          <ProtectedRoute component={MyNFT} />
        </Route>
        <Route path="/explore" component={Explore} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  const { checkSession } = useAuthStore();
  
  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, [checkSession]);

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
