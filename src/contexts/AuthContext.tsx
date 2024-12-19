import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateWallet } from '@/utils/walletUtils';

interface User {
  id: string;
  pin: string;
  wallets: {
    id: string;
    network: 'ETH' | 'SOL' | 'USDT';
    address: string;
    balance: string;
  }[];
  transactions: {
    id: string;
    type: 'send' | 'receive';
    amount: string;
    currency: string;
    address: string;
    timestamp: string;
    status: 'pending' | 'completed' | 'failed';
  }[];
}

interface AuthContextType {
  user: User | null;
  login: (pin: string) => Promise<void>;
  logout: () => void;
  createAccount: (pin: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const createAccount = async (pin: string) => {
    try {
      // Generate wallets for each network
      const ethWallet = await generateWallet('ETH');
      const solWallet = await generateWallet('SOL');
      const usdtWallet = await generateWallet('USDT');

      const newUser: User = {
        id: crypto.randomUUID(),
        pin,
        wallets: [ethWallet, solWallet, usdtWallet],
        transactions: []
      };

      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      toast.success('Account created successfully!');
      navigate('/wallet-dashboard');
    } catch (error) {
      toast.error('Failed to create account');
      console.error(error);
    }
  };

  const login = async (pin: string) => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      toast.error('No account found');
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    if (parsedUser.pin !== pin) {
      toast.error('Invalid PIN');
      return;
    }

    setUser(parsedUser);
    toast.success('Login successful!');
    navigate('/wallet-dashboard');
  };

  const logout = () => {
    setUser(null);
    navigate('/');
  };

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