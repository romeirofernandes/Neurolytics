import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/User/Dashboard'
import AdminAuth from './pages/Admin/AdminAuth'
import AdminDashboard from './pages/Admin/AdminDashboard'
import NotFoundPage from './pages/404Page'
import ExperimentBuilder from './pages/User/ExperimentBuilder'

// Inline route protection components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div>
          <Routes>
            {/* Public routes - accessible to everyone */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth routes - only accessible when NOT logged in */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            {/* Protected routes - only accessible when logged in */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/experiment-builder" element={
              <ProtectedRoute>
                <ExperimentBuilder />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* 404 route - catch all unmatched routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App