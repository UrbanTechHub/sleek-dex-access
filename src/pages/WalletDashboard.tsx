import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRightLeft, Wallet, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const WalletDashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
          <p className="text-muted-foreground">Manage your crypto assets and transactions</p>
        </div>
        <Button 
          className="w-full md:w-auto" 
          onClick={handleConnectWallet}
          disabled={isConnecting || isConnected}
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Connect Wallet"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
            <CardDescription>Your total wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0.00 ETH</div>
            <p className="text-muted-foreground">≈ $0.00 USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-center py-6">
              <History className="mx-auto h-12 w-12 opacity-50 mb-2" />
              <p>No recent transactions</p>
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