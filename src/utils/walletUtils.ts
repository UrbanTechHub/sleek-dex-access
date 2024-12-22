import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { mnemonicToWalletKey } from '@ton/crypto';
import ECPairFactory from 'ecpair';

// Initialize Bitcoin-related libraries
const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

export interface WalletData {
  id: string;
  name: string;
  network: 'ETH' | 'SOL' | 'BTC' | 'TON' | 'USDT';
  address: string;
  privateKey: string;
  balance: string;
  lastUpdated: Date;
}

export const generateWallet = async (network: 'ETH' | 'SOL' | 'BTC' | 'TON' | 'USDT', name: string): Promise<WalletData> => {
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
    case 'SOL': {
      const keypair = Keypair.generate();
      const secretKeyHex = Buffer.from(keypair.secretKey).toString('hex');
      return {
        id: crypto.randomUUID(),
        name,
        network,
        address: keypair.publicKey.toString(),
        privateKey: secretKeyHex,
        balance: '0',
        lastUpdated: new Date(),
      };
    }
    case 'BTC': {
      // Generate Bitcoin testnet wallet for safety
      const testnet = bitcoin.networks.testnet;
      const keyPair = ECPair.makeRandom({ network: testnet });
      const { address } = bitcoin.payments.p2pkh({ 
        pubkey: keyPair.publicKey,
        network: testnet
      });
      
      return {
        id: crypto.randomUUID(),
        name,
        network: 'BTC',
        address: address || '',
        privateKey: keyPair.toWIF(),
        balance: '0',
        lastUpdated: new Date(),
      };
    }
    case 'TON': {
      // Generate a random mnemonic and convert it to a key pair
      const mnemonic = Array(24).fill(0).map(() => Math.random().toString(36).slice(2)).join(' ');
      const key = await mnemonicToWalletKey(mnemonic);
      const publicKeyHex = Buffer.from(key.publicKey).toString('hex');
      const privateKeyHex = Buffer.from(key.secretKey).toString('hex');
      
      return {
        id: crypto.randomUUID(),
        name,
        network: 'TON',
        address: publicKeyHex,
        privateKey: privateKeyHex,
        balance: '0',
        lastUpdated: new Date(),
      };
    }
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
};

export const updateWalletBalance = async (wallet: WalletData): Promise<string> => {
  try {
    switch (wallet.network) {
      case 'ETH': {
        const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
        const balance = await provider.getBalance(wallet.address);
        return ethers.formatEther(balance);
      }
      case 'SOL': {
        // For demonstration purposes, returning existing balance
        // In production, implement proper Solana balance fetching
        return wallet.balance || '0';
      }
      case 'USDT': {
        const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
        const usdtContract = new ethers.Contract(
          '0xdac17f958d2ee523a2206206994597c13d831ec7',
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        const balance = await usdtContract.balanceOf(wallet.address);
        return ethers.formatUnits(balance, 6);
      }
      case 'BTC':
      case 'TON':
        // For demonstration purposes
        // In production, implement proper Bitcoin/TON balance fetching
        return wallet.balance || '0';
      default:
        return '0';
    }
  } catch (error) {
    console.error('Error updating balance:', error);
    return wallet.balance;
  }
};