import { Suspense } from "react";
import { CloudSun } from "lucide-react";
import { CloudBackground } from "@/components/cloudledger/cloud-background";
import { FloatingCard } from "@/components/cloudledger/floating-card";
import { PhoneLoginForm } from "@/components/cloudledger/phone-login-form";

export default function LoginPage() {
  return (
    <CloudBackground>
      <main className="flex min-h-dvh items-center justify-center px-4 py-10">
        <FloatingCard className="w-full max-w-md p-7">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-600 text-white shadow-xl shadow-sky-300/50">
              <CloudSun className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">CloudLedger</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              A quiet family ledger above the clouds. Sign in with your registered phone number.
            </p>
          </div>
          <Suspense>
            <PhoneLoginForm />
          </Suspense>
        </FloatingCard>
      </main>
    </CloudBackground>
  );
}
