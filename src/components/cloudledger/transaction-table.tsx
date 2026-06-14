import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setTransactionPaid } from "@/lib/cloudledger/actions";
import { formatMoney } from "@/lib/cloudledger/money";
import type { TransactionWithRelations } from "@/lib/cloudledger/types";
import { CategoryBadge } from "./category-badge";
import { DirectionBadge } from "./direction-badge";
import { EmptyState } from "./empty-state";
import { FloatingCard } from "./floating-card";

export function TransactionTable({ transactions }: { transactions: TransactionWithRelations[] }) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Nothing in the ledger yet"
        description="The air is clear. Add the first item whenever something needs tracking."
      />
    );
  }

  return (
    <FloatingCard className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="border-white/70">
            <TableHead>Description</TableHead>
            <TableHead className="hidden md:table-cell">Kid</TableHead>
            <TableHead className="hidden lg:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Direction</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="border-white/70">
              <TableCell>
                <div className="font-medium text-slate-800">{transaction.description}</div>
                <div className="text-xs text-slate-500">
                  {new Date(transaction.created_at).toLocaleDateString()} · {transaction.source}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{transaction.kid.name}</TableCell>
              <TableCell className="hidden lg:table-cell">
                <CategoryBadge category={transaction.category} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <DirectionBadge direction={transaction.direction} kidName={transaction.kid.name} />
              </TableCell>
              <TableCell>
                <form action={setTransactionPaid.bind(null, transaction.id, !transaction.is_paid)}>
                  <Button type="submit" variant="ghost" size="sm" className="rounded-full">
                    {transaction.is_paid ? "Paid" : "Unpaid"}
                  </Button>
                </form>
              </TableCell>
              <TableCell className="text-right font-semibold text-slate-800">
                {formatMoney(transaction.amount_cents)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </FloatingCard>
  );
}
