import { useUserStore } from '../stores/userStore';
import UserService from '../services/userService';
export const useUserApi = () => {
  const {
    users,
    isLoading,
    error,
    setUsers,
    setIsLoading,
    setError
  } = useUserStore();
  const loadUsers = async (permissions: string[]) => {
    try {
      setIsLoading(true);
      const response = await UserService.fetchUsers(permissions);
      if (response.success) {
        setUsers(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
      return {
        success: false,
        message: 'Failed to load users'
      };
    } finally {
      setIsLoading(false);
    }
  };
  const updateUserStatus = async (userId: number, status: string, permissions: string[]) => {
    try {
      setIsLoading(true);
      const response = await UserService.updateUserStatus(userId, status, permissions);
      if (response.success) {
        await loadUsers(permissions);
      }
      return response;
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
      return {
        success: false,
        message: 'Failed to update user status'
      };
    } finally {
      setIsLoading(false);
    }
  };
  const resendVerification = async (userId: number, permissions: string[]) => {
    try {
      setIsLoading(true);
      const response = await UserService.resendVerification(userId, permissions);
      if (response.success) {
        await loadUsers(permissions);
      }
      return response;
    } catch (error) {
      console.error('Error resending verification email:', error);
      setError('Failed to send user verification email');
      return {
        success: false,
        message: 'Failed to resend verfication Email'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    error,
    loadUsers,
    resendVerification,
    updateUserStatus
  };
};
export default useUserApi;