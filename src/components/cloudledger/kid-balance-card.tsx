import Link from "next/link";
import { balanceSentence } from "@/lib/cloudledger/balances";
import { formatMoney } from "@/lib/cloudledger/money";
import type { BalanceSummary } from "@/lib/cloudledger/types";
import { FloatingCard } from "./floating-card";

export function KidBalanceCard({ balance }: { balance: BalanceSummary }) {
  return (
    <Link href={`/transactions?kid=${balance.kid.id}`} className="block">
      <FloatingCard className="transition duration-200 hover:-translate-y-0.5 hover:bg-white/72">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{balance.kid.name}</p>
            <p className="mt-2 text-base font-semibold text-slate-700">
              {balanceSentence(balance.kid.name, balance.netCents)}
            </p>
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {balance.netCents === 0 ? "$0.00" : formatMoney(balance.netCents)}
          </p>
        </div>
      </FloatingCard>
    </Link>
  );
}
