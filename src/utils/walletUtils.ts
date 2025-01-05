import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { toast } from "sonner";
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import * as web3 from '@solana/web3.js';

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

// Constants for API endpoints
const ETH_API_URL = "https://api.etherscan.io/api";
const BTC_API_URL = "https://blockchain.info/rawaddr";
const SOL_API_URL = "https://api.mainnet-beta.solana.com";

// Solana USDT token program ID (mainnet)
const USDT_TOKEN_PROGRAM_ID = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

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
  try {
    const id = crypto.randomUUID();
    const name = `My Wallet - ${network}`;
    let address = '';
    let privateKey = '';

    switch (network) {
      case 'ETH': {
        const wallet = ethers.Wallet.createRandom();
        address = wallet.address;
        privateKey = wallet.privateKey;
        break;
      }
      case 'USDT':
      case 'SOL': {
        const keypair = web3.Keypair.generate();
        address = keypair.publicKey.toString();
        privateKey = Buffer.from(keypair.secretKey).toString('hex');
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
        balance = (data.final_balance / 100000000).toString();
        break;
      }
      case 'USDT': {
        // For USDT on Solana
        const connection = new web3.Connection(SOL_API_URL);
        const pubKey = new web3.PublicKey(wallet.address);
        const tokenPubKey = new web3.PublicKey(USDT_TOKEN_PROGRAM_ID);
        
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
            programId: tokenPubKey,
          });
          
          const usdtBalance = tokenAccounts.value.reduce((total, account) => {
            const parsedInfo = account.account.data.parsed.info;
            if (parsedInfo.mint === USDT_TOKEN_PROGRAM_ID) {
              return total + Number(parsedInfo.tokenAmount.amount) / Math.pow(10, parsedInfo.tokenAmount.decimals);
            }
            return total;
          }, 0);
          
          balance = usdtBalance.toString();
        } catch (error) {
          console.error('Error fetching USDT balance:', error);
          balance = '0';
        }
        break;
      }
      case 'SOL': {
        const connection = new web3.Connection(SOL_API_URL);
        const pubKey = new web3.PublicKey(wallet.address);
        const balance = await connection.getBalance(pubKey);
        return (balance / web3.LAMPORTS_PER_SOL).toString();
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
        return ethers.isAddress(address);
      case 'USDT':
      case 'SOL':
        try {
          new web3.PublicKey(address);
          return true;
        } catch {
          return false;
        }
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

export const sendTransaction = async (wallet: WalletData, amount: string, recipient: string): Promise<boolean> => {
  try {
    // Validate recipient address
    if (!validateAddress(recipient, wallet.network)) {
      toast.error('Invalid recipient address');
      return false;
    }

    // Simple simulation - in a real app, this would interact with the blockchain
    toast.success(`Simulated transaction of ${amount} ${wallet.network} to ${recipient}`);
    return true;
  } catch (error) {
    console.error('Transaction error:', error);
    toast.error('Failed to send transaction');
    return false;
  }
};
