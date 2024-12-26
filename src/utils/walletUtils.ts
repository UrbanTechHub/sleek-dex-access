import { ethers } from "ethers";
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

export interface WalletData {
  id: string;
  name: string;
  network: 'ETH' | 'BTC' | 'USDT' | 'SOL' | 'USDC';
  address: string;
  privateKey: string;
  balance: string;
  lastUpdated: Date;
}

export const generateWallet = async (network: 'ETH' | 'BTC' | 'USDT' | 'SOL' | 'USDC', name: string): Promise<WalletData> => {
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
    case 'SOL':
    case 'USDC': {
      const keypair = Keypair.generate();
      return {
        id: crypto.randomUUID(),
        name,
        network,
        address: keypair.publicKey.toString(),
        privateKey: Buffer.from(keypair.secretKey).toString('hex'),
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
        address: address,
        privateKey: keyPair.toWIF(),
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
    const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/your-api-key');
    const solanaConnection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    switch (wallet.network) {
      case 'ETH': {
        const balance = await provider.getBalance(wallet.address);
        return ethers.formatEther(balance);
      }
      case 'USDT': {
        const usdtContract = new ethers.Contract(
          '0xdac17f958d2ee523a2206206994597c13d831ec7',
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        const balance = await usdtContract.balanceOf(wallet.address);
        return ethers.formatUnits(balance, 6);
      }
      case 'USDC': {
        const usdcContract = new ethers.Contract(
          '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        const balance = await usdcContract.balanceOf(wallet.address);
        return ethers.formatUnits(balance, 6);
      }
      case 'SOL': {
        const publicKey = new PublicKey(wallet.address);
        const balance = await solanaConnection.getBalance(publicKey);
        return (balance / 1e9).toString();
      }
      case 'BTC':
        // For demonstration purposes
        return wallet.balance || '0';
      default:
        return '0';
    }
  } catch (error) {
    console.error('Error updating balance:', error);
    return wallet.balance;
  }
};