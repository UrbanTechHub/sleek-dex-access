import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase';
import { generateWallet } from '@/utils/walletUtils';
import type { User } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser(data as User);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error fetching user data');
    }
  };

  const createAccount = async (pin: string) => {
    try {
      const email = `${crypto.randomUUID()}@temp.com`;
      const password = crypto.randomUUID();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from auth signup');

      const ethWallet = await generateWallet('ETH');
      const solWallet = await generateWallet('SOL');
      const usdtWallet = await generateWallet('USDT');

      const newUser: Omit<User, 'id'> = {
        pin,
        wallets: [ethWallet, solWallet, usdtWallet],
        transactions: [],
      };

      const { error: dbError } = await supabase
        .from('users')
        .insert([{ id: authData.user.id, ...newUser }]);

      if (dbError) throw dbError;

      await fetchUserData(authData.user.id);
      toast.success('Account created successfully!');
      navigate('/wallet-dashboard');
    } catch (error) {
      console.error('Account creation error:', error);
      toast.error('Failed to create account');
    }
  };

  const login = async (pin: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('pin', pin)
        .single();

      if (error || !data) {
        toast.error('Invalid PIN');
        return;
      }

      setUser(data as User);
      toast.success('Login successful!');
      navigate('/wallet-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return {
    user,
    login,
    logout,
    createAccount,
    fetchUserData,
  };
};