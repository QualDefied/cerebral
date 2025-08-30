import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always set a default user - no authentication required
  const [user] = useState<User>({
    id: 'demo-user',
    email: 'demo@teamshell.com',
    firstName: 'Demo',
    lastName: 'User'
  });
  const [loading] = useState(false);

  useEffect(() => {
    // Set a default token for API calls
    axios.defaults.headers.common['Authorization'] = 'Bearer demo-token';
  }, []);

  const login = async (email: string, password: string) => {
    // No-op since we're skipping authentication
    console.log('Login bypassed - direct access enabled');
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // No-op since we're skipping authentication
    console.log('Registration bypassed - direct access enabled');
  };

  const logout = () => {
    // No-op since we're skipping authentication
    console.log('Logout bypassed - direct access enabled');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}