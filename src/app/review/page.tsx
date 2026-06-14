import { AppShell } from "@/components/cloudledger/app-shell";
import { EmptyState } from "@/components/cloudledger/empty-state";
import { ReviewCard } from "@/components/cloudledger/review-card";
import { getCategories, getPeople, getTransactions, requireCurrentPerson } from "@/lib/cloudledger/data";

export default async function ReviewPage() {
  const currentPerson = await requireCurrentPerson();
  const [transactions, categories, people] = await Promise.all([
    getTransactions(currentPerson),
    getCategories(),
    getPeople(),
  ]);
  const reviewItems = transactions.filter((transaction) => transaction.needs_review);
  const kids = people.filter((person) => person.role === "kid");

  return (
    <AppShell currentPerson={currentPerson}>
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700/80">Review</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Needs a quick look</h1>
          <p className="mt-2 text-slate-500">
            Correct the fields, then approve the item back into the normal ledger.
          </p>
        </div>
        {reviewItems.length > 0 ? (
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
        ) : (
          <EmptyState
            title="Nothing needs review"
            description="Every current entry looks clear enough to stay in the main ledger."
          />
        )}
      </div>
    </AppShell>
  );
}
