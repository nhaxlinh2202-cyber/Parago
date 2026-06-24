import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isDriver: boolean;
  isPremium: boolean;
  university: string;
  faculty: string;
  rating: number;
  totalRides: number;
  trustScore: number;
  ecoPoints: number;
  verified: boolean;
  systemRole?: "ADMIN" | "MODERATOR" | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  // Actions
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  loadUserFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  loadUserFromStorage: async () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');
      
      if (accessToken && refreshToken) {
        // 1. Optimistic load from storage to prevent UI flicker
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ accessToken, refreshToken, user, isAuthenticated: true, isInitialized: true });
          } catch (e) {
            // Ignore JSON parse error
          }
        }
        
        // 2. Fetch fresh user data from server
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (res.ok) {
            const freshUser = await res.json();
            // This will also update localStorage via the setUser method
            useAuthStore.getState().setUser(freshUser);
            set({ accessToken, refreshToken, isAuthenticated: true, isInitialized: true });
          }
        } catch (e) {
          console.error("Failed to fetch fresh user data on load", e);
        }
        
        // Ensure initialized state is true even if fetch fails
        set({ isInitialized: true });
        return;
      }
      
      set({ isInitialized: true });
    }
  },
}));
