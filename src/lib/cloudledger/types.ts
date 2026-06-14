export type PersonRole = "dad" | "kid";
export type Direction = "dad_owes_kid" | "kid_owes_dad";
export type Source = "web" | "sms";

export type Person = {
  id: string;
  name: string;
  role: PersonRole;
  phone: string;
  onboarding_completed: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export type Transaction = {
  id: string;
  kid_id: string;
  submitted_by_id: string;
  amount_cents: number;
  description: string;
  category_id: string;
  direction: Direction;
  source: Source;
  raw_sms_text: string | null;
  confidence: number | null;
  needs_review: boolean;
  review_reason: string | null;
  is_paid: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Settlement = {
  id: string;
  kid_id: string;
  submitted_by_id: string;
  amount_cents: number;
  direction: Direction;
  note: string | null;
  created_at: string;
};

export type TransactionWithRelations = Transaction & {
  kid: Person;
  submitted_by: Person;
  category: Category;
};

export type BalanceSummary = {
  kid: Person;
  dadOwesCents: number;
  kidOwesCents: number;
  settlementAdjustmentCents: number;
  netCents: number;
};
