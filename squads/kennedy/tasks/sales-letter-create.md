# Create a Complete Sales Letter

## Metadata
```yaml
task_id: KN_SL_001
agent: kennedy-sales-letter
type: creation
complexity: high
estimated_time: 90-120min
source: "The Ultimate Sales Letter (3rd Ed) — 28-Step System"
```

## Purpose

Create a complete direct response sales letter following Dan Kennedy's proven 28-Step Sales Letter System. This is the foundational document of all direct response marketing — a single piece of copy designed to sell, with every element engineered for response.

> "The sales letter is the workhorse of direct response marketing. It does the selling when you can't be there. It never has a bad day, never forgets the pitch, and never asks for a raise." — Dan Kennedy

## The Framework: Kennedy's 28-Step Sales Letter System

### The 28 Steps

| # | Step | Purpose |
|---|------|---------|
| 1 | Get "Inside" the customer | Deep empathy research |
| 2 | What do they really want? | Core desires mapping |
| 3 | Emotional trigger inventory | Fear, greed, guilt, pride, etc. |
| 4 | The offer itself | What are you actually selling? |
| 5 | Is there a damaging admission? | Strategic vulnerability |
| 6 | The big promise / headline | The single most compelling claim |
| 7 | First paragraph hook | Stop them from putting it down |
| 8 | Sub-heads as signposts | Keep them reading |
| 9 | Fascination bullets | Curiosity-driven benefit statements |
| 10 | Proof section | Testimonials, facts, demonstrations |
| 11 | The guarantee | Risk reversal |
| 12 | Call to action | What to do right now |
| 13 | Fear of loss close | Scarcity / deadline / FOMO |
| 14 | P.S. section | The second most-read element |
| 15 | Response device | Make it easy to respond |
| 16 | Graphic enhancements | Bold, underline, handwriting |
| 17 | Edit for length | Long enough to sell, not a word more |
| 18 | Test on a live person | Real feedback before mailing |
| 19 | Address the envelope | A-pile worthy |
| 20 | Write a lift note | "Frankly, I wasn't sure..." |
| 21 | Grabber / lumpy mail insert | Physical attention device |
| 22 | Order form design | A mini sales letter itself |
| 23 | The "Johnson Box" | Pre-headline teaser |
| 24 | Interior elements | Buck slip, brochure, testimonial sheet |
| 25 | Involve the reader | Tokens, stamps, scratch-offs |
| 26 | Personalize | Name, city, specifics |
| 27 | Prepare for production | Print specs, mail specs |
| 28 | Test plan | What to test first |

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    years_in_business: 0
    usp: ""

  offer:
    product_service: ""
    price_point: ""
    primary_benefit: ""
    delivery_method: ""
    guarantee: ""

  audience:
    who: ""
    primary_desire: ""
    primary_fear: ""
    sophistication_level: "beginner | intermediate | experienced"
    awareness_level: "unaware | problem-aware | solution-aware | product-aware"

  proof:
    testimonials: []
    case_studies: []
    statistics: []
    credentials: []

  distribution:
    channel: "direct mail | email | web page | hybrid"
    list_source: ""
    estimated_quantity: ""
```

## Step-by-Step Process

### Step 1: Research & Empathy (Steps 1-3)
Deep dive into the customer's world before writing a single word.

**Customer Empathy Map:**
```
What do they SEE?      → Their daily environment, competitors' offers
What do they HEAR?     → What friends, media, experts tell them
What do they THINK?    → Private doubts, aspirations, beliefs
What do they FEEL?     → Frustrations, fears, hopes
What do they DO?       → Current behaviors, workarounds
What do they WANT?     → The dream outcome, status change
```

**Emotional Trigger Inventory:**
- Fear of loss / missing out
- Greed / desire for gain
- Guilt / obligation
- Pride / status / vanity
- Lust / desire
- Anger / frustration
- Exclusivity / belonging

### Step 2: Construct the Offer (Steps 4-5)
Define what you are selling with brutal specificity.

```yaml
offer_construction:
  core_product: ""
  bonuses: []
  guarantee_type: ""
  guarantee_specifics: ""
  damaging_admission: ""      # Strategic vulnerability that builds trust
  price_justification: ""
  payment_options: []
```

### Step 3: Write the Headline (Step 6)
The headline is 80% of the letter's success. Use Kennedy's 12 formulas:

1. **Warning/Alert:** "WARNING: Don't Even Think About [Action] Until You Read This"
2. **Question:** "Do You Make These [X] Mistakes in [Topic]?"
3. **How-To:** "How to [Desired Result] in [Timeframe] — Even If [Objection]"
4. **News:** "Exposed: The [Industry] Secret That [Benefit]"
5. **Testimonial:** "[Result] in [Timeframe] — Read How [Name] Did It"
6. **Free Offer:** "FREE: [Specific Valuable Thing] Reveals [Benefit]"
7. **Reason Why:** "[X] Reasons Why [Audience] Are Switching to [Product]"
8. **If-Then:** "If You [Condition], Here Is Something You Should Know"
9. **Secrets:** "The Closely Guarded Secrets of [Desired Outcome]"
10. **Challenge:** "Give Me [Timeframe] and I'll Give You [Result]"
11. **Guarantee:** "Guaranteed [Result] or [Consequence]"
12. **Story:** "They Laughed When I [Action] — But When I [Result]..."

### Step 4: Write the Body (Steps 7-14)
Follow this exact sequence:

```
OPENING (Hook) → Stop them, create curiosity
PROBLEM → Agitate the pain they feel
AGITATE → Twist the knife (with empathy)
STORY → Personal Epiphany Bridge
SOLUTION → Introduce your mechanism
BENEFITS → What they get (fascination bullets)
PROOF → Testimonials, facts, demonstrations
OFFER → The full stack with values
GUARANTEE → Bold risk reversal
CTA → Exactly what to do now
URGENCY → Real deadline or scarcity
P.S. → Restate offer + add new benefit
```

### Step 5: Write Fascination Bullets (Step 9)
Kennedy's fascination bullets create irresistible curiosity:

**Formulas:**
- "The [adjective] [noun] that [unexpected benefit]..."
- "Why [common belief] is dead wrong — and what to do instead"
- "The single biggest mistake [audience] make with [topic] (page X)"
- "How to [result] without [common pain/effort]"
- "What [authority figure] knows about [topic] that you don't"
- "[Number] ways to [benefit] — #[X] will surprise you"

### Step 6: Finalize & Produce (Steps 15-28)
Production elements that boost response:

```yaml
production:
  envelope: ""                # Teaser copy, plain, lumpy?
  johnson_box: ""             # Pre-headline summary
  lift_note: ""               # "Frankly, I wasn't going to..."
  grabber: ""                 # Dollar bill, toy, unusual object
  order_form: ""              # Mini sales letter
  personalization: ""         # How to personalize each piece
  response_device: ""         # Phone, URL, QR, mail-back
  test_plan:
    test_1: ""                # Headline A vs B
    test_2: ""                # Offer variation
    test_3: ""                # List segment
```

## Output Template
```yaml
output:
  sales_letter:
    headline: ""
    subheadline: ""
    johnson_box: ""
    opening_paragraph: ""
    problem_section: ""
    story_section: ""
    solution_section: ""
    benefits_bullets: []       # 15-25 fascination bullets
    proof_section: ""
    offer_stack: []
    guarantee: ""
    cta: ""
    urgency_close: ""
    ps_section: ""
    lift_note: ""
    word_count: 0
    estimated_pages: 0
    response_device: ""
    test_plan: []
```


handoff:
  to: "kennedy-media"
  trigger: "Sales letter complete"
  context: "Validated sales letter ready for deployment"


## Quality Gate
```yaml
quality:
  - [ ] Headline uses one of Kennedy's 12 proven formulas
  - [ ] Opening paragraph hooks reader in first 2 sentences
  - [ ] Problem/agitation section creates emotional urgency
  - [ ] Fascination bullets number at least 15
  - [ ] Proof section has minimum 3 different types of proof
  - [ ] Guarantee is bold, specific, and risk-reversing
  - [ ] CTA is crystal clear — one action, no ambiguity
  - [ ] P.S. section restates offer and adds urgency
  - [ ] Letter follows A-Pile / B-Pile principles for delivery
  - [ ] Test plan identifies 3 variables to split-test
```

## Handoff
- -> **kennedy-copy** for fascination bullet refinement (KN_CP_001)
- -> **kennedy-media** for direct mail production specs (KN_MD_001)
- -> **kennedy-audit** for sales letter performance audit (KN_AU_001)

---
*Task: KN_SL_001 | Agent: kennedy-sales-letter | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No target audience defined"
  - "No offer or product specified"
  - "No USP articulated"

elicit:
  - question: "Who is your target audience and what is the primary desire you're addressing?"
    required: true
  - question: "What is your product/service, price point, and guarantee?"
    required: true
  - question: "Do you have testimonials or proof elements available?"
    required: false

output_example: |
  ## Sales Letter — ACTUAL COMPLETED LETTER
  **Product:** Retirement Strategy Consultation for High-Net-Worth Professionals
  **Market:** Executives and business owners, age 50-65, $500K-$3M net worth
  **Offer:** Free retirement strategy review ($1,500 value, limited to 10 people)
  **Control letter from existing client:** 23% response rate, 47% consultation-to-sale conversion

  ---

  ### OUTER ENVELOPE
  [Hand-addressed, first-class stamp]
  "Personal" printed in red in corner
  No sales-y copy on outer envelope (curiosity-based)

  ---

  ### LETTER

  [LETTERHEAD]

  February 14, 2026

  [FIRST NAME],

  If you've built significant wealth through hard work and smart business decisions, this may be the most important letter you read this year.

  Here's why:

  Most successful entrepreneurs are BRILLIANT at making money...but TERRIBLE at protecting it.

  I know because I see it every week. Business owners with $2M-$10M in assets who are:
  - Paying 40-50% in unnecessary taxes
  - Exposed to lawsuits that could wipe them out
  - Missing out on $100K-$500K in wealth-building strategies their competitors are using
  - Worried they won't have enough for retirement (despite looking rich on paper)

  ---

  **Let me be direct: if you haven't had a comprehensive retirement strategy review in the last 2 years, you're almost certainly leaving money on the table.**

  And if you HAVE had one recently? You've probably forgotten most of what you discussed.

  That's exactly why I'm writing...

  ---

  **The Problem With Traditional Retirement Planning**

  Most financial advisors sell products. They push mutual funds and annuities and wrap it all up as "retirement planning."

  But here's what they DON'T do:

  ✗ They don't coordinate your strategy across ALL your assets (business, real estate, investments, insurance)
  ✗ They don't tax-plan YOUR specific situation
  ✗ They don't challenge your business' valuation
  ✗ They don't create real legacy plans that account for your values

  They just... sell products.

  ---

  **How This Became Personal**

  Five years ago, I sat across from a business owner named Tom. He'd built a $12M software company. Worked 60-hour weeks for 15 years.

  His financial advisor had told him: "You're fine for retirement. Keep investing in the market."

  But when we ran the numbers, Tom discovered:
  - His company sale would trigger $4.2M in capital gains taxes (that could be reduced to $800K with proper planning)
  - He was exposing his family to liability that one lawsuit could destroy
  - His kids inherited a $2M tax bill instead of a $6M inheritance

  Tom was ANGRY. Not at his advisor—at himself for not asking the right questions.

  Three months later, with a proper strategy in place, Tom went from "possibly worried" to completely confident. He sold his company 18 months later and kept $1.8M MORE than he would have without proper planning.

  That's a TRUE story. And it happens regularly.

  ---

  **The Specific 7-Point Strategy We Use**

  I won't bore you with jargon. Here's exactly what we analyze:

  **1. TAX OPTIMIZATION** — Where are you overpaying? (Most of our clients save $80K-$300K+ annually)

  **2. ASSET PROTECTION** — What's exposed? (Business assets, real estate, investments)

  **3. BUSINESS VALUATION** — Is your company worth what you think? (We often uncover 20-40% undervaluations)

  **4. SUCCESSION PLANNING** — Will your company go to your kids or the IRS?

  **5. LIQUIDITY STRATEGY** — Do you have enough liquid assets for retirement?

  **6. LEGACY PLANNING** — What are you leaving behind, and how much will taxes steal?

  **7. INSURANCE AUDIT** — Are you over-insured or under-insured?

  ---

  **Here's What ACTUALLY Changes**

  When we execute this strategy with clients, here's what typically happens:

  **Client #1 (Medical Practice Owner):**
  - Before: Worried about retirement, no plan, $4.5M liquid
  - After: $220K annual tax savings + protection strategy + clear path to $8M by retirement
  - Time invested: 4 hours for strategy session

  **Client #2 (Manufacturing Business Owner):**
  - Before: "I'm probably OK" — no real analysis
  - After: Discovered $1.2M business valuation error, implemented tax strategy saving $156K/year
  - Result: Business suddenly worth $2M more

  **Client #3 (Real Estate Investor):**
  - Before: Multiple properties, unclear net worth, confused about tax strategy
  - After: Organized asset map, implemented cost segregation study (saving $89K in taxes year 1), clear 10-year plan

  ---

  **A Completely Risk-Free Offer**

  Because I'm confident this will be valuable, I'm offering:

  **FREE Retirement Strategy Review ($1,500 value)**

  Here's what's included:
  - 90-minute private consultation with me personally
  - Complete analysis of your financial situation
  - Written recommendations with specific strategies
  - NO sales pitch (if you want to work together, we'll discuss that later)
  - You keep all recommendations regardless

  The only catch? I'm only taking on 10 new clients this quarter.

  So this offer expires March 31st, 2026.

  ---

  **How to Claim Your Free Review**

  Step 1: Call my office at 303-555-1234 (ask for Sarah)
  Step 2: Tell her you received this letter and want to schedule your review
  Step 3: We'll find a time that works for you

  That's it. No forms. No questions.

  ---

  **P.S.** — The biggest regret I hear from successful entrepreneurs? "I wish I'd done this 5 years ago." Don't be that person. Call today: 303-555-1234

  **P.P.S.** — This is a limited offer (only 10 spots available). We typically book out 2-3 weeks, so call soon to guarantee your spot.

  ---

  ✓ Headline uses Kennedy's formula #7 ("How [Specific Person] Got [Specific Result]")
  ✓ Damaging admission ("Most entrepreneurs are terrible at protecting wealth")
  ✓ Story with real client example (builds credibility)
  ✓ Specific problem articulation (not generic)
  ✓ Clear offer with real deadline and scarcity
  ✓ Single clear call to action (phone number)
  ✓ P.S. creates urgency
  ✓ Word count: 987 words (2-3 minute read)
  ✓ All 28 steps of Ultimate Sales Letter addressed
  - Fascination bullets (15-25 minimum)
  - Production specs for mailing
  - Test plan with 3 split-test variables

completion_criteria:
  - "All 28 steps addressed in the letter"
  - "Headline uses proven Kennedy formula"
  - "Quality gate checklist passes minimum 8/10"
```
