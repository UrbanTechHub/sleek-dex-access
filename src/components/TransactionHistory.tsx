import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: string;
  currency: string;
  address: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  network?: 'ETH' | 'BTC' | 'TRON' | 'SOL' | 'USDC';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Network</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="capitalize">{tx.type}</TableCell>
            <TableCell>{tx.amount} {tx.currency}</TableCell>
            <TableCell>{tx.network || tx.currency}</TableCell>
            <TableCell className="font-mono text-sm truncate max-w-[200px]">
              {tx.address}
            </TableCell>
            <TableCell>{formatDistanceToNow(tx.timestamp, { addSuffix: true })}</TableCell>
            <TableCell>
              <Badge variant="secondary" className={`${getStatusColor(tx.status)} text-white`}>
                {tx.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
        {transactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No transactions yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TransactionHistory;