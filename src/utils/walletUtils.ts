import { ethers } from "ethers";
import { Keypair } from "@solana/web3.js";
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { getRandomNonce, KeyPair as TonKeyPair } from '@ton/crypto';

// Initialize ECPair library with secp256k1
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
      return {
        id: crypto.randomUUID(),
        name,
        network,
        address: keypair.publicKey.toString(),
        privateKey: Array.from(keypair.secretKey).join(','),
        balance: '0',
        lastUpdated: new Date(),
      };
    }
    case 'BTC': {
      // Generate Bitcoin testnet wallet for safety
      const network = bitcoin.networks.testnet;
      const keyPair = bitcoin.ECPair.makeRandom({ network });
      const { address } = bitcoin.payments.p2pkh({ 
        pubkey: keyPair.publicKey,
        network 
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
      const keyPair = await TonKeyPair.random(await getRandomNonce());
      const publicKey = keyPair.publicKey.toString('hex');
      
      return {
        id: crypto.randomUUID(),
        name,
        network: 'TON',
        address: publicKey,
        privateKey: keyPair.secretKey.toString('hex'),
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