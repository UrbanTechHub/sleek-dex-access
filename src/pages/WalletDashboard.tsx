import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import WalletInfo from "@/components/WalletInfo";
import TransactionHistory from "@/components/TransactionHistory";
import { WalletData, updateWalletBalance, sendTransaction } from "@/utils/walletUtils";
import WalletActions from "@/components/WalletActions";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { storage } from "@/utils/localStorage";
import type { Transaction } from "@/types/auth";

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
    
    console.log('Setting initial wallets:', user.wallets);
    setWallets(user.wallets || []);
    
    // Initial balance update
    void updateAllBalances().catch(console.error);
    
    // Set up automatic balance updates every 30 seconds
    const intervalId = setInterval(() => {
      void updateAllBalances().catch(console.error);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, navigate]);

  const updateAllBalances = async () => {
    if (isUpdating || !user?.wallets) return;
    
    setIsUpdating(true);
    try {
      const updatedWallets = await Promise.all(
        user.wallets.map(async (wallet) => {
          try {
            const newBalance = await updateWalletBalance(wallet);
            console.log('Updated balance:', { network: wallet.network, balance: newBalance });
            return {
              ...wallet,
              balance: newBalance,
              lastUpdated: new Date(),
            };
          } catch (error) {
            console.error(`Error updating ${wallet.network} balance:`, error);
            return wallet;
          }
        })
      );
      
      setWallets(updatedWallets);
      
      if (user) {
        const updatedUser = {
          ...user,
          wallets: updatedWallets
        };
        storage.setUser(updatedUser);
      }
      
      console.log('All balances updated successfully');
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
      
      if (success && user) {
        // Update balance immediately after successful transaction
        const updatedBalance = await updateWalletBalance(wallet);
        console.log('Transaction successful, new balance:', updatedBalance);
        
        const updatedWallets = wallets.map(w => {
          if (w.id === wallet.id) {
            return {
              ...w,
              balance: updatedBalance
            };
          }
          return w;
        });
        
        // Create new transaction record
        const newTransaction: Transaction = {
          id: crypto.randomUUID(),
          type: 'send',
          amount,
          currency: wallet.network === 'TRON' ? 'USDT' : wallet.network,
          address: recipient,
          timestamp: new Date(),
          status: 'completed',
          network: wallet.network
        };
        
        // Update user state with new transaction and wallet balances
        const updatedUser = {
          ...user,
          transactions: [newTransaction, ...(user.transactions || [])],
          wallets: updatedWallets
        };
        
        // Save to storage and update state
        storage.setUser(updatedUser);
        setWallets(updatedWallets);
        
        toast.success(`Successfully sent ${amount} ${wallet.network}`);
        
        // Trigger multiple balance updates to ensure sync
        const checkBalances = async () => {
          await updateAllBalances();
          // Check again after 10 seconds for network confirmation
          setTimeout(() => {
            void updateAllBalances();
          }, 10000);
        };
        
        void checkBalances();
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
            <p className="text-muted-foreground">Manage your crypto assets</p>
          </div>
          <Button variant="destructive" onClick={handleLogout} className="shrink-0">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="flex flex-col gap-4">
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
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
              <TransactionHistory transactions={user?.transactions || []} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletDashboard;
