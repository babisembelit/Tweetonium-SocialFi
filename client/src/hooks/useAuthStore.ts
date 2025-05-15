import { create } from 'zustand';
import { getQueryFn } from '@/lib/queryClient';

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
  loading: boolean;
  checkSession: () => Promise<void>;
  login: (userData: User, walletData: Wallet) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  wallet: null,
  loading: true,
  checkSession: async () => {
    try {
      set({ loading: true });
      const fetchSession = getQueryFn<{
        isAuthenticated: boolean;
        user: User | null;
        wallet: Wallet | null;
      }>({ on401: 'returnNull' });
      
      const response = await fetch('/api/session');
      const data = await response.json();
      
      if (data && data.isAuthenticated) {
        set({
          isAuthenticated: true,
          user: data.user,
          wallet: data.wallet,
          loading: false
        });
      } else {
        set({
          isAuthenticated: false,
          user: null,
          wallet: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      set({
        isAuthenticated: false,
        user: null,
        wallet: null,
        loading: false
      });
    }
  },
  login: (userData: User, walletData: Wallet) => set({ 
    isAuthenticated: true, 
    user: userData, 
    wallet: walletData,
    loading: false
  }),
  logout: async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ 
        isAuthenticated: false, 
        user: null, 
        wallet: null 
      });
    }
  }
}));
