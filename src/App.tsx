import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MobileMenuProvider } from './contexts/MobileMenuContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import ResetPasswordPage from './pages/auth/ResetPasswordpage';
import NotificationPage from './pages/NotificationPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import OrderAdminDashboard from './pages/OrderPage';
import Admins from './pages/Admins';
import Statistics from './pages/Statistics';
import Resources from './pages/Resources';
import Layout from './components/layout/Layout';
import Users from './pages/Users'
import AdminProfile from './pages/AdminProfile';

const VerificationRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  // Redirect to login if no token is provided
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};


export function App() {
  return (
    <Router>
      <AuthProvider>
        <MobileMenuProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard route */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Reset Password route */}
            <Route path="/reset-password" element={
              <VerificationRoute>             
                <ResetPasswordPage />
              </VerificationRoute>
            } />
            
            {/* Profile route */}
            <Route path="/account/profile" element={
              <ProtectedRoute>
                <Layout>
                  <AdminProfile />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Products route */}
            <Route path="/products" element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admins route */}
            <Route path="/admins" element={
              <ProtectedRoute>
                <Layout>
                  <Admins />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Order route */}
            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout>
                  <OrderAdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Statistics route */}
            <Route path="/statistics" element={
              <ProtectedRoute>
                <Layout>
                  <Statistics />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Resources route */}
            <Route path="/resources" element={
              <ProtectedRoute>
                <Layout>
                  <Resources />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <Layout>
                  <NotificationPage />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Users route */}
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </MobileMenuProvider>
      </AuthProvider>
    </Router>
  );
}