import React, { createContext, useContext, useState } from 'react';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import type { AuthContextType, User } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, login, logout, createAccount } = useAuthOperations();

  return (
    <AuthContext.Provider value={{ user, login, logout, createAccount }}>
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