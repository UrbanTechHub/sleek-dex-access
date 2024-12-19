import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateWallet } from '@/utils/walletUtils';
import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://weeatsonmgbshxrpiaso.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlZWF0c29ubWdic2h4cnBpYXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MDYyNTQsImV4cCI6MjA1MDE4MjI1NH0.2SXYojF_InZR4yBzzIIWfj6Is9tfmB7KOk0KMTMmkEA';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      toast.error('Error fetching user data');
      return;
    }

    if (data) {
      setUser(data as User);
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
        .insert([{ id: authData.user?.id, ...newUser }]);

      if (dbError) throw dbError;

      await fetchUserData(authData.user!.id);
      toast.success('Account created successfully!');
      navigate('/wallet-dashboard');
    } catch (error) {
      toast.error('Failed to create account');
      console.error(error);
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
      toast.error('Login failed');
      console.error(error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
