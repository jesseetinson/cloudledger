"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CategorySpendBar } from "@/components/cloudledger/category-spend-bar";
import { MobileTransactionList } from "@/components/cloudledger/mobile-transaction-list";
import type { Category, Person, TransactionWithRelations } from "@/lib/cloudledger/types";
import { cn } from "@/lib/utils";

export function TransactionSection({
  transactions,
  currentPerson,
  categories,
  kids,
}: {
  transactions: TransactionWithRelations[];
  currentPerson: Person;
  categories: Category[];
  kids: Person[];
}) {
  const [selectedKidId, setSelectedKidId] = useState("all");
  const canFilterByKid = currentPerson.role === "dad";
  const visibleTransactions = useMemo(() => {
    if (!canFilterByKid || selectedKidId === "all") {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.kid_id === selectedKidId);
  }, [canFilterByKid, selectedKidId, transactions]);
  const selectedKid = kids.find((kid) => kid.id === selectedKidId);

  return (
    <div>
      <CategorySpendBar transactions={visibleTransactions} />

      <div className="mb-5 border-t border-[#e8eeeb] pt-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#183c3d]">Transactions</h2>
          {!canFilterByKid ? (
            <p className="text-sm font-semibold text-[#9aa9a7]">{selectedKid?.name ?? "All"}</p>
          ) : null}
        </div>

        {canFilterByKid ? (
          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
            <FilterPill active={selectedKidId === "all"} onClick={() => setSelectedKidId("all")}>
              All
            </FilterPill>
            {kids.map((kid) => (
              <FilterPill key={kid.id} active={selectedKidId === kid.id} onClick={() => setSelectedKidId(kid.id)}>
                {kid.name}
              </FilterPill>
            ))}
          </div>
        ) : null}
      </div>

      <MobileTransactionList transactions={visibleTransactions} currentPerson={currentPerson} categories={categories} />
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition",
        active ? "bg-[#183c3d] text-white shadow-sm" : "bg-[#f3f5f1] text-[#7f908e]",
      )}
    >
      {children}
    </button>
  );
}
