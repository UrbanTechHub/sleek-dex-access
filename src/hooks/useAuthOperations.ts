import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateWallet } from '@/utils/walletUtils';
import { storage } from '@/utils/localStorage';
import type { User } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user state from localStorage on component mount
    return storage.getUser();
  });
  const navigate = useNavigate();

  // Persist user data whenever it changes
  useEffect(() => {
    if (user) {
      storage.setUser(user);
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

      storage.setUser(newUser);
      setUser(newUser);
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
      const storedUser = storage.getUser();
      if (storedUser && storedUser.pin === pin) {
        setUser(storedUser);
        toast.success('Login successful!');
        navigate('/wallet-dashboard');
      } else {
        toast.error('Invalid PIN');
        throw new Error('Invalid PIN');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      storage.removeUser();
      setUser(null);
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