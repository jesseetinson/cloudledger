import { balanceSentence } from "@/lib/cloudledger/balances";
import { formatMoney } from "@/lib/cloudledger/money";
import type { BalanceSummary } from "@/lib/cloudledger/types";
import { FloatingCard } from "./floating-card";
import { SettledState } from "./settled-state";

export function BalanceHero({
  balance,
  viewerIsKid = false,
  totalLabel,
}: {
  balance: BalanceSummary;
  viewerIsKid?: boolean;
  totalLabel?: string;
}) {
  const settled = balance.netCents === 0;

  return (
    <FloatingCard className="relative overflow-hidden p-7">
      <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-amber-200/30 blur-2xl" />
      <p className="text-sm font-medium text-slate-500">{totalLabel ?? "Current balance"}</p>
      <div className="mt-4 flex flex-col gap-3">
        {settled ? (
          <>
            <SettledState />
            <p className="text-5xl font-semibold tracking-tight text-slate-800">$0.00</p>
          </>
        ) : (
          <>
            <p className="text-lg font-medium text-slate-600">
              {balanceSentence(balance.kid.name, balance.netCents, viewerIsKid)}
            </p>
            <p className="text-5xl font-semibold tracking-tight text-slate-900">
              {formatMoney(balance.netCents)}
            </p>
          </>
        )}
      </div>
    </FloatingCard>
  );
}
