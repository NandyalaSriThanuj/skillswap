// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import SignupPage          from './pages/SignupPage';
import DashboardPage       from './pages/DashboardPage';
import ProfilePage         from './pages/ProfilePage';
import EditProfilePage     from './pages/EditProfilePage';
import UserProfilePage     from './pages/UserProfilePage';
import SearchPage          from './pages/SearchPage';
import ExchangesPage       from './pages/ExchangesPage';
import ExchangeDetailPage  from './pages/ExchangeDetailPage';
import MessagesPage        from './pages/MessagesPage';
import AdminPage           from './pages/AdminPage';
import BarterPage          from './pages/Barter';

// Loading spinner
const FullPageSpinner = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
    <div style={{ textAlign:'center' }}>
      <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--accent)', animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
      <p style={{ color:'var(--muted)', fontFamily:'Space Grotesk, sans-serif' }}>Loading SkillSwap…</p>
    </div>
  </div>
);

// Route guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.is_admin ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public (logged-out) */}
      <Route path="/"        element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login"   element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup"  element={<PublicRoute><SignupPage /></PublicRoute>} />

      {/* Protected */}
      <Route path="/dashboard"         element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/edit"      element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
      <Route path="/users/:id"         element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
      <Route path="/search"            element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/exchanges"         element={<ProtectedRoute><ExchangesPage /></ProtectedRoute>} />
      <Route path="/exchanges/:id"     element={<ProtectedRoute><ExchangeDetailPage /></ProtectedRoute>} />
      <Route path="/messages"          element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminPage /></AdminRoute></ProtectedRoute>} />

      {/* Barter Hub — accessible logged in or out (has internal auth) */}
      <Route path="/barter" element={<BarterPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--surface2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 14,
            },
            success: { iconTheme: { primary: '#43e97b', secondary: '#0a0a0f' } },
            error:   { iconTheme: { primary: '#ff6b6b', secondary: '#0a0a0f' } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
