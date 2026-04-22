import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "staff" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string | UserRole;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateAvatar: (url: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('vpsims_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData: User, token: string) => {
    localStorage.setItem('vpsims_token', token);
    localStorage.setItem('vpsims_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('vpsims_token');
    localStorage.removeItem('vpsims_user');
    setUser(null);
  };

  const updateAvatar = (url: string) => {
    if (user) {
      const updatedUser = { ...user, avatarUrl: url };
      setUser(updatedUser);
      localStorage.setItem('vpsims_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateAvatar, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
