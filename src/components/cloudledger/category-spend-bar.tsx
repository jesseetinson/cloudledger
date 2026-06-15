"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/cloudledger/money";
import type { TransactionWithRelations } from "@/lib/cloudledger/types";

const barColors = ["#46d7a8", "#f57da6", "#ffc95f", "#7dd3fc", "#b8a7e8", "#94a3b8"];

export function CategorySpendBar({ transactions }: { transactions: TransactionWithRelations[] }) {
  const [mode, setMode] = useState<"dollars" | "percent">("dollars");
  const [expanded, setExpanded] = useState(false);
  const unpaid = transactions.filter((transaction) => !transaction.is_paid);
  const total = unpaid.reduce((sum, transaction) => sum + transaction.amount_cents, 0);
  const rows = Object.values(
    unpaid.reduce<Record<string, { id: string; name: string; cents: number }>>((groups, transaction) => {
      const id = transaction.category.id;
      groups[id] ??= { id, name: transaction.category.name, cents: 0 };
      groups[id].cents += transaction.amount_cents;
      return groups;
    }, {}),
  ).sort((a, b) => b.cents - a.cents);

  if (total === 0 || rows.length === 0) {
    return null;
  }

  return (
    <section className="mb-7 rounded-[1.75rem] bg-[#fbfcf8] px-5 py-5">
      <button type="button" onClick={() => setExpanded((current) => !current)} className="w-full text-left">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#9aa9a7]">Open by category</p>
            <p className="mt-1 text-3xl font-black text-[#183c3d]">{formatMoney(total)}</p>
          </div>
        </div>
        <div className="mt-5 flex h-8 overflow-hidden rounded-full bg-[#edf1ed]">
          {rows.map((row, index) => (
            <span
              key={row.id}
              className="h-full rounded-full"
              style={{
                width: `${Math.max((row.cents / total) * 100, 5)}%`,
                backgroundColor: barColors[index % barColors.length],
              }}
            />
          ))}
        </div>
      </button>
      {expanded ? (
        <div className="mt-4 grid gap-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMode((current) => (current === "dollars" ? "percent" : "dollars"))}
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#178b8f] shadow-sm"
              aria-label="Toggle breakdown between dollars and percent"
            >
              {mode === "dollars" ? "$" : "%"}
            </button>
          </div>
          {rows.slice(0, 4).map((row, index) => (
            <div key={row.id} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: barColors[index % barColors.length] }}
                />
                <span className="truncate font-semibold text-[#183c3d]">{row.name}</span>
              </div>
              <span className="font-bold text-[#183c3d]">
                {mode === "dollars" ? formatMoney(row.cents) : `${Math.round((row.cents / total) * 100)}%`}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
