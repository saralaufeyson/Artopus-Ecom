import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  whatsappNumber?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { name: string; email: string; password: string; phone?: string; whatsappNumber?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const isUser = (value: unknown): value is User => {
  if (!value || typeof value !== 'object') return false;

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string'
    && typeof user.name === 'string'
    && typeof user.email === 'string'
    && typeof user.role === 'string'
  );
};

const parseAuthResponse = (data: unknown): { token: string; user: User } | null => {
  if (!data || typeof data !== 'object') return null;

  const response = data as Record<string, unknown>;
  if (typeof response.token !== 'string' || !response.token || !isUser(response.user)) {
    return null;
  }

  return { token: response.token, user: response.user };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(!!localStorage.getItem('token'));

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Error fetching user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await axios.post('/api/auth/login', credentials);
      const authResponse = parseAuthResponse(res.data);
      if (!authResponse) {
        return { success: false, error: 'Invalid response from login server' };
      }

      const { token: newToken, user: userData } = authResponse;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : 'Login failed';
      return { success: false, error: errorMsg || 'Login failed' };
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phone?: string; whatsappNumber?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      const authResponse = parseAuthResponse(res.data);
      if (!authResponse) {
        return { success: false, error: 'Invalid response from registration server' };
      }

      const { token: newToken, user: newUser } = authResponse;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = axios.isAxiosError(err) ? err.response?.data?.message : 'Registration failed';
      return { success: false, error: errorMsg || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
