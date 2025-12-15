import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, generateNickname, CAMPUS_CODE } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role: UserRole, campusCode: string, adminEmail?: string, adminPassword?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  email: 'admin@campus.edu',
  password: 'admin123'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('campusvoice_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({ ...parsed, createdAt: new Date(parsed.createdAt) });
      } catch {
        localStorage.removeItem('campusvoice_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (role: UserRole, campusCode: string, adminEmail?: string, adminPassword?: string): Promise<boolean> => {
    if (campusCode !== CAMPUS_CODE) {
      return false;
    }

    if (role === 'admin') {
      if (adminEmail !== ADMIN_CREDENTIALS.email || adminPassword !== ADMIN_CREDENTIALS.password) {
        return false;
      }
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      role,
      nickname: role === 'student' ? generateNickname() : 'Administrator',
      createdAt: new Date(),
    };

    setUser(newUser);
    localStorage.setItem('campusvoice_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campusvoice_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
