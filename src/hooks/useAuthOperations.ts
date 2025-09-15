import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateWallet } from '@/utils/walletUtils';
import { storage, ensureFlashDriveAccess } from '@/utils/localStorage';
import { flashDriveStorage } from '@/utils/flashDriveStorage';
import type { User } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        setIsLoading(true);
        
        // Check if flash drive is supported first
        if (!flashDriveStorage.isSupported) {
          console.log('Flash drive not supported, skipping initialization');
          setIsLoading(false);
          return;
        }
        
        // Try to load user data from flash drive
        const storedUser = await storage.loadUserFromFlashDrive();
        if (storedUser) {
          console.log('Initial user state loaded from flash drive:', storedUser);
          setUser(storedUser);
        } else {
          console.log('No user data found on flash drive');
        }
      } catch (error) {
        console.error('Failed to initialize auth from flash drive:', error);
        // Don't show error toast on initialization - just log it
      } finally {
        console.log('Auth initialization complete, setting loading to false');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user && !isLoading) {
      // Save user data to flash drive whenever user state changes
      storage.saveUserToFlashDrive().catch(console.error);
    }
  }, [user, isLoading]);

  const createAccount = async (pin: string) => {
    try {
      console.log('Starting account creation with PIN length:', pin.length);
      
      if (!pin || pin.length < 6) {
        toast.error('PIN must be at least 6 characters long');
        throw new Error('Invalid PIN');
      }

      // Ensure flash drive access before creating account
      console.log('Checking flash drive access...');
      const hasAccess = await ensureFlashDriveAccess();
      if (!hasAccess) {
        console.error('Flash drive access denied');
        toast.error('Flash drive access required to create wallet');
        throw new Error('Flash drive access required');
      }
      console.log('Flash drive access confirmed');

      const userId = crypto.randomUUID();
      console.log('Generated user ID:', userId);
      
      console.log('Generating wallets for all networks...');
      const wallets = [];
      
      try {
        const ethWallet = await generateWallet('ETH');
        console.log('ETH wallet generated successfully');
        wallets.push(ethWallet);
      } catch (error) {
        console.error('Failed to generate ETH wallet:', error);
        throw new Error('Failed to generate ETH wallet');
      }

      try {
        const btcWallet = await generateWallet('BTC');
        console.log('BTC wallet generated successfully');
        wallets.push(btcWallet);
      } catch (error) {
        console.error('Failed to generate BTC wallet:', error);
        throw new Error('Failed to generate BTC wallet');
      }

      try {
        const solWallet = await generateWallet('SOL');
        console.log('SOL wallet generated successfully');
        wallets.push(solWallet);
      } catch (error) {
        console.error('Failed to generate SOL wallet:', error);
        throw new Error('Failed to generate SOL wallet');
      }

      try {
        const tronWallet = await generateWallet('TRON');
        console.log('TRON wallet generated successfully');
        wallets.push(tronWallet);
      } catch (error) {
        console.error('Failed to generate TRON wallet:', error);
        throw new Error('Failed to generate TRON wallet');
      }

      const newUser: User = {
        id: userId,
        pin,
        wallets,
        transactions: [],
      };

      console.log('Setting user in context...');
      setUser(newUser);
      
      // Save immediately to flash drive
      console.log('Saving user data to flash drive...');
      const saved = await storage.saveUserToFlashDrive();
      if (!saved) {
        console.error('Failed to save user data to flash drive');
        toast.error('Failed to save wallet to flash drive');
        throw new Error('Failed to save to flash drive');
      }
      
      console.log('Account creation completed successfully');
      toast.success('Account created and saved to flash drive!');
      navigate('/wallet-dashboard');
    } catch (error) {
      console.error('Account creation error:', error);
      toast.error(`Failed to create account: ${error.message}`);
      throw error;
    }
  };

  const login = async (pin: string) => {
    try {
      if (!pin || pin.length < 6) {
        toast.error('PIN must be at least 6 characters long');
        throw new Error('Invalid PIN');
      }

      // Ensure flash drive access before login
      const hasAccess = await ensureFlashDriveAccess();
      if (!hasAccess) {
        toast.error('Flash drive access required to login');
        throw new Error('Flash drive access required');
      }

      // Load user data from flash drive
      const userData = await storage.loadUserFromFlashDrive();
      console.log('Retrieved user data for login from flash drive:', userData);

      if (!userData) {
        console.log('No user account found on flash drive');
        toast.error('No wallet found on flash drive. Please create one first.');
        throw new Error('No wallet found');
      }

      if (userData.pin !== pin) {
        toast.error('Incorrect PIN');
        throw new Error('Invalid PIN');
      }

      setUser(userData);
      console.log('Login successful with flash drive data:', userData);
      toast.success('Login successful!');
      navigate('/wallet-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      console.log('User logged out successfully');
      
      // Disconnect from flash drive
      flashDriveStorage.disconnect();
      
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
    isLoading,
  };
};
