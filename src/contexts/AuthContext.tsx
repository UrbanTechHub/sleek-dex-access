import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { generateWallet } from '@/utils/walletUtils';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session.user.id);
      }
    });

    // Listen for auth changes
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
      // Generate a random email since we're using PIN authentication
      const email = `${crypto.randomUUID()}@temp.com`;
      const password = crypto.randomUUID(); // Random password since we're using PIN

      // Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Generate wallets
      const ethWallet = await generateWallet('ETH');
      const solWallet = await generateWallet('SOL');
      const usdtWallet = await generateWallet('USDT');

      const newUser: Omit<User, 'id'> = {
        pin,
        wallets: [ethWallet, solWallet, usdtWallet],
        transactions: []
      };

      // Store user data in Supabase
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
      // Query users table by PIN
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