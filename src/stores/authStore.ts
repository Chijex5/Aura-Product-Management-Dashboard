// src/stores/authStore.ts
import { create } from 'zustand';

export interface User {
  admin_id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  phoneNumber: string;
  updatedAt: string;
  lastLogin: string;
  avatar: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  type: string;
  module: string;
}

export interface AuthState {
  user: User | null;
  activityLogs: ActivityLog[];
  token: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  isLoading: boolean;
  isNotVerified: boolean;
  verificationToken: string;
  error: string | null;
  setUser: (user: User | null) => void;
  setActivityLogs: (logs: ActivityLog[]) => void;
  setToken: (token: string | null) => void;
  setIsCheckingAuth: (isCheckingAuth: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setVerificationToken: (verificationToken: string) => void;
  setIsNotVerified: (isNotVerified: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  activityLogs: [],
  token: null,
  isAuthenticated: false,
  isCheckingAuth: false,
  isNotVerified: false,
  verificationToken: '',
  isLoading: false,
  error: null,
  setUser: user => set({
    user
  }),
  setActivityLogs: logs => set({
    activityLogs: logs
  }),
  setToken: token => set({
    token
  }),
  setIsAuthenticated: isAuthenticated => set({
    isAuthenticated
  }),
  setIsCheckingAuth: isCheckingAuth => set({
    isCheckingAuth
  }),
  setVerificationToken: verificationToken => set({
    verificationToken
  }),
  setIsLoading: isLoading => set({
    isLoading
  }),
  setIsNotVerified: isNotVerified => set({
    isNotVerified
  }),
  setError: error => set({
    error
  })
}));