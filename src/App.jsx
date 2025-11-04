import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import HomePage from './pages/HomePage';
import ResidentDashboardPage from './pages/Residentsdashboard';
import SecretaryDashboardPage from './pages/Secretarydashboard';
import { ToastProvider } from './components/ToastNotification';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...');
      
      const response = await axios.get(`${API_BASE_URL}/auth/me`);

      if (response.data.success && response.data.user) {
        console.log('✅ User authenticated:', response.data.user);
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userType', response.data.user.role === 'admin' ? 'secretary' : 'resident');
      } else {
        console.log('❌ User not authenticated');
        clearAuth();
      }
    } catch (error) {
      console.log('❌ Auth check failed:', error.response?.data?.message || error.message);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userType');
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    checkAuth,
    logout
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('🚫 Not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('🚫 Wrong role, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route 
              path="/resident-dashboard" 
              element={
                <ProtectedRoute requiredRole="resident">
                  <ResidentDashboardPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/secretary-dashboard" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <SecretaryDashboardPage />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;