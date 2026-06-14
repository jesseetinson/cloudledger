"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { calculateBalances } from "./balances";
import { dollarsToCents } from "./money";
import { getCategories, getPeople, getSettlements, getTransactions, requireCurrentPerson, sessionCookieName } from "./data";
import { phoneSchema, reviewUpdateSchema, settlementSchema, transactionDetailsSchema, transactionFormSchema } from "./validation";

export async function loginWithPhone(formData: FormData) {
  const phone = phoneSchema.parse(formData.get("phone"));
  const supabase = createSupabaseServiceClient();
  let person = null;

  if (supabase) {
    const { data, error } = await supabase
      .from("people")
      .select("id,name,role,phone,onboarding_completed")
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    person = data;
  } else {
    const people = await getPeople();
    person = people.find((candidate) => candidate.phone === phone) ?? null;
  }

  if (!person) {
    redirect("/login?error=unknown-phone");
  }

  (await cookies()).set(sessionCookieName, phone, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect(person.onboarding_completed ? "/dashboard" : "/onboarding");
}

export async function logout() {
  (await cookies()).delete(sessionCookieName);
  redirect("/login");
}

export async function completeOnboarding(destination: "/dashboard", _formData?: FormData) {
  void _formData;
  const currentPerson = await requireCurrentPerson();
  const supabase = createSupabaseServiceClient();

  if (supabase) {
    const { error } = await supabase
      .from("people")
      .update({ onboarding_completed: true })
      .eq("id", currentPerson.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  redirect(destination);
}

export async function createTransaction(formData: FormData) {
  const currentPerson = await requireCurrentPerson();
  const parsed = transactionFormSchema.parse({
    amount: formData.get("amount"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    kidId: formData.get("kidId") || undefined,
    direction: formData.get("direction"),
    note: formData.get("note") || undefined,
    needsReview: formData.get("needsReview") === "on",
  });

  const people = await getPeople();
  const categories = await getCategories();
  const kidId = currentPerson.role === "kid" ? currentPerson.id : parsed.kidId;
  const kid = people.find((person) => person.id === kidId && person.role === "kid");
  const category = categories.find((candidate) => candidate.id === parsed.categoryId);

  if (!kid) {
    throw new Error("Dad must choose which kid this belongs to.");
  }

  if (!category) {
    throw new Error("Choose a valid category.");
  }

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    redirect("/dashboard?demo=1");
  }

  const amountCents = dollarsToCents(parsed.amount);
  const { error } = await supabase.from("transactions").insert({
    kid_id: kid.id,
    submitted_by_id: currentPerson.id,
    amount_cents: amountCents,
    description: parsed.description,
    category_id: category.id,
    direction: parsed.direction,
    source: "web",
    needs_review: parsed.needsReview ?? false,
    review_reason: parsed.needsReview ? parsed.note || "Flagged during manual entry." : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/review");
  const directionText =
    parsed.direction === "dad_owes_kid"
      ? currentPerson.role === "kid"
        ? "Dad owes you"
        : `Dad owes ${kid.name}`
      : currentPerson.role === "kid"
        ? "You owe Dad"
        : `${kid.name} owes Dad`;
  const addedMessage = `Added. ${directionText} $${(amountCents / 100).toFixed(2)} for ${parsed.description}.`;
  redirect(`/dashboard?added=${encodeURIComponent(addedMessage)}`);
}

export async function setTransactionPaid(transactionId: string, isPaid: boolean) {
  const currentPerson = await requireCurrentPerson();
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    redirect("/dashboard?demo=1");
  }

  let query = supabase
    .from("transactions")
    .update({
      is_paid: isPaid,
      paid_at: isPaid ? new Date().toISOString() : null,
    })
    .eq("id", transactionId);

  if (currentPerson.role === "kid") {
    query = query.eq("kid_id", currentPerson.id);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/review");
}

export async function updateTransactionDetails(formData: FormData) {
  const currentPerson = await requireCurrentPerson();
  const parsed = transactionDetailsSchema.parse({
    transactionId: formData.get("transactionId"),
    description: formData.get("description"),
  });
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    redirect("/dashboard?demo=1");
  }

  let query = supabase
    .from("transactions")
    .update({
      description: parsed.description,
    })
    .eq("id", parsed.transactionId);

  if (currentPerson.role === "kid") {
    query = query.eq("kid_id", currentPerson.id);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function settleBalance(formData: FormData) {
  const currentPerson = await requireCurrentPerson();
  const parsed = settlementSchema.parse({
    kidId: formData.get("kidId"),
  });
  const people = await getPeople();
  const kid = people.find((person) => person.id === parsed.kidId && person.role === "kid");

  if (!kid) {
    throw new Error("Choose which person to settle with.");
  }

  if (currentPerson.role === "kid" && currentPerson.id !== kid.id) {
    throw new Error("You can only settle your own balance.");
  }

  const [transactions, settlements] = await Promise.all([
    getTransactions(currentPerson),
    getSettlements(currentPerson),
  ]);
  const balance = calculateBalances([kid], transactions, settlements)[0];

  if (!balance || balance.netCents === 0) {
    redirect("/dashboard");
  }

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    redirect("/dashboard?demo=1");
  }

  const { error } = await supabase.from("settlements").insert({
    kid_id: kid.id,
    submitted_by_id: currentPerson.id,
    amount_cents: Math.abs(balance.netCents),
    direction: balance.netCents > 0 ? "dad_owes_kid" : "kid_owes_dad",
    note: "Settled from dashboard.",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  redirect("/dashboard");
}

export async function approveReviewedTransaction(formData: FormData) {
  const currentPerson = await requireCurrentPerson();
  const parsed = reviewUpdateSchema.parse({
    transactionId: formData.get("transactionId"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    kidId: formData.get("kidId") || undefined,
    direction: formData.get("direction"),
    isPaid: formData.get("isPaid") === "on",
  });
  const people = await getPeople();
  const categories = await getCategories();
  const kidId = currentPerson.role === "kid" ? currentPerson.id : parsed.kidId;
  const kid = people.find((person) => person.id === kidId && person.role === "kid");
  const category = categories.find((candidate) => candidate.id === parsed.categoryId);

  if (!kid) {
    throw new Error("Choose which kid this belongs to.");
  }

  if (!category) {
    throw new Error("Choose a valid category.");
  }

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    redirect("/dashboard?demo=1");
  }

  let query = supabase
    .from("transactions")
    .update({
      kid_id: kid.id,
      amount_cents: dollarsToCents(parsed.amount),
      description: parsed.description,
      category_id: category.id,
      direction: parsed.direction,
      is_paid: parsed.isPaid ?? false,
      paid_at: parsed.isPaid ? new Date().toISOString() : null,
      needs_review: false,
      review_reason: null,
    })
    .eq("id", parsed.transactionId);

  if (currentPerson.role === "kid") {
    query = query.eq("kid_id", currentPerson.id);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/review");
  redirect("/dashboard");
}

export async function deleteTransaction(formData: FormData) {
  const currentPerson = await requireCurrentPerson();
  const transactionId = String(formData.get("transactionId") ?? "");

  if (!transactionId) {
    throw new Error("Missing item.");
  }

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    redirect("/dashboard?demo=1");
  }

  let query = supabase.from("transactions").delete().eq("id", transactionId);

  if (currentPerson.role === "kid") {
    query = query.eq("kid_id", currentPerson.id);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/review");
  redirect("/dashboard");
}
