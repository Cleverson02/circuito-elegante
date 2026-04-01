# Write a Bold Guarantee

## Metadata
```yaml
task_id: KN_SL_003
agent: kennedy-sales-letter
type: creation
complexity: medium
estimated_time: 30min
source: "The Ultimate Sales Letter — Step 11 + No B.S. Direct Marketing — Rule #7"
```

## Purpose

Craft a guarantee so bold it removes all risk from the buyer and transfers it to the seller. Kennedy teaches that the guarantee is the single most underused tool in marketing — most businesses either have no guarantee or hide it in fine print.

> "The guarantee should be so strong that it scares you a little. If it doesn't scare you, it's not strong enough to move the needle." — Dan Kennedy

## The Framework: Kennedy's Guarantee System

### The 5 Types of Guarantees (Ascending Boldness)

| Level | Type | Example | Risk Transfer |
|-------|------|---------|---------------|
| 1 | Standard Money-Back | "30-day money-back guarantee" | Low |
| 2 | Extended Money-Back | "365-day no-questions-asked refund" | Medium |
| 3 | Better-Than-Money-Back | "Double your money back if it doesn't work" | High |
| 4 | Results Guarantee | "If you don't get [X result], I'll [Y]" | Very High |
| 5 | Outrageous Guarantee | "I'll pay you $1,000 if this doesn't [result]" | Maximum |

### The Guarantee Formula
```
IF [specific condition met by buyer]
AND [product/service used as directed]
AND [result NOT achieved within timeframe]
THEN [exactly what you'll do — refund, pay them, etc.]
PLUS [they keep the bonuses / materials]
```

## Input Required
```yaml
input:
  product_service: ""
  price_point: ""
  promised_result: ""
  timeframe: ""
  current_guarantee: ""        # If any
  refund_rate_current: ""      # Current refund %
  risk_tolerance: "conservative | moderate | aggressive"
```

## Step-by-Step Process

### Step 1: Identify the #1 Buying Objection
What is the single biggest reason someone would NOT buy? The guarantee must address THIS objection directly.

### Step 2: Match Guarantee to Price Point
```
$1-$97:     Standard or Extended money-back (low friction)
$97-$997:   Results guarantee or Better-than-money-back
$997-$5000: Results guarantee + keep bonuses
$5000+:     Outrageous guarantee + personal commitment
```

### Step 3: Write the Guarantee Copy
Use Kennedy's proven structure:
```
[BOLD HEADLINE]: "My Personal [X]-Day Guarantee"

[CONDITION]: "Use [product] for [X] days..."
[PROMISE]: "If you don't see [specific result]..."
[ACTION]: "Simply [how to claim] and I'll [refund/pay you]..."
[BONUS]: "And you keep everything — the [materials], the [bonuses]..."
[REASON]: "I can offer this because I know [confidence statement]..."
```

### Step 4: Add the "Reason Why"
Always explain WHY you can make such a bold guarantee. This removes skepticism.

### Step 5: Stress-Test the Guarantee
- Would YOU feel comfortable buying with this guarantee?
- Does it address the #1 objection?
- Is it specific enough to be believable?
- Is it bold enough to shift the risk?

## Output Template
```yaml
output:
  guarantee:
    type: ""
    headline: ""
    full_copy: ""
    conditions: []
    timeframe: ""
    specifics: ""
    reason_why: ""
    risk_transfer_level: "/10"
    estimated_impact_on_conversion: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Sales letter complete"
  context: "Validated sales letter ready for deployment"


## Quality Gate
```yaml
quality:
  - [ ] Guarantee addresses the #1 buying objection
  - [ ] Guarantee type matches price point and risk tolerance
  - [ ] Full copy written in Kennedy's guarantee structure
  - [ ] "Reason why" included to justify boldness
  - [ ] Guarantee makes NOT buying feel riskier than buying
  - [ ] Conditions are fair and specific
  - [ ] Guarantee is prominently featured, not hidden
```

## Handoff
- -> **kennedy-sales-letter** for integration into sales letter (KN_SL_001)
- -> **kennedy-offers** for offer stack integration

---
*Task: KN_SL_003 | Agent: kennedy-sales-letter | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No product or service defined"
  - "No promised result articulated"

elicit:
  - question: "What product/service needs a guarantee and what result does it promise?"
    required: true
  - question: "What is your risk tolerance (conservative/moderate/aggressive)?"
    required: false

output_example: |
  ## Bold Guarantee — Output
  **Source Framework:** Ultimate Sales Letter Step 11 + No B.S. Rule #7
  **Agent:** kennedy-sales-letter

  - Guarantee type selected and justified
  - Full guarantee copy written
  - Risk transfer analysis included

completion_criteria:
  - "Guarantee type matches price point"
  - "Full copy follows Kennedy structure"
  - "Reason why included"
```
