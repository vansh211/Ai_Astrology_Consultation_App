import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure backend API base URL
axios.defaults.baseURL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [astrologerProfile, setAstrologerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup request interceptor to attach JWT token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('cosmic_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Validate token and fetch user details on load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('cosmic_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/auth/me');
        setUser(response.data.user);
        if (response.data.astrologer) {
          setAstrologerProfile(response.data.astrologer);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('cosmic_token');
        setUser(null);
        setAstrologerProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/register', userData);
      localStorage.setItem('cosmic_token', response.data.token);
      setUser(response.data.user);
      if (response.data.astrologer) {
        setAstrologerProfile(response.data.astrologer);
      }
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please check inputs.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', { email, password });
      localStorage.setItem('cosmic_token', response.data.token);
      setUser(response.data.user);
      if (response.data.astrologer) {
        setAstrologerProfile(response.data.astrologer);
      }
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials'
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('cosmic_token');
    setUser(null);
    setAstrologerProfile(null);
  };

  // Update astrologer profile locally after saving
  const updateLocalAstrologerProfile = (updatedProfile) => {
    setAstrologerProfile(updatedProfile);
  };

  const value = {
    user,
    astrologerProfile,
    loading,
    register,
    login,
    logout,
    updateLocalAstrologerProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
