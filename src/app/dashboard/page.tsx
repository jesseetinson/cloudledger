import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { AppShell } from "@/components/cloudledger/app-shell";
import { FloatingCard } from "@/components/cloudledger/floating-card";
import { TransactionTable } from "@/components/cloudledger/transaction-table";
import { calculateBalances } from "@/lib/cloudledger/balances";
import { settleBalance } from "@/lib/cloudledger/actions";
import { getCloudLedgerPhoneNumber } from "@/lib/cloudledger/contact";
import { formatMoney } from "@/lib/cloudledger/money";
import type { BalanceSummary } from "@/lib/cloudledger/types";
import { getPeople, getSettlements, getTransactions, requireCurrentPerson } from "@/lib/cloudledger/data";

export default async function DashboardPage() {
  const currentPerson = await requireCurrentPerson();
  const [people, transactions, settlements] = await Promise.all([
    getPeople(),
    getTransactions(currentPerson),
    getSettlements(currentPerson),
  ]);
  const kids = people.filter((person) => person.role === "kid");
  const visibleKids = currentPerson.role === "dad" ? kids : kids.filter((kid) => kid.id === currentPerson.id);
  const balances = calculateBalances(visibleKids, transactions, settlements);
  const primaryBalance = balances[0];
  const totalNetCents = balances.reduce((sum, balance) => sum + balance.netCents, 0);
  const reviewCount = transactions.filter((transaction) => transaction.needs_review).length;
  const phoneNumber = getCloudLedgerPhoneNumber();
  const hasBalance = balances.some((balance) => balance.netCents !== 0);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <AppShell currentPerson={currentPerson} reviewCount={currentPerson.role === "dad" ? reviewCount : 0}>
      <div className="grid gap-5">
        <section className="relative isolate flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-white/70 bg-white/45 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="pointer-events-none absolute -right-8 top-2 -z-10 hidden text-[8rem] font-semibold leading-none text-white/55 sm:block">
            Ledger
          </div>
          <div className="absolute right-8 top-8 -z-10 h-28 w-28 rounded-full bg-[#d7a642]/20 blur-3xl" />
          <div>
            <p className="text-sm font-semibold text-sky-700">CloudLedger</p>
            <h1 className="mt-2 max-w-2xl text-4xl font-semibold text-slate-950 sm:text-6xl">
              {currentPerson.role === "dad" ? "One family balance." : "Your balance with Dad."}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              {currentPerson.role === "dad"
                ? "A quiet place to see who needs to be paid back."
                : "Add what Dad owes you, or settle when it is handled."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link href="/add" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-medium text-white shadow-xl shadow-slate-900/15 hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              Add item
            </Link>
            {phoneNumber ? <p className="text-xs text-slate-500">Text items to {phoneNumber}</p> : null}
          </div>
        </section>

        {currentPerson.role === "dad" ? (
          <FloatingCard className="overflow-hidden p-0 shadow-[0_30px_100px_rgba(15,23,42,0.11)]">
            <div className="grid gap-4 border-b border-sky-100/80 bg-white/35 p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Family total</p>
                <p className="mt-2 text-5xl font-semibold text-slate-950">
                  {formatMoney(totalNetCents)}
                </p>
              </div>
              <p className="max-w-xs text-sm leading-6 text-slate-500">
                {hasBalance ? "Positive means Dad pays out overall. Negative means the kids owe Dad overall." : "Everyone is settled."}
              </p>
            </div>
            <div className="divide-y divide-sky-100/80">
              {balances.map((balance) => (
                <BalanceLedgerRow key={balance.kid.id} balance={balance} />
              ))}
            </div>
          </FloatingCard>
        ) : primaryBalance ? (
          <FloatingCard className="relative overflow-hidden p-6 shadow-[0_30px_100px_rgba(15,23,42,0.11)] sm:p-8">
            <div className="pointer-events-none absolute -right-4 -top-3 text-[5.5rem] font-semibold leading-none text-sky-50 sm:text-[9rem]">
              Pay
            </div>
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[#d7a642]/25 blur-3xl" />
            <p className="text-sm font-medium text-slate-500">Right now</p>
            <p className="mt-3 text-xl font-medium text-slate-700">{kidBalanceLabel(primaryBalance, true)}</p>
            <p className="mt-3 text-6xl font-semibold text-slate-950">
              {formatMoney(primaryBalance.netCents)}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <SettleButton balance={primaryBalance} compact={false} />
              <Link href="/transactions" className="inline-flex h-11 items-center justify-center rounded-full border border-sky-200 bg-white/55 px-5 text-sm font-medium text-slate-700 hover:bg-white">
                See details
              </Link>
            </div>
          </FloatingCard>
        ) : (
          <FloatingCard className="grid gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">All clear up here.</h2>
            <p className="text-slate-600">Add your first item or text the CloudLedger number whenever Dad owes you.</p>
            <Link href="/add" className="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-medium text-white hover:bg-sky-700 sm:w-fit">
              Add item
            </Link>
          </FloatingCard>
        )}

        <section className="grid gap-4">
          <div className="flex items-end justify-between gap-4 px-1">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
              <p className="text-sm text-slate-500">
                {recentTransactions.length > 0 ? "The latest few entries." : "Nothing has been added yet."}
              </p>
            </div>
            <Link href="/transactions" className="text-sm font-medium text-sky-700 underline underline-offset-4">
              View all
            </Link>
          </div>
          {recentTransactions.length > 0 ? (
            <TransactionTable transactions={recentTransactions} />
          ) : (
            <FloatingCard className="flex flex-col items-start gap-4 p-6">
              <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">Clear</div>
              <h3 className="text-2xl font-semibold text-slate-950">No IOUs yet.</h3>
              <p className="max-w-md text-sm leading-6 text-slate-600">
                Add one item when something needs tracking. That is all CloudLedger has to do.
              </p>
            </FloatingCard>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function BalanceLedgerRow({ balance }: { balance: BalanceSummary }) {
  return (
    <div className="grid gap-4 p-5 transition hover:bg-white/30 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:p-6">
      <Link href={`/transactions?kid=${balance.kid.id}`} className="group min-w-0">
        <p className="text-lg font-semibold text-slate-950 group-hover:text-sky-700">{balance.kid.name}</p>
        <p className="mt-1 text-sm text-slate-500">{kidBalanceLabel(balance)}</p>
      </Link>
      <p className="text-3xl font-semibold text-slate-950 sm:text-right">
        {formatMoney(balance.netCents)}
      </p>
      <SettleButton balance={balance} />
    </div>
  );
}

function SettleButton({ balance, compact = true }: { balance: BalanceSummary; compact?: boolean }) {
  if (balance.netCents === 0) {
    return (
      <div className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-50 px-4 text-sm font-medium text-emerald-700">
        <Check className="h-4 w-4" />
        Settled
      </div>
    );
  }

  return (
    <form action={settleBalance}>
      <input type="hidden" name="kidId" value={balance.kid.id} />
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        {compact ? "Settle" : "Settle up"}
      </button>
    </form>
  );
}

function kidBalanceLabel(balance: BalanceSummary, viewerIsKid = false) {
  if (balance.netCents > 0) {
    return viewerIsKid ? "Dad owes you" : `Dad owes ${balance.kid.name}`;
  }

  if (balance.netCents < 0) {
    return viewerIsKid ? "You owe Dad" : `${balance.kid.name} owes Dad`;
  }

  return "Settled";
}
