import React, { useEffect, createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import DashboardSkeletonLoader from '@/components/loaders/SkeletonLoader';
import axiosInstance from '@/utils/axios';
interface User {
  admin_id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatar: string;
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendResetLink: (email: string) => Promise<{ success: boolean, message?: string, error?: any }>; 
  signup: (userData: any) => Promise<void>;
  verify: (verifyToken: string, password: string) => Promise<void>;
  validateResetToken: (verificationToken: string) => Promise<{success: boolean, message?: string, admin?: User, error?: string }>;
  logout: () => void;
  changePassword: (newPassword: string, token: string) => Promise<{ success: boolean, message?: string, error?: any }>;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  isNotVerified: boolean;
  verificationToken: string;
  error: string | null;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const {
    user,
    token,
    isAuthenticated,
    isCheckingAuth,
    setIsCheckingAuth,
    isLoading,
    isNotVerified,
    setIsNotVerified,
    setVerificationToken,
    verificationToken,
    error,
    setUser,
    setActivityLogs,
    setNotifications,
    setToken,
    setIsAuthenticated,
    setIsLoading,
    setError
  } = useAuthStore();

  // Add a state to track if initial auth check is complete
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true); // Start checking auth
        setIsLoading(true);
        const storedToken = localStorage.getItem('authToken');
        if (!storedToken) {
          // No token found, mark auth check as complete and exit
          setAuthCheckComplete(true);
          setIsLoading(false);
          setIsCheckingAuth(false); // FIXED: Set to false when check is complete
          return;
        }

        // Set token in state
        setToken(storedToken);

        // Validate token and fetch user data
        try {
          // Real API call to validate token and get user data
          const response = await axiosInstance.get('/api/auth/me');
          setUser(response.data.admin);
          setActivityLogs(response.data.activity_logs)
          setNotifications(response.data.notifications || []);
          setIsAuthenticated(true);
        } catch (err: any) {
          console.error('Auth validation error:', err.response?.data || err.message);
          setError('Session expired. Please login again.');

          // Clear invalid token
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setIsCheckingAuth(false); // FIXED: Set to false when check is complete
        setAuthCheckComplete(true);
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const validateResetToken = async (verificationToken: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await axiosInstance.get(`/admin/validate-reset-token?token=${verificationToken}`);
      
      return {
        success: true,
        message: response.data.message,
        user: response.data.admin,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Internal Server Error. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally{
      setIsLoading(false);
    }
  };

  const sendResetLink = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.post('/admin/send-reset-link', {
        email
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Internal Server Error. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsNotVerified(false);
      const response = await axiosInstance.post('/admin/login', {
        email,
        password
      });
      if (response.status == 201) {
        setError(response.data.error);
        setIsNotVerified(true);
        setVerificationToken(response.data.token);
        return;
      }
      const token = response.data.access_token;
      const userData = response.data.admin;
      const activityLogData = response.data.activity_logs;

      if (!token) {
        throw new Error('No token received from server');
      }
      localStorage.setItem('authToken', token);
      setToken(token);
      setUser(userData);
      setActivityLogs(activityLogData);
      setNotifications(response.data.notifications || []);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Internal Sever Error. Please try again.';
      setError(errorMessage);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  const verify = async (verifyToken: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsNotVerified(false);
      const response = await axiosInstance.post('/admin/verify', {
        "token": verifyToken,
        "password": password
      });
      const token = response.data.access_token;
      const userData = response.data.admin;
      if (!token) {
        throw new Error('No token received from server');
      }
      localStorage.setItem('authToken', token);
      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Verification failed. Please try again.';
      setError(errorMessage);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  const signup = async (userData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Real API call for signup
      const response = await axiosInstance.post('/api/auth/signup', userData);
      const {
        user: newUser,
        token
      } = response.data;
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token in localStorage and state
      localStorage.setItem('authToken', token);
      setToken(token);
      setUser(newUser);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err: any) {
      console.error('Signup error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    // Clear token from localStorage and state
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };
  const changePassword = async (newPassword: string, token: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.post('/admin/reset-password', {
        token: token,
        new_password: newPassword
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Password reset failed. Please try again.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Real API call for password reset
      await axiosInstance.post('/api/auth/reset-password', {
        email
      });

      // Success message can be handled by the component
    } catch (err: any) {
      console.error('Password reset error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Password reset failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Block rendering until initial auth check is complete
  if (!authCheckComplete) {
    return <DashboardSkeletonLoader />;
  }
  return <AuthContext.Provider value={{
    user,
    token,
    isAuthenticated,
    isCheckingAuth,
    validateResetToken,
    sendResetLink,
    isLoading,
    isNotVerified,
    verificationToken,
    error,
    login,
    verify,
    signup,
    logout,
    changePassword,
    resetPassword
  }}>
      {children}
    </AuthContext.Provider>;
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};