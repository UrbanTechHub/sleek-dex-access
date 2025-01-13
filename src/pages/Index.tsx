import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PasskeyAuth from '@/components/PasskeyAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/wallet-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Welcome to Wallet App</CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Sign in to access your wallet' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PasskeyAuth mode={mode} onSuccess={handleSuccess} />
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <Button
              variant="ghost"
              onClick={() => setMode(mode === 'login' ? 'create' : 'login')}
            >
              {mode === 'login' ? 'Create Account' : 'Sign In'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;