import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import ECPairFactory from 'ecpair';
import { toast } from "sonner";

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

const BTC_API_URL = "https://mempool.space/api/address";

export const generateBitcoinWallet = () => {
  const keyPair = ECPair.makeRandom();
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(keyPair.publicKey),
    network: bitcoin.networks.bitcoin
  });
  return {
    address: address || '',
    privateKey: keyPair.toWIF(),
  };
};

export const getBitcoinBalance = async (address: string): Promise<string> => {
  try {
    const response = await fetch(`${BTC_API_URL}/${address}`);
    if (!response.ok) {
      throw new Error('Failed to fetch BTC balance');
    }
    const data = await response.json();
    const balance = ((data.chain_stats?.funded_txo_sum || 0) - (data.chain_stats?.spent_txo_sum || 0) / 100000000).toString();
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
  } catch {
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
    // For now, we'll simulate the transaction
    console.log('Simulated BTC transaction:', { fromAddress, toAddress, amount });
    toast.success(`Simulated sending ${amount} BTC`);
    return true;
  } catch (error) {
    console.error('BTC transaction error:', error);
    toast.error('Failed to send BTC');
    return false;
  }
};