# CloudLedger

CloudLedger is a private family IOU tracker for Dad and three kids. It supports a calm web dashboard plus deterministic SMS intake through Twilio.

## Getting Started

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

CLOUDLEDGER_DAD_PHONE=+15550000001
CLOUDLEDGER_JESSE_PHONE=+15550000002
CLOUDLEDGER_BROTHER_1_PHONE=+15550000003
CLOUDLEDGER_BROTHER_2_PHONE=+15550000004

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_VALIDATE_SIGNATURE=false
OPENAI_API_KEY=
OPENAI_SMS_MODEL=gpt-5.5-mini
```

Set `TWILIO_VALIDATE_SIGNATURE=true` in production after your deployed webhook URL is stable.

`OPENAI_API_KEY` enables Phase 3 AI cleanup for SMS parsing. CloudLedger still parses deterministically first; OpenAI is used only after the local parser finds an explicit amount and registered sender. `OPENAI_SMS_MODEL` is optional and is set to `gpt-5.5-mini` for this small parsing task.

## Supabase Setup

Run the SQL migration in `supabase/migrations`.

The Phase 1 schema creates:

- `people`
- `categories`
- `transactions`
- `settlements`

It seeds Dad, Jesse, Brother 1, Brother 2, and the starting categories. Replace the placeholder phone numbers with real E.164 phone numbers.

## Twilio SMS Webhook

CloudLedger accepts inbound SMS at:

```text
POST /api/sms/inbound
```

In Twilio Console:

1. Go to **Phone Numbers > Active Numbers**.
2. Choose your CloudLedger number.
3. Under **Messaging**, set **A Message Comes In** to:

```text
https://your-domain.com/api/sms/inbound
```

4. Set method to `POST`.
5. Save.

For local testing, use a public tunnel such as:

```bash
ngrok http 3000
```

Then set the Twilio webhook URL to:

```text
https://your-ngrok-url.ngrok-free.app/api/sms/inbound
```

## SMS Examples

Kids are identified automatically by their sender phone number.

```text
64 Uber Eats
```

Saves as Dad owes that kid `$64.00` for Uber Eats.

```text
to dad 110 shoes
```

Saves as that kid owes Dad `$110.00` for shoes.

```text
dad owes me 116 chalet bbq
```

Saves as Dad owes that kid `$116.00` for Chalet BBQ.

Dad must include the kid name:

```text
Jesse 45 gas
```

Saves as Jesse owes Dad `$45.00` for gas.

```text
Jesse I owe you 80 dinner
```

Saves as Dad owes Jesse `$80.00` for dinner.

If Dad texts:

```text
22 coffee
```

CloudLedger does not save it and replies:

```text
Who is this for? Text it like: 'Jesse 22 coffee.'
```

## Verification

Run:

```bash
npm run test:sms
npm run lint
npm run build
```

## OpenAI SMS Parsing

Phase 3 adds OpenAI-powered cleanup and ambiguity handling for inbound SMS. The webhook still enforces hard rules in application code:

- It never saves a transaction unless an amount is explicitly present.
- Dad-submitted SMS must resolve to one registered kid.
- AI output is validated with Zod before it can be inserted.
- AI confidence below `0.85` is saved with `needs_review = true`.
- The original SMS is stored in `raw_sms_text`.

If `OPENAI_API_KEY` is missing or the AI response fails validation, CloudLedger falls back to deterministic parsing.

## Phase 2 Scope

SMS intake began deterministic-only. Phase 3 now layers OpenAI parsing on top without replacing deterministic safety checks.
