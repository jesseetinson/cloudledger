import { CheckCircle2 } from "lucide-react";

export function SettledState({ text = "All settled" }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
      <CheckCircle2 className="h-4 w-4" />
      {text}
    </div>
  );
}
