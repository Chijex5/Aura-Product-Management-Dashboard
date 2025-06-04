import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MobileMenuProvider } from './contexts/MobileMenuContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Admins from './pages/Admins';
import Statistics from './pages/Statistics';
import Resources from './pages/Resources';
import Layout from './components/layout/Layout';
import Users from './pages/Users'
import AdminProfile from './pages/AdminProfile';


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