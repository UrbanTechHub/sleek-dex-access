import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PasskeyAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();

  const handlePasskeyAuth = async () => {
    setIsAuthenticating(true);
    try {
      // Here we'll implement the actual WebAuthn authentication
      // For now, we'll just show a success message
      toast({
        title: "Authentication Successful",
        description: "Welcome back to your wallet!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Button
      onClick={handlePasskeyAuth}
      disabled={isAuthenticating}
      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
    >
      <Fingerprint className="mr-2 h-4 w-4" />
      {isAuthenticating ? "Authenticating..." : "Authenticate with Passkey"}
    </Button>
  );
};

export default PasskeyAuth;