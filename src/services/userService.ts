import axiosInstance from '../utils/axios';
import { useUserStore } from '../stores/userStore';
import canI from '../function/CanI';
export interface UserData {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  location: string;
  isVerified: boolean;
  joinedDate: string;
  avatar?: string;
}
const UserService = {
  fetchUsers: async (permissions: string[]) => {
    const store = useUserStore.getState();
    const ICan = canI(permissions, 'users.view');
    if (!ICan) {
      return {
        success: false,
        message: "You do not have permission to view users"
      };
    }
    try {
      const response = await axiosInstance.get('/users/list');
      return {
        success: true,
        data: response.data.users,
        message: 'Users fetched successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch users';
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  },
  updateUserStatus: async (userId: number, status: string, permissions: string[]) => {
    const store = useUserStore.getState();
    const ICan = canI(permissions, 'users.edit');
    if (!ICan) {
      return {
        success: false,
        message: "You do not have permission to edit users"
      };
    }
    try {
      const response = await axiosInstance.put(`/users/${userId}/status`, {
        status
      });
      return {
        success: true,
        data: response.data,
        message: 'User status updated successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update user status';
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  },
  resendVerification: async (userId: number, permissions: string[]) => {
    const store = useUserStore.getState();
    const ICan = canI(permissions, 'users.edit');
    if (!ICan) {
      return {
        success: false,
        message: "You do not have permission to send verifications to users"
      };
    }
    try {
      const response = await axiosInstance.post(`/users/${userId}/resend-verification`);
      return {
        success: true,
        data: response.data,
        message: 'Verification email sent successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resend verification email';
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }
};
export default UserService;