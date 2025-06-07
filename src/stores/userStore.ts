import { create } from 'zustand';
import { UserData } from '../services/userService';

interface UserStore {
  users: UserData[];
  isLoading: boolean;
  error: string | null;
  setUsers: (users: UserData[]) => void;
  updateUser: (userId: number, updatedUser: Partial<UserData>) => void;
  deleteUser: (userId: number) => void;
  addUser: (user: UserData) => void;
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
  
  updateUser: (userId, updatedUser) => set(state => ({
    users: state.users.map(user => 
      user.user_id === userId 
        ? { ...user, ...updatedUser }
        : user
    )
  })),
  
  deleteUser: (userId) => set(state => ({
    users: state.users.filter(user => user.user_id !== userId)
  })),
  
  addUser: (user) => set(state => ({
    users: [...state.users, user]
  })),
  
  setIsLoading: value => set({
    isLoading: value
  }),
  
  setError: error => set({
    error
  })
}));