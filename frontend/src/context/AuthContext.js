// src/context/AuthContext.js
// Global authentication state - accessible from any component

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // True while checking stored token

  // On app load, check if there's a saved token and fetch user data
  useEffect(() => {
    const token = localStorage.getItem('skillswap_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('skillswap_token');
    } finally {
      setLoading(false);
    }
  };

  // Login: Save token and set user
  const login = (token, userData) => {
    localStorage.setItem('skillswap_token', token);
    setUser(userData);
  };

  // Logout: Clear everything
  const logout = () => {
    localStorage.removeItem('skillswap_token');
    setUser(null);
  };

  // Update user data (after profile edit)
  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
