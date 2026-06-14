import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "twilio";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { demoCategories, demoPeople } from "@/lib/cloudledger/seed";
import type { Category, Person } from "@/lib/cloudledger/types";
import { parseCloudLedgerSmsWithAi } from "@/lib/cloudledger/openai-sms-parser";
import { confirmationMessage, normalizeSmsPhone } from "@/lib/cloudledger/sms-parser";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value)]));

  if (!(await isValidTwilioRequest(request, params))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const from = normalizeSmsPhone(params.From);
  const body = params.Body?.trim() ?? "";
  const supabase = createSupabaseServiceClient();
  const [people, categories] = await Promise.all([loadPeople(supabase), loadCategories(supabase)]);
  const sender = people.find((person) => person.phone === from) ?? null;
  const parsed = await parseCloudLedgerSmsWithAi({ body, sender, people, categories });

  if (!parsed.ok) {
    return twiml(parsed.reply);
  }

  if (!supabase) {
    return twiml(`${confirmationMessage(parsed)}. Demo mode only; connect Supabase to save SMS entries.`);
  }

  const { error } = await supabase.from("transactions").insert({
    kid_id: parsed.kid.id,
    submitted_by_id: sender!.id,
    amount_cents: parsed.amountCents,
    description: parsed.description,
    category_id: parsed.category.id,
    direction: parsed.direction,
    source: "sms",
    raw_sms_text: body,
    confidence: parsed.confidence,
    needs_review: parsed.needsReview,
    review_reason: parsed.reviewReason,
  });

  if (error) {
    console.error(error);
    return twiml("I couldn't save that just now. Please try again in a minute.");
  }

  return twiml(confirmationMessage(parsed));
}

async function loadPeople(supabase: ReturnType<typeof createSupabaseServiceClient>) {
  if (!supabase) {
    return demoPeople;
  }

  const { data, error } = await supabase.from("people").select("id,name,role,phone,onboarding_completed");

  if (error) {
    console.error(error);
    return demoPeople;
  }

  return data as Person[];
}

async function loadCategories(supabase: ReturnType<typeof createSupabaseServiceClient>) {
  if (!supabase) {
    return demoCategories;
  }

  const { data, error } = await supabase.from("categories").select("id,name,slug,icon");

  if (error) {
    console.error(error);
    return demoCategories;
  }

  return data as Category[];
}

async function isValidTwilioRequest(request: NextRequest, params: Record<string, string>) {
  if (process.env.TWILIO_VALIDATE_SIGNATURE !== "true") {
    return true;
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    return false;
  }

  const headerStore = await headers();
  const signature = headerStore.get("x-twilio-signature") ?? "";
  const forwardedProto = headerStore.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const forwardedHost = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? request.nextUrl.host;
  const url = `${forwardedProto}://${forwardedHost}${request.nextUrl.pathname}`;

  return validateRequest(authToken, signature, url, params);
}

function twiml(message: string) {
  return new NextResponse(`<Response><Message>${escapeXml(message)}</Message></Response>`, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
