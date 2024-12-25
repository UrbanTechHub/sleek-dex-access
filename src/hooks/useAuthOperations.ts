import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateWallet } from '@/utils/walletUtils';
import { storage } from '@/utils/localStorage';
import type { User } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = storage.getUser();
    console.log('Initial user state:', storedUser);
    return storedUser;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      storage.setUser(user);
      console.log('Updated user in storage:', user);
    }
  }, [user]);

  const createAccount = async (pin: string) => {
    try {
      if (!pin || pin.length < 6) {
        toast.error('PIN must be at least 6 characters long');
        throw new Error('Invalid PIN');
      }

      if (storage.hasExistingWallet()) {
        toast.error('A wallet already exists. Please use login instead.');
        throw new Error('Wallet already exists');
      }

      const userId = crypto.randomUUID();
      const defaultWalletName = "My Wallet";
      
      const [ethWallet, usdtWallet, btcWallet] = await Promise.all([
        generateWallet('ETH', `${defaultWalletName} - ETH`),
        generateWallet('USDT', `${defaultWalletName} - USDT`),
        generateWallet('BTC', `${defaultWalletName} - BTC`)
      ]);

      const newUser: User = {
        id: userId,
        pin,
        wallets: [ethWallet, usdtWallet, btcWallet],
        transactions: [],
      };

      storage.setUser(newUser);
      setUser(newUser);
      
      console.log('New account created:', newUser);
      toast.success('Account created successfully!');
      navigate('/wallet-dashboard');
    } catch (error) {
      console.error('Account creation error:', error);
      toast.error('Failed to create account. Please try again.');
      throw error;
    }
  };

  const login = async (pin: string) => {
    try {
      if (!pin || pin.length < 6) {
        toast.error('PIN must be at least 6 characters long');
        throw new Error('Invalid PIN');
      }

      const userData = storage.getUser();
      console.log('Retrieved user data for login:', userData);

      if (!userData) {
        console.log('No user account found in storage');
        toast.error('No wallet found. Please create one first.');
        throw new Error('No wallet found');
      }

      if (userData.pin !== pin) {
        toast.error('Incorrect PIN');
        throw new Error('Invalid PIN');
      }

      setUser(userData);
      console.log('Login successful:', userData);
      toast.success('Login successful!');
      navigate('/wallet-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      storage.removeUser();
      setUser(null);
      console.log('User logged out successfully');
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
      throw error;
    }
  };

  return {
    user,
    login,
    logout,
    createAccount,
  };
};