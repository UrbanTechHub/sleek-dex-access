import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, RefreshCw, Wallet, LogOut } from "lucide-react";
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
      // Filter out TON and SOL wallets if they exist
      const filteredWallets = JSON.parse(savedWallets).filter(
        (wallet: WalletData) => ['ETH', 'BTC', 'USDT'].includes(wallet.network)
      );
      setWallets(filteredWallets);
      localStorage.setItem('wallets', JSON.stringify(filteredWallets));
    } else {
      generateInitialWallets();
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const generateInitialWallets = async () => {
    setIsGenerating(true);
    try {
      const networks: Array<'ETH' | 'BTC' | 'USDT'> = ['ETH', 'BTC', 'USDT'];
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallet Dashboard</h1>
          <p className="text-muted-foreground">Manage your crypto assets</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={updateBalances}
            disabled={isUpdating || wallets.length === 0}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            Update Balances
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <Card key={wallet.id}>
            <CardHeader>
              <CardTitle>{wallet.network} Wallet</CardTitle>
              <CardDescription>Balance: {wallet.balance} {wallet.network}</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionHistory transactions={transactions} />
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDashboard;