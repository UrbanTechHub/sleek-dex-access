import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import FlashDriveStatus from "@/components/FlashDriveStatus";

const Index = () => {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [flashDriveReady, setFlashDriveReady] = useState(false);
  const { login, createAccount } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashDriveReady) {
      toast.error('Please connect your flash drive first');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(pin);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!flashDriveReady) {
      toast.error('Please connect your flash drive first');
      return;
    }
    
    if (!pin || pin.length < 6) {
      toast.error('Please enter a PIN with at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      await createAccount(pin);
    } catch (error) {
      console.error('Account creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Secure Wallet</h1>
          <p className="text-muted-foreground">Your crypto, secured on your flash drive</p>
        </div>
        
        <FlashDriveStatus 
          onConnected={() => setFlashDriveReady(true)}
          showConnectButton={true}
        />

        <Card className="backdrop-blur-sm bg-card/90">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Access Your Wallet</CardTitle>
            <CardDescription className="text-center">
              Enter your PIN to login or create a new wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN (minimum 6 characters)</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    placeholder="Enter your PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    disabled={isLoading || !flashDriveReady}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !pin || !flashDriveReady}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleCreateWallet}
                  disabled={isLoading || !pin || !flashDriveReady}
                >
                  {isLoading ? "Creating..." : "Create New Wallet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Your wallet data is stored securely on your flash drive</p>
          <p>Keep your flash drive safe and never share your PIN</p>
        </div>
      </div>
    </div>
  );
};

export default Index;