import { generateEthereumWallet, getEthereumBalance, validateEthereumAddress, sendEthereumTransaction } from './networks/ethereumUtils';
import { generateBitcoinWallet, getBitcoinBalance, validateBitcoinAddress, sendBitcoinTransaction } from './networks/bitcoinUtils';
import { generateSolanaWallet, getSolanaBalance, validateSolanaAddress, sendSolanaTransaction } from './networks/solanaUtils';

export type Network = "ETH" | "BTC" | "USDT" | "SOL";

export interface WalletData {
  id: string;
  name: string;
  network: Network;
  address: string;
  privateKey: string;
  balance: string;
  lastUpdated: Date;
}

export const generateWallet = async (network: Network): Promise<WalletData> => {
  const id = crypto.randomUUID();
  const name = `My ${network} Wallet`;
  let walletInfo;

  switch (network) {
    case 'ETH':
      walletInfo = generateEthereumWallet();
      break;
    case 'BTC':
      walletInfo = generateBitcoinWallet();
      break;
    case 'SOL':
    case 'USDT':
      walletInfo = generateSolanaWallet();
      break;
    default:
      throw new Error(`Unsupported network: ${network}`);
  }

  return {
    id,
    name,
    network,
    address: walletInfo.address,
    privateKey: walletInfo.privateKey,
    balance: '0',
    lastUpdated: new Date(),
  };
};

export const updateWalletBalance = async (wallet: WalletData): Promise<string> => {
  try {
    switch (wallet.network) {
      case 'ETH':
        return await getEthereumBalance(wallet.address);
      case 'BTC':
        return await getBitcoinBalance(wallet.address);
      case 'SOL':
      case 'USDT':
        return await getSolanaBalance(wallet.address);
      default:
        throw new Error(`Unsupported network: ${wallet.network}`);
    }
  } catch (error) {
    console.error(`Error updating ${wallet.network} balance:`, error);
    return '0';
  }
};

export const validateAddress = (address: string, network: Network): boolean => {
  switch (network) {
    case 'ETH':
      return validateEthereumAddress(address);
    case 'BTC':
      return validateBitcoinAddress(address);
    case 'SOL':
    case 'USDT':
      return validateSolanaAddress(address);
    default:
      return false;
  }
};

export const sendTransaction = async (wallet: WalletData, amount: string, recipient: string): Promise<boolean> => {
  if (!validateAddress(recipient, wallet.network)) {
    toast.error('Invalid recipient address');
    return false;
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    toast.error('Invalid amount');
    return false;
  }

  const currentBalance = await updateWalletBalance(wallet);
  if (parseFloat(currentBalance) < numAmount) {
    toast.error('Insufficient balance');
    return false;
  }

  switch (wallet.network) {
    case 'ETH':
      return sendEthereumTransaction(wallet.address, recipient, amount, wallet.privateKey);
    case 'BTC':
      return sendBitcoinTransaction(wallet.address, recipient, amount, wallet.privateKey);
    case 'SOL':
    case 'USDT':
      return sendSolanaTransaction(wallet.address, recipient, amount, wallet.privateKey);
    default:
      toast.error(`Unsupported network: ${wallet.network}`);
      return false;
  }
};