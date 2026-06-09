import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vidyamitra_token') || null);
  const [loading, setLoading] = useState(true);

  // Check if token exists and fetch current user profile
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error("Auth validation failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = res.data;
      
      localStorage.setItem('vidyamitra_token', access_token);
      localStorage.setItem('vidyamitra_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      throw err.response?.data?.detail || "Login failed. Please verify credentials.";
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { access_token, user: userData } = res.data;
      
      localStorage.setItem('vidyamitra_token', access_token);
      localStorage.setItem('vidyamitra_user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      throw err.response?.data?.detail || "Registration failed. Please try again.";
    }
  };

  const logout = () => {
    localStorage.removeItem('vidyamitra_token');
    localStorage.removeItem('vidyamitra_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
