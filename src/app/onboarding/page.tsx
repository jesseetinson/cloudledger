import { redirect } from "next/navigation";
import { CloudBackground } from "@/components/cloudledger/cloud-background";
import { OnboardingFlow } from "@/components/cloudledger/onboarding/onboarding-flow";
import { getCloudLedgerPhoneNumber } from "@/lib/cloudledger/contact";
import { requireCurrentPerson } from "@/lib/cloudledger/data";

export default async function OnboardingPage() {
  const currentPerson = await requireCurrentPerson();

  if (currentPerson.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <CloudBackground>
      <main className="flex min-h-dvh items-center justify-center px-4 py-8">
        <OnboardingFlow currentPerson={currentPerson} phoneNumber={getCloudLedgerPhoneNumber()} />
      </main>
    </CloudBackground>
  );
}
