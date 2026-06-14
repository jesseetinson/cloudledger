import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { Category, Person } from "./types";
import {
  categorizeSmsDescription,
  cleanSmsDescription,
  extractSmsAmount,
  findKidInSmsText,
  inferSmsDirection,
  normalizeSmsWords,
  parseCloudLedgerSms,
  type SmsParseResult,
} from "./sms-parser";

const aiSmsSchema = z.object({
  amount: z.number().positive().nullable(),
  description: z.string().trim().min(0).max(140),
  category: z.string().trim().min(1),
  direction: z.enum(["dad_owes_kid", "kid_owes_dad"]).nullable(),
  kid_name: z.string().trim().nullable(),
  confidence: z.number().min(0).max(1),
  needs_review: z.boolean(),
  reason: z.string().trim().min(1).max(240),
});

type AiSmsOutput = z.infer<typeof aiSmsSchema>;

let openaiClient: OpenAI | null = null;

export async function parseCloudLedgerSmsWithAi({
  body,
  sender,
  people,
  categories,
}: {
  body: string;
  sender: Person | null;
  people: Person[];
  categories: Category[];
}): Promise<SmsParseResult> {
  const deterministic = parseCloudLedgerSms({ body, sender, people, categories });

  if (!sender || !process.env.OPENAI_API_KEY) {
    return deterministic;
  }

  const amount = extractSmsAmount(body);

  if (!amount) {
    return deterministic;
  }

  try {
    const ai = await parseWithOpenAI({ body, sender, people, categories });
    return mergeAiWithDeterministic({ ai, body, sender, people, categories, deterministic });
  } catch (error) {
    console.error(error);
    return deterministic;
  }
}

async function parseWithOpenAI({
  body,
  sender,
  people,
  categories,
}: {
  body: string;
  sender: Person;
  people: Person[];
  categories: Category[];
}) {
  const client = getOpenAIClient();
  const kids = people.filter((person) => person.role === "kid").map((person) => person.name);
  const categoryNames = categories.map((category) => category.name);

  const response = await client.responses.parse({
    model: process.env.OPENAI_SMS_MODEL ?? "gpt-5.5",
    input: [
      {
        role: "system",
        content:
          "You parse private family IOU SMS messages for CloudLedger. Return only structured data. Never invent an amount. If the message is ambiguous, lower confidence and set needs_review true.",
      },
      {
        role: "user",
        content: JSON.stringify({
          raw_text: body,
          sender: { name: sender.name, role: sender.role },
          kids,
          categories: categoryNames,
          rules: [
            "Amount must be explicitly present in the raw text.",
            "If sender is a kid and direction is absent, default to dad_owes_kid.",
            "If sender is Dad and direction is absent, default to kid_owes_dad.",
            "Dad-submitted messages must include a clear kid name.",
            "Use one of the provided categories.",
            "Use confidence below 0.85 when category, kid, description, or direction is uncertain.",
          ],
        }),
      },
    ],
    text: {
      format: zodTextFormat(aiSmsSchema, "cloudledger_sms_parse"),
    },
  });

  return response.output_parsed;
}

function mergeAiWithDeterministic({
  ai,
  body,
  sender,
  people,
  categories,
  deterministic,
}: {
  ai: AiSmsOutput | null;
  body: string;
  sender: Person;
  people: Person[];
  categories: Category[];
  deterministic: SmsParseResult;
}): SmsParseResult {
  const amount = extractSmsAmount(body);

  if (!amount || !ai || ai.amount === null) {
    return deterministic;
  }

  const aiAmountCents = Math.round(ai.amount * 100);

  if (aiAmountCents !== amount.cents) {
    return {
      ok: false,
      reason: "missing_amount",
      reply: "I couldn't confidently read the amount. Try: '64 Uber Eats.'",
    };
  }

  const kids = people.filter((person) => person.role === "kid");
  const deterministicKid = sender.role === "kid" ? sender : findKidInSmsText(body, kids);
  const aiKid = ai.kid_name ? findKidByName(ai.kid_name, kids) : null;
  const kid = sender.role === "kid" ? sender : aiKid ?? deterministicKid;

  if (!kid) {
    return {
      ok: false,
      reason: "missing_kid",
      reply: "Who is this for? Text it like: 'Jesse 22 coffee.'",
    };
  }

  const fallbackDescription =
    deterministic.ok ? deterministic.description : cleanSmsDescription(body, amount.raw, sender.role === "dad" ? kid.name : undefined);
  const description = ai.description.trim() || fallbackDescription;

  if (!description) {
    return deterministic;
  }

  const category = findCategory(ai.category, categories) ?? categorizeSmsDescription(description, categories);
  const direction = ai.direction ?? (deterministic.ok ? deterministic.direction : inferSmsDirection(body, sender, kid));
  const confidence = Math.min(Math.max(ai.confidence, 0), 1);
  const needsReview = ai.needs_review || confidence < 0.85 || category.slug === "other";
  const reviewReason = needsReview
    ? ai.reason || (confidence < 0.85 ? "AI confidence was below 0.85." : "AI marked this SMS for review.")
    : null;

  return {
    ok: true,
    amountCents: amount.cents,
    description,
    category,
    direction,
    kid,
    confidence,
    needsReview,
    reviewReason,
  };
}

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openaiClient;
}

function findKidByName(name: string, kids: Person[]) {
  const normalizedName = normalizeSmsWords(name);
  return kids.find((kid) => normalizeSmsWords(kid.name) === normalizedName) ?? null;
}

function findCategory(value: string, categories: Category[]) {
  const normalized = normalizeSmsWords(value);

  return (
    categories.find((category) => normalizeSmsWords(category.name) === normalized || category.slug === normalized) ??
    null
  );
}
