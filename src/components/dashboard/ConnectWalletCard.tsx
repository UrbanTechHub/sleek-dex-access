import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";

const ConnectWalletCard = () => {
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask to connect your wallet");
        return;
      }
      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts.length > 0) {
        toast.success("Wallet connected successfully!");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
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
          onClick={connectWallet}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90"
        >
          <Link2 className="mr-2 h-4 w-4" />
          Connect MetaMask
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => toast.info("More wallet connections coming soon!")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add More Wallets
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectWalletCard;