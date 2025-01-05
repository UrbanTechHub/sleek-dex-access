import { ethers } from 'ethers';
import { toast } from "sonner";

const ETH_RPC_URL = 'https://eth-mainnet.public.blastapi.io';

export const generateEthereumWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

export const getEthereumBalance = async (address: string): Promise<string> => {
  try {
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    const rawBalance = await provider.getBalance(address);
    return ethers.formatEther(rawBalance);
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    toast.error('Failed to fetch ETH balance');
    return '0';
  }
};

export const validateEthereumAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const sendEthereumTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  privateKey: string
): Promise<boolean> => {
  try {
    // For now, we'll simulate the transaction
    console.log('Simulated ETH transaction:', { fromAddress, toAddress, amount });
    toast.success(`Simulated sending ${amount} ETH`);
    return true;
  } catch (error) {
    console.error('ETH transaction error:', error);
    toast.error('Failed to send ETH');
    return false;
  }
};