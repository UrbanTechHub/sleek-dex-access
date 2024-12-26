import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Wallet, LogOut, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import WalletInfo from "@/components/WalletInfo";
import TransactionHistory, { Transaction } from "@/components/TransactionHistory";
import { WalletData, generateWallet, updateWalletBalance } from "@/utils/walletUtils";
import SendTokenDialog from "@/components/SendTokenDialog";
import ReceiveDialog from "@/components/ReceiveDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const WalletDashboard = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedWallets = localStorage.getItem('wallets');
    const savedTransactions = localStorage.getItem('transactions');
    
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets));
    } else {
      generateInitialWallets();
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const generateInitialWallets = async () => {
    setIsGenerating(true);
    try {
      const networks: Array<'ETH' | 'BTC' | 'USDT' | 'SOL' | 'USDC'> = ['ETH', 'BTC', 'USDT', 'SOL', 'USDC'];
      const walletData = localStorage.getItem('walletData');
      const { name } = walletData ? JSON.parse(walletData) : { name: 'My Wallet' };
      
      const newWallets = await Promise.all(
        networks.map(network => generateWallet(network, `${name} - ${network}`))
      );
      setWallets(newWallets);
      localStorage.setItem('wallets', JSON.stringify(newWallets));
      toast.success("Wallets generated successfully!");
    } catch (error) {
      toast.error("Failed to generate wallets");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

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
        type: 'send' as const,
        amount,
        currency: wallet.network,
        address: recipient,
        timestamp: new Date(),
        status: 'completed' as const
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="backdrop-blur-sm bg-card/90 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  {wallet.network} Wallet
                </CardTitle>
                <CardDescription className="font-mono">
                  Balance: {wallet.balance} {wallet.network}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <SendTokenDialog
                    wallet={wallet}
                    onSend={handleSendTransaction(wallet)}
                  />
                  <ReceiveDialog wallet={wallet} />
                </div>
                <WalletInfo
                  address={wallet.address}
                  network={wallet.network}
                  balance={wallet.balance}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="backdrop-blur-sm bg-card/90 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
            <CardDescription>Your recent transactions across all networks</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletDashboard;
