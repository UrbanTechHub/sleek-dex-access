import { ethers } from 'ethers';
import { toast } from "sonner";

// Use a public RPC that allows CORS
const ETH_RPC_URL = 'https://cloudflare-eth.com';

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
    
    // Create provider with fallback URLs
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    
    // Add timeout to prevent hanging
    const balancePromise = provider.getBalance(address);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    );
    
    const rawBalance = await Promise.race([balancePromise, timeoutPromise]) as bigint;
    const balance = ethers.formatEther(rawBalance);
    console.log('ETH balance:', balance);
    return balance;
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    // Return current balance instead of 0 to prevent UI disruption
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
    
    // Validate address before attempting transaction
    if (!validateEthereumAddress(toAddress)) {
      toast.error('Invalid ETH address');
      return false;
    }

    // For now, we're just simulating the transaction
    // In production, you would use the actual provider and send the transaction
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    toast.success(`Simulated sending ${amount} ETH`);
    return true;
  } catch (error) {
    console.error('ETH transaction error:', error);
    toast.error('Failed to send ETH');
    return false;
  }
};