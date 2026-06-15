"use client";

import { CreditCard, Plus, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { settleBalance } from "@/lib/cloudledger/actions";
import type { BalanceSummary } from "@/lib/cloudledger/types";

export function DashboardActions({
  balances,
  isDad,
  phoneNumber,
  addForm,
}: {
  balances: BalanceSummary[];
  isDad: boolean;
  phoneNumber: string;
  addForm: ReactNode;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const firstOpenBalance = balances.find((balance) => balance.netCents !== 0) ?? balances[0];
  const settleBalances = balances.filter((balance) => balance.netCents !== 0);

  return (
    <>
      <div className="relative z-20 grid grid-cols-3 px-9 pb-8 pt-3 text-center">
        <RoundAction
          icon={<CreditCard className="h-5 w-5" />}
          label="Settle up"
          balance={!isDad ? firstOpenBalance : undefined}
          onClick={isDad ? () => setShowSettle((current) => !current) : undefined}
          active={showSettle}
        />
        <RoundAction
          href="/api/contact-card"
          icon={<UserPlus className="h-5 w-5" />}
          label="Add contact"
          disabled={!phoneNumber}
        />
        <RoundAction
          icon={<Plus className="h-5 w-5" />}
          label="Add transaction"
          onClick={() => setShowAdd((current) => !current)}
          active={showAdd}
        />
      </div>

      {isDad && showSettle ? (
        <section className="mx-6 mb-5 -mt-3 rounded-[1.5rem] bg-[#f6f8f2] p-3">
          <p className="px-2 pb-2 text-sm font-bold text-[#183c3d]">Settle with which kid?</p>
          <div className="grid gap-2">
            {settleBalances.length > 0 ? (
              settleBalances.map((balance) => (
                <form key={balance.kid.id} action={settleBalance}>
                  <input type="hidden" name="kidId" value={balance.kid.id} />
                  <button type="submit" className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left">
                    <span>
                      <span className="block text-sm font-bold text-[#183c3d]">{balance.kid.name}</span>
                      <span className="block text-xs text-[#9aa9a7]">{balance.netCents > 0 ? "You owe" : "You are owed"}</span>
                    </span>
                    <span className="font-black text-[#183c3d]">{formatAbs(balance.netCents)}</span>
                  </button>
                </form>
              ))
            ) : (
              <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#9aa9a7]">Everyone is settled.</p>
            )}
          </div>
        </section>
      ) : null}

      {showAdd ? (
        <section id="add-transaction" className="mt-5 scroll-mt-5">
          {addForm}
        </section>
      ) : null}
    </>
  );
}

function formatAbs(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(cents) / 100);
}

function RoundAction({
  icon,
  label,
  balance,
  href,
  disabled = false,
  onClick,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  balance?: BalanceSummary;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  active?: boolean;
}) {
  const circle = (
    <>
      <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-[#178b8f] shadow-[0_10px_24px_rgba(15,23,42,0.18)] ${active ? "ring-4 ring-[#dff7f2]" : ""}`}>
        {icon}
      </span>
      <span className="mt-3 block text-xs font-bold leading-tight text-[#183c3d]">{label}</span>
    </>
  );

  if (balance && balance.netCents !== 0) {
    return (
      <form action={settleBalance} className="px-1">
        <input type="hidden" name="kidId" value={balance.kid.id} />
        <button type="submit" className="w-full">{circle}</button>
      </form>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="px-1">
        {circle}
      </button>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className="px-1">
        {circle}
      </a>
    );
  }

  return (
    <div className="px-1 opacity-45">
      {circle}
    </div>
  );
}
