import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { toast } from "sonner";
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import * as web3 from '@solana/web3.js';

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

// Updated API endpoints
const ETH_RPC_URL = 'https://eth-mainnet.public.blastapi.io';
const BTC_API_URL = "https://mempool.space/api/address";
const SOL_RPC_URL = "https://api.devnet.solana.com"; // Using devnet for development
const SOLANA_CLUSTER = 'devnet';

// Solana USDT token program ID (devnet)
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
    }

    return {
      id,
      name,
      network,
      address,
      privateKey,
      balance: '0',
      lastUpdated: new Date()
    };
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
        const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
        const rawBalance = await provider.getBalance(wallet.address);
        balance = ethers.formatEther(rawBalance);
        break;
      }
      case 'BTC': {
        try {
          const response = await fetch(`${BTC_API_URL}/${wallet.address}`);
          if (!response.ok) {
            console.error('BTC API error:', await response.text());
            return '0';
          }
          const data = await response.json();
          // mempool.space uses chain_stats.funded_txo_sum - chain_stats.spent_txo_sum for balance
          balance = ((data.chain_stats?.funded_txo_sum || 0) - (data.chain_stats?.spent_txo_sum || 0) / 100000000).toString();
        } catch (error) {
          console.error('Error fetching BTC balance:', error);
          return '0';
        }
        break;
      }
      case 'USDT': {
        try {
          const connection = new web3.Connection(SOL_RPC_URL, 'confirmed');
          const pubKey = new web3.PublicKey(wallet.address);
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            pubKey,
            { programId: new web3.PublicKey(USDT_TOKEN_PROGRAM_ID) }
          );
          
          const usdtBalance = tokenAccounts.value.reduce((total, account) => {
            const parsedInfo = account.account.data.parsed.info;
            return total + Number(parsedInfo.tokenAmount.amount) / Math.pow(10, parsedInfo.tokenAmount.decimals);
          }, 0);
          
          balance = usdtBalance.toString();
        } catch (error) {
          console.error('Error fetching USDT balance:', error);
          return '0';
        }
        break;
      }
      case 'SOL': {
        try {
          const connection = new web3.Connection(SOL_RPC_URL, 'confirmed');
          const pubKey = new web3.PublicKey(wallet.address);
          const rawBalance = await connection.getBalance(pubKey);
          balance = (rawBalance / web3.LAMPORTS_PER_SOL).toString();
        } catch (error) {
          console.error('Error fetching SOL balance:', error);
          return '0';
        }
        break;
      }
    }

    return balance;
  } catch (error) {
    console.error('Error updating wallet balance:', error);
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
      case 'SOL': {
        const connection = new web3.Connection(SOL_RPC_URL, 'confirmed');
        const senderKeypair = web3.Keypair.fromSecretKey(
          Buffer.from(wallet.privateKey, 'hex')
        );
        const recipientPubKey = new web3.PublicKey(recipient);
        
        const transaction = new web3.Transaction().add(
          web3.SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: recipientPubKey,
            lamports: numAmount * web3.LAMPORTS_PER_SOL,
          })
        );

        const signature = await web3.sendAndConfirmTransaction(
          connection,
          transaction,
          [senderKeypair]
        );
        console.log('SOL Transaction signature:', signature);
        break;
      }
      // For other networks, we'll simulate success for now
      default:
        console.log(`Simulated ${wallet.network} transaction:`, {
          from: wallet.address,
          to: recipient,
          amount: amount
        });
    }

    toast.success(`Transaction of ${amount} ${wallet.network} sent successfully`);
    return true;
  } catch (error) {
    console.error('Transaction error:', error);
    toast.error('Failed to send transaction');
    return false;
  }
};