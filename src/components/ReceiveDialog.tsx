import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowDownToLine, Copy } from "lucide-react";
import { toast } from "sonner";
import { WalletData } from "@/utils/walletUtils";
import QRCode from "qrcode.react";

interface ReceiveDialogProps {
  wallet: WalletData;
}

const ReceiveDialog = ({ wallet }: ReceiveDialogProps) => {
  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast.success("Address copied to clipboard!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowDownToLine className="mr-2 h-4 w-4" />
          Receive
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive {wallet.network}</DialogTitle>
          <DialogDescription>
            Share your wallet address to receive {wallet.network}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center p-4">
            <QRCode value={wallet.address} size={200} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Your Wallet Address:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                {wallet.address}
              </code>
              <Button size="icon" variant="outline" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveDialog;