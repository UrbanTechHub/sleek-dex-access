import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Key, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const navigate = useNavigate();
  const { user, login, createAccount } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/wallet-dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(pin);
      } else {
        await createAccount(pin);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 animate-scale-in">
              Secure DEX Wallet
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl max-w-2xl leading-relaxed">
              Access your decentralized wallet with enhanced security using PIN. 
              Trade and manage your crypto assets with confidence.
            </p>
          </div>

          <div className="w-full max-w-md">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-opacity-50 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  {mode === 'login' ? (
                    <>
                      <Key className="h-6 w-6 text-purple-600 animate-pulse" />
                      Login to Wallet
                    </>
                  ) : (
                    <>
                      <Wallet className="h-6 w-6 text-indigo-600 animate-pulse" />
                      Create New Wallet
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-base">
                  {mode === 'login' 
                    ? "Access your existing wallet securely" 
                    : "Set up a new wallet with PIN protection"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="pin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    {mode === 'login' ? 'Login' : 'Create Wallet'}
                  </Button>
                </form>
                <Button 
                  variant="ghost" 
                  className="w-full group hover:bg-purple-50 dark:hover:bg-gray-800 transition-all duration-300"
                  onClick={() => setMode(mode === 'login' ? 'create' : 'login')}
                >
                  <span className="flex items-center gap-2">
                    {mode === 'login' 
                      ? "Don't have a wallet? Create one" 
                      : "Already have a wallet? Login"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
            <p>Secure, decentralized, and always in your control</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;