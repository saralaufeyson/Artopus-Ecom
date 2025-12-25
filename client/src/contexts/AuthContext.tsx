import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Optionally fetch user info from backend using token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (credentials: { email: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await axios.post('/api/auth/login', credentials);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData: { name: string; email: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
