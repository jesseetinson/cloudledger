import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { CategorySpendBar } from "@/components/cloudledger/category-spend-bar";
import { CloudBackground } from "@/components/cloudledger/cloud-background";
import { DashboardActions } from "@/components/cloudledger/dashboard-actions";
import { MobileTransactionList } from "@/components/cloudledger/mobile-transaction-list";
import { QuickAddForm } from "@/components/cloudledger/quick-add-form";
import { logout } from "@/lib/cloudledger/actions";
import { calculateBalances } from "@/lib/cloudledger/balances";
import { getCloudLedgerPhoneNumber } from "@/lib/cloudledger/contact";
import { formatMoney } from "@/lib/cloudledger/money";
import type { BalanceSummary, Person } from "@/lib/cloudledger/types";
import { getCategories, getPeople, getTransactions, requireCurrentPerson } from "@/lib/cloudledger/data";

export default async function DashboardPage() {
  const currentPerson = await requireCurrentPerson();

  if (!currentPerson.onboarding_completed) {
    redirect("/onboarding");
  }

  const [people, categories, transactions] = await Promise.all([
    getPeople(),
    getCategories(),
    getTransactions(currentPerson),
  ]);
  const kids = people.filter((person) => person.role === "kid");
  const visibleKids = currentPerson.role === "dad" ? kids : kids.filter((kid) => kid.id === currentPerson.id);
  const balances = calculateBalances(visibleKids, transactions);
  const mainBalance = currentPerson.role === "dad" ? null : balances[0];
  const firstOpenBalance = balances.find((balance) => balance.netCents !== 0) ?? balances[0];
  const totalCents = currentPerson.role === "dad"
    ? balances.reduce((sum, balance) => sum + balance.netCents, 0)
    : mainBalance?.netCents ?? 0;
  const phoneNumber = getCloudLedgerPhoneNumber();

  return (
    <CloudBackground className="bg-[linear-gradient(180deg,#edf1ef_0%,#f7f8f2_100%)]">
      <main className="mx-auto min-h-dvh w-full max-w-[430px] px-4 py-10">
        <section className="rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <HeroCard currentPerson={currentPerson} totalCents={totalCents} />

          <div className="-mt-7">
            <DashboardActions
              balance={firstOpenBalance}
              phoneNumber={phoneNumber}
              addForm={
                <QuickAddForm
                  currentPerson={currentPerson}
                  kids={currentPerson.role === "dad" ? kids : visibleKids}
                  categories={categories}
                />
              }
            />
          </div>

          {currentPerson.role === "dad" ? (
            <DadBalances balances={balances} />
          ) : null}

          <section className="px-6 pb-7 pt-10">
            <CategorySpendBar transactions={transactions} />
            <div className="mb-5 flex items-center justify-between border-t border-[#e8eeeb] pt-7">
              <h2 className="text-xl font-bold text-[#183c3d]">Transactions</h2>
              <p className="text-sm font-semibold text-[#9aa9a7]">All</p>
            </div>
            <MobileTransactionList transactions={transactions} currentPerson={currentPerson} categories={categories} />
          </section>
        </section>

      </main>
    </CloudBackground>
  );
}

function HeroCard({ currentPerson, totalCents }: { currentPerson: Person; totalCents: number }) {
  return (
    <div className="relative h-[254px] overflow-hidden rounded-[2rem] bg-[#0d4359] px-7 pt-5 text-white">
      <div className="absolute inset-0 opacity-45">
        <div className="absolute -right-14 -top-24 h-80 w-80 rotate-45 border-[28px] border-[#86a5ae]/40" />
        <div className="absolute right-10 top-16 h-44 w-44 rotate-45 border-[18px] border-[#86a5ae]/35" />
        <div className="absolute bottom-5 left-44 h-52 w-52 rotate-45 border-[18px] border-[#86a5ae]/25" />
      </div>
      <div className="relative z-10 flex items-center justify-between">
        <div className="text-sm font-bold">9:41</div>
        <form action={logout}>
          <button type="submit" className="grid h-9 w-9 place-items-center rounded-full text-white/85" aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
      <div className="relative z-10 mt-5 text-center">
        <h1 className="text-lg font-bold">{currentPerson.name}</h1>
        <p className="mt-8 text-sm font-semibold text-white/58">Total:</p>
        <p className="mt-1 text-5xl font-black leading-none tracking-normal text-white">
          {signedMoney(totalCents)}
        </p>
      </div>
    </div>
  );
}

function DadBalances({ balances }: { balances: BalanceSummary[] }) {
  return (
    <div className="mx-6 mt-8 grid gap-2 rounded-[1.5rem] bg-[#f6f8f2] p-3">
      {balances.map((balance) => (
        <div key={balance.kid.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
          <div>
            <p className="text-sm font-bold text-[#183c3d]">{balance.kid.name}</p>
            <p className="text-xs text-[#9aa9a7]">{balanceLabel(balance)}</p>
          </div>
          <p className="font-black text-[#183c3d]">{signedMoney(balance.netCents)}</p>
        </div>
      ))}
    </div>
  );
}

function signedMoney(cents: number) {
  if (cents === 0) {
    return "$0.00";
  }

  return `${cents > 0 ? "+" : "-"}${formatMoney(cents)}`;
}

function balanceLabel(balance: BalanceSummary) {
  if (balance.netCents > 0) {
    return `Dad owes ${balance.kid.name}`;
  }

  if (balance.netCents < 0) {
    return `${balance.kid.name} owes Dad`;
  }

  return "Settled";
}
