import { create } from 'zustand';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin: string;
  avatar: string;
}
interface AdminStore {
  admins: Admin[];
  isLoading: boolean;
  error: string | null;
  setAdmins: (admins: Admin[]) => void;
  addAdmin: (admin: Admin) => void;
  updateAdmin: (id: number, updates: Partial<Admin>) => void;
  deleteAdmin: (id: number) => void;
  setIsLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
}
export const useAdminStore = create<AdminStore>(set => ({
  admins: [],
  isLoading: false,
  error: null,
  setAdmins: admins => set({
    admins
  }),
  addAdmin: admin => set(state => ({
    
    admins: [...state.admins, admin]
  })),
  updateAdmin: (id, updates) => set(state => ({
    admins: state.admins.map(admin => admin.id === id ? {
      ...admin,
      ...updates
    } : admin)
  })),
  deleteAdmin: id => set(state => ({
    admins: state.admins.filter(admin => admin.id !== id)
  })),
  setIsLoading: value => set({
    isLoading: value
  }),
  setError: error => set({
    error
  })
}));