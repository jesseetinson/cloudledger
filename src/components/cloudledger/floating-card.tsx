import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function FloatingCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "cloud-shadow rounded-3xl border border-white/70 bg-white/58 p-5 backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
