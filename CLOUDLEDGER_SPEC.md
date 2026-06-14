# CloudLedger Product Spec

Build a private family web app called **CloudLedger**.

CloudLedger helps a dad and his three kids track small amounts owed between Dad and each kid. It should feel simple, beautiful, calm, and almost euphoric to use. The whole experience should feel like a peaceful dashboard floating above the clouds, not like a budgeting spreadsheet.

The goal is to remove the annoying back-and-forth of tracking who paid for what. Each person should be able to quickly text a shared phone number or enter an item in the app, and the app should automatically add it to the correct balance.

## Users

The app is designed for four users:

- Dad
- Jesse
- Brother 1
- Brother 2

Each person logs in with their phone number. Their phone number determines who they are.

- When a kid logs in, the app automatically shows only that kid's balance with Dad.
- When Dad logs in, he sees all three kids and the full family picture.

The app should be private, lightweight, and built for real daily use.

## Visual Style And Feel

The app should feel heavenly, soft, calm, and premium.

Visual direction:

- Above-the-clouds atmosphere
- Light sky gradients
- Soft whites, pale blues, warm creams, subtle lavender, and gentle gold accents
- Floating cards that feel like they are sitting in mist or sunlight
- Rounded corners everywhere
- Soft shadows
- Glassmorphism-style panels
- Clean spacing
- Smooth, calm animations
- Minimal clutter
- No harsh finance-app look
- No aggressive colors
- No dense tables on the main dashboard
- A beautiful personal app, not an accounting system

The main dashboard should feel like opening a calm sky cockpit for family IOUs.

Use a cloud-like background with a subtle gradient. Cards should float above it. The main balance number should feel central and satisfying. The app should feel peaceful enough that checking balances does not feel annoying.

Suggested design elements:

- Soft cloud background component
- Floating translucent cards
- Pill-shaped filters
- Gentle category badges
- Large balance cards
- Soft settled state with a calm success message
- Small tasteful icons for food, clothing, transport, subscriptions, errands, gifts, and other
- Very clean mobile layout

This app will often be used on a phone, so design mobile-first.

## User Experience

The app should feel extremely easy.

A kid should be able to:

1. Log in with phone number.
2. See a personal greeting.
3. Instantly see whether Dad owes them money or they owe Dad.
4. Add a new item in one quick form.
5. View recent transactions.
6. Filter transactions by category, date, paid/unpaid, and direction.
7. Mark items as paid or settled.
8. Review anything the system was unsure about.

Dad should be able to:

1. Log in with phone number.
2. See one balance card per kid.
3. See the total family net balance.
4. Add an item for any kid.
5. Text the app and specify the kid by name.
6. Filter all transactions by kid, category, date, paid/unpaid, and direction.
7. Review unclear entries.
8. Mark transactions as paid or settled.

Default assumptions:

- If Jesse, Brother 1, or Brother 2 adds an item, assume Dad owes that kid.
- If Dad adds an item, assume that kid owes Dad, but Dad must specify which kid the item belongs to.
- Users can override the direction manually if needed.

## Core Dashboard Behavior

### Kid Dashboard

When a kid logs in, the dashboard should be filtered to that kid only.

Example greeting:

> Welcome back, Jesse

The main card should show one clear statement:

- Dad owes you $236.50
- You owe Dad $42.00
- All settled

The page should include:

- Main balance card
- Quick add transaction form
- Recent transactions
- Category breakdown
- Paid/unpaid toggle
- Review queue if anything needs clarification

The kid should not see siblings' balances or transactions.

The dashboard should feel personal. It should not feel like an admin panel.

### Dad Dashboard

When Dad logs in, he should see the full picture.

The dashboard should include:

- Total family net balance
- One card for each kid
- Recent transactions across all kids
- Filter by kid
- Filter by category
- Filter by paid/unpaid
- Quick add form with a kid selector
- Review queue

Each kid card should clearly say:

- Dad owes Jesse $X
- Jesse owes Dad $X
- Settled

Dad should be able to click a kid card and see only that kid's transaction history.

## SMS Behavior

The app should integrate with Twilio so each person can text one shared phone number.

The sender's phone number should identify who is texting.

### If A Kid Texts The Number

The app should automatically associate the transaction with that kid.

If the kid texts:

```text
64 Uber Eats
```

The app should interpret it as:

- Kid: sender
- Amount: $64
- Description: Uber Eats
- Category: Food / Delivery
- Direction: Dad owes kid

If the kid texts:

```text
to dad 110 shoes
```

The app should interpret it as:

- Kid: sender
- Amount: $110
- Description: shoes
- Category: Clothing / Shopping
- Direction: kid owes Dad

If the kid texts:

```text
dad owes me 116 chalet bbq
```

The app should interpret it as:

- Kid: sender
- Amount: $116
- Description: Chalet BBQ
- Category: Food / Delivery
- Direction: Dad owes kid

### If Dad Texts The Number

Dad must specify which kid the transaction relates to.

If Dad texts:

```text
Jesse 45 gas
```

The app should interpret it as:

- Kid: Jesse
- Amount: $45
- Description: gas
- Category: Travel / Transport
- Direction: Jesse owes Dad

If Dad texts:

```text
Jesse I owe you 80 dinner
```

The app should interpret it as:

- Kid: Jesse
- Amount: $80
- Description: dinner
- Category: Food / Delivery
- Direction: Dad owes Jesse

If Dad texts:

```text
22 coffee
```

The app should not save the transaction because the kid is unclear.

It should reply:

```text
Who is this for? Text it like: 'Jesse 22 coffee.'
```

### SMS Confirmation Messages

After saving an SMS entry, the app should reply with a clean confirmation.

Examples:

```text
Added: Dad owes Jesse $64.00 for Uber Eats - Food / Delivery
```

```text
Added: Jesse owes Dad $110.00 for shoes - Clothing / Shopping
```

If the app cannot find an amount, reply:

```text
I couldn't find an amount. Try: '64 Uber Eats.'
```

If the app is unsure, it should either ask for clarification or save the item as needing review.

Example:

```text
I saved this for review because I wasn't fully sure: 'dinner thing from yesterday.'
```

## Manual Web Entry

The web app should also have a quick add form.

For kids:

- Kid is automatically set to the logged-in user.
- Default direction is Dad owes me.
- They enter amount, description, category, and optional note.
- They can switch direction to "I owe Dad" if needed.

For Dad:

- Dad must select which kid the item relates to.
- Default direction is kid owes Dad.
- Dad can switch direction to Dad owes kid.
- Dad enters amount, description, category, and optional note.

The form should be fast and satisfying to use. It should not feel like filling out a finance form.

## Transaction Features

Each transaction should have:

- Kid
- Submitted by
- Amount
- Description
- Category
- Direction
- Source: SMS or web
- Raw SMS text, if applicable
- Confidence score, if parsed by AI
- Needs review status
- Paid/unpaid status
- Created date
- Updated date

Transactions should support:

- Edit
- Delete
- Mark as paid
- Mark as unpaid
- Filter by kid
- Filter by category
- Filter by direction
- Filter by source
- Filter by paid/unpaid
- Filter by date range
- Search by description

For kids, all transaction views should only show their own entries.

For Dad, transaction views should show all entries and allow filtering.

## Categories

The app should automatically categorize items.

Starting categories:

- Food / Delivery
- Clothing / Shopping
- Travel / Transport
- Subscriptions
- Errands
- Gifts
- Health
- Entertainment
- Other

Examples:

- Uber Eats, Chalet BBQ, St-Hubert -> Food / Delivery
- Zara, Simons, Massimo, shoes -> Clothing / Shopping
- Gas, Uber, taxi, parking -> Travel / Transport
- Claude, Netflix, Spotify -> Subscriptions
- Wiper fluid, pharmacy, supplies -> Errands

If uncertain, use Other and mark the transaction as needing review.

## AI Parsing

Use OpenAI to parse natural language SMS messages into structured data.

The parser should return:

- Amount
- Description
- Category
- Direction
- Kid name, if Dad submitted it
- Confidence
- Needs review
- Reason

Important rules:

- Never invent an amount.
- Never save a Dad-submitted transaction unless the kid is clear.
- If the sender is a kid and no direction is stated, default to Dad owes kid.
- If the sender is Dad and no direction is stated, default to kid owes Dad.
- If the text clearly says "to dad", "owe dad", "I owe dad", or similar, direction is kid owes Dad.
- If the text clearly says "dad owes me", "I owe Jesse", "pay Jesse back", or similar, direction is Dad owes kid.
- If confidence is low, save as needing review or ask a clarification by SMS.
- Store the original raw text.

Use deterministic parsing first where obvious, then AI for cleanup, category, direction, and ambiguity.

## Review Queue

The app should have a review page for unclear entries.

Items should appear here when:

- AI confidence is low
- Category is uncertain
- Direction is uncertain
- Dad's SMS did not clearly identify a kid
- Amount or description seems incomplete

A review card should let the user correct:

- Amount
- Description
- Category
- Direction
- Kid, if Dad is reviewing
- Paid/unpaid status

After approval, the item should become a normal transaction.

## Settlement Behavior

The app should support marking individual transactions as paid.

It should also support adding a settlement payment.

Examples:

- Dad paid Jesse $200
- Jesse paid Dad $50

The balance should update accordingly.

There should be a clear history of settlements so the app does not simply erase what happened.

## Balance Logic

For each kid:

- Dad owes kid total: sum unpaid transactions where direction is Dad owes kid.
- Kid owes Dad total: sum unpaid transactions where direction is kid owes Dad.
- Net balance: Dad owes kid total minus kid owes Dad total, adjusted for settlements.

Display:

- If net is positive: Dad owes [kid] $X
- If net is negative: [Kid] owes Dad $X
- If net is zero: Settled

The app should always make direction visually clear so nobody gets confused.

## Suggested Pages

### `/login`

Phone number login. Should feel calm and premium, with a simple card in the center of a cloud background.

### `/dashboard`

Role-aware dashboard. Kid sees only their own Dad balance. Dad sees everyone.

### `/transactions`

Full transaction history with filters. Kids see only their own. Dad sees all.

### `/add`

Manual quick add page.

### `/review`

Unclear entries that need review.

### `/settings`

Basic profile page showing name, role, and phone number.

## Suggested Components

Create reusable components:

- `CloudBackground`
- `FloatingCard`
- `BalanceHero`
- `KidBalanceCard`
- `QuickAddForm`
- `TransactionTable`
- `TransactionFilters`
- `TransactionRow`
- `CategoryBadge`
- `DirectionBadge`
- `ReviewCard`
- `PhoneLoginForm`
- `EmptyState`
- `SettledState`

The UI should feel custom and polished, not like default boilerplate.

## Security And Privacy

This is a private family app.

Requirements:

- Only the four registered phone numbers should be allowed.
- Phone number determines identity.
- Users should not be able to spoof another person from the web app.
- Kids should only see their own balances and transactions.
- Dad can see all.
- Use Supabase Row Level Security.
- Validate all API input.
- Never trust client-submitted user IDs.
- Never expose secret keys in the browser.
- Use environment variables for Supabase, Twilio, and OpenAI keys.
- Store raw SMS text for auditability.
- Keep a clear transaction history.

## Tech Stack

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase database and auth
- Supabase Row Level Security
- Twilio SMS webhook
- OpenAI API for SMS parsing and categorization
- Vercel deployment

Include:

- Supabase SQL migrations
- Seed data for the four users and categories
- `.env.example`
- `README.md` with setup instructions
- Twilio webhook setup instructions
- Supabase auth setup instructions
- Vercel deployment instructions

## Important Product Principle

Do not build this like a public fintech product.

Build it like a beautiful private family ledger that solves one annoying problem very well.

The app should be fast, calm, simple, and reliable.

The user should be able to answer one question instantly:

> Who owes who, and how much?

## Basic Rundown

CloudLedger is a private IOU tracker for Dad and his three kids. Each person can text a shared phone number or use the web app to add expenses. The app automatically identifies who submitted the item by phone number, associates the transaction with the right kid, categorizes it, determines whether Dad owes the kid or the kid owes Dad, and updates the correct balance.

Kids only see their own balance with Dad, while Dad can see all three kids. The experience should be beautiful, calm, cloud-like, and extremely easy to use.
