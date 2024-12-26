import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const ConnectWalletCard = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask to connect your wallet");
        return;
      }
      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts && accounts.length > 0) {
        const balances = await getTokenBalances(accounts[0]);
        toast.success("MetaMask wallet connected successfully!");
        return { address: accounts[0], balances };
      }
    } catch (error) {
      console.error("Failed to connect MetaMask:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const connectTrustWallet = async () => {
    try {
      if (typeof window.trustwallet === "undefined") {
        toast.error("Please install Trust Wallet to connect");
        return;
      }

      const accounts = await window.trustwallet.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        const balances = await getTokenBalances(accounts[0]);
        toast.success("Trust Wallet connected successfully!");
        return { address: accounts[0], balances };
      }
    } catch (error) {
      console.error("Failed to connect Trust Wallet:", error);
      toast.error("Failed to connect Trust Wallet. Please try again.");
    }
  };

  const connectWalletConnect = async () => {
    try {
      const provider = await import('@walletconnect/web3-provider');
      const Web3Modal = (await import('web3modal')).default;

      const providerOptions = {
        walletconnect: {
          package: provider.default,
          options: {
            infuraId: "YOUR_INFURA_ID" // Replace with your Infura ID
          }
        }
      };

      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
        providerOptions
      });

      const instance = await web3Modal.connect();
      const addresses = await instance.enable();
      
      if (addresses && addresses.length > 0) {
        const balances = await getTokenBalances(addresses[0]);
        toast.success("Wallet connected successfully!");
        return { address: addresses[0], balances };
      }
    } catch (error) {
      console.error("Failed to connect via WalletConnect:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const getTokenBalances = async (address: string) => {
    try {
      // Ethereum balance
      const ethBalanceResult = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"]
      });

      const ethBalance = ethBalanceResult ? (parseInt(ethBalanceResult.toString(), 16) / 1e18).toString() : "0";

      // For other tokens, we'll need to use their contract addresses
      const tokenContracts = {
        USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      };

      const balances: Record<string, string> = {
        ETH: ethBalance,
        USDT: "0",
        USDC: "0",
      };

      // Get token balances using Web3
      const Web3 = (await import('web3')).default;
      const web3 = new Web3(window.ethereum);

      const minABI = [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function",
        },
      ];

      for (const [token, contractAddress] of Object.entries(tokenContracts)) {
        try {
          const contract = new web3.eth.Contract(minABI, contractAddress);
          const balance = await contract.methods.balanceOf(address).call();
          balances[token] = (parseInt(balance.toString()) / 1e6).toString(); // USDT and USDC use 6 decimals
        } catch (error) {
          console.error(`Error fetching ${token} balance:`, error);
          balances[token] = "0";
        }
      }

      return balances;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return null;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 hover:shadow-xl transition-all duration-300 border-2 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-purple-500" />
          Connect External Wallet
        </CardTitle>
        <CardDescription>
          Connect your existing wallets to manage all your assets in one place
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={connectMetaMask}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:opacity-90"
        >
          <Link2 className="mr-2 h-4 w-4" />
          Connect MetaMask
        </Button>
        <Button 
          onClick={connectTrustWallet}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90"
        >
          <Link2 className="mr-2 h-4 w-4" />
          Connect Trust Wallet
        </Button>
        <Button 
          onClick={connectWalletConnect}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
        >
          <Link2 className="mr-2 h-4 w-4" />
          Connect Other Wallets
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectWalletCard;