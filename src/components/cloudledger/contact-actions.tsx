"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { contactCardHref } from "@/lib/cloudledger/contact";

export function downloadContactCard() {
  window.location.href = contactCardHref();
}

export function ContactActions({ phoneNumber }: { phoneNumber: string }) {
  const [copied, setCopied] = useState(false);
  const configured = Boolean(phoneNumber);

  async function copyNumber() {
    if (!configured) return;
    await navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button
        type="button"
        disabled={!configured}
        onClick={downloadContactCard}
        className="h-11 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-500"
      >
        Add CloudLedger to Contacts
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={!configured}
        onClick={copyNumber}
        className="h-11 rounded-2xl"
      >
        Copy phone number
      </Button>
      {copied ? (
        <p className="sm:col-span-2 text-sm font-medium text-emerald-700">Copied. Save it as CloudLedger.</p>
      ) : null}
    </div>
  );
}
