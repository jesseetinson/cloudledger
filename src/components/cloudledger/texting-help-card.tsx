import type { Person } from "@/lib/cloudledger/types";
import { FloatingCard } from "./floating-card";
import { ContactActions } from "./contact-actions";

const kidExamples = ["64 Uber Eats", "116 chalet bbq", "to dad 110 shoes"];
const dadExamples = ["Jesse 45 gas", "Jesse I owe you 80 dinner", "Ben 22 coffee"];

export function TextingHelpCard({
  currentPerson,
  phoneNumber,
  compact = false,
}: {
  currentPerson: Person;
  phoneNumber: string;
  compact?: boolean;
}) {
  const isDad = currentPerson.role === "dad";
  const examples = isDad ? dadExamples : kidExamples;

  return (
    <FloatingCard className="grid gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Text instead</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">
          {phoneNumber ? phoneNumber : "SMS number coming soon"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isDad
            ? "Text the CloudLedger number with a kid's name, amount, and what it was for."
            : "Text the CloudLedger number whenever Dad owes you for something."}
        </p>
      </div>
      <div className="grid gap-2">
        {examples.slice(0, compact ? 2 : 3).map((example) => (
          <div key={example} className="rounded-2xl bg-white/60 px-4 py-3 font-mono text-sm text-slate-700">
            {example}
          </div>
        ))}
      </div>
      <ContactActions phoneNumber={phoneNumber} />
    </FloatingCard>
  );
}
