import { Check, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/cloudledger/app-shell";
import { CategoryBadge } from "@/components/cloudledger/category-badge";
import { FloatingCard } from "@/components/cloudledger/floating-card";
import { QuickAddForm } from "@/components/cloudledger/quick-add-form";
import { ReviewCard } from "@/components/cloudledger/review-card";
import { Button } from "@/components/ui/button";
import { calculateBalances } from "@/lib/cloudledger/balances";
import { setTransactionPaid, settleBalance } from "@/lib/cloudledger/actions";
import { getCloudLedgerPhoneNumber } from "@/lib/cloudledger/contact";
import { formatMoney } from "@/lib/cloudledger/money";
import type { BalanceSummary, Person, TransactionWithRelations } from "@/lib/cloudledger/types";
import { getCategories, getPeople, getSettlements, getTransactions, requireCurrentPerson } from "@/lib/cloudledger/data";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentPerson = await requireCurrentPerson();
  const emptyParams: Record<string, string | string[] | undefined> = {};
  const [people, categories, transactions, settlements, params] = await Promise.all([
    getPeople(),
    getCategories(),
    getTransactions(currentPerson),
    getSettlements(currentPerson),
    searchParams ?? Promise.resolve(emptyParams),
  ]);
  const kids = people.filter((person) => person.role === "kid");
  const visibleKids = currentPerson.role === "dad" ? kids : kids.filter((kid) => kid.id === currentPerson.id);
  const balances = calculateBalances(visibleKids, transactions, settlements);
  const primaryBalance = balances[0];
  const totalNetCents = balances.reduce((sum, balance) => sum + balance.netCents, 0);
  const reviewItems = transactions.filter((transaction) => transaction.needs_review);
  const activeTransactions = transactions.filter((transaction) => !transaction.needs_review);
  const phoneNumber = getCloudLedgerPhoneNumber();
  const addedMessage = normalizeParam(params.added);

  return (
    <AppShell currentPerson={currentPerson}>
      <main className="grid gap-5">
        <section className="relative isolate overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/45 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-7">
          <div className="pointer-events-none absolute -right-8 top-2 -z-10 hidden text-[8rem] font-semibold leading-none text-white/55 sm:block">
            Ledger
          </div>
          <div className="absolute right-8 top-8 -z-10 h-28 w-28 rounded-full bg-[#d7a642]/20 blur-3xl" />
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-sky-700">CloudLedger</p>
              <h1 className="mt-2 max-w-2xl text-4xl font-semibold text-slate-950 sm:text-6xl">
                {currentPerson.role === "dad" ? "Who owes who?" : "You and Dad."}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                One page for adding, checking, reviewing, and settling up.
              </p>
            </div>
            {phoneNumber ? (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/55 px-4 py-2 text-sm font-medium text-slate-700">
                <MessageCircle className="h-4 w-4 text-sky-700" />
                Text {phoneNumber}
              </div>
            ) : null}
          </div>
          {addedMessage ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-800">
              {addedMessage}
            </div>
          ) : null}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <BalanceBoard
            balances={balances}
            primaryBalance={primaryBalance}
            totalNetCents={totalNetCents}
            currentPerson={currentPerson}
          />
          <QuickAddForm currentPerson={currentPerson} kids={currentPerson.role === "dad" ? kids : visibleKids} categories={categories} />
        </section>

        {reviewItems.length > 0 ? (
          <section className="grid gap-4">
            <SectionTitle
              eyebrow="Needs review"
              title="Check these before they count."
              description="These came from SMS or unclear input. Approve, fix, or delete them here."
            />
            <div className="grid gap-4">
              {reviewItems.map((transaction) => (
                <ReviewCard
                  key={transaction.id}
                  transaction={transaction}
                  categories={categories}
                  kids={kids}
                  currentPerson={currentPerson}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-4">
          <SectionTitle
            eyebrow="Ledger"
            title={activeTransactions.length > 0 ? "Everything in one place." : "Nothing yet."}
            description={
              activeTransactions.length > 0
                ? "Mark items paid when they are handled. Settle up above when the real money changes hands."
                : "Add the first item above, or text the CloudLedger number."
            }
          />
          <LedgerList transactions={activeTransactions} currentPerson={currentPerson} />
        </section>
      </main>
    </AppShell>
  );
}

function BalanceBoard({
  balances,
  primaryBalance,
  totalNetCents,
  currentPerson,
}: {
  balances: BalanceSummary[];
  primaryBalance?: BalanceSummary;
  totalNetCents: number;
  currentPerson: Person;
}) {
  if (currentPerson.role === "dad") {
    return (
      <FloatingCard className="overflow-hidden p-0 shadow-[0_30px_100px_rgba(15,23,42,0.11)]">
        <div className="border-b border-sky-100/80 bg-white/35 p-5 sm:p-6">
          <p className="text-sm font-medium text-slate-500">Family total</p>
          <p className="mt-2 text-5xl font-semibold text-slate-950">{formatMoney(totalNetCents)}</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Positive means Dad pays out overall. Negative means the kids owe Dad overall.
          </p>
        </div>
        <div className="divide-y divide-sky-100/80">
          {balances.map((balance) => (
            <BalanceLedgerRow key={balance.kid.id} balance={balance} />
          ))}
        </div>
      </FloatingCard>
    );
  }

  if (!primaryBalance) {
    return (
      <FloatingCard className="p-6">
        <p className="text-sm font-medium text-slate-500">Right now</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">All settled.</h2>
        <p className="mt-2 text-sm text-slate-500">No balance with Dad yet.</p>
      </FloatingCard>
    );
  }

  return (
    <FloatingCard className="relative overflow-hidden p-6 shadow-[0_30px_100px_rgba(15,23,42,0.11)] sm:p-8">
      <div className="pointer-events-none absolute -right-4 -top-3 text-[5.5rem] font-semibold leading-none text-sky-50 sm:text-[9rem]">
        Pay
      </div>
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-[#d7a642]/25 blur-3xl" />
      <p className="text-sm font-medium text-slate-500">Right now</p>
      <p className="mt-3 text-xl font-medium text-slate-700">{kidBalanceLabel(primaryBalance, true)}</p>
      <p className="mt-3 text-6xl font-semibold text-slate-950">{formatMoney(primaryBalance.netCents)}</p>
      <div className="mt-6">
        <SettleButton balance={primaryBalance} compact={false} />
      </div>
    </FloatingCard>
  );
}

function BalanceLedgerRow({ balance }: { balance: BalanceSummary }) {
  return (
    <div className="grid gap-4 p-5 transition hover:bg-white/30 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:p-6">
      <div className="min-w-0">
        <p className="text-lg font-semibold text-slate-950">{balance.kid.name}</p>
        <p className="mt-1 text-sm text-slate-500">{kidBalanceLabel(balance)}</p>
      </div>
      <p className="text-3xl font-semibold text-slate-950 sm:text-right">{formatMoney(balance.netCents)}</p>
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

function LedgerList({
  transactions,
  currentPerson,
}: {
  transactions: TransactionWithRelations[];
  currentPerson: Person;
}) {
  if (transactions.length === 0) {
    return (
      <FloatingCard className="flex flex-col items-start gap-4 p-6">
        <div className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800">Clear</div>
        <h3 className="text-2xl font-semibold text-slate-950">No IOUs yet.</h3>
        <p className="max-w-md text-sm leading-6 text-slate-600">
          Add one item when something needs tracking. That is all CloudLedger has to do.
        </p>
      </FloatingCard>
    );
  }

  return (
    <FloatingCard className="overflow-hidden p-0">
      <div className="divide-y divide-sky-100/80">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-950">{transaction.description}</p>
                <CategoryBadge category={transaction.category} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                <span>{transaction.source}</span>
                {currentPerson.role === "dad" ? <span>{transaction.kid.name}</span> : null}
                <span className="rounded-full bg-white/70 px-2.5 py-1 font-medium text-slate-600">
                  {transactionDirectionLabel(transaction, currentPerson)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="text-xl font-semibold text-slate-950">{formatMoney(transaction.amount_cents)}</p>
              <form action={setTransactionPaid.bind(null, transaction.id, !transaction.is_paid)}>
                <Button type="submit" variant={transaction.is_paid ? "secondary" : "ghost"} size="sm" className="rounded-full">
                  {transaction.is_paid ? "Paid" : "Mark paid"}
                </Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </FloatingCard>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="px-1">
      <p className="text-sm font-semibold text-sky-700">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
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

function transactionDirectionLabel(transaction: TransactionWithRelations, currentPerson: Person) {
  if (transaction.direction === "dad_owes_kid") {
    return currentPerson.role === "kid" ? "Dad owes you" : `Dad owes ${transaction.kid.name}`;
  }

  return currentPerson.role === "kid" ? "You owe Dad" : `${transaction.kid.name} owes Dad`;
}

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
