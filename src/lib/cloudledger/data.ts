import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { demoCategories, demoPeople, demoTransactions } from "./seed";
import type { Category, Person, Settlement, TransactionWithRelations } from "./types";

export const sessionCookieName = "cloudledger_phone";

export async function getCurrentPerson(): Promise<Person | null> {
  const phone = (await cookies()).get(sessionCookieName)?.value;

  if (!phone) {
    return null;
  }

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return demoPeople.find((person) => person.phone === phone) ?? null;
  }

  const { data, error } = await supabase
    .from("people")
    .select("id,name,role,phone,onboarding_completed")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Person | null;
}

export async function requireCurrentPerson() {
  const person = await getCurrentPerson();

  if (!person) {
    redirect("/login");
  }

  return person;
}

export async function getPeople() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return demoPeople;
  }

  const { data, error } = await supabase.from("people").select("id,name,role,phone,onboarding_completed").order("role").order("name");

  if (error) {
    console.error(error);
    return demoPeople;
  }

  return data as Person[];
}

export async function getCategories() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return demoCategories;
  }

  const { data, error } = await supabase.from("categories").select("id,name,slug,icon").order("name");

  if (error) {
    console.error(error);
    return demoCategories;
  }

  return data as Category[];
}

export async function getTransactions(currentPerson: Person) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return visibleTransactionsFor(currentPerson, demoTransactions);
  }

  let query = supabase
    .from("transactions")
    .select(
      "*, kid:people!transactions_kid_id_fkey(id,name,role,phone,onboarding_completed), submitted_by:people!transactions_submitted_by_id_fkey(id,name,role,phone,onboarding_completed), category:categories(id,name,slug,icon)",
    )
    .order("created_at", { ascending: false });

  if (currentPerson.role === "kid") {
    query = query.eq("kid_id", currentPerson.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return visibleTransactionsFor(currentPerson, demoTransactions);
  }

  return data as unknown as TransactionWithRelations[];
}

export async function getSettlements(currentPerson: Person) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return [] as Settlement[];
  }

  let query = supabase.from("settlements").select("*").order("created_at", { ascending: false });

  if (currentPerson.role === "kid") {
    query = query.eq("kid_id", currentPerson.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [] as Settlement[];
  }

  return data as Settlement[];
}

function visibleTransactionsFor(person: Person, transactions: TransactionWithRelations[]) {
  if (person.role === "dad") {
    return transactions;
  }

  return transactions.filter((transaction) => transaction.kid_id === person.id);
}
