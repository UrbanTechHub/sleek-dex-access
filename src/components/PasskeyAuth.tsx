import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Fingerprint, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface PasskeyAuthProps {
  mode: 'login' | 'create';
  onSuccess?: () => void;
}

const PasskeyAuth = ({ mode, onSuccess }: PasskeyAuthProps) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin'>('biometric');
  const [pin, setPin] = useState("");
  const { toast } = useToast();
  const { login, createAccount } = useAuth();

  const validatePin = (pin: string): boolean => {
    if (!pin || pin.length < 6) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 6 characters long",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
    return true;
  };

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    try {
      if ('credentials' in navigator) {
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const userId = crypto.getRandomValues(new Uint8Array(16));

        const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
          challenge,
          rp: { 
            name: 'Secure DEX Wallet',
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: 'user@example.com',
            displayName: 'Wallet User',
          },
          pubKeyCredParams: [
            {
              type: 'public-key',
              alg: -7
            }
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred'
          },
          timeout: 60000,
          attestation: 'none'
        };

        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        });
        
        if (credential) {
          const defaultPin = crypto.getRandomValues(new Uint8Array(4))
            .reduce((acc, val) => acc + (val % 10), '')
            .padStart(6, '0');
            
          if (mode === 'create') {
            await createAccount(defaultPin);
          } else {
            await login(defaultPin);
          }
          onSuccess?.();
        }
      } else {
        throw new Error("Web Authentication API not supported");
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: "Please try again or use PIN",
        variant: "destructive",
        duration: 3000,
      });
      setAuthMethod('pin');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinAuth = async () => {
    if (!validatePin(pin)) {
      return;
    }

    try {
      if (mode === 'create') {
        await createAccount(pin);
      } else {
        await login(pin);
      }
      onSuccess?.();
    } catch (error) {
      console.error("PIN authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        {authMethod === 'biometric' ? (
          <>
            <Button
              onClick={handleBiometricAuth}
              disabled={isAuthenticating}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              {isAuthenticating ? "Authenticating..." : `Use Biometric ${mode === 'create' ? 'Registration' : 'Authentication'}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => setAuthMethod('pin')}
              className="w-full"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Use PIN Instead
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter your PIN (minimum 6 characters)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full"
              minLength={6}
            />
            <Button
              onClick={handlePinAuth}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Account' : 'Login'} with PIN
            </Button>
            <Button
              variant="outline"
              onClick={() => setAuthMethod('biometric')}
              className="w-full"
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              Use Biometric Instead
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PasskeyAuth;