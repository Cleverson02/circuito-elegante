# Setup Customer Retention System

## Metadata
```yaml
task_id: KN_MG_003
agent: kennedy-magnetic
type: setup
complexity: high
estimated_time: 60min
source: "Magnetic Marketing — Pillar 3: Retention"
```

## Purpose

Build a systematic customer retention program. Kennedy's Magnetic Marketing operates on 3 pillars: Attraction, Conversion, and Retention. Most businesses focus on the first two and neglect the third — which is where 80% of lifetime profit comes from.

> "It costs 5-7x more to get a new customer than to keep an existing one. Yet most businesses spend 95% of their budget on acquisition and 5% on retention. That's insanity." — Dan Kennedy

## The Framework: Kennedy's 5 Retention Strategies

### Strategy 1: Stay in Touch Constantly
Monthly newsletter, weekly email, regular direct mail. Out of sight = out of mind.

### Strategy 2: Provide Ongoing Value
Education, entertainment, insider access. Give them reasons to stay connected.

### Strategy 3: Create Community
Membership, events, peer groups. People don't leave tribes easily.

### Strategy 4: Ascend Them Up the Ladder
Always have a next purchase available. Don't let them plateau.

### Strategy 5: Prevent "Holes in the Bucket"
Identify and fix every reason customers leave.

## Input Required
```yaml
input:
  business:
    name: ""
    customer_base_size: ""
    average_customer_value: ""
    average_customer_lifespan: ""
    current_retention_rate: ""
    main_reasons_customers_leave: []

  current_retention:
    newsletter: false
    email_frequency: ""
    direct_mail: false
    events: false
    community: false
    loyalty_program: false
```

## Step-by-Step Process

### Step 1: Calculate Customer Lifetime Value (LCV)
```
LCV = Average Purchase x Purchase Frequency x Customer Lifespan
Current LCV: $________
Target LCV (with retention program): $________
```

### Step 2: Audit "Holes in the Bucket"
Kennedy identifies 5 common holes:
1. **No follow-up after first purchase** — They feel forgotten
2. **No regular communication** — Out of sight, out of mind
3. **No ascension path** — Nowhere to go next
4. **No community** — No emotional ties
5. **No loyalty recognition** — They feel unappreciated

### Step 3: Design the Monthly Communication Plan
```yaml
monthly_plan:
  week_1: ""                   # Newsletter / valuable content
  week_2: ""                   # Special offer / ascension
  week_3: ""                   # Education / case study
  week_4: ""                   # Community event / recognition
  direct_mail: ""              # Monthly printed piece
```

### Step 4: Create the Ascension System
What can customers buy next? Map the path:
```
First Purchase → Upsell → Cross-sell → Premium → VIP / Continuity
```

### Step 5: Build Reactivation for At-Risk Customers
Identify signals of customer attrition and create rescue campaigns.

## Output Template
```yaml
output:
  retention_system:
    current_lcv: ""
    target_lcv: ""
    holes_identified: []
    monthly_plan: {}
    ascension_path: []
    reactivation_triggers: []
    estimated_retention_improvement: ""
    estimated_revenue_impact: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Magnetic system designed"
  context: "Lead magnets, shock-and-awe, follow-up sequences"


## Quality Gate
```yaml
quality:
  - [ ] LCV calculated with target improvement
  - [ ] All 5 "holes in the bucket" assessed
  - [ ] Monthly communication plan designed
  - [ ] Ascension path mapped with specific offers
  - [ ] Reactivation triggers and campaigns defined
  - [ ] Direct mail included in retention mix
  - [ ] Revenue impact estimated
```

## Handoff
- -> **kennedy-referrals** for referral program integration
- -> **kennedy-copy** for retention communication copywriting
- -> **kennedy-media** for multi-channel delivery

---
*Task: KN_MG_003 | Agent: kennedy-magnetic | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No customer base data available"
  - "No current retention rate known"

elicit:
  - question: "What is your current customer base size and average customer value?"
    required: true
  - question: "What retention activities do you currently do?"
    required: false

output_example: |
  ## Retention System — Output
  **Source Framework:** Magnetic Marketing Pillar 3
  **Agent:** kennedy-magnetic

  - LCV analysis and target
  - 5 holes audit
  - Monthly communication plan
  - Ascension path

completion_criteria:
  - "LCV calculated"
  - "Monthly plan designed"
  - "Ascension path mapped"
```
