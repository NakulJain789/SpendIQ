import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('spendiq_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Check initial token and verify with backend
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('spendiq_token');
      const storedUser = localStorage.getItem('spendiq_user');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Ignore json parse error
        }
      }

      try {
        const res = await authAPI.getMe();
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('spendiq_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Initial session check failed:', err.message);
        localStorage.removeItem('spendiq_token');
        localStorage.removeItem('spendiq_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUser();

    // Listen for global auth expired event
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('spendiq_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('spendiq_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('spendiq_token', receivedToken);
      localStorage.setItem('spendiq_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      toast.success(`Welcome back, ${receivedUser.name.split(' ')[0]}!`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register({ name, email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('spendiq_token', receivedToken);
      localStorage.setItem('spendiq_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      toast.success(`Account created! Welcome to SpendIQ, ${receivedUser.name.split(' ')[0]}!`);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('spendiq_token');
    localStorage.removeItem('spendiq_user');
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
