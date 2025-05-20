// src/services/adminService.ts
import axiosInstance from '@/utils/axios';
import { useAdminStore } from '@/stores/adminStore';
import canI from '@/function/CanI';

export interface AdminData {
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: string[];
}

export interface AdminResponse {
  admin_id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[] | string;
  last_login: string;
  avatar: string;
}

/**
 * Transform API response to match our Admin interface
 */
const transformAdminData = (adminData: AdminResponse) => {
  return {
    id: adminData.admin_id,
    name: adminData.name,
    email: adminData.email,
    role: adminData.role,
    permissions: typeof adminData.permissions === 'string' 
      ? JSON.parse(adminData.permissions) 
      : adminData.permissions,
    lastLogin: adminData.last_login,
    avatar: adminData.avatar
  };
};

/**
 * Admin API Services
 */
export const AdminService = {
  /**
   * Fetch all admins from the API
   */
  fetchAdmins: async (permissions: string[]) => {

    const store = useAdminStore.getState();
    const ICan = canI(permissions, 'admin.view');
    if(!ICan) {
        store.setError('You do not have permission to see the admin list');
         return{
          success: false,
          message: "You do not have permission to see the admin list",
        };
    }
    try {
      store.setIsLoading(true);
      store.setError(null);
      
      const response = await axiosInstance.get('/admin/list');
      
      if (response.data && response.data.admins) {
        const transformedAdmins = response.data.admins.map(transformAdminData);
        store.setAdmins(transformedAdmins);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch admins';
      store.setError(errorMessage);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  },
  
  /**
   * Get current admin profile
   */
  getAdminProfile: async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      
      if (response.data && response.data.admin) {
        return transformAdminData(response.data.admin);
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Create a new admin
   */
  createAdmin: async (adminData: AdminData, permissions: string[]) => {
    const store = useAdminStore.getState();
    const ICan = canI(permissions, 'admin.create');
    if(!ICan) {
        // store.setError('You do not have permission to create an admin');
         return{
          success: false,
          message: "You do not have permission to create an admin",
        };
    }
    try {
      store.setIsLoading(true);
      store.setError(null);
      
      const response = await axiosInstance.post('/admin/create', adminData);
      await AdminService.fetchAdmins( permissions );
      
      return {
        success: true,
        data: response.data,
        message: 'Admin created successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create admin';
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
      
    } finally {
      store.setIsLoading(false);
    }
  },
  
  updateAdmin: async (id: number, permissions: string[], updates: Partial<AdminData>) => {
    const store = useAdminStore.getState();
    const ICan = canI(permissions, 'admin.edit');
    if(!ICan) {
        // store.setError('You do not have permission to update an admin');
        return{
          success: false,
          message: "You do not have permission to update an admin",
        };
    }
    try {
      store.setIsLoading(true);
      store.setError(null);
      
      // Assuming there's an endpoint like /admin/update/:id
      const response = await axiosInstance.put(`/admin/update/${id}`, updates);
      
      // Update the local store if the API call was successful
      if (response.status === 200 && response.data) {
        const updatedAdmin = transformAdminData(response.data.admin);
        store.updateAdmin(id, updatedAdmin);
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Admin updated successfully'
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update admin';
      store.setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      store.setIsLoading(false);
    }
  },
  
  deleteAdmin: async (id: number, permissions: string[]) => {

    const store = useAdminStore.getState();
    const ICan = canI(permissions, 'admin.delete');
    if(!ICan) {
        // store.setError('You do not have permission to delete an admin');
         return{
          success: false,
          message: "You do not have permission to delete an admin",
        };
    }
    
    try {
      store.setIsLoading(true);
      store.setError(null);
      
      const response = await axiosInstance.delete(`/admin/delete/${id}`);
      
      // Update the store if deletion was successful
      if (response.status === 200) {
        store.deleteAdmin(id);
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete admin';
      store.setError(errorMessage);
      throw error;
    } finally {
      store.setIsLoading(false);
    }
  }
};

export default AdminService;
