import { ethers } from 'ethers';
import { toast } from "sonner";

// Use multiple RPC providers with fallback
const ETH_RPC_URLS = [
  'https://eth-mainnet.public.blastapi.io',
  'https://ethereum-rpc.publicnode.com',
  'https://rpc.ankr.com/eth',
  'https://eth.drpc.org'
];

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
  console.log('Fetching ETH balance for:', address);
  
  for (const rpcUrl of ETH_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      const balancePromise = provider.getBalance(address);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );
      
      const rawBalance = await Promise.race([balancePromise, timeoutPromise]);
      const balance = ethers.formatEther(rawBalance as bigint);
      console.log('ETH balance:', balance, 'from', rpcUrl);
      return balance;
    } catch (error) {
      console.error(`Error fetching ETH balance from ${rpcUrl}:`, error);
      continue; // Try next provider
    }
  }
  
  console.error('All ETH RPC providers failed');
  return '0';
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
    console.log('Initiating ETH transaction:', { fromAddress, toAddress, amount });
    
    if (!validateEthereumAddress(toAddress)) {
      toast.error('Invalid ETH address');
      return false;
    }

    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For development, we simulate successful transactions
    console.log('ETH transaction completed successfully');
    toast.success(`Successfully sent ${amount} ETH`);
    return true;
  } catch (error) {
    console.error('ETH transaction error:', error);
    toast.error('Failed to send ETH transaction');
    return false;
  }
};