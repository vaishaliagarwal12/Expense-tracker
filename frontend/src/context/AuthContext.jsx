import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fintrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fintrack_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await authApi.me();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('fintrack_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { user: userData, token: jwtToken } = res.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('fintrack_token', jwtToken);
    localStorage.setItem('fintrack_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const { user: userData, token: jwtToken } = res.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('fintrack_token', jwtToken);
    localStorage.setItem('fintrack_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
    authApi.logout().catch(() => {});
  };

  const updateProfile = async (data) => {
    const res = await authApi.updateProfile(data);
    if (res.data && res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('fintrack_user', JSON.stringify(res.data.user));
    }
    return res.data?.user;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
