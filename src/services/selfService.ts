import axiosInstance from '../utils/axios';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/stores/authStore';

const SelfService = {
  updateSelf: async (userData: Partial<User>) => {
    const store = useAuthStore.getState();
    try {
      store.setError(null);
      await axiosInstance.put('/self/update', userData);
      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}

export default SelfService;