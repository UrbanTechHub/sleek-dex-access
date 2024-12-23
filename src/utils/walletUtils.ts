import { ethers } from "ethers";
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { Buffer } from 'buffer';

// Initialize Bitcoin-related libraries
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

export const generateWallet = async (network: 'ETH' | 'BTC' | 'USDT', name: string): Promise<WalletData> => {
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
      // Generate Bitcoin mainnet wallet
      const keyPair = ECPair.makeRandom({ network: bitcoin.networks.bitcoin });
      const { address } = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(keyPair.publicKey),
        network: bitcoin.networks.bitcoin,
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
    switch (wallet.network) {
      case 'ETH': {
        const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
        const balance = await provider.getBalance(wallet.address);
        return ethers.formatEther(balance);
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