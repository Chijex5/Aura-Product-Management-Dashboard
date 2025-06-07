import axiosInstance from '../utils/axios';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/stores/authStore';
import { mark } from 'framer-motion/client';

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
  },
  deleteNotification: async (notificationId: number) => {
    const store = useAuthStore.getState();
    try {
      store.setError(null);
      await axiosInstance.delete(`/admin/notification/${notificationId}`);
      return {
        success: true,
        message: 'Notification deleted successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete notification';
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  },
  markNotificationAsRead: async (notificationId: number) => {
    const store = useAuthStore.getState();
    try {
      store.setError(null);
      await axiosInstance.put(`admin/notification/${notificationId}`);
      return {
        success: true,
        message: 'Notification marked as read successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to mark notification as read';
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  },
  markAllNotificationsAsRead: async () => {
    const store = useAuthStore.getState();
    try {
      store.setError(null);
      await axiosInstance.put('/admin/notification');
      return {
        success: true,
        message: 'All notifications marked as read successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to mark all notifications as read';
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}

export default SelfService;