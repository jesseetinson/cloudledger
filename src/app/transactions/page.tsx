import { AppShell } from "@/components/cloudledger/app-shell";
import { TransactionFilters } from "@/components/cloudledger/transaction-filters";
import { TransactionTable } from "@/components/cloudledger/transaction-table";
import { getCategories, getPeople, getTransactions, requireCurrentPerson } from "@/lib/cloudledger/data";
import { transactionFiltersSchema } from "@/lib/cloudledger/validation";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentPerson = await requireCurrentPerson();
  const [people, categories, transactions] = await Promise.all([
    getPeople(),
    getCategories(),
    getTransactions(currentPerson),
  ]);
  const params = await searchParams;
  const filters = transactionFiltersSchema.parse({
    kid: normalizeParam(params.kid),
    category: normalizeParam(params.category),
    paid: normalizeParam(params.paid) ?? "all",
    direction: normalizeParam(params.direction) ?? "all",
    q: normalizeParam(params.q),
  });
  const addedMessage = normalizeParam(params.added);
  const kids = people.filter((person) => person.role === "kid");
  const filtered = transactions.filter((transaction) => {
    if (currentPerson.role === "dad" && filters.kid && transaction.kid_id !== filters.kid) return false;
    if (filters.category && transaction.category_id !== filters.category) return false;
    if (filters.paid === "paid" && !transaction.is_paid) return false;
    if (filters.paid === "unpaid" && transaction.is_paid) return false;
    if (filters.direction && filters.direction !== "all" && transaction.direction !== filters.direction) return false;
    if (filters.q && !transaction.description.toLowerCase().includes(filters.q.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell currentPerson={currentPerson}>
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700/80">Recent activity</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Activity</h1>
          <p className="mt-2 text-slate-500">
            {currentPerson.role === "dad"
              ? "Every family IOU, with gentle filters."
              : "Only your balance history with Dad is visible here."}
          </p>
        </div>
        {addedMessage ? (
          <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/80 px-5 py-4 text-sm font-medium text-emerald-800">
            {addedMessage}
          </div>
        ) : null}
        <TransactionFilters kids={kids} categories={categories} showKidFilter={currentPerson.role === "dad"} />
        <TransactionTable transactions={filtered} />
      </div>
    </AppShell>
  );
}

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
