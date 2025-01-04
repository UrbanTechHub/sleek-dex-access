import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { toast } from "sonner";
import { Buffer } from 'buffer';
import { ethers } from 'ethers';

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

// Constants for API endpoints
const ETH_API_URL = "https://api.etherscan.io/api";
const BTC_API_URL = "https://blockchain.info/rawaddr";
const USDT_API_URL = "https://api.etherscan.io/api";

export type Network = "ETH" | "BTC" | "USDT";

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
  try {
    const id = crypto.randomUUID();
    const name = `My Wallet - ${network}`;
    let address = '';
    let privateKey = '';

    switch (network) {
      case 'ETH':
      case 'USDT': {
        const wallet = ethers.Wallet.createRandom();
        address = wallet.address;
        privateKey = wallet.privateKey;
        break;
      }
      case 'BTC': {
        const keyPair = ECPair.makeRandom();
        const { address: btcAddress } = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(keyPair.publicKey),
          network: bitcoin.networks.bitcoin
        });
        address = btcAddress || '';
        privateKey = keyPair.toWIF();
        break;
      }
      default:
        throw new Error(`Unsupported network: ${network}`);
    }

    const wallet: WalletData = {
      id,
      name,
      network,
      address,
      privateKey,
      balance: '0',
      lastUpdated: new Date()
    };

    return wallet;
  } catch (error) {
    console.error('Error generating wallet:', error);
    throw error;
  }
};

export const updateWalletBalance = async (wallet: WalletData): Promise<string> => {
  try {
    let balance = '0';

    switch (wallet.network) {
      case 'ETH': {
        const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
        const rawBalance = await provider.getBalance(wallet.address);
        balance = ethers.formatEther(rawBalance);
        break;
      }
      case 'BTC': {
        const response = await fetch(`${BTC_API_URL}/${wallet.address}`);
        const data = await response.json();
        balance = (data.final_balance / 100000000).toString(); // Convert satoshis to BTC
        break;
      }
      case 'USDT': {
        const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
        const usdtContract = new ethers.Contract(
          '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT contract address
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        const rawBalance = await usdtContract.balanceOf(wallet.address);
        balance = (Number(rawBalance) / 1e6).toString(); // USDT has 6 decimals
        break;
      }
      default:
        throw new Error(`Unsupported network: ${wallet.network}`);
    }

    return balance;
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    toast.error('Failed to update wallet balance');
    return '0';
  }
};

export const validateAddress = (address: string, network: Network): boolean => {
  try {
    switch (network) {
      case 'ETH':
      case 'USDT':
        return ethers.isAddress(address);
      case 'BTC':
        try {
          bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
          return true;
        } catch {
          return false;
        }
      default:
        return false;
    }
  } catch {
    return false;
  }
};