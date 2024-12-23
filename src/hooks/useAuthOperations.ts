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
      const userId = crypto.randomUUID();
      const defaultWalletName = "My Wallet";
      const ethWallet = await generateWallet('ETH', `${defaultWalletName} - ETH`);
      const usdtWallet = await generateWallet('USDT', `${defaultWalletName} - USDT`);
      const btcWallet = await generateWallet('BTC', `${defaultWalletName} - BTC`);

      const newUser: User = {
        id: userId,
        pin,
        wallets: [ethWallet, usdtWallet, btcWallet],
        transactions: [],
      };

      // First save to storage, then update state
      storage.setUser(newUser);
      setUser(newUser);
      
      console.log('New account created:', newUser);
      toast.success('Account created successfully!');
      navigate('/wallet-dashboard');
    } catch (error) {
      console.error('Account creation error:', error);
      toast.error('Failed to create account');
      throw error;
    }
  };

  const login = async (pin: string) => {
    try {
      console.log('Attempting login with PIN:', pin);
      const storedUser = storage.getUser();
      console.log('Retrieved user data for login:', storedUser);

      if (!storedUser) {
        console.log('No user account found in storage');
        toast.error('No account found. Please create one first.');
        throw new Error('No account found');
      }

      if (storedUser.pin !== pin) {
        console.log('PIN mismatch - Stored:', storedUser.pin, 'Entered:', pin);
        toast.error('Invalid PIN');
        throw new Error('Invalid PIN');
      }

      setUser(storedUser);
      console.log('Login successful:', storedUser);
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