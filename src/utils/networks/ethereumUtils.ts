import { ethers } from 'ethers';
import { toast } from "sonner";

const ETH_RPC_URL = 'https://eth-mainnet.g.alchemy.com/v2/demo';

export const generateEthereumWallet = () => {
  try {
    const wallet = ethers.Wallet.createRandom();
    console.log('Generated ETH wallet:', wallet.address);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  } catch (error) {
    console.error('Error generating ETH wallet:', error);
    toast.error('Failed to generate ETH wallet');
    throw error;
  }
};

export const getEthereumBalance = async (address: string): Promise<string> => {
  try {
    console.log('Fetching ETH balance for:', address);
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    const rawBalance = await provider.getBalance(address);
    const balance = ethers.formatEther(rawBalance);
    console.log('ETH balance:', balance);
    return balance;
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    toast.error('Failed to fetch ETH balance');
    return '0';
  }
};

export const validateEthereumAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch (error) {
    console.error('Error validating ETH address:', error);
    return false;
  }
};

export const sendEthereumTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: string,
  privateKey: string
): Promise<boolean> => {
  try {
    console.log('Simulating ETH transaction:', { fromAddress, toAddress, amount });
    if (!validateEthereumAddress(toAddress)) {
      toast.error('Invalid ETH address');
      return false;
    }
    toast.success(`Simulated sending ${amount} ETH`);
    return true;
  } catch (error) {
    console.error('ETH transaction error:', error);
    toast.error('Failed to send ETH');
    return false;
  }
};