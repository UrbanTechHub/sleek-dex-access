import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface WalletInfoProps {
  address: string;
  network: 'ETH' | 'BTC' | 'USDT' | 'SOL' | 'USDC';
  balance: string;
}

const WalletInfo = ({ address, network, balance }: WalletInfoProps) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  const viewExplorer = () => {
    let explorerUrl = '';
    switch (network) {
      case 'BTC':
        explorerUrl = `https://www.blockchain.com/explorer/addresses/btc/${address}`;
        break;
      case 'SOL':
        explorerUrl = `https://explorer.solana.com/address/${address}`;
        break;
      case 'USDC':
        // USDC on Solana
        explorerUrl = `https://explorer.solana.com/address/${address}/tokens`;
        break;
      case 'USDT':
        explorerUrl = `https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7?a=${address}`;
        break;
      case 'ETH':
      default:
        explorerUrl = `https://etherscan.io/address/${address}`;
    }
    window.open(explorerUrl, '_blank');
  };

  const getNetworkColor = () => {
    switch (network) {
      case 'ETH':
        return 'from-blue-500 to-purple-500';
      case 'BTC':
        return 'from-orange-500 to-yellow-500';
      case 'USDT':
        return 'from-green-500 to-emerald-500';
      case 'SOL':
        return 'from-purple-500 to-indigo-500';
      case 'USDC':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const formatBalance = (balance: string, network: string) => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0.00';
    return num.toFixed(network === 'SOL' ? 9 : 4);
  };

  return (
    <Card className={`bg-gradient-to-br ${getNetworkColor()} text-white shadow-xl hover:shadow-2xl transition-all duration-300`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {network} Wallet
          <Button variant="ghost" size="icon" onClick={copyAddress} className="text-white hover:text-white/80">
            <Copy className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription className="text-white/90">
          Balance: {formatBalance(balance, network)} {network}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-mono break-all bg-black/20 p-2 rounded">{address}</p>
        <Button 
          variant="secondary" 
          className="w-full bg-white/10 hover:bg-white/20 text-white border-none" 
          onClick={viewExplorer}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </Button>
      </CardContent>
    </Card>
  );
};

export default WalletInfo;