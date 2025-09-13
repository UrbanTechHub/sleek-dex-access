import { toast } from "sonner";
import { generateEthereumWallet, getEthereumBalance, validateEthereumAddress, sendEthereumTransaction } from './networks/ethereumUtils';
import { generateBitcoinWallet, getBitcoinBalance, validateBitcoinAddress, sendBitcoinTransaction } from './networks/bitcoinUtils';
import { generateSolanaWallet, getSolanaBalance, validateSolanaAddress, sendSolanaTransaction } from './networks/solanaUtils';
import { generateTronWallet, getTronBalance, validateTronAddress, sendTronTransaction } from './networks/tronUtils';

export type Network = "ETH" | "BTC" | "TRON" | "SOL";

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
  console.log('Generating wallet for network:', network);
  const id = crypto.randomUUID();
  const name = network === 'TRON' ? 'My USDT (TRC20) Wallet' : `My ${network} Wallet`;
  let walletInfo;

  try {
    switch (network) {
      case 'ETH':
        walletInfo = generateEthereumWallet();
        break;
      case 'BTC':
        walletInfo = generateBitcoinWallet();
        break;
      case 'SOL':
        walletInfo = generateSolanaWallet();
        break;
      case 'TRON':
        walletInfo = generateTronWallet();
        break;
      default:
        throw new Error(`Unsupported network: ${network}`);
    }

    const wallet: WalletData = {
      id,
      name,
      network,
      address: walletInfo.address,
      privateKey: walletInfo.privateKey,
      balance: '0',
      lastUpdated: new Date(),
    };

    console.log('Successfully generated wallet:', { network, address: wallet.address });
    toast.success(`${network} wallet generated successfully`);
    return wallet;
  } catch (error) {
    console.error('Error in generateWallet:', error);
    toast.error(`Failed to generate ${network} wallet`);
    throw error;
  }
};

export const updateWalletBalance = async (wallet: WalletData): Promise<string> => {
  console.log('Updating balance for wallet:', { network: wallet.network, address: wallet.address });
  try {
    let balance: string;
    switch (wallet.network) {
      case 'ETH':
        balance = await getEthereumBalance(wallet.address);
        break;
      case 'BTC':
        balance = await getBitcoinBalance(wallet.address);
        break;
      case 'SOL':
        balance = await getSolanaBalance(wallet.address);
        break;
      case 'TRON':
        balance = await getTronBalance(wallet.address);
        break;
      default:
        throw new Error(`Unsupported network: ${wallet.network}`);
    }
    console.log('Updated balance:', { network: wallet.network, balance });
    return balance;
  } catch (error) {
    console.error(`Error updating ${wallet.network} balance:`, error);
    return wallet.balance;
  }
};

export const validateAddress = (address: string, network: Network): boolean => {
  console.log('Validating address:', { network, address });
  try {
    switch (network) {
      case 'ETH':
        return validateEthereumAddress(address);
      case 'BTC':
        return validateBitcoinAddress(address);
      case 'SOL':
        return validateSolanaAddress(address);
      case 'TRON':
        return validateTronAddress(address);
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error validating ${network} address:`, error);
    return false;
  }
};

export const sendTransaction = async (
  wallet: WalletData,
  amount: string,
  recipient: string
): Promise<boolean> => {
  console.log('Initiating transaction:', { network: wallet.network, amount, recipient });
  
  if (!validateAddress(recipient, wallet.network)) {
    toast.error('Invalid recipient address');
    return false;
  }

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    toast.error('Invalid amount');
    return false;
  }

  try {
    const currentBalance = await updateWalletBalance(wallet);
    if (parseFloat(currentBalance) < numAmount) {
      toast.error('Insufficient balance');
      return false;
    }

    let success: boolean;
    switch (wallet.network) {
      case 'ETH':
        success = await sendEthereumTransaction(wallet.address, recipient, amount, wallet.privateKey);
        break;
      case 'BTC':
        success = await sendBitcoinTransaction(wallet.address, recipient, amount, wallet.privateKey);
        break;
      case 'SOL':
        success = await sendSolanaTransaction(wallet.address, recipient, amount, wallet.privateKey);
        break;
      case 'TRON':
        success = await sendTronTransaction(wallet.address, recipient, amount, wallet.privateKey);
        break;
      default:
        throw new Error(`Unsupported network: ${wallet.network}`);
    }

    if (success) {
      console.log('Transaction successful:', { network: wallet.network, amount, recipient });
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error sending ${wallet.network} transaction:`, error);
    toast.error(`Failed to send ${wallet.network} transaction`);
    return false;
  }
};