import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category, Person } from "@/lib/cloudledger/types";
import { FloatingCard } from "./floating-card";

export function TransactionFilters({
  kids,
  categories,
  showKidFilter,
}: {
  kids: Person[];
  categories: Category[];
  showKidFilter: boolean;
}) {
  return (
    <FloatingCard className="p-4">
      <form className="grid gap-3 md:grid-cols-5" action="/transactions">
        {showKidFilter ? (
          <select name="kid" className="h-10 rounded-2xl border border-input bg-white/70 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="">All kids</option>
            {kids.map((kid) => (
              <option key={kid.id} value={kid.id}>
                {kid.name}
              </option>
            ))}
          </select>
        ) : null}
        <select name="category" className="h-10 rounded-2xl border border-input bg-white/70 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <option value="">Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="paid" className="h-10 rounded-2xl border border-input bg-white/70 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <option value="all">All</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
        <select name="direction" className="h-10 rounded-2xl border border-input bg-white/70 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <option value="all">Either direction</option>
          <option value="dad_owes_kid">Dad owes kid</option>
          <option value="kid_owes_dad">Kid owes Dad</option>
        </select>
        <div className="flex gap-2">
          <Input name="q" placeholder="Search" className="rounded-2xl bg-white/70" />
          <Button type="submit" variant="secondary" className="rounded-2xl">Filter</Button>
        </div>
      </form>
    </FloatingCard>
  );
}
