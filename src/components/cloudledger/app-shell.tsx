import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, CloudSun, Home, LogOut, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/cloudledger/actions";
import type { Person } from "@/lib/cloudledger/types";
import { CloudBackground } from "./cloud-background";

const navItems = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: Home },
  { href: "/add", label: "Add", mobileLabel: "Add", icon: Plus },
  { href: "/transactions", label: "Activity", mobileLabel: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", mobileLabel: "Settings", icon: Settings },
];

export function AppShell({
  currentPerson,
  children,
  reviewCount = 0,
}: {
  currentPerson: Person;
  children: React.ReactNode;
  reviewCount?: number;
}) {
  if (!currentPerson.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <CloudBackground>
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-5 pb-24 sm:px-6 sm:pb-5 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/45 p-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <div className="rounded-2xl bg-sky-600 p-2 text-white shadow-lg shadow-sky-300/50">
              <CloudSun className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-800">CloudLedger</p>
              <p className="text-xs text-slate-500">Welcome back, {currentPerson.name}</p>
            </div>
          </Link>
          <nav className="hidden gap-1 overflow-x-auto sm:flex">
            {[...navItems, ...(reviewCount > 0 ? [{ href: "/review", label: "Needs review", mobileLabel: "Review", icon: Activity }] : [])].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white/70 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="icon" className="rounded-full" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </header>
        <main className="flex-1 pb-10">{children}</main>
        <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-3xl border border-white/70 bg-white/75 p-2 shadow-2xl shadow-sky-900/10 backdrop-blur-xl sm:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium text-slate-600 hover:bg-white/80"
              >
                <Icon className="h-4 w-4" />
                {item.mobileLabel}
              </Link>
            );
          })}
        </nav>
      </div>
    </CloudBackground>
  );
}
