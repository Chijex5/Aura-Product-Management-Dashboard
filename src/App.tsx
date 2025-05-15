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
export function App() {
  return <Router>
      <AuthProvider>
        <MobileMenuProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="products" element={<Products />} />
                      <Route path="admins" element={<Admins />} />
                      <Route path="statistics" element={<Statistics />} />
                      <Route path="resources" element={<Resources />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>} />
          </Routes>
        </MobileMenuProvider>
      </AuthProvider>
    </Router>;
}