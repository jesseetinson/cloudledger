import { Sparkles } from "lucide-react";
import { FloatingCard } from "./floating-card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <FloatingCard className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 rounded-full bg-amber-100/80 p-3 text-amber-700">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </FloatingCard>
  );
}
