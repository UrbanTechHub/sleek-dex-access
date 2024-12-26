import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import TransactionHistory, { Transaction } from "../TransactionHistory";

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
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
  );
};

export default TransactionList;