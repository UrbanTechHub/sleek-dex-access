import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateWallet } from '@/utils/walletUtils';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  toast.error('Configuration error. Please check console.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

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
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserData(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('Failed to initialize authentication');
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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