import { NextResponse } from "next/server";
import { buildCloudLedgerVCard, getCloudLedgerPhoneNumber } from "@/lib/cloudledger/contact";

export function GET() {
  const phoneNumber = getCloudLedgerPhoneNumber();

  if (!phoneNumber) {
    return new NextResponse("CloudLedger SMS number is not configured yet.", { status: 404 });
  }

  return new NextResponse(buildCloudLedgerVCard(phoneNumber), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cloudledger.vcf"',
    },
  });
}
