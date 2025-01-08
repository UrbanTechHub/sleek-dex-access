import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import WalletInfo from "@/components/WalletInfo";
import TransactionHistory from "@/components/TransactionHistory";
import { WalletData, updateWalletBalance, sendTransaction } from "@/utils/walletUtils";
import WalletActions from "@/components/WalletActions";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { storage } from "@/utils/localStorage";

const WalletDashboard = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    setWallets(user.wallets || []);
    
    // Initial balance update
    void updateAllBalances();
    
    // Set up automatic balance updates every 30 seconds
    const intervalId = setInterval(() => {
      void updateAllBalances();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, navigate]);

  const updateAllBalances = async () => {
    if (isUpdating || !user?.wallets) return;
    
    setIsUpdating(true);
    try {
      const updatedWallets = await Promise.all(
        user.wallets.map(async (wallet) => ({
          ...wallet,
          balance: await updateWalletBalance(wallet),
          lastUpdated: new Date(),
        }))
      );
      
      setWallets(updatedWallets);
      
      // Update user context with new balances and persist to localStorage
      if (user) {
        const updatedUser = {
          ...user,
          wallets: updatedWallets
        };
        storage.setUser(updatedUser);
      }
      
      toast.success("All balances updated successfully!");
    } catch (error) {
      console.error('Error updating balances:', error);
      toast.error("Failed to update some balances");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendTransaction = (wallet: WalletData) => async (amount: string, recipient: string) => {
    try {
      const success = await sendTransaction(wallet, amount, recipient);
      
      if (success) {
        // Update the specific wallet's balance immediately after successful transaction
        const updatedBalance = await updateWalletBalance(wallet);
        
        const updatedWallets = wallets.map(w => {
          if (w.id === wallet.id) {
            return {
              ...w,
              balance: updatedBalance
            };
          }
          return w;
        });
        
        setWallets(updatedWallets);
        
        // Update the transaction history and persist to localStorage
        const newTransaction = {
          id: crypto.randomUUID(),
          type: 'send' as const,
          amount,
          currency: wallet.network,
          address: recipient,
          timestamp: new Date(),
          status: 'completed' as const,
          network: wallet.network
        };
        
        if (user) {
          const updatedUser = {
            ...user,
            transactions: [newTransaction, ...(user.transactions || [])],
            wallets: updatedWallets
          };
          storage.setUser(updatedUser);
        }
        
        toast.success(`Successfully sent ${amount} ${wallet.network}`);
      }
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Failed to send transaction');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Wallet Dashboard</h1>
            <p className="text-muted-foreground">Manage your crypto assets</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {wallets.map((wallet) => (
            <div key={wallet.id}>
              <WalletInfo
                address={wallet.address}
                network={wallet.network}
                balance={wallet.balance}
              />
              <WalletActions
                wallet={wallet}
                onSend={handleSendTransaction(wallet)}
                onUpdate={updateAllBalances}
                isUpdating={isUpdating}
              />
            </div>
          ))}
        </div>

        <Card className="backdrop-blur-sm bg-card/90">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent transactions across all networks</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory transactions={user.transactions || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletDashboard;