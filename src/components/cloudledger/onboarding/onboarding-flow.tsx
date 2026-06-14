"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/lib/cloudledger/actions";
import type { Person } from "@/lib/cloudledger/types";
import { ContactActions } from "../contact-actions";
import { FloatingCard } from "../floating-card";
import { TextingHelpCard } from "../texting-help-card";

export function OnboardingFlow({
  currentPerson,
  phoneNumber,
}: {
  currentPerson: Person;
  phoneNumber: string;
}) {
  const [step, setStep] = useState(0);
  const isDad = currentPerson.role === "dad";
  const steps = ["Welcome", "Texting", "Contact", "First action"];

  return (
    <FloatingCard className="mx-auto w-full max-w-2xl p-6 sm:p-8">
      <div className="mb-6 flex gap-2">
        {steps.map((label, index) => (
          <div
            key={label}
            className={`h-2 flex-1 rounded-full ${index <= step ? "bg-sky-500" : "bg-white/70"}`}
          />
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-5 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700/80">Step 1 of 4</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {isDad ? "Welcome to CloudLedger" : `Welcome to CloudLedger, ${currentPerson.name}`}
          </h1>
          <p className="mx-auto max-w-md text-slate-600">
            {isDad
              ? "Track balances with each kid from one simple dashboard."
              : "This keeps track of what Dad owes you, and what you owe Dad, without messy notes or mental math."}
          </p>
          <Button className="h-12 rounded-2xl bg-sky-600 text-white hover:bg-sky-700" onClick={() => setStep(1)}>
            Get started
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-5">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700/80">Step 2 of 4</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">How texting works</h1>
          <p className="text-slate-600">
            {isDad
              ? "Text the CloudLedger number and include the kid's name."
              : "Text the CloudLedger number whenever Dad owes you for something."}
          </p>
          <TextingHelpCard currentPerson={currentPerson} phoneNumber={phoneNumber} />
          <p className="text-sm leading-6 text-slate-600">
            {isDad
              ? "If you text a kid's name, amount, and item, CloudLedger assumes that kid owes you. If you owe the kid, write 'I owe [kid].'"
              : "If you just text an amount and description, CloudLedger assumes Dad owes you. If you owe Dad, start with 'to dad.'"}
          </p>
          <Button className="h-12 rounded-2xl bg-sky-600 text-white hover:bg-sky-700" onClick={() => setStep(2)}>
            Next
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-5">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700/80">Step 3 of 4</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Add CloudLedger as a contact</h1>
          <div className="rounded-3xl bg-white/65 p-5">
            <p className="text-sm text-slate-500">Contact name</p>
            <p className="text-xl font-semibold text-slate-900">CloudLedger</p>
            <p className="mt-4 text-sm text-slate-500">Phone number</p>
            <p className="text-xl font-semibold text-slate-900">
              {phoneNumber || "SMS number coming soon"}
            </p>
          </div>
          <ContactActions phoneNumber={phoneNumber} />
          <Button className="h-12 rounded-2xl bg-sky-600 text-white hover:bg-sky-700" onClick={() => setStep(3)}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-5 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700/80">Step 4 of 4</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">You&apos;re ready</h1>
          <p className="mx-auto max-w-md text-slate-600">Everything happens on one page now.</p>
          <form action={completeOnboarding.bind(null, "/dashboard")}>
            <Button type="submit" className="h-12 w-full rounded-2xl bg-sky-600 text-white hover:bg-sky-700">
              Open CloudLedger
            </Button>
          </form>
        </div>
      ) : null}
    </FloatingCard>
  );
}
