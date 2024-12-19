import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Key } from "lucide-react";
import PasskeyAuth from "@/components/PasskeyAuth";
import { useState } from "react";

const Index = () => {
  const [mode, setMode] = useState<'login' | 'create'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              Secure DEX Wallet
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl max-w-2xl">
              Access your decentralized wallet with enhanced security using passkeys
            </p>
          </div>

          <div className="w-full max-w-md">
            <Card className="hover:shadow-lg transition-shadow">
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
                    : "Set up a new wallet with passkey protection"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PasskeyAuth mode={mode} />
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setMode(mode === 'login' ? 'create' : 'login')}
                >
                  {mode === 'login' 
                    ? "Don't have a wallet? Create one" 
                    : "Already have a wallet? Login"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;