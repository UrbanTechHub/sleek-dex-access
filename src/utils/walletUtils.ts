import { ethers } from "ethers";
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { toast } from "sonner";
import { Buffer } from 'buffer';

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

export interface WalletData {
  id: string;
  name: string;
  network: 'ETH' | 'BTC' | 'USDT';
  address: string;
  privateKey: string;
  balance: string;
  lastUpdated: Date;
}

// Initialize providers
const ethProvider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');

// USDT contract address on Ethereum mainnet
const USDT_CONTRACT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const USDT_ABI = ['function balanceOf(address) view returns (uint256)'];

export const generateWallet = async (network: 'ETH' | 'BTC' | 'USDT', name: string): Promise<WalletData> => {
  try {
    switch (network) {
      case 'ETH':
      case 'USDT': {
        const wallet = ethers.Wallet.createRandom();
        return {
          id: crypto.randomUUID(),
          name,
          network,
          address: wallet.address,
          privateKey: wallet.privateKey,
          balance: '0',
          lastUpdated: new Date(),
        };
      }
      case 'BTC': {
        const keyPair = ECPair.makeRandom();
        const { address } = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(keyPair.publicKey),
          network: bitcoin.networks.bitcoin
        });

        if (!address) {
          throw new Error('Failed to generate Bitcoin address');
        }

        return {
          id: crypto.randomUUID(),
          name,
          network: 'BTC',
          address,
          privateKey: keyPair.toWIF(),
          balance: '0',
          lastUpdated: new Date(),
        };
      }
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  } catch (error) {
    console.error('Error generating wallet:', error);
    throw error;
  }
};

export const updateWalletBalance = async (wallet: WalletData): Promise<string> => {
  try {
    switch (wallet.network) {
      case 'ETH': {
        const balance = await ethProvider.getBalance(wallet.address);
        return ethers.formatEther(balance);
      }
      case 'USDT': {
        const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, ethProvider);
        const balance = await contract.balanceOf(wallet.address);
        return ethers.formatUnits(balance, 6); // USDT uses 6 decimals
      }
      case 'BTC': {
        // For BTC, we'll use a mock balance for demo purposes
        // In production, you'd want to use a Bitcoin node or API service
        return wallet.balance;
      }
      default:
        return '0';
    }
  } catch (error) {
    console.error(`Error updating ${wallet.network} balance:`, error);
    toast.error(`Failed to update ${wallet.network} balance`);
    return wallet.balance;
  }
};

export const sendTransaction = async (
  wallet: WalletData,
  amount: string,
  recipient: string
): Promise<boolean> => {
  try {
    // In a real implementation, you would:
    // 1. Create and sign the transaction
    // 2. Broadcast it to the network
    // 3. Wait for confirmation
    // 4. Update local state
    
    // For demo purposes, we'll just simulate a successful transaction
    toast.success(`Successfully sent ${amount} ${wallet.network} to ${recipient}`);
    return true;
  } catch (error) {
    console.error(`Error sending ${wallet.network} transaction:`, error);
    toast.error(`Failed to send ${wallet.network} transaction`);
    return false;
  }
};

export const validateAddress = (address: string, network: string): boolean => {
  try {
    switch (network) {
      case 'ETH':
      case 'USDT':
        return ethers.isAddress(address);
      case 'BTC':
        // Basic Bitcoin address validation (starts with 1, 3, or bc1)
        return /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(address);
      default:
        return false;
    }
  } catch {
    return false;
  }
};