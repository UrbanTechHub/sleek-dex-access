import * as web3 from '@solana/web3.js';
import { toast } from "sonner";
import { Buffer } from 'buffer';

const SOL_RPC_URL = "https://api.devnet.solana.com";
const SOLANA_CLUSTER = 'devnet';

export const generateSolanaWallet = () => {
  const keypair = web3.Keypair.generate();
  return {
    address: keypair.publicKey.toString(),
    privateKey: Buffer.from(keypair.secretKey).toString('hex'),
  };
};

export const getSolanaBalance = async (address: string): Promise<string> => {
  try {
    const connection = new web3.Connection(SOL_RPC_URL, 'confirmed');
    const pubKey = new web3.PublicKey(address);
    const rawBalance = await connection.getBalance(pubKey);
    return (rawBalance / web3.LAMPORTS_PER_SOL).toString();
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    toast.error('Failed to fetch SOL balance');
    return '0';
  }
};

export const validateSolanaAddress = (address: string): boolean => {
  try {
    new web3.PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

export const sendSolanaTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  privateKey: string
): Promise<boolean> => {
  try {
    const connection = new web3.Connection(SOL_RPC_URL, 'confirmed');
    const senderKeypair = web3.Keypair.fromSecretKey(
      Buffer.from(privateKey, 'hex')
    );
    const recipientPubKey = new web3.PublicKey(toAddress);
    
    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: recipientPubKey,
        lamports: parseFloat(amount) * web3.LAMPORTS_PER_SOL,
      })
    );

    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [senderKeypair]
    );
    console.log('SOL Transaction signature:', signature);
    toast.success(`Sent ${amount} SOL successfully`);
    return true;
  } catch (error) {
    console.error('SOL transaction error:', error);
    toast.error('Failed to send SOL');
    return false;
  }
};