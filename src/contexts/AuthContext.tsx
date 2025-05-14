import React, { useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
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
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setIsAuthenticated,
    setIsLoading,
    setError
  } = useAuthStore();
  useEffect(() => {
    // Check for stored auth token on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token and fetch user data
      validateAndFetchUser(token);
    }
  }, []);
  const validateAndFetchUser = async (token: string) => {
    try {
      setIsLoading(true);
      // TODO: Add API call to validate token and get user data
      // For now, we'll simulate it
      const userData = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com'
      };
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Session expired. Please login again.');
      logout();
    } finally {
      setIsLoading(false);
    }
  };
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Add actual API call
      // Simulated API call
      if (email === 'admin@example.com' && password === 'password') {
        const userData = {
          id: '1',
          name: 'Admin User',
          email
        };
        const token = 'dummy-token';
        localStorage.setItem('authToken', token);
        setUser(userData);
        setIsAuthenticated(true);
        navigate('/');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  const signup = async (userData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Add actual API call
      // Simulated API call
      const token = 'dummy-token';
      localStorage.setItem('authToken', token);
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Add actual API call
      // Simulated API call
      if (oldPassword === 'password') {
        // Password changed successfully
        return true;
      } else {
        throw new Error('Current password is incorrect');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Add actual API call
      // Simulated API call
      // In a real app, this would send a reset link to the user's email
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  return <AuthContext.Provider value={{
    user,
    isAuthenticated,
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