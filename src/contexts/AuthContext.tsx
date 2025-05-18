import React, { useEffect, createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import DashboardSkeletonLoader from '@/components/SkeletonLoader';
import axiosInstance from '@/utils/axios';

interface AuthContextType {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
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
    error,
    setUser,
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
          setIsAuthenticated(true);
        } catch (err) {
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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Real API call for login
      const response = await axiosInstance.post('/admin/login', {
        email,
        password
      });
      
      const token = response.data.access_token;
      const userData = response.data.admin; // Make sure this matches backend response key
      
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
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please try again.';
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
      
      const { user: newUser, token } = response.data;
      
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

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Real API call for password change
      await axiosInstance.post('/api/auth/change-password', {
        oldPassword,
        newPassword
      });
      
      // Success message can be handled by the component
    } catch (err: any) {
      console.error('Password change error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Password change failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Real API call for password reset
      await axiosInstance.post('/api/auth/reset-password', { email });
      
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
    return (
      <DashboardSkeletonLoader />
    );
  }

  return <AuthContext.Provider value={{
    user,
    token,
    isAuthenticated,
    isCheckingAuth,
    isLoading,
    error,
    login,
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