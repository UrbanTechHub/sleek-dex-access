export interface Wallet {
  id: string;
  name: string;
  network: 'ETH' | 'BTC' | 'TRON' | 'SOL';
  address: string;
  privateKey: string;
  balance: string;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  currency: string;
  address: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  network?: 'ETH' | 'BTC' | 'TRON' | 'SOL';
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
