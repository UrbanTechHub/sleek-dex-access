import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import SendTokenDialog from "./SendTokenDialog";
import ReceiveDialog from "./ReceiveDialog";
import { WalletData } from "@/utils/walletUtils";

interface WalletActionsProps {
  wallet: WalletData;
  onSend: (amount: string, recipient: string) => void;
  onUpdate: () => void;
  isUpdating: boolean;
}

const WalletActions = ({ wallet, onSend, onUpdate, isUpdating }: WalletActionsProps) => {
  return (
    <div className="flex gap-2 mt-4">
      <SendTokenDialog wallet={wallet} onSend={onSend} />
      <ReceiveDialog wallet={wallet} />
      <Button
        variant="outline"
        onClick={onUpdate}
        disabled={isUpdating}
        className="flex-1"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
        Update
      </Button>
    </div>
  );
};

export default WalletActions;