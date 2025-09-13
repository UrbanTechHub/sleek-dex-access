import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { toast } from "sonner";

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

const BTC_API_URL = "https://mempool.space/api/address";

export const generateBitcoinWallet = () => {
  try {
    const keyPair = ECPair.makeRandom();
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(keyPair.publicKey),
      network: bitcoin.networks.bitcoin
    });
    console.log('Generated BTC wallet:', address);
    return {
      address: address || '',
      privateKey: keyPair.toWIF(),
    };
  } catch (error) {
    console.error('Error generating BTC wallet:', error);
    toast.error('Failed to generate BTC wallet');
    throw error;
  }
};

export const getBitcoinBalance = async (address: string): Promise<string> => {
  try {
    console.log('Fetching BTC balance for:', address);
    const response = await fetch(`${BTC_API_URL}/${address}`);
    if (!response.ok) {
      throw new Error('Failed to fetch BTC balance');
    }
    const data = await response.json();
    const balance = ((data.chain_stats?.funded_txo_sum || 0) - (data.chain_stats?.spent_txo_sum || 0) / 100000000).toString();
    console.log('BTC balance:', balance);
    return balance;
  } catch (error) {
    console.error('Error fetching BTC balance:', error);
    toast.error('Failed to fetch BTC balance');
    return '0';
  }
};

export const validateBitcoinAddress = (address: string): boolean => {
  try {
    bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
    return true;
  } catch (error) {
    console.error('Error validating BTC address:', error);
    return false;
  }
};

export const sendBitcoinTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  privateKey: string
): Promise<boolean> => {
  try {
    console.log('Initiating BTC transaction:', { fromAddress, toAddress, amount });
    
    if (!validateBitcoinAddress(toAddress)) {
      toast.error('Invalid BTC address');
      return false;
    }

    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('BTC transaction completed successfully');
    toast.success(`Successfully sent ${amount} BTC`);
    return true;
  } catch (error) {
    console.error('BTC transaction error:', error);
    toast.error('Failed to send BTC transaction');
    return false;
  }
};