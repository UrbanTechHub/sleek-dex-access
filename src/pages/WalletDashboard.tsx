import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRightLeft, Wallet, History, Plus, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";

interface StoredWallet {
  address: string;
  privateKey: string;
  balance: string;
  lastUpdated: string;
}

const WalletDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<StoredWallet | null>(null);
  const [storedWallets, setStoredWallets] = useState<StoredWallet[]>([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    // Load stored wallets from localStorage
    const savedWallets = localStorage.getItem('wallets');
    if (savedWallets) {
      setStoredWallets(JSON.parse(savedWallets));
    }
  }, []);

  const updateWalletBalances = async () => {
    setIsLoadingBalance(true);
    try {
      const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
      const updatedWallets = await Promise.all(
        storedWallets.map(async (wallet) => {
          const balance = await provider.getBalance(wallet.address);
          return {
            ...wallet,
            balance: ethers.formatEther(balance),
            lastUpdated: new Date().toISOString(),
          };
        })
      );
      setStoredWallets(updatedWallets);
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      toast.success("Balances updated successfully!");
    } catch (error) {
      toast.error("Failed to update balances");
      console.error(error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          toast.success("Wallet connected successfully!");
        }
      } else {
        toast.error("Please install MetaMask to connect your wallet");
      }
    } catch (error) {
      toast.error("Failed to connect wallet");
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGenerateWallet = async () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/demo');
      const balance = await provider.getBalance(wallet.address);
      
      const newWallet: StoredWallet = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        balance: ethers.formatEther(balance),
        lastUpdated: new Date().toISOString(),
      };

      setGeneratedWallet(newWallet);
      const updatedWallets = [...storedWallets, newWallet];
      setStoredWallets(updatedWallets);
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      
      toast.success("New wallet generated and stored successfully!");
    } catch (error) {
      toast.error("Failed to generate wallet");
      console.error(error);
    }
  };

  const handleSendReceive = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    toast.info("Send/Receive feature coming soon");
  };

  const handleViewHistory = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    toast.info("Transaction history feature coming soon");
  };

  const getTotalBalance = () => {
    return storedWallets.reduce((total, wallet) => {
      return total + parseFloat(wallet.balance || '0');
    }, 0).toFixed(4);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
          <p className="text-muted-foreground">Manage your crypto assets and transactions</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            className="flex-1 md:flex-none" 
            onClick={handleConnectWallet}
            disabled={isConnecting || isConnected}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Connect Wallet"}
          </Button>
          <Button
            className="flex-1 md:flex-none"
            onClick={handleGenerateWallet}
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate New Wallet
          </Button>
        </div>
      </div>

      {generatedWallet && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Wallet</CardTitle>
            <CardDescription>Store these details securely</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold">Address:</p>
              <p className="font-mono text-sm break-all">{generatedWallet.address}</p>
            </div>
            <div>
              <p className="font-semibold">Private Key:</p>
              <p className="font-mono text-sm break-all">{generatedWallet.privateKey}</p>
            </div>
            <div>
              <p className="font-semibold">Balance:</p>
              <p className="font-mono text-sm">{generatedWallet.balance} ETH</p>
            </div>
            <p className="text-sm text-red-500">
              Important: Save your private key securely. Never share it with anyone!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Balance
              <Button
                size="icon"
                variant="ghost"
                onClick={updateWalletBalances}
                disabled={isLoadingBalance}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
            <CardDescription>Your total wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getTotalBalance()} ETH</div>
            <p className="text-muted-foreground">≈ ${(parseFloat(getTotalBalance()) * 2000).toFixed(2)} USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stored Wallets</CardTitle>
            <CardDescription>Your generated wallets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storedWallets.map((wallet, index) => (
                <div key={index} className="text-sm">
                  <p className="font-mono truncate">{wallet.address}</p>
                  <p className="text-muted-foreground">{wallet.balance} ETH</p>
                </div>
              ))}
              {storedWallets.length === 0 && (
                <p className="text-muted-foreground text-center">No wallets generated yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleSendReceive}
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Send / Receive
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleViewHistory}
            >
              <History className="mr-2 h-4 w-4" />
              View History
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-12">
            <History className="mx-auto h-16 w-16 opacity-50 mb-4" />
            <p className="text-lg">No transactions found</p>
            <p>Your transaction history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard;