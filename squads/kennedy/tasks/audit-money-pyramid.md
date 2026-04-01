# Analyze Money Pyramid Position

## Metadata
```yaml
task_id: KN_AU_002
agent: kennedy-audit
type: analysis
complexity: medium
estimated_time: 30-45min
source: "No B.S. Direct Marketing — Money Pyramid Framework"
```

## Purpose

Analyze where a business sits on Kennedy's Money Pyramid and design strategies to move UP the pyramid. The Money Pyramid reveals that most businesses fish in the most crowded, least profitable waters.

> "The Money Pyramid shows you where the REAL money is. Most businesses compete at the bottom — fighting over the 60% who live paycheck to paycheck. The smart money targets the top 20% where the wealth is concentrated." — Dan Kennedy

## The Framework: Kennedy's Money Pyramid

```
        /\
       /  \     1% — Ultra Rich ($10M+)
      /----\    4% — Rich ($1M-$10M)
     /------\   15% — Comfortable ($250K-$1M)
    /--------\  60% — Living Paycheck to Paycheck
   /----------\ 20% — Broke / Struggling
  /____________\
```

### Where Are You Fishing?
- Bottom 80%: High volume, low prices, heavy competition, thin margins
- Top 20%: Lower volume, premium prices, less competition, fat margins
- Top 5%: Exclusivity, ultra-premium, minimal competition, extraordinary margins

## Input Required
```yaml
input:
  business: ""
  current_customer_profile: ""
  average_transaction: ""
  pricing_tier: ""
  target_pyramid_level: ""
```

## Step-by-Step Process

### Step 1: Identify Current Pyramid Position
Where do your current customers sit on the pyramid?

### Step 2: Calculate Revenue Opportunity by Level
What would revenue look like if you moved up one level?

### Step 3: Design the Ascension Strategy
What needs to change to attract higher-level clients?

### Step 4: Create the Premium Tier
Design an offer for the next level up.

## Output Template
```yaml
output:
  money_pyramid:
    current_position: ""
    target_position: ""
    revenue_opportunity: ""
    ascension_strategy: []
    changes_needed:
      positioning: ""
      pricing: ""
      offer: ""
      marketing: ""
    timeline: ""
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Marketing audit complete"
  context: "Audit findings and 90-day action plan"


## Quality Gate
```yaml
quality:
  - [ ] Current pyramid position identified with data
  - [ ] Revenue opportunity calculated
  - [ ] Ascension strategy is specific and actionable
  - [ ] Changes needed clearly defined
  - [ ] Timeline is realistic
```

## Handoff
- -> **kennedy-affluent** for premium positioning
- -> **kennedy-offers** for premium offer design

---
*Task: KN_AU_002 | Agent: kennedy-audit | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business or customer data provided"

elicit:
  - question: "Describe your current customer profile and average transaction value."
    required: true

output_example: |
  ## Money Pyramid Analysis — Output
  **Source Framework:** Money Pyramid
  **Agent:** kennedy-audit

  - Current position mapped
  - Revenue opportunity calculated
  - Ascension strategy designed

completion_criteria:
  - "Current position identified"
  - "Revenue opportunity calculated"
  - "Strategy designed"
```
