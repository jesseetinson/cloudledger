import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/cloudledger/app-shell";
import { BalanceHero } from "@/components/cloudledger/balance-hero";
import { FloatingCard } from "@/components/cloudledger/floating-card";
import { KidBalanceCard } from "@/components/cloudledger/kid-balance-card";
import { TextingHelpCard } from "@/components/cloudledger/texting-help-card";
import { TransactionTable } from "@/components/cloudledger/transaction-table";
import { calculateBalances } from "@/lib/cloudledger/balances";
import { getCloudLedgerPhoneNumber } from "@/lib/cloudledger/contact";
import { formatMoney } from "@/lib/cloudledger/money";
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

  return (
    <AppShell currentPerson={currentPerson} reviewCount={currentPerson.role === "dad" ? reviewCount : 0}>
      <div className="grid gap-6">
        <section>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700/80">Home</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back, {currentPerson.name}
          </h1>
        </section>

        {currentPerson.role === "dad" ? (
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <FloatingCard className="p-7">
              <p className="text-sm font-medium text-slate-500">Family total</p>
              <p className="mt-4 text-5xl font-semibold tracking-tight text-slate-900">
                {totalNetCents === 0 ? "$0.00" : formatMoney(totalNetCents)}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                A simple snapshot of all unpaid items.
              </p>
              <Link href="/add" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-medium text-white hover:bg-sky-700">
                <Plus className="h-4 w-4" />
                Add item
              </Link>
            </FloatingCard>
            <div className="grid gap-4">
              {balances.map((balance) => (
                <KidBalanceCard key={balance.kid.id} balance={balance} />
              ))}
            </div>
          </div>
        ) : primaryBalance ? (
          <div className="grid gap-4">
            <BalanceHero balance={primaryBalance} viewerIsKid />
            <Link href="/add" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-medium text-white hover:bg-sky-700 sm:w-fit">
              <Plus className="h-4 w-4" />
              Add item
            </Link>
          </div>
        ) : (
          <FloatingCard className="grid gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">All clear up here.</h2>
            <p className="text-slate-600">Add your first item or text the CloudLedger number whenever Dad owes you.</p>
            <Link href="/add" className="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-medium text-white hover:bg-sky-700 sm:w-fit">
              Add item
            </Link>
          </FloatingCard>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <TextingHelpCard currentPerson={currentPerson} phoneNumber={phoneNumber} compact />
          <div className="grid gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Recent activity</h2>
                <p className="text-sm text-slate-500">The latest items in the family balance.</p>
              </div>
              <Link href="/transactions" className="text-sm font-medium text-sky-700 underline underline-offset-4">
                View all
              </Link>
            </div>
            {transactions.length > 0 ? (
              <TransactionTable transactions={transactions.slice(0, 5)} />
            ) : (
              <FloatingCard className="grid gap-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {currentPerson.role === "dad" ? "Nothing tracked yet." : "All clear up here."}
                </h3>
                <p className="text-slate-600">
                  {currentPerson.role === "dad"
                    ? "Add an item for one of the kids, or text the CloudLedger number with the kid's name."
                    : "Add your first item or text the CloudLedger number whenever Dad owes you."}
                </p>
                <Link href="/add" className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-medium text-white hover:bg-sky-700 sm:w-fit">
                  Add item
                </Link>
              </FloatingCard>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
