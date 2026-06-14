import { AppShell } from "@/components/cloudledger/app-shell";
import { FloatingCard } from "@/components/cloudledger/floating-card";
import { TextingHelpCard } from "@/components/cloudledger/texting-help-card";
import { getCloudLedgerPhoneNumber } from "@/lib/cloudledger/contact";
import { getPeople, requireCurrentPerson } from "@/lib/cloudledger/data";

export default async function SettingsPage() {
  const currentPerson = await requireCurrentPerson();
  const people = await getPeople();

  return (
    <AppShell currentPerson={currentPerson}>
      <div className="mx-auto grid max-w-3xl gap-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700/80">Private family app</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
        </div>
        <FloatingCard>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-500">Name</dt>
              <dd className="mt-1 font-semibold text-slate-900">{currentPerson.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Role</dt>
              <dd className="mt-1 font-semibold capitalize text-slate-900">{currentPerson.role}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Phone</dt>
              <dd className="mt-1 font-semibold text-slate-900">{currentPerson.phone}</dd>
            </div>
          </dl>
        </FloatingCard>
        <TextingHelpCard currentPerson={currentPerson} phoneNumber={getCloudLedgerPhoneNumber()} compact />
        {currentPerson.role === "dad" ? (
          <FloatingCard>
            <h2 className="text-lg font-semibold text-slate-900">Registered family numbers</h2>
            <div className="mt-4 grid gap-3">
              {people.map((person) => (
                <div key={person.id} className="flex items-center justify-between rounded-2xl bg-white/55 px-4 py-3">
                  <span className="font-medium text-slate-800">{person.name}</span>
                  <span className="text-sm text-slate-500">{person.phone}</span>
                </div>
              ))}
            </div>
          </FloatingCard>
        ) : null}
      </div>
    </AppShell>
  );
}
