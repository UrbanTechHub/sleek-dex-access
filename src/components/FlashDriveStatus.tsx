import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UsbIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { flashDriveStorage, isFlashDriveSupported } from '@/utils/flashDriveStorage';

interface FlashDriveStatusProps {
  onConnected?: () => void;
  showConnectButton?: boolean;
}

const FlashDriveStatus = ({ onConnected, showConnectButton = true }: FlashDriveStatusProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await flashDriveStorage.isFlashDriveConnected();
      setIsConnected(connected);
      
      if (connected && onConnected) {
        onConnected();
      }
    } catch (error) {
      console.error('Error checking flash drive connection:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  const connectFlashDrive = async () => {
    try {
      const handle = await flashDriveStorage.requestAccess();
      if (handle) {
        setIsConnected(true);
        if (onConnected) {
          onConnected();
        }
      }
    } catch (error) {
      console.error('Error connecting to flash drive:', error);
      toast.error('Failed to connect to flash drive');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (!isFlashDriveSupported()) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Browser Not Supported</p>
              <p className="text-sm text-muted-foreground">
                Please use Chrome or Edge for flash drive support
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isConnected ? 'border-green-500/60 bg-green-500/10' : 'border-orange-500/60 bg-orange-500/10'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UsbIcon className={`h-5 w-5 ${isConnected ? 'text-green-600' : 'text-orange-600'}`} />
            <div>
              <p className={`font-medium ${isConnected ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
                Flash Drive {isConnected ? 'Connected' : 'Not Connected'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? 'Your wallet data is secured on the flash drive'
                  : 'Connect your flash drive to access your wallet'
                }
              </p>
            </div>
          </div>
          
          {showConnectButton && !isConnected && (
            <Button
              onClick={connectFlashDrive}
              disabled={isChecking}
              variant="outline"
              size="sm"
            >
              {isChecking ? 'Checking...' : 'Connect'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashDriveStatus;