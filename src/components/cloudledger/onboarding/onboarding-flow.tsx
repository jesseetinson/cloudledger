"use client";

import { CreditCard, MessageCircle, Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/lib/cloudledger/actions";
import type { Person } from "@/lib/cloudledger/types";
import { ContactActions } from "../contact-actions";

export function OnboardingFlow({
  currentPerson,
  phoneNumber,
}: {
  currentPerson: Person;
  phoneNumber: string;
}) {
  const [step, setStep] = useState(0);
  const isDad = currentPerson.role === "dad";
  const steps = ["Total", "Actions", "Transactions", "Texting"];

  return (
    <section className="w-full max-w-[430px] overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="bg-[#0d4359] px-7 pb-12 pt-6 text-white">
        <div className="flex gap-2">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-white" : "bg-white/20"}`}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-sm font-semibold text-white/60">CloudLedger tutorial</p>
        <h1 className="mt-2 text-center text-3xl font-black leading-tight">
          {stepTitle(step, currentPerson.name)}
        </h1>
      </div>

      <div className="-mt-7 px-6 pb-6">
        <div className="rounded-[1.75rem] bg-[#f8f8f2] p-5">
          {step === 0 ? (
            <TutorialPanel
              title={isDad ? "The total is the family snapshot." : "The total is your balance with Dad."}
              body={
                isDad
                  ? "Positive means Dad pays out overall. Negative means the kids owe Dad overall."
                  : "Positive means Dad owes you. Negative means you owe Dad. Zero means settled."
              }
            >
              <div className="rounded-[1.5rem] bg-[#0d4359] p-5 text-center text-white">
                <p className="text-sm font-semibold text-white/55">Total:</p>
                <p className="mt-1 text-5xl font-black">$0.00</p>
              </div>
            </TutorialPanel>
          ) : null}

          {step === 1 ? (
            <TutorialPanel
              title="Use the three buttons at the top."
              body="Settle up records that real money changed hands. Add contact saves the texting number. Add transaction jumps to the form."
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                <MiniAction icon={<CreditCard className="h-5 w-5" />} label="Settle up" />
                <MiniAction icon={<UserPlus className="h-5 w-5" />} label="Add contact" />
                <MiniAction icon={<Plus className="h-5 w-5" />} label="Add transaction" />
              </div>
            </TutorialPanel>
          ) : null}

          {step === 2 ? (
            <TutorialPanel
              title="Tap or swipe each transaction."
              body="Tap to see details and edit the description. Swipe right to delete. Swipe left to switch paid or unpaid."
            >
              <div className="grid gap-3">
                <GestureRow icon={<Pencil className="h-4 w-4" />} title="Tap" body="Open details" />
                <GestureRow icon={<Trash2 className="h-4 w-4" />} title="Swipe right" body="Delete" />
                <GestureRow icon={<CreditCard className="h-4 w-4" />} title="Swipe left" body="Paid / unpaid" />
              </div>
            </TutorialPanel>
          ) : null}

          {step === 3 ? (
            <TutorialPanel
              title="You can add by text too."
              body={
                isDad
                  ? "Text a kid name, amount, and description. Example: Jesse 45 gas."
                  : "Text an amount and description. Example: 64 Uber Eats. Start with 'to dad' if you owe Dad."
              }
            >
              <div className="rounded-[1.5rem] bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf7f4] text-[#178b8f]">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#183c3d]">CloudLedger</p>
                    <p className="text-sm text-[#9aa9a7]">{phoneNumber || "SMS number coming soon"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <ContactActions phoneNumber={phoneNumber} />
                </div>
              </div>
            </TutorialPanel>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3">
          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => setStep((current) => current + 1)}
              className="h-12 rounded-full bg-[#0d4359] text-white hover:bg-[#0a3548]"
            >
              Next
            </Button>
          ) : (
            <form action={completeOnboarding.bind(null, "/dashboard")}>
              <Button type="submit" className="h-12 w-full rounded-full bg-[#0d4359] text-white hover:bg-[#0a3548]">
                Open CloudLedger
              </Button>
            </form>
          )}
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((current) => current - 1)}
              className="h-10 rounded-full text-[#667a78]"
            >
              Back
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function TutorialPanel({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-2xl font-black leading-tight text-[#183c3d]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#667a78]">{body}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function MiniAction({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-[#178b8f] shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
        {icon}
      </span>
      <span className="mt-3 block text-xs font-bold leading-tight text-[#183c3d]">{label}</span>
    </div>
  );
}

function GestureRow({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf7f4] text-[#178b8f]">
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-[#183c3d]">{title}</p>
        <p className="text-xs text-[#9aa9a7]">{body}</p>
      </div>
    </div>
  );
}

function stepTitle(step: number, name: string) {
  if (step === 0) return `Hi, ${name}.`;
  if (step === 1) return "Three buttons.";
  if (step === 2) return "Transaction moves.";
  return "Text it in.";
}
