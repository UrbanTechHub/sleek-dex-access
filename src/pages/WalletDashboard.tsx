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

const WalletDashboard = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.wallets) {
      setWallets(user.wallets);
      void updateAllBalances();
    }
  }, [user]);

  const updateAllBalances = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const updatedWallets = await Promise.all(
        wallets.map(async (wallet) => ({
          ...wallet,
          balance: await updateWalletBalance(wallet),
          lastUpdated: new Date(),
        }))
      );
      
      setWallets(updatedWallets);
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
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
        const updatedWallets = wallets.map(w => {
          if (w.id === wallet.id) {
            return {
              ...w,
              balance: (Number(w.balance) - Number(amount)).toString()
            };
          }
          return w;
        });
        
        setWallets(updatedWallets);
        localStorage.setItem('wallets', JSON.stringify(updatedWallets));
        
        // Update the transaction history
        const newTransaction = {
          id: crypto.randomUUID(),
          type: 'send',
          amount,
          currency: wallet.network,
          address: recipient,
          timestamp: new Date(),
          status: 'completed',
          network: wallet.network
        };
        
        const updatedTransactions = [newTransaction, ...(user?.transactions || [])];
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
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
            <Card key={wallet.id} className="backdrop-blur-sm bg-card/90">
              <CardHeader>
                <CardTitle>{wallet.name}</CardTitle>
                <CardDescription>
                  Balance: {wallet.balance} {wallet.network}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="backdrop-blur-sm bg-card/90">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent transactions across all networks</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory transactions={user?.transactions || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletDashboard;