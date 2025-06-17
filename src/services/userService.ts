import axiosInstance from '../utils/axios';
import { useUserStore } from '../stores/userStore';
import { normalizePermissions } from './permissionUtils';
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

// Cache configuration
const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  MAX_SIZE: 100 // Maximum number of cached entries
};

// Cache storage
interface CacheEntry {
  data: any;
  timestamp: number;
  key: string;
}

class UserCache {
  private cache = new Map<string, CacheEntry>();
  private lastFetchTime = 0;
  private isFetching = false;

  private generateCacheKey(permissions: string[]): string {
    return `users_${normalizePermissions(permissions).sort().join('_')}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > CACHE_CONFIG.TTL;
  }

  private cleanup(): void {
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // If cache is still too large, remove oldest entries
    if (this.cache.size > CACHE_CONFIG.MAX_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.cache.size - CACHE_CONFIG.MAX_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  get(permissions: string[]): CacheEntry | null {
    const key = this.generateCacheKey(permissions);
    const entry = this.cache.get(key);
    
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  set(permissions: string[], data: any): void {
    const key = this.generateCacheKey(permissions);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      key
    };
    
    this.cache.set(key, entry);
    this.cleanup();
  }

  invalidate(permissions?: string[]): void {
    if (permissions) {
      const key = this.generateCacheKey(permissions);
      this.cache.delete(key);
    } else {
      // Clear all user-related cache
      this.cache.clear();
    }
  }

  setFetchingState(isFetching: boolean): void {
    this.isFetching = isFetching;
    if (isFetching) {
      this.lastFetchTime = Date.now();
    }
  }

  shouldFetch(permissions: string[], forceRefresh = false): boolean {
    if (forceRefresh) return true;
    if (this.isFetching) return false;
    
    const cached = this.get(permissions);
    if (!cached) return true;
    
    // Check if cached data is empty or invalid
    if (!cached.data || !cached.data.users || cached.data.users.length === 0) {
      return true;
    }
    
    return false;
  }

  invalidateOnError(permissions: string[]): void {
    const key = this.generateCacheKey(permissions);
    this.cache.delete(key);
    this.isFetching = false;
  }

  clear(): void {
    this.cache.clear();
    this.lastFetchTime = 0;
    this.isFetching = false;
  }
}

// Global cache instance
const userCache = new UserCache();

const UserService = {
  fetchUsers: async (permissions: string[], forceRefresh = false) => {
    const store = useUserStore.getState();
    const ICan = canI(permissions, 'users.view');
    
    if (!ICan) {
      return {
        success: false,
        message: "You do not have permission to view users"
      };
    }

    // Check current store state - if users are empty, force fetch
    const currentUsers = store.users || [];
    const shouldForceRefresh = forceRefresh || currentUsers.length === 0;

    // Check cache first
    if (!userCache.shouldFetch(permissions, shouldForceRefresh)) {
      const cached = userCache.get(permissions);
      if (cached && cached.data && cached.data.users && cached.data.users.length > 0) {
        // Update store with cached data without loading state
        store.setUsers(cached.data.users);
        return {
          success: true,
          data: cached.data.users,
          message: 'Users fetched successfully'
        };
      }
    }

    try {
      userCache.setFetchingState(true);
      store.setError(null);
      
      const response = await axiosInstance.get('/users/list');
      
      if (response.data && response.data.users) {
        // Update store with fresh data
        store.setUsers(response.data.users);
        
        // Only cache if we have actual data
        if (response.data.users.length > 0) {
          userCache.set(permissions, response.data);
        }
        
        return {
          success: true,
          data: response.data.users,
          message: 'Users fetched successfully'
        };
      } else {
        // If response is empty or invalid, don't cache it
        userCache.invalidateOnError(permissions);
        return {
          success: false,
          message: 'No users data received'
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch users';
      store.setError(errorMessage);
      
      // Clear cache on error so next attempt will try API again
      userCache.invalidateOnError(permissions);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      userCache.setFetchingState(false);
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
      store.setError(null);
      
      const response = await axiosInstance.put(`/users/${userId}/status`, {
        status
      });
      
      // Invalidate cache after updating user status
      userCache.invalidate();
      
      // Update user in store if we have the updated data
      if (response.data && response.data.user) {
        store.updateUser(userId, response.data.user);
      }
      
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
      store.setError(null);
      
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
  },

  // Utility methods for cache management
  clearCache: () => {
    userCache.clear();
  },

  refreshUsers: async (permissions: string[]) => {
    return await UserService.fetchUsers(permissions, true);
  }
};

export default UserService;