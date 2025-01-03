import { ethers } from "ethers";
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
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
      case 'SOL': {
        try {
          const publicKey = new PublicKey(wallet.address);
          const balance = await solanaConnection.getBalance(publicKey);
          return (balance / LAMPORTS_PER_SOL).toString();
        } catch (error) {
          console.error('Error fetching SOL balance:', error);
          return '0';
        }
      }
      case 'USDC': {
        try {
          const publicKey = new PublicKey(wallet.address);
          const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(publicKey, {
            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
          });
          
          for (const account of tokenAccounts.value) {
            if (account.account.data.parsed.info.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
              return (account.account.data.parsed.info.tokenAmount.uiAmount || 0).toString();
            }
          }
          return '0';
        } catch (error) {
          console.error('Error fetching USDC balance:', error);
          return '0';
        }
      }
      case 'BTC': {
        // For demonstration purposes, returning stored balance
        // In production, you would want to query a Bitcoin node or API
        return wallet.balance;
      }
      default:
        return '0';
    }
  } catch (error) {
    console.error('Error updating balance:', error);
    return wallet.balance;
  }
};

export const validateSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};