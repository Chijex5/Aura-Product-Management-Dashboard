import axiosInstance from '../utils/axios';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/stores/authStore';

interface ServiceResponse {
  success: boolean;
  message: string;
}

interface SelfServiceType {
  updateSelf: (userData: Partial<User>) => Promise<ServiceResponse>;
  deleteNotification: (notificationId: number) => Promise<ServiceResponse>;
  markNotificationAsRead: (notificationId: number) => Promise<ServiceResponse>;
  markAllNotificationsAsRead: () => Promise<ServiceResponse>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<ServiceResponse>;
}

const SelfService: SelfServiceType = {
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
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const store = useAuthStore.getState();
      store.setError(null);
      await axiosInstance.post('/admin/change_password', { oldPassword, newPassword });
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      const store = useAuthStore.getState();
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}

export default SelfService;