import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Key, ArrowRight, Loader } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, createAccount } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await login(pin);
        navigate('/wallet-dashboard');
      } else {
        await createAccount(pin);
        navigate('/wallet-dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 mb-4">
            Secure DEX Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Access your decentralized wallet with enhanced security using PIN
          </p>
        </div>

        <Card className="border-2 border-opacity-50 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === 'login' ? (
                <>
                  <Key className="h-6 w-6 text-purple-600" />
                  Login to Wallet
                </>
              ) : (
                <>
                  <Wallet className="h-6 w-6 text-indigo-600" />
                  Create New Wallet
                </>
              )}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? "Access your existing wallet securely" 
                : "Set up a new wallet with PIN protection"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Enter your 6-digit PIN"
                  minLength={6}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {mode === 'login' ? 'Login' : 'Create Wallet'}
              </Button>
            </form>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setMode(mode === 'login' ? 'create' : 'login')}
              disabled={isLoading}
            >
              <span className="flex items-center gap-2">
                {mode === 'login' 
                  ? "Don't have a wallet? Create one" 
                  : "Already have a wallet? Login"}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Index;