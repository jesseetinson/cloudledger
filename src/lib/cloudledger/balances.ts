import type { BalanceSummary, Person, Settlement, TransactionWithRelations } from "./types";

export function calculateBalances(
  kids: Person[],
  transactions: TransactionWithRelations[],
  settlements: Settlement[] = [],
): BalanceSummary[] {
  return kids.map((kid) => {
    const kidTransactions = transactions.filter((transaction) => transaction.kid_id === kid.id && !transaction.is_paid);
    const dadOwesCents = kidTransactions
      .filter((transaction) => transaction.direction === "dad_owes_kid")
      .reduce((sum, transaction) => sum + transaction.amount_cents, 0);
    const kidOwesCents = kidTransactions
      .filter((transaction) => transaction.direction === "kid_owes_dad")
      .reduce((sum, transaction) => sum + transaction.amount_cents, 0);
    const settlementAdjustmentCents = settlements
      .filter((settlement) => settlement.kid_id === kid.id)
      .reduce((sum, settlement) => {
        return settlement.direction === "dad_owes_kid"
          ? sum - settlement.amount_cents
          : sum + settlement.amount_cents;
      }, 0);

    return {
      kid,
      dadOwesCents,
      kidOwesCents,
      settlementAdjustmentCents,
      netCents: dadOwesCents - kidOwesCents + settlementAdjustmentCents,
    };
  });
}

export function balanceSentence(kidName: string, netCents: number, viewerIsKid = false) {
  if (netCents > 0) {
    return viewerIsKid ? `Dad owes you` : `Dad owes ${kidName}`;
  }

  if (netCents < 0) {
    return viewerIsKid ? `You owe Dad` : `${kidName} owes Dad`;
  }

  return "Settled";
}
