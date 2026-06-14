import type { Category, Direction, Person } from "./types";

export type SmsParseResult =
  | {
      ok: true;
      amountCents: number;
      description: string;
      category: Category;
      direction: Direction;
      kid: Person;
      confidence: number;
      needsReview: boolean;
      reviewReason: string | null;
    }
  | {
      ok: false;
      reason: "unknown_sender" | "missing_amount" | "missing_kid" | "missing_description";
      reply: string;
    };

const kidOwesDadPatterns = [
  /\bto\s+dad\b/i,
  /\bi\s+owe\s+dad\b/i,
  /\bowe\s+dad\b/i,
  /\bowes\s+dad\b/i,
  /\bpay\s+dad\b/i,
  /\bpaid\s+dad\b/i,
];

const dadOwesKidPatterns = [
  /\bdad\s+owes\s+me\b/i,
  /\byou\s+owe\s+me\b/i,
  /\bi\s+owe\s+you\b/i,
  /\bi\s+owe\s+[a-z0-9 ]+\b/i,
  /\bdad\s+owes\s+[a-z0-9 ]+\b/i,
  /\bpay\s+[a-z0-9 ]+\b/i,
  /\bpay\s+back\s+[a-z0-9 ]+\b/i,
];

const categoryRules: Array<{ slug: string; patterns: RegExp[] }> = [
  {
    slug: "food-delivery",
    patterns: [/\buber\s*eats\b/i, /\bchalet\b/i, /\bst-?hubert\b/i, /\bcoffee\b/i, /\bdinner\b/i, /\blunch\b/i, /\bfood\b/i, /\bbq\b/i, /\brestaurant\b/i],
  },
  {
    slug: "clothing-shopping",
    patterns: [/\bzara\b/i, /\bsimons\b/i, /\bmassimo\b/i, /\bshoes?\b/i, /\bshirt\b/i, /\bclothes?\b/i],
  },
  {
    slug: "travel-transport",
    patterns: [/\bgas\b/i, /\buber\b/i, /\btaxi\b/i, /\bparking\b/i, /\btrain\b/i, /\bbus\b/i],
  },
  {
    slug: "subscriptions",
    patterns: [/\bclaude\b/i, /\bnetflix\b/i, /\bspotify\b/i, /\bsubscription\b/i],
  },
  {
    slug: "errands",
    patterns: [/\bwiper\b/i, /\bpharmacy\b/i, /\bsupplies\b/i, /\berrand\b/i],
  },
  {
    slug: "gifts",
    patterns: [/\bgift\b/i, /\bpresent\b/i],
  },
  {
    slug: "health",
    patterns: [/\bdoctor\b/i, /\bdentist\b/i, /\bmedicine\b/i, /\bhealth\b/i],
  },
  {
    slug: "entertainment",
    patterns: [/\bmovie\b/i, /\bticket\b/i, /\bgame\b/i, /\bconcert\b/i],
  },
];

export function normalizeSmsPhone(value: string | null | undefined) {
  return (value ?? "").replace(/^whatsapp:/i, "").trim();
}

export function parseCloudLedgerSms({
  body,
  sender,
  people,
  categories,
}: {
  body: string;
  sender: Person | null;
  people: Person[];
  categories: Category[];
}): SmsParseResult {
  if (!sender) {
    return {
      ok: false,
      reason: "unknown_sender",
      reply: "This phone number is not registered for CloudLedger.",
    };
  }

  const rawText = body.trim();
  const amount = extractSmsAmount(rawText);

  if (!amount) {
    return {
      ok: false,
      reason: "missing_amount",
      reply: "I couldn't find an amount. Try: '64 Uber Eats.'",
    };
  }

  const kids = people.filter((person) => person.role === "kid");
  const kid = sender.role === "kid" ? sender : findKidInSmsText(rawText, kids);

  if (!kid) {
    return {
      ok: false,
      reason: "missing_kid",
      reply: "Who is this for? Text it like: 'Jesse 22 coffee.'",
    };
  }

  const description = cleanSmsDescription(rawText, amount.raw, sender.role === "dad" ? kid.name : undefined);

  if (!description) {
    return {
      ok: false,
      reason: "missing_description",
      reply: "I found the amount, but not what it was for. Try: '64 Uber Eats.'",
    };
  }

  const category = categorizeSmsDescription(description, categories);
  const direction = inferSmsDirection(rawText, sender, kid);

  return {
    ok: true,
    amountCents: amount.cents,
    description,
    category,
    direction,
    kid,
    confidence: category.slug === "other" ? 0.8 : 1,
    needsReview: category.slug === "other",
    reviewReason: category.slug === "other" ? "SMS category was uncertain." : null,
  };
}

export function confirmationMessage(result: Extract<SmsParseResult, { ok: true }>) {
  const directionText =
    result.direction === "dad_owes_kid"
      ? `Dad owes ${result.kid.name}`
      : `${result.kid.name} owes Dad`;

  return `Added: ${directionText} ${formatSmsMoney(result.amountCents)} for ${result.description} - ${result.category.name}`;
}

export function extractSmsAmount(text: string) {
  const match = text.match(/(?:\$)?(\d+(?:[.,]\d{1,2})?)/);

  if (!match) {
    return null;
  }

  const value = Number(match[1].replace(",", "."));

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return {
    raw: match[0],
    cents: Math.round(value * 100),
  };
}

export function findKidInSmsText(text: string, kids: Person[]) {
  const normalized = normalizeSmsWords(text);

  return kids.find((kid) => {
    const kidName = normalizeSmsWords(kid.name);
    return new RegExp(`\\b${escapeRegExp(kidName)}\\b`, "i").test(normalized);
  });
}

export function inferSmsDirection(text: string, sender: Person, kid: Person): Direction {
  if (sender.role === "kid") {
    return kidOwesDadPatterns.some((pattern) => pattern.test(text)) ? "kid_owes_dad" : "dad_owes_kid";
  }

  const mentionsDadOwesKid = [
    new RegExp(`\\bi\\s+owe\\s+(you|${escapeRegExp(kid.name)})\\b`, "i"),
    new RegExp(`\\bpay\\s+(you|${escapeRegExp(kid.name)})\\b`, "i"),
    new RegExp(`\\bdad\\s+owes\\s+${escapeRegExp(kid.name)}\\b`, "i"),
    ...dadOwesKidPatterns,
  ].some((pattern) => pattern.test(text));

  return mentionsDadOwesKid ? "dad_owes_kid" : "kid_owes_dad";
}

export function cleanSmsDescription(text: string, amountRaw: string, kidName?: string) {
  let cleaned = text
    .replace(amountRaw, " ")
    .replace(/\bdad\s+owes\s+me\b/gi, " ")
    .replace(/\byou\s+owe\s+me\b/gi, " ")
    .replace(/\bto\s+dad\b/gi, " ")
    .replace(/\bi\s+owe\s+dad\b/gi, " ")
    .replace(/\bowe\s+dad\b/gi, " ")
    .replace(/\bi\s+owe\s+you\b/gi, " ")
    .replace(/\bpay\s+you\b/gi, " ")
    .replace(/\bdad\s+owes\b/gi, " ")
    .replace(/\bi\s+owe\b/gi, " ")
    .replace(/\bpay\s+back\b/gi, " ")
    .replace(/\bpay\b/gi, " ");

  if (kidName) {
    cleaned = cleaned.replace(new RegExp(`\\b${escapeRegExp(kidName)}\\b`, "gi"), " ");
  }

  return cleaned.replace(/\s+/g, " ").trim();
}

export function categorizeSmsDescription(description: string, categories: Category[]) {
  const rule = categoryRules.find((candidate) => candidate.patterns.some((pattern) => pattern.test(description)));
  const fallback = categories.find((category) => category.slug === "other") ?? categories[0];

  if (!rule) {
    return fallback;
  }

  return categories.find((category) => category.slug === rule.slug) ?? fallback;
}

export function normalizeSmsWords(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatSmsMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
