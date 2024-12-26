import { useState } from 'react';
import { toast } from 'sonner';
import { getTokenBalances } from '../utils/tokenBalances';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface WalletConnection {
  address: string;
  balances: {
    ETH: string;
    USDT: string;
    USDC: string;
  } | null;
}

export const useWalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectMetaMask = async (): Promise<WalletConnection | null> => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask to connect your wallet");
        return null;
      }
      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      
      if (accounts && accounts.length > 0) {
        const balances = await getTokenBalances(accounts[0]);
        toast.success("MetaMask wallet connected successfully!");
        return { address: accounts[0], balances };
      }
      return null;
    } catch (error) {
      console.error("Failed to connect MetaMask:", error);
      toast.error("Failed to connect wallet. Please try again.");
      return null;
    }
  };

  const connectTrustWallet = async (): Promise<WalletConnection | null> => {
    try {
      if (typeof window.trustwallet === "undefined") {
        toast.error("Please install Trust Wallet to connect");
        return null;
      }

      const accounts = await window.trustwallet.request({
        method: "eth_requestAccounts"
      });

      if (accounts && accounts.length > 0) {
        const balances = await getTokenBalances(accounts[0]);
        toast.success("Trust Wallet connected successfully!");
        return { address: accounts[0], balances };
      }
      return null;
    } catch (error) {
      console.error("Failed to connect Trust Wallet:", error);
      toast.error("Failed to connect Trust Wallet. Please try again.");
      return null;
    }
  };

  const connectWalletConnect = async (): Promise<WalletConnection | null> => {
    try {
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId: "YOUR_INFURA_ID"
            }
          }
        }
      });

      const instance = await web3Modal.connect();
      const addresses = await instance.enable();
      
      if (addresses && addresses.length > 0) {
        const balances = await getTokenBalances(addresses[0]);
        toast.success("Wallet connected successfully!");
        return { address: addresses[0], balances };
      }
      return null;
    } catch (error) {
      console.error("Failed to connect via WalletConnect:", error);
      toast.error("Failed to connect wallet. Please try again.");
      return null;
    }
  };

  return {
    isConnecting,
    setIsConnecting,
    connectMetaMask,
    connectTrustWallet,
    connectWalletConnect
  };
};