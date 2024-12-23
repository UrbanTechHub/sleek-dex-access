import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateWallet } from '@/utils/walletUtils';
import { storage } from '@/utils/localStorage';
import type { User } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = storage.getUser();
    console.log('Initial stored user:', storedUser); // Debug log
    return storedUser;
  });
  const navigate = useNavigate();

  // Persist user data whenever it changes
  useEffect(() => {
    if (user) {
      storage.setUser(user);
      console.log('User data updated in storage:', user); // Debug log
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

      setUser(newUser);
      storage.setUser(newUser);
      console.log('Account created with data:', newUser); // Debug log
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
      console.log('Attempting login with PIN:', pin); // Debug log
      console.log('Stored user data:', storedUser); // Debug log

      if (!storedUser) {
        toast.error('No account found. Please create one first.');
        throw new Error('No account found');
      }

      if (storedUser.pin === pin) {
        setUser(storedUser);
        console.log('Login successful:', storedUser); // Debug log
        toast.success('Login successful!');
        navigate('/wallet-dashboard');
      } else {
        console.log('PIN mismatch - Stored PIN:', storedUser.pin, 'Entered PIN:', pin); // Debug log
        toast.error('Invalid PIN');
        throw new Error('Invalid PIN');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      storage.removeUser();
      setUser(null);
      console.log('User logged out'); // Debug log
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