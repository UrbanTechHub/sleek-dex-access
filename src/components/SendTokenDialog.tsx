import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { WalletData } from "@/utils/walletUtils";

interface SendTokenDialogProps {
  wallet: WalletData;
  onSend: (amount: string, recipient: string) => void;
}

const SendTokenDialog = ({ wallet, onSend }: SendTokenDialogProps) => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const validateAddress = (address: string) => {
    switch (wallet.network) {
      case 'BTC':
        // Basic Bitcoin address validation (starts with 1, 3, or bc1)
        return /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(address);
      case 'TON':
        // Basic TON address validation (64 characters)
        return /^[a-zA-Z0-9]{48}$/.test(address);
      default:
        // ETH/USDT address validation (0x followed by 40 hex characters)
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
  };

  const handleSend = () => {
    if (!amount || !recipient) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!validateAddress(recipient)) {
      toast.error(`Invalid ${wallet.network} address format`);
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(amount) > Number(wallet.balance)) {
      toast.error("Insufficient balance");
      return;
    }

    onSend(amount, recipient);
    setIsOpen(false);
    setAmount("");
    setRecipient("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send {wallet.network}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              placeholder={`0.0 ${wallet.network}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder={`Enter ${wallet.network} address`}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSend}>
            Send {wallet.network}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendTokenDialog;