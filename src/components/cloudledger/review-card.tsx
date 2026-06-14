import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { approveReviewedTransaction, deleteTransaction } from "@/lib/cloudledger/actions";
import type { Category, Person, TransactionWithRelations } from "@/lib/cloudledger/types";
import { formatMoney } from "@/lib/cloudledger/money";
import { CategoryBadge } from "./category-badge";
import { DirectionBadge } from "./direction-badge";
import { FloatingCard } from "./floating-card";

export function ReviewCard({
  transaction,
  categories,
  kids,
  currentPerson,
}: {
  transaction: TransactionWithRelations;
  categories: Category[];
  kids: Person[];
  currentPerson: Person;
}) {
  const isDad = currentPerson.role === "dad";

  return (
    <FloatingCard>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 text-amber-700">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-800">Needs a quick look</h3>
            <p className="text-lg font-semibold text-slate-900">{formatMoney(transaction.amount_cents)}</p>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            We weren&apos;t totally sure where this belongs.
          </p>
          <p className="mt-2 text-base font-medium text-slate-800">{transaction.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <CategoryBadge category={transaction.category} />
            <DirectionBadge direction={transaction.direction} kidName={transaction.kid.name} />
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={`#fix-${transaction.id}`} className="inline-flex h-10 items-center justify-center rounded-2xl bg-white/70 px-4 text-sm font-medium text-slate-700 hover:bg-white">
          Fix it
        </a>
        <form action={approveReviewedTransaction}>
          <input type="hidden" name="transactionId" value={transaction.id} />
          <input type="hidden" name="kidId" value={transaction.kid_id} />
          <input type="hidden" name="amount" value={(transaction.amount_cents / 100).toFixed(2)} />
          <input type="hidden" name="description" value={transaction.description} />
          <input type="hidden" name="categoryId" value={transaction.category_id} />
          <input type="hidden" name="direction" value={transaction.direction} />
          <Button type="submit" variant="secondary" className="h-10 rounded-2xl">
            Looks right
          </Button>
        </form>
        <form action={deleteTransaction}>
          <input type="hidden" name="transactionId" value={transaction.id} />
          <Button type="submit" variant="ghost" className="h-10 rounded-2xl text-rose-700 hover:bg-rose-50">
            Delete
          </Button>
        </form>
      </div>

      <form id={`fix-${transaction.id}`} action={approveReviewedTransaction} className="mt-6 grid gap-4">
        <input type="hidden" name="transactionId" value={transaction.id} />
        {isDad ? (
          <div className="space-y-2">
            <Label htmlFor={`kid-${transaction.id}`}>Kid</Label>
            <select
              id={`kid-${transaction.id}`}
              name="kidId"
              defaultValue={transaction.kid_id}
              className="h-11 w-full rounded-2xl border border-input bg-white/70 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {kids.map((kid) => (
                <option key={kid.id} value={kid.id}>
                  {kid.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <div className="space-y-2">
            <Label htmlFor={`amount-${transaction.id}`}>Amount</Label>
            <Input
              id={`amount-${transaction.id}`}
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={(transaction.amount_cents / 100).toFixed(2)}
              className="h-11 rounded-2xl bg-white/70"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`description-${transaction.id}`}>Description</Label>
            <Input
              id={`description-${transaction.id}`}
              name="description"
              defaultValue={transaction.description}
              className="h-11 rounded-2xl bg-white/70"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`category-${transaction.id}`}>Category</Label>
            <select
              id={`category-${transaction.id}`}
              name="categoryId"
              defaultValue={transaction.category_id}
              className="h-11 w-full rounded-2xl border border-input bg-white/70 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`direction-${transaction.id}`}>Direction</Label>
            <select
              id={`direction-${transaction.id}`}
              name="direction"
              defaultValue={transaction.direction}
              className="h-11 w-full rounded-2xl border border-input bg-white/70 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="dad_owes_kid">{isDad ? "Dad owes kid" : "Dad owes me"}</option>
              <option value="kid_owes_dad">{isDad ? "Kid owes Dad" : "I owe Dad"}</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input name="isPaid" type="checkbox" defaultChecked={transaction.is_paid} className="h-4 w-4 rounded border-sky-200" />
          Mark as paid
        </label>
        <Button type="submit" className="h-11 rounded-2xl bg-sky-600 text-white hover:bg-sky-700">
          Save changes
        </Button>
      </form>
    </FloatingCard>
  );
}
