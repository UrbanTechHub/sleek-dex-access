import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Fingerprint, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface PasskeyAuthProps {
  onSuccess?: () => void;
}

const PasskeyAuth = ({ onSuccess }: PasskeyAuthProps) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin'>('biometric');
  const [pin, setPin] = useState("");
  const { toast } = useToast();

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    try {
      if ('FaceID' in navigator || 'TouchID' in navigator) {
        // Using Web Authentication API
        const publicKey = {
          challenge: new Uint8Array(32),
          rp: { name: 'Secure DEX Wallet' },
          user: {
            id: new Uint8Array(16),
            name: 'user@example.com',
            displayName: 'Wallet User',
          },
          pubKeyCredParams: [{alg: -7, type: 'public-key'}],
          timeout: 60000,
        };

        await navigator.credentials.create({ publicKey });
        toast({
          title: "Biometric Authentication Successful",
          description: "Welcome back to your wallet!",
          duration: 3000,
        });
        onSuccess?.();
      } else {
        throw new Error("Biometric authentication not supported");
      }
    } catch (error) {
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

  const handlePinAuth = () => {
    if (pin.length < 6) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be at least 6 characters",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Here you would typically validate against a stored PIN
    // For demo purposes, we'll accept any valid PIN
    toast({
      title: "PIN Authentication Successful",
      description: "Welcome back to your wallet!",
      duration: 3000,
    });
    onSuccess?.();
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
              {isAuthenticating ? "Authenticating..." : "Use Biometric Authentication"}
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
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full"
            />
            <Button
              onClick={handlePinAuth}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Authenticate with PIN
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