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

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'order' | 'product' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}

export interface AuthState {
  user: User | null;
  activityLogs: ActivityLog[];
  notifications: Notification[];
  token: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  isLoading: boolean;
  isNotVerified: boolean;
  verificationToken: string;
  error: string | null;
  setUser: (user: User | null) => void;
  setActivityLogs: (logs: ActivityLog[]) => void;
  setNotifications: (notifications: Notification[]) => void;
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
  notifications: [],
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
  setNotifications: notifications => set({
    notifications
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