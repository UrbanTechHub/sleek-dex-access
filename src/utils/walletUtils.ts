import { ethers } from "ethers";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export interface WalletData {
  id: string;
  network: 'ETH' | 'SOL' | 'USDT';
  address: string;
  privateKey: string;
  balance: string;
  lastUpdated: Date;
}

export const generateWallet = async (network: 'ETH' | 'SOL' | 'USDT'): Promise<WalletData> => {
  switch (network) {
    case 'ETH':
    case 'USDT': {
      const wallet = ethers.Wallet.createRandom();
      return {
        id: crypto.randomUUID(),
        network,
        address: wallet.address,
        privateKey: wallet.privateKey,
        balance: '0',
        lastUpdated: new Date(),
      };
    }
    case 'SOL': {
      // Generate random bytes for the keypair
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      
      // Create keypair from the random bytes
      const keypair = Keypair.fromSeed(randomBytes);
      
      return {
        id: crypto.randomUUID(),
        network,
        address: keypair.publicKey.toString(),
        privateKey: Array.from(keypair.secretKey).join(','), // Store as comma-separated string
        balance: '0',
        lastUpdated: new Date(),
      };
    }
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
};

export const updateWalletBalance = async (wallet: WalletData): Promise<string> => {
  try {
    switch (wallet.network) {
      case 'ETH': {
        const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
        const balance = await provider.getBalance(wallet.address);
        return ethers.formatEther(balance);
      }
      case 'SOL': {
        const connection = new Connection('https://api.mainnet-beta.solana.com');
        const publicKey = new PublicKey(wallet.address);
        const balance = await connection.getBalance(publicKey);
        return (balance / LAMPORTS_PER_SOL).toString();
      }
      case 'USDT': {
        // For USDT, we would need to interact with the USDT contract
        const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
        const usdtContract = new ethers.Contract(
          '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT contract address
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        const balance = await usdtContract.balanceOf(wallet.address);
        return ethers.formatUnits(balance, 6); // USDT uses 6 decimals
      }
      default:
        return '0';
    }
  } catch (error) {
    console.error('Error updating balance:', error);
    return wallet.balance;
  }
};
