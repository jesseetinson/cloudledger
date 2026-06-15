"use client";

import { Car, CheckCircle2, Film, Gift, HeartPulse, MoreHorizontal, Plane, RotateCcw, ShoppingBag, Trash2, Utensils, X } from "lucide-react";
import type { PointerEvent } from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteTransaction, setTransactionPaid, updateTransactionDetails } from "@/lib/cloudledger/actions";
import { formatMoney } from "@/lib/cloudledger/money";
import type { Category, Person, TransactionWithRelations } from "@/lib/cloudledger/types";
import { cn } from "@/lib/utils";

export function MobileTransactionList({
  transactions,
  currentPerson,
  categories,
}: {
  transactions: TransactionWithRelations[];
  currentPerson: Person;
  categories: Category[];
}) {
  const [selected, setSelected] = useState<TransactionWithRelations | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="rounded-[2rem] bg-white px-6 py-8 text-center">
        <p className="text-lg font-semibold text-[#183c3d]">No transactions yet</p>
        <p className="mt-2 text-sm text-[#9aa9a7]">Text CloudLedger when something needs tracking.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-1">
        {transactions.map((transaction) => (
          <SwipeTransactionRow
            key={transaction.id}
            transaction={transaction}
            currentPerson={currentPerson}
            onOpen={() => setSelected(transaction)}
          />
        ))}
      </div>
      {selected ? (
        <TransactionDetailsSheet
          transaction={selected}
          currentPerson={currentPerson}
          categories={categories}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}

function SwipeTransactionRow({
  transaction,
  currentPerson,
  onOpen,
}: {
  transaction: TransactionWithRelations;
  currentPerson: Person;
  onOpen: () => void;
}) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const paidFormRef = useRef<HTMLFormElement>(null);
  const amountLabel = transactionAmountLabel(transaction, currentPerson);
  const paidLabel = transaction.is_paid ? "Mark unpaid" : "Mark paid";
  const PaidIcon = transaction.is_paid ? RotateCcw : CheckCircle2;
  const actionOpacity = Math.min(Math.abs(offset) / 28, 1);

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    startX.current = event.clientX;
    startY.current = event.clientY;
    startOffset.current = offset;
    setDragging(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const dx = event.clientX - startX.current;
    const dy = event.clientY - startY.current;

    if (!dragging && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      setDragging(Math.abs(dx) > Math.abs(dy) * 1.2);
    }

    if (Math.abs(dx) > Math.abs(dy) * 1.2) {
      setOffset(clamp(startOffset.current + dx, -132, 132));
    }
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const dx = event.clientX - startX.current;
    const dy = event.clientY - startY.current;
    const nextOffset = clamp(startOffset.current + dx, -132, 132);
    const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy) * 1.2;

    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!isHorizontalSwipe || Math.abs(dx) < 12) {
      if (offset !== 0) {
        setOffset(0);
        return;
      }
      onOpen();
      return;
    }

    if (nextOffset >= 118) {
      deleteFormRef.current?.requestSubmit();
      return;
    }

    if (nextOffset <= -118) {
      paidFormRef.current?.requestSubmit();
      return;
    }

    if (nextOffset >= 46) {
      setOffset(96);
      return;
    }

    if (nextOffset <= -46) {
      setOffset(-96);
      return;
    }

    setOffset(0);
  }

  return (
    <div className="relative overflow-hidden rounded-[1.4rem]">
      <div
        className="absolute inset-y-0 left-0 flex w-36 items-center rounded-[1.4rem] bg-[#ff5b63] px-4 text-white"
        style={{ opacity: offset > 0 ? actionOpacity : 0 }}
      >
        <div className="grid justify-items-center gap-1">
          <Trash2 className="h-5 w-5" />
          <span className="text-xs font-bold">Delete</span>
        </div>
      </div>
      <div
        className="absolute inset-y-0 right-0 flex w-36 items-center justify-end rounded-[1.4rem] bg-[#45c7a8] px-4 text-white"
        style={{ opacity: offset < 0 ? actionOpacity : 0 }}
      >
        <div className="grid justify-items-center gap-1">
          <PaidIcon className="h-5 w-5" />
          <span className="text-xs font-bold">{transaction.is_paid ? "Unpaid" : "Paid"}</span>
        </div>
      </div>
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setOffset(0)}
        style={{ transform: `translateX(${offset}px)`, touchAction: "pan-y" }}
        className={cn(
          "relative grid w-full grid-cols-[3rem_1fr_auto] items-center gap-3 rounded-[1.4rem] bg-white px-4 py-3 text-left shadow-sm",
          dragging ? "transition-none" : "transition-transform duration-200 ease-out",
        )}
      >
        <TransactionIcon slug={transaction.category.slug} paid={transaction.is_paid} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-[#183c3d]">{transaction.description}</span>
          <span className="mt-0.5 block truncate text-xs text-[#9aa9a7]">
            {transactionSubtitle(transaction, currentPerson)}
          </span>
        </span>
        <span className="text-right">
          <span className="block text-xs text-[#9aa9a7]">{shortDate(transaction.created_at)}</span>
          <span className="mt-1 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#9aa9a7]">
            {amountLabel}
          </span>
          <span
            className={cn(
              "block text-base font-bold text-[#183c3d]",
              transaction.is_paid && "text-[#9aa9a7] line-through",
            )}
          >
            {formatMoney(transaction.amount_cents)}
          </span>
        </span>
      </button>
      {offset > 0 ? (
        <form action={deleteTransaction} className="absolute inset-y-0 left-0 flex w-28 items-center">
          <input type="hidden" name="transactionId" value={transaction.id} />
          <button type="submit" className="h-full w-full text-left text-[0px]" aria-label="Delete transaction">
            Delete
          </button>
        </form>
      ) : null}
      {offset < 0 ? (
        <form action={setTransactionPaid.bind(null, transaction.id, !transaction.is_paid)} className="absolute inset-y-0 right-0 flex w-28 items-center">
          <button type="submit" className="h-full w-full text-right text-[0px]" aria-label={paidLabel}>
            {paidLabel}
          </button>
        </form>
      ) : null}
      <form ref={deleteFormRef} action={deleteTransaction} className="hidden">
        <input type="hidden" name="transactionId" value={transaction.id} />
      </form>
      <form ref={paidFormRef} action={setTransactionPaid.bind(null, transaction.id, !transaction.is_paid)} className="hidden" />
    </div>
  );
}

function TransactionDetailsSheet({
  transaction,
  currentPerson,
  categories,
  onClose,
}: {
  transaction: TransactionWithRelations;
  currentPerson: Person;
  categories: Category[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/30 px-3 pb-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#9aa9a7]">Transaction details</p>
            <h2 className="mt-1 text-2xl font-bold text-[#183c3d]">{formatMoney(transaction.amount_cents)}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#f3f5f1] text-[#183c3d]"
            aria-label="Close details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <dl className="mt-5 grid gap-3 text-sm">
          <div className="rounded-2xl bg-[#f8f8f2] px-4 py-3">
            <dt className="text-[#9aa9a7]">Date added</dt>
            <dd className="mt-1 font-semibold text-[#183c3d]">{longDate(transaction.created_at)}</dd>
          </div>
          <div className="rounded-2xl bg-[#f8f8f2] px-4 py-3">
            <dt className="text-[#9aa9a7]">Direction</dt>
            <dd className="mt-1 font-semibold text-[#183c3d]">{transactionDirectionLabel(transaction, currentPerson)}</dd>
          </div>
        </dl>
        <form action={updateTransactionDetails} className="mt-5 grid gap-3">
          <input type="hidden" name="transactionId" value={transaction.id} />
          <label className="grid gap-2 text-sm font-semibold text-[#183c3d]">
            Description
            <input
              name="description"
              defaultValue={transaction.description}
              className="h-12 rounded-2xl border border-[#e5ebe7] bg-white px-4 text-base outline-none focus:border-[#46c9ae]"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#183c3d]">
            Category
            <select
              name="categoryId"
              defaultValue={transaction.category_id}
              className="h-12 rounded-2xl border border-[#e5ebe7] bg-white px-4 text-base outline-none focus:border-[#46c9ae]"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#183c3d]">
            Direction
            <select
              name="direction"
              defaultValue={transaction.direction}
              className="h-12 rounded-2xl border border-[#e5ebe7] bg-white px-4 text-base outline-none focus:border-[#46c9ae]"
            >
              <option value="dad_owes_kid">
                {currentPerson.role === "kid" ? "Dad owes me" : `Dad owes ${transaction.kid.name}`}
              </option>
              <option value="kid_owes_dad">
                {currentPerson.role === "kid" ? "I owe Dad" : `${transaction.kid.name} owes Dad`}
              </option>
            </select>
          </label>
          <Button type="submit" className="h-12 rounded-full bg-[#0f3f52] text-white hover:bg-[#0b3444]">
            Save transaction
          </Button>
        </form>
      </div>
    </div>
  );
}

function TransactionIcon({ slug, paid }: { slug: string; paid: boolean }) {
  const Icon =
    slug.includes("transport") || slug.includes("travel")
      ? Car
      : slug.includes("food")
        ? Utensils
        : slug.includes("shopping")
          ? ShoppingBag
          : slug.includes("gift")
            ? Gift
            : slug.includes("health")
              ? HeartPulse
              : slug.includes("entertainment")
                ? Film
                : slug.includes("errand")
                  ? Plane
                  : MoreHorizontal;

  return (
    <span
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full text-white",
        paid ? "bg-[#cdd6d1]" : iconColor(slug),
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

function iconColor(slug: string) {
  if (slug.includes("food")) return "bg-[#67d9bd]";
  if (slug.includes("shopping")) return "bg-[#b5a7df]";
  if (slug.includes("gift")) return "bg-[#f77fac]";
  if (slug.includes("transport") || slug.includes("travel")) return "bg-[#5ec9c4]";
  if (slug.includes("entertainment")) return "bg-[#b9bec2]";
  return "bg-[#d6ded8]";
}

function transactionSubtitle(transaction: TransactionWithRelations, currentPerson: Person) {
  if (transaction.is_paid) {
    return "Paid";
  }

  return transactionDirectionLabel(transaction, currentPerson);
}

function transactionDirectionLabel(transaction: TransactionWithRelations, currentPerson: Person) {
  if (transaction.direction === "dad_owes_kid") {
    return currentPerson.role === "kid" ? "Dad owes you" : `Dad owes ${transaction.kid.name}`;
  }

  return currentPerson.role === "kid" ? "You owe Dad" : `${transaction.kid.name} owes Dad`;
}

function transactionAmountLabel(transaction: TransactionWithRelations, currentPerson: Person) {
  if (currentPerson.role === "dad") {
    return transaction.direction === "dad_owes_kid" ? "You owe" : "You are owed";
  }

  return transaction.direction === "dad_owes_kid" ? "You are owed" : "You owe";
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function longDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
