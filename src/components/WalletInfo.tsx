import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface WalletInfoProps {
  address: string;
  network: 'ETH' | 'SOL' | 'USDT';
  balance: string;
}

const WalletInfo = ({ address, network, balance }: WalletInfoProps) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  const viewExplorer = () => {
    const explorerUrl = network === 'SOL' 
      ? `https://explorer.solana.com/address/${address}`
      : `https://etherscan.io/address/${address}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {network} Wallet
          <Button variant="outline" size="icon" onClick={copyAddress}>
            <Copy className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>Balance: {balance} {network}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-mono break-all">{address}</p>
        <Button variant="outline" className="w-full" onClick={viewExplorer}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </Button>
      </CardContent>
    </Card>
  );
};

export default WalletInfo;