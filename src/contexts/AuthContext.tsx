import React, { createContext, useContext } from 'react';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import type { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authOperations = useAuthOperations();

  return (
    <AuthContext.Provider value={authOperations}>
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