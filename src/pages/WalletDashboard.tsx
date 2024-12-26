import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Transaction } from "@/components/TransactionHistory";
import { WalletData, updateWalletBalance } from "@/utils/walletUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ConnectWalletCard from "@/components/dashboard/ConnectWalletCard";
import WalletGrid from "@/components/dashboard/WalletGrid";
import TransactionList from "@/components/dashboard/TransactionList";

const WalletDashboard = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedWallets = localStorage.getItem('wallets');
    const savedTransactions = localStorage.getItem('transactions');
    
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets));
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const updateBalances = async () => {
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
      toast.success("Balances updated successfully!");
    } catch (error) {
      toast.error("Failed to update balances");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendTransaction = (wallet: WalletData) => async (amount: string, recipient: string) => {
    try {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'send',
        amount,
        currency: wallet.network,
        address: recipient,
        timestamp: new Date(),
        status: 'completed'
      };

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
      setTransactions([newTransaction, ...transactions]);
      localStorage.setItem('wallets', JSON.stringify(updatedWallets));
      localStorage.setItem('transactions', JSON.stringify([newTransaction, ...transactions]));

      toast.success(`Successfully sent ${amount} ${wallet.network}`);
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Failed to send transaction');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Wallet Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your crypto assets across multiple networks</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={updateBalances}
              disabled={isUpdating || wallets.length === 0}
              className="hover:scale-105 transition-transform"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              Update Balances
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="hover:scale-105 transition-transform"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <WalletGrid wallets={wallets} onSendTransaction={handleSendTransaction} />
          </div>
          <div className="lg:col-span-1">
            <ConnectWalletCard />
          </div>
        </div>

        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
};

export default WalletDashboard;