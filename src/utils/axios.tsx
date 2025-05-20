// src/utils/axios.ts
import axios from 'axios';

// Create a custom axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to every request
axiosInstance.interceptors.request.use(config => {
  // Get token from localStorage for every request
  const token = localStorage.getItem('authToken');

  // If token exists, add it to the Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(response => response, error => {
  // Handle 401 Unauthorized errors (expired token, etc.)
  if (error.response && error.response.status === 401) {
    // Clear localStorage and redirect to login
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

// Create a multipart form instance for file uploads
export const uploadAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:5000',
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Add the same request interceptor for auth token
uploadAxiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Helper function for file uploads
export const uploadFile = async (url: string, file: File, additionalData = {}) => {
  const formData = new FormData();
  formData.append('image', file);

  // Add any additional data fields
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value as string);
  });
  return uploadAxiosInstance.post(url, formData);
};
export default axiosInstance;