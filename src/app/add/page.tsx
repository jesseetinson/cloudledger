import { AppShell } from "@/components/cloudledger/app-shell";
import { QuickAddForm } from "@/components/cloudledger/quick-add-form";
import { TextingHelpCard } from "@/components/cloudledger/texting-help-card";
import { getCloudLedgerPhoneNumber } from "@/lib/cloudledger/contact";
import { getCategories, getPeople, requireCurrentPerson } from "@/lib/cloudledger/data";

export default async function AddPage() {
  const currentPerson = await requireCurrentPerson();
  const [people, categories] = await Promise.all([getPeople(), getCategories()]);
  const kids = people.filter((person) => person.role === "kid");

  return (
    <AppShell currentPerson={currentPerson}>
      <div className="mx-auto grid max-w-4xl gap-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700/80">Add item</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Add item</h1>
          <p className="mt-2 text-slate-500">
            Just the amount, what it was for, and who owes who.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <QuickAddForm currentPerson={currentPerson} kids={kids} categories={categories} />
          <TextingHelpCard currentPerson={currentPerson} phoneNumber={getCloudLedgerPhoneNumber()} />
        </div>
      </div>
    </AppShell>
  );
}
