import { useAdminStore } from '@/stores/adminStore';
import AdminService, { AdminData } from '@/services/adminService';

/**
 * Custom hook to handle admin-related API operations
 */
export const useAdminApi = () => {
  const {
    admins,
    isLoading,
    error,
    setAdmins,
    setIsLoading,
    setError,
    addAdmin,
    updateAdmin: updateLocalAdmin,
    deleteAdmin: deleteLocalAdmin
  } = useAdminStore();

  /**
   * Fetch all admins on component mount
   */
  const loadAdmins = async (permissions: string[]) => {
    try {
      await AdminService.fetchAdmins(permissions);
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  /**
   * Create a new admin
   */
  const createAdmin = async (adminData: AdminData, permissions:string[]) => {
    try {
      const result = await AdminService.createAdmin(adminData, permissions);
      return result;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  };

  /**
   * Update an existing admin
   */
  const updateAdmin = async (id: number, permissions:string[], updates: Partial<AdminData>) => {
    try {
      const result = await AdminService.updateAdmin(id, permissions, updates);
      return result;
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  };

  /**
   * Delete an admin
   */
  const deleteAdmin = async (id: number, permissions: string[]) => {
    try {
      const result = await AdminService.deleteAdmin(id, permissions);
      return result;
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  };

  /**
   * Get current admin profile
   */
  const getCurrentAdmin = async () => {
    try {
      const admin = await AdminService.getAdminProfile();
      return admin;
    } catch (error) {
      console.error('Error fetching current admin profile:', error);
      throw error;
    }
  };

  return {
    admins,
    isLoading,
    error,
    loadAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getCurrentAdmin,
  };
};

export default useAdminApi;