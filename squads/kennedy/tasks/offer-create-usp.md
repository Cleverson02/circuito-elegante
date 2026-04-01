# Create a Unique Selling Proposition (USP)

## Metadata
```yaml
task_id: KN_OF_001
agent: kennedy-offers
type: creation
complexity: high
estimated_time: 60-90min
source: "Ultimate Marketing Plan — USP Construction (4 Pathways)"
```

## Purpose

Create a USP so clear and compelling that prospects instantly understand why they should choose you over every alternative. Without a USP, you are a commodity competing only on price — and price competition is a race to the bottom.

> "Without a USP, you are a me-too, commodity competitor, vulnerable to being shopped on price alone. With a powerful USP, you own a position in the market that no one can take from you." — Dan Kennedy

## The Framework: Kennedy's 4 USP Pathways

### Pathway 1: Unique Product / Service Feature
Something about your product literally no one else offers.
- "The only pizza delivered in 30 minutes or it's free" (Domino's)

### Pathway 2: Unique Guarantee / Risk Reversal
A guarantee so bold no competitor will match it.
- "If you find a lower price within 30 days, we'll refund DOUBLE the difference"

### Pathway 3: Unique Audience / Niche Specialization
Serving a specific audience better than generalists.
- "The only financial planner exclusively for dentists in the Southwest"

### Pathway 4: Unique Process / Method
A proprietary system or method that produces superior results.
- "Our patented 7-Step Restoration Process removes stains other cleaners can't"

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    products_services: []
    current_positioning: ""
    years_in_business: ""

  competitors:
    top_3: []
    their_claims: []
    market_gaps: []

  unique_elements:
    product_features: []
    guarantees: []
    specializations: []
    processes: []
    results: []
    credentials: []
```

## Step-by-Step Process

### Step 1: Competitive Landscape Audit
What does everyone in your market claim? What is the "commodity" positioning?

### Step 2: Mine for Uniqueness
Apply all 4 pathways and list EVERY possible unique element.

### Step 3: Test Each Candidate USP
**The USP Strength Test:**
- Can a competitor say the same thing? (If yes, it's NOT a USP)
- Does it matter to the buyer? (If no, it's irrelevant)
- Is it specific and measurable? (If vague, it's weak)
- Can it be proven? (If not, it's a hollow claim)
- Is it memorable? (If forgettable, it won't work)

### Step 4: Craft the USP Statement
Format: "[Audience] choose us because [unique thing] which means [benefit they care about]"

### Step 5: Deploy the USP Everywhere
The USP must appear on:
- Every marketing piece
- Business cards, signage, website
- Sales presentations
- Answering the phone

## Output Template
```yaml
output:
  usp:
    statement: ""
    pathway_used: ""
    proof_points: []
    competitive_advantage: ""
    deployment_plan: []
    test_recommendations: []
```


handoff:
  to: "kennedy-copy"
  trigger: "Offer designed and validated"
  context: "Irresistible offer with guarantee and urgency"


## Quality Gate
```yaml
quality:
  - [ ] USP passes the "Can a competitor say this?" test (NO)
  - [ ] USP matters to the target buyer (verified)
  - [ ] USP is specific and measurable, not vague
  - [ ] USP can be proven with evidence
  - [ ] USP is memorable in one sentence
  - [ ] Deployment plan covers all touchpoints
```

## Handoff
- -> **kennedy-sales-letter** for USP integration into sales copy
- -> **kennedy-brand** for brand positioning alignment
- -> **kennedy-magnetic** for lead magnet integration

---
*Task: KN_OF_001 | Agent: kennedy-offers | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business or competitive information provided"
  - "No unique elements to work with"

elicit:
  - question: "What is unique about your business, product, process, or guarantee?"
    required: true
  - question: "Who are your top 3 competitors and what do they claim?"
    required: true

output_example: |
  ## USP — Output
  **Source Framework:** Ultimate Marketing Plan — 4 Pathways
  **Agent:** kennedy-offers

  - USP statement crafted and tested
  - Competitive differentiation analysis
  - Deployment plan across all touchpoints

completion_criteria:
  - "USP passes strength test"
  - "Competitive analysis complete"
  - "Deployment plan created"
```
