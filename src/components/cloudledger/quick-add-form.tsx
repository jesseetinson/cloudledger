"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTransaction } from "@/lib/cloudledger/actions";
import type { Category, Person } from "@/lib/cloudledger/types";
import { FloatingCard } from "./floating-card";

export function QuickAddForm({
  currentPerson,
  kids,
  categories,
}: {
  currentPerson: Person;
  kids: Person[];
  categories: Category[];
}) {
  const isDad = currentPerson.role === "dad";
  const defaultDirection = isDad ? "kid_owes_dad" : "dad_owes_kid";
  const [selectedKidId, setSelectedKidId] = useState(kids[0]?.id ?? "");
  const selectedKidName = useMemo(() => {
    return kids.find((kid) => kid.id === selectedKidId)?.name ?? "Kid";
  }, [kids, selectedKidId]);

  return (
    <FloatingCard>
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-500">Add item</p>
        <h2 className="text-xl font-semibold text-slate-800">What should CloudLedger remember?</h2>
      </div>
      <form action={createTransaction} className="grid gap-4">
        {isDad ? (
          <div className="space-y-2">
            <Label htmlFor="kidId">Which kid?</Label>
            <select
              id="kidId"
              name="kidId"
              required
              value={selectedKidId}
              onChange={(event) => setSelectedKidId(event.target.value)}
              className="h-12 w-full rounded-2xl border border-input bg-white/70 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Choose a kid</option>
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
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="64.00" required className="h-12 rounded-2xl bg-white/70" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">What was it for?</Label>
            <Input id="description" name="description" placeholder="Uber Eats" required className="h-12 rounded-2xl bg-white/70" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Who owes who?</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-sm font-medium text-slate-700 has-[:checked]:border-sky-400 has-[:checked]:bg-sky-50 has-[:checked]:text-sky-800">
              <input className="sr-only" type="radio" name="direction" value="dad_owes_kid" defaultChecked={defaultDirection === "dad_owes_kid"} />
              {isDad ? `I owe ${selectedKidName}` : "Dad owes me"}
            </label>
            <label className="rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-sm font-medium text-slate-700 has-[:checked]:border-sky-400 has-[:checked]:bg-sky-50 has-[:checked]:text-sky-800">
              <input className="sr-only" type="radio" name="direction" value="kid_owes_dad" defaultChecked={defaultDirection === "kid_owes_dad"} />
              {isDad ? `${selectedKidName} owes me` : "I owe Dad"}
            </label>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select id="categoryId" name="categoryId" required defaultValue={categories[0]?.id} className="h-12 w-full rounded-2xl border border-input bg-white/70 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" className="h-12 rounded-2xl bg-sky-600 text-white hover:bg-sky-700">Add item</Button>
      </form>
    </FloatingCard>
  );
}
