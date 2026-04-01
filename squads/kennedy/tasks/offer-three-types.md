# Design Three Levels of Offers

## Metadata
```yaml
task_id: KN_OF_004
agent: kennedy-offers
type: creation
complexity: medium
estimated_time: 45min
source: "Brass Balls Course — Three Types of Offers"
```

## Purpose

Design offers at three levels — Basic, Premium, and Ultra-Premium — using Kennedy's principle that you should always give prospects a choice of how much to invest. Having multiple offer tiers increases both total revenue and average transaction value.

> "Never give a prospect just one option. Give them three. The cheapest makes the middle look reasonable, and the most expensive makes the middle look like a bargain." — Dan Kennedy

## The Framework: Three-Tier Offer Architecture

### Tier 1: BASIC (The Entry Point)
- Lowest price, core deliverable only
- Purpose: Convert price-sensitive buyers
- Margin: Lowest, but creates a buyer

### Tier 2: PREMIUM (The Sweet Spot)
- Mid-range price, core + bonuses + support
- Purpose: Where most revenue comes from (60-70% choose this)
- Margin: Healthy, sustainable

### Tier 3: ULTRA-PREMIUM (The Aspirational)
- Highest price, everything + done-for-you + VIP
- Purpose: Capture maximum value from best clients (10-20%)
- Margin: Highest, premium positioning

### The Contrast Principle
The existence of Ultra-Premium makes Premium look like a great deal.

## Input Required
```yaml
input:
  product_service: ""
  audience: ""
  current_price: ""
  deliverables: []
  additional_services: []
```

## Step-by-Step Process

### Step 1: Define Core Deliverable (for Basic tier)
What is the minimum you can deliver that still solves the problem?

### Step 2: Add Value Layers (for Premium tier)
What makes the experience better, faster, or more supported?

### Step 3: Create the VIP Experience (for Ultra-Premium)
What would the "white glove" version look like?

### Step 4: Price Each Tier
Premium should be 2-3x Basic. Ultra-Premium should be 3-5x Premium.

### Step 5: Name Each Tier
Give each tier a name that conveys value, not just price.

## Output Template
```yaml
output:
  three_tier_offer:
    tier_1_basic:
      name: ""
      price: ""
      includes: []
    tier_2_premium:
      name: ""
      price: ""
      includes: []
    tier_3_ultra_premium:
      name: ""
      price: ""
      includes: []
    expected_distribution: "20% / 60% / 20%"
    average_transaction_increase: ""
```


handoff:
  to: "kennedy-copy"
  trigger: "Offer designed and validated"
  context: "Irresistible offer with guarantee and urgency"


## Quality Gate
```yaml
quality:
  - [ ] Three distinct tiers with clear differentiation
  - [ ] Each tier named (not just "Basic/Premium/VIP")
  - [ ] Price ratios are logical (2-3x jumps)
  - [ ] Premium tier designed as the "obvious" best choice
  - [ ] Ultra-Premium makes Premium look like a bargain
  - [ ] Each tier delivers real value at its price point
```

## Handoff
- -> **kennedy-sales-letter** for offer presentation
- -> **kennedy-copy** for tier descriptions

---
*Task: KN_OF_004 | Agent: kennedy-offers | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No product/service to tier"
  - "No audience defined"

elicit:
  - question: "What do you currently sell and at what price point?"
    required: true
  - question: "What additional services or value could you add?"
    required: false

output_example: |
  ## Three-Tier Offer — Example Output
  **Source Framework:** Brass Balls Course — Three Types of Offers
  **Agent:** kennedy-offers
  **Product:** Done-For-You Sales Letter Service
  **Audience:** E-commerce businesses ($500K-$5M revenue)

  ### TIER 1: BASIC — "The Self-Service Blueprint"
  **Price:** $297
  **Includes:**
  - 28-Step Sales Letter Framework (template)
  - 12 Fill-in-the-Blank Headline Formulas
  - Self-guided workbook (PDF)
  - Email support (48-hour response)
  **Ideal for:** DIY entrepreneurs, tight budgets

  ### TIER 2: PREMIUM — "The Done-With-You Letter" ⭐ (Expected: 60-70% choose this)
  **Price:** $2,997
  **Includes:**
  - Everything in Basic PLUS:
  - 90-minute kickoff consultation
  - 28-Step framework customized to their business
  - 2 rounds of revisions
  - Fascination bullet optimization
  - A/B testing setup guide
  - Phone/email support (24-hour response)
  - Results tracking spreadsheet template
  **Ideal for:** Serious entrepreneurs, 90-day ROI focus

  ### TIER 3: ULTRA-PREMIUM — "The Done-For-You Masterpiece"
  **Price:** $12,000
  **Includes:**
  - Everything in Premium PLUS:
  - I write the entire sales letter FOR you (you provide brief)
  - 5 complete headline options (tested batch)
  - Full offer architecture design (bonuses, guarantee, urgency)
  - Video walkthrough of your completed letter
  - 60-day A/B test management (I run it, you monitor)
  - Shock-and-Awe package design consultation
  - VIP status: Priority support, phone availability
  - Performance guarantee: If letter doesn't beat industry benchmarks, revisions free
  **Ideal for:** High-revenue businesses, time-constrained, serious scaling

  ### Contrast Principle Analysis:
  - Ultra-Premium ($12,000) makes Premium ($2,997) look like an incredible bargain
  - Premium has ALL the elements that matter (customization, revisions, support)
  - Basic serves as price anchor to make Premium seem not-that-expensive
  - Expected revenue distribution: 15-20% Basic / 60-70% Premium / 10-15% Ultra-Premium
  - **Average transaction value increase:** From $297 (single sale) → $3,500+ (mix)

completion_criteria:
  - "Three distinct tiers designed with different value levels"
  - "Pricing follows contrast principle (2-3x jumps: $297 → $2,997 → $12,000)"
  - "Premium positioned as obvious best choice (has 60-70% of value at 25% of price)"
  - "Ultra-Premium makes Premium look like bargain (5x price for 2x deliverables)"
  - "Each tier solves a different prospect pain point"
  - "Tier names convey value, not just price level"
```
