import Link from "next/link";
import { redirect } from "next/navigation";
import { CloudSun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/cloudledger/actions";
import type { Person } from "@/lib/cloudledger/types";
import { CloudBackground } from "./cloud-background";

export function AppShell({
  currentPerson,
  children,
}: {
  currentPerson: Person;
  children: React.ReactNode;
}) {
  if (!currentPerson.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <CloudBackground>
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-4 pb-8 sm:px-6 sm:py-5 lg:px-8">
        <header className="mb-5 flex items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/45 p-3 backdrop-blur-xl sm:mb-6 sm:flex-row">
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <div className="rounded-2xl bg-sky-600 p-2 text-white shadow-lg shadow-sky-300/50">
              <CloudSun className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">CloudLedger</p>
              <p className="hidden text-xs text-slate-500 sm:block">Welcome back, {currentPerson.name}</p>
            </div>
          </Link>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="icon" className="rounded-full" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </header>
        <main className="flex-1 pb-12 sm:pb-10">{children}</main>
      </div>
    </CloudBackground>
  );
}
