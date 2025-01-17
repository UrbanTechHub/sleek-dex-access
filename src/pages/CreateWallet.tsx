import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PasskeyAuth from "@/components/PasskeyAuth";
import { toast } from "sonner";

const CreateWallet = () => {
  const [step, setStep] = useState<'auth' | 'create'>('auth');
  const navigate = useNavigate();
  const [walletName, setWalletName] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ETH");

  const handleAuthSuccess = () => {
    setStep('create');
    toast.success("Authentication successful!");
  };

  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      toast.error("Please enter a wallet name");
      return;
    }

    try {
      const walletData = {
        name: walletName,
        network: selectedNetwork,
      };
      localStorage.setItem('walletData', JSON.stringify(walletData));
      toast.success("Wallet created successfully!");
      navigate("/wallet-dashboard");
    } catch (error) {
      toast.error("Failed to create wallet");
      console.error("Wallet creation error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Create New Wallet</CardTitle>
          <CardDescription className="text-center">
            {step === 'auth' 
              ? "First, authenticate using your passkey"
              : "Set up your new wallet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'auth' ? (
            <PasskeyAuth mode="create" onSuccess={handleAuthSuccess} />
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Wallet Name</label>
                <Input
                  type="text"
                  placeholder="Enter wallet name"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Network</label>
                <Select
                  value={selectedNetwork}
                  onValueChange={setSelectedNetwork}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">Ethereum</SelectItem>
                    <SelectItem value="SOL">Solana</SelectItem>
                    <SelectItem value="BTC">Bitcoin</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full"
                onClick={handleCreateWallet}
              >
                Create Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateWallet;