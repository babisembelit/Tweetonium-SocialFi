import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  profileImage?: string;
}

interface Wallet {
  publicKey: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  wallet: Wallet | null;
  login: (userData: User, walletData: Wallet) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  wallet: null,
  login: (userData: User, walletData: Wallet) => set({ 
    isAuthenticated: true, 
    user: userData, 
    wallet: walletData 
  }),
  logout: () => set({ 
    isAuthenticated: false, 
    user: null, 
    wallet: null 
  })
}));
