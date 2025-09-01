import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BondMarket from './pages/BondMarket';
import Trading from './pages/Trading';
import Portfolio from './pages/Portfolio';
import Profile from './pages/Profile';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Hooks
import { useAuth } from './hooks/useAuth';

// Main App Content
const AppContent = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8, // Account for navbar height
          pl: { xs: 0, md: sidebarOpen ? 0 : 0 },
          transition: 'padding-left 0.3s ease',
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <BondMarket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trading/:bondId?"
            element={
              <ProtectedRoute>
                <Trading />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WebSocketProvider>
          <AppContent />
        </WebSocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;