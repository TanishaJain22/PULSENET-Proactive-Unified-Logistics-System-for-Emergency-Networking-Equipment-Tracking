import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '@/lib/api';
import { authApi, getAuthToken, setAuthToken, removeAuthToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (authResponse: AuthResponse) => {
    setAuthToken(authResponse.token);
    setUser({
      id: authResponse.userId,
      email: authResponse.email,
      role: authResponse.role as 'SYSTEM_ADMIN' | 'HOSPITAL_ADMIN' | 'USER',
      hospitalId: authResponse.hospitalId
    });
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    removeAuthToken();
    setUser(null);
    // Clear any other potential session data
    localStorage.clear();
    sessionStorage.clear();
  };

  const checkAuth = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('🔍 No auth token found');
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('🔍 Found existing token, setting demo user');
      
      // For demo purposes, if a token exists, assume user is logged in
      // In production, you'd validate the token with the backend
      setUser({
        id: 'demo-user-123',
        email: 'user@demo.com',
        role: 'USER'
      });
      
    } catch (error) {
      console.error('🚨 Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};