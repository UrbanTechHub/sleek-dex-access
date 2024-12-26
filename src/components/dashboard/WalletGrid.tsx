import { WalletData } from "@/utils/walletUtils";
import WalletInfo from "../WalletInfo";
import SendTokenDialog from "../SendTokenDialog";
import ReceiveDialog from "../ReceiveDialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Wallet } from "lucide-react";

interface WalletGridProps {
  wallets: WalletData[];
  onSendTransaction: (wallet: WalletData) => (amount: string, recipient: string) => void;
}

const WalletGrid = ({ wallets, onSendTransaction }: WalletGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {wallets.map((wallet) => (
        <Card key={wallet.id} className="backdrop-blur-sm bg-card/90 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              {wallet.network} Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <SendTokenDialog
                wallet={wallet}
                onSend={onSendTransaction(wallet)}
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
  );
};

export default WalletGrid;