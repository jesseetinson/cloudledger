import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CloudBackground({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.96),transparent_24%),radial-gradient(circle_at_82%_0%,rgba(222,213,255,0.6),transparent_28%),linear-gradient(180deg,#dff4ff_0%,#f7fbff_42%,#fff7df_100%)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-16 top-24 h-48 w-80 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute left-1/4 top-12 h-36 w-72 rounded-full bg-sky-100/80 blur-3xl" />
        <div className="absolute right-0 top-36 h-48 w-96 rounded-full bg-white/75 blur-3xl" />
        <div className="absolute bottom-0 left-[-10%] h-72 w-[120%] rounded-[50%] bg-white/55 blur-2xl" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
