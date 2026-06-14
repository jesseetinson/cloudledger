"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithPhone } from "@/lib/cloudledger/actions";

export function PhoneLoginForm() {
  const searchParams = useSearchParams();
  const unknownPhone = searchParams.get("error") === "unknown-phone";

  return (
    <form action={loginWithPhone} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+15550000002"
          className="h-12 rounded-2xl bg-white/70"
          required
        />
        {unknownPhone ? (
          <p className="text-sm text-rose-600">That phone number is not registered for this family.</p>
        ) : (
          <p className="text-sm text-slate-500">Use one of the four registered family phone numbers.</p>
        )}
      </div>
      <Button type="submit" className="h-12 w-full rounded-2xl bg-sky-600 text-white hover:bg-sky-700">
        Enter CloudLedger
      </Button>
    </form>
  );
}
