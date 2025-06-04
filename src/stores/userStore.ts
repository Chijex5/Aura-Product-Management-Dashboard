import { create } from 'zustand';
import { UserData } from '../services/userService';
interface UserStore {
  users: UserData[];
  isLoading: boolean;
  error: string | null;
  setUsers: (users: UserData[]) => void;
  setIsLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
}
export const useUserStore = create<UserStore>(set => ({
  users: [],
  isLoading: false,
  error: null,
  setUsers: users => set({
    users
  }),
  setIsLoading: value => set({
    isLoading: value
  }),
  setError: error => set({
    error
  })
}));