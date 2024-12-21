import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, RefreshCw, Wallet } from "lucide-react";
import { toast } from "sonner";
import WalletInfo from "@/components/WalletInfo";
import TransactionHistory, { Transaction } from "@/components/TransactionHistory";
import { WalletData, generateWallet, updateWalletBalance } from "@/utils/walletUtils";
import SendTokenDialog from "@/components/SendTokenDialog";

const SUPPORTED_NETWORKS = ['ETH', 'SOL', 'USDT'] as const;

const WalletDashboard = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
      const newWallets = await Promise.all(
        SUPPORTED_NETWORKS.map(network => generateWallet(network))
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
      // Create a new transaction
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: 'send',
        amount,
        from: wallet.address,
        to: recipient,
        network: wallet.network,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      // Update wallet balance
      const updatedWallets = wallets.map(w => {
        if (w.id === wallet.id) {
          return {
            ...w,
            balance: (Number(w.balance) - Number(amount)).toString()
          };
        }
        return w;
      });

      // Update state and localStorage
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

  const getTotalBalance = (network: typeof SUPPORTED_NETWORKS[number]) => {
    return wallets
      .filter(w => w.network === network)
      .reduce((total, wallet) => total + parseFloat(wallet.balance || '0'), 0)
      .toFixed(4);
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
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {SUPPORTED_NETWORKS.map((network) => (
          <Card key={network}>
            <CardHeader>
              <CardTitle>{network} Total Balance</CardTitle>
              <CardDescription>{getTotalBalance(network)} {network}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {wallets.find(w => w.network === network) && (
                  <SendTokenDialog
                    wallet={wallets.find(w => w.network === network)!}
                    onSend={handleSendTransaction(wallets.find(w => w.network === network)!)}
                  />
                )}
                <Button className="flex-1" variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  Receive
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <WalletInfo
            key={wallet.id}
            address={wallet.address}
            network={wallet.network}
            balance={wallet.balance}
          />
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