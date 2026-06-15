import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => normalizePhoneNumber(value))
  .refine((value) => /^\+[1-9][0-9]{7,14}$/.test(value), "Use E.164 format, like +15551234567.");

export function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length > 0) {
    return `+${digits}`;
  }

  return trimmed;
}

export const transactionFormSchema = z.object({
  amount: z.coerce.number().positive().max(100000),
  description: z.string().trim().min(2).max(120),
  categoryId: z.string().uuid().or(z.string().min(1)),
  kidId: z.string().optional(),
  direction: z.enum(["dad_owes_kid", "kid_owes_dad"]),
  note: z.string().trim().max(500).optional(),
  needsReview: z.coerce.boolean().optional(),
});

export const transactionFiltersSchema = z.object({
  kid: z.string().optional(),
  category: z.string().optional(),
  paid: z.enum(["all", "paid", "unpaid"]).optional(),
  direction: z.enum(["all", "dad_owes_kid", "kid_owes_dad"]).optional(),
  q: z.string().optional(),
});

export const reviewUpdateSchema = z.object({
  transactionId: z.string().min(1),
  amount: z.coerce.number().positive().max(100000),
  description: z.string().trim().min(2).max(120),
  categoryId: z.string().min(1),
  kidId: z.string().optional(),
  direction: z.enum(["dad_owes_kid", "kid_owes_dad"]),
  isPaid: z.coerce.boolean().optional(),
});

export const settlementSchema = z.object({
  kidId: z.string().min(1),
});

export const transactionDetailsSchema = z.object({
  transactionId: z.string().min(1),
  amount: z.coerce.number().positive().max(100000),
  description: z.string().trim().min(2).max(120),
  categoryId: z.string().min(1),
  direction: z.enum(["dad_owes_kid", "kid_owes_dad"]),
});
