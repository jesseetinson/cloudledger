import type { BalanceSummary, Person, TransactionWithRelations } from "./types";

export function calculateBalances(
  kids: Person[],
  transactions: TransactionWithRelations[],
): BalanceSummary[] {
  return kids.map((kid) => {
    const kidTransactions = transactions.filter((transaction) => transaction.kid_id === kid.id && !transaction.is_paid);
    const dadOwesCents = kidTransactions
      .filter((transaction) => transaction.direction === "dad_owes_kid")
      .reduce((sum, transaction) => sum + transaction.amount_cents, 0);
    const kidOwesCents = kidTransactions
      .filter((transaction) => transaction.direction === "kid_owes_dad")
      .reduce((sum, transaction) => sum + transaction.amount_cents, 0);
    const settlementAdjustmentCents = 0;

    return {
      kid,
      dadOwesCents,
      kidOwesCents,
      settlementAdjustmentCents,
      netCents: dadOwesCents - kidOwesCents,
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
