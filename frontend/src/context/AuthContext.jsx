import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load user data on initial app load if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          setProfile(response.data.profile);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: receivedToken, user: loggedUser, profile: loggedProfile } = response.data;

        // Save to LocalStorage
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        if (loggedProfile) {
          localStorage.setItem('profile', JSON.stringify(loggedProfile));
        }

        // Update React State
        setToken(receivedToken);
        setUser(loggedUser);
        setProfile(loggedProfile);

        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (registerData) => {
    try {
      const response = await api.post('/auth/register', registerData);
      if (response.data.success) {
        const { token: receivedToken, user: loggedUser, profile: loggedProfile } = response.data;

        // Save to LocalStorage
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        if (loggedProfile) {
          localStorage.setItem('profile', JSON.stringify(loggedProfile));
        }

        // Update React State
        setToken(receivedToken);
        setUser(loggedUser);
        setProfile(loggedProfile);

        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please check your details.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use AuthContext easily in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
