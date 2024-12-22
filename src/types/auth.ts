export interface Wallet {
  id: string;
  network: 'ETH' | 'BTC' | 'USDT';
  address: string;
  balance: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  currency: string;
  address: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface User {
  id: string;
  pin: string;
  wallets: Wallet[];
  transactions: Transaction[];
}

export interface AuthContextType {
  user: User | null;
  login: (pin: string) => Promise<void>;
  logout: () => void;
  createAccount: (pin: string) => Promise<void>;
}