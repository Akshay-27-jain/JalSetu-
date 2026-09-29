import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role, LoginResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
  isMainAdmin: boolean;
  isCommunityAdmin: boolean;
  isResident: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');
      if (savedToken && savedUserStr) {
        const savedUser: User = JSON.parse(savedUserStr);
        setToken(savedToken);
        setUser(savedUser);
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (response: LoginResponse) => {
    const newUser: User = {
      id: 0, // Assigned from token / backend
      email: response.email,
      fullName: response.fullName,
      phoneNumber: response.phoneNumber,
      role: response.role,
      apartmentId: response.apartmentId,
      householdId: response.householdId,
      apartmentName: response.apartmentName,
      flatNumber: response.flatNumber,
    };

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(response.token);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isMainAdmin = user?.role === 'MAIN_ADMIN';
  const isCommunityAdmin = user?.role === 'COMMUNITY_ADMIN';
  const isResident = user?.role === 'RESIDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        isMainAdmin,
        isCommunityAdmin,
        isResident,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
