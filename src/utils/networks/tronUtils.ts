import TronWeb from 'tronweb';
import { toast } from "sonner";

const TRON_FULL_NODE = 'https://api.trongrid.io';
const TRON_SOLIDITY_NODE = 'https://api.trongrid.io';
const TRON_EVENT_SERVER = 'https://api.trongrid.io';

// USDT TRC20 contract address on Tron mainnet
const USDT_CONTRACT_ADDRESS = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const getTronWeb = (privateKey?: string): TronWeb => {
  try {
    const tronWeb = new TronWeb(
      TRON_FULL_NODE,
      TRON_SOLIDITY_NODE,
      TRON_EVENT_SERVER,
      privateKey
    );
    return tronWeb;
  } catch (error) {
    console.error('Error initializing TronWeb:', error);
    throw new Error('Failed to initialize TronWeb');
  }
};

export const generateTronWallet = async () => {
  try {
    const tronWeb = getTronWeb();
    const account = await tronWeb.createAccount();
    console.log('Generated Tron wallet:', account);
    
    return {
      address: account.address.base58,
      privateKey: account.privateKey
    };
  } catch (error) {
    console.error('Error generating Tron wallet:', error);
    throw new Error('Failed to generate Tron wallet');
  }
};

export const getTronBalance = async (address: string): Promise<string> => {
  try {
    const tronWeb = getTronWeb();
    const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
    const balance = await contract.balanceOf(address).call();
    const decimals = await contract.decimals().call();
    
    // Convert balance to human-readable format (USDT has 6 decimals)
    const formattedBalance = (Number(balance) / Math.pow(10, Number(decimals))).toString();
    console.log('USDT-TRC20 balance:', formattedBalance);
    return formattedBalance;
  } catch (error) {
    console.error('Error fetching USDT-TRC20 balance:', error);
    return '0';
  }
};

export const validateTronAddress = (address: string): boolean => {
  try {
    const tronWeb = getTronWeb();
    return tronWeb.isAddress(address);
  } catch (error) {
    console.error('Error validating Tron address:', error);
    return false;
  }
};

export const sendTronTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  privateKey: string
): Promise<boolean> => {
  try {
    console.log('Initiating USDT-TRC20 transaction:', { fromAddress, toAddress, amount });
    
    if (!validateTronAddress(toAddress)) {
      toast.error('Invalid USDT-TRC20 address');
      return false;
    }

    const tronWeb = getTronWeb(privateKey);
    const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);
    
    // Convert amount to token decimals (USDT has 6 decimals)
    const decimals = await contract.decimals().call();
    const amountInSmallestUnit = tronWeb.toBigNumber(amount).multipliedBy(Math.pow(10, Number(decimals)));
    
    // Send the transaction
    const transaction = await contract.transfer(
      toAddress,
      amountInSmallestUnit.toString()
    ).send({
      feeLimit: 100000000,
      callValue: 0,
      shouldPollResponse: true
    });
    
    console.log('USDT-TRC20 Transaction successful:', transaction);
    toast.success(`Sent ${amount} USDT-TRC20 successfully`);
    return true;
  } catch (error) {
    console.error('USDT-TRC20 transaction error:', error);
    toast.error('Failed to send USDT-TRC20');
    return false;
  }
};