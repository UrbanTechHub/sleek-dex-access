import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Wallet } from "lucide-react";
import { useWalletConnect } from "@/hooks/useWalletConnect";

const ConnectWalletCard = () => {
  const { 
    isConnecting, 
    setIsConnecting, 
    connectMetaMask, 
    connectTrustWallet, 
    connectWalletConnect 
  } = useWalletConnect();

  const handleConnect = async (connectFn: () => Promise<any>) => {
    setIsConnecting(true);
    try {
      await connectFn();
    } finally {
      setIsConnecting(false);
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
          onClick={() => handleConnect(connectMetaMask)}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:opacity-90"
        >
          <Link2 className="mr-2 h-4 w-4" />
          Connect MetaMask
        </Button>
        <Button 
          onClick={() => handleConnect(connectTrustWallet)}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90"
        >
          <Link2 className="mr-2 h-4 w-4" />
          Connect Trust Wallet
        </Button>
        <Button 
          onClick={() => handleConnect(connectWalletConnect)}
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