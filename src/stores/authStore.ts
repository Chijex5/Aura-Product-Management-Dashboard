import create from 'zustand';
interface AuthStore {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: any) => void;
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
}
export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setUser: user => set({
    user
  }),
  setIsAuthenticated: value => set({
    isAuthenticated: value
  }),
  setIsLoading: value => set({
    isLoading: value
  }),
  setError: error => set({
    error
  })
}));