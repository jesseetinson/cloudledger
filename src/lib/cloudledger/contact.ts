export function getCloudLedgerPhoneNumber() {
  return process.env.TWILIO_PHONE_NUMBER?.trim() || "";
}

export function contactCardHref() {
  return "/api/contact-card";
}

export function buildCloudLedgerVCard(phoneNumber: string) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:CloudLedger",
    "ORG:CloudLedger",
    `TEL;TYPE=CELL:${phoneNumber}`,
    "NOTE:Text this number to add family IOUs to CloudLedger.",
    "END:VCARD",
    "",
  ].join("\r\n");
}
