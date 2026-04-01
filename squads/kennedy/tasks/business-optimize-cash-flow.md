# Optimize Cash Flow

## Metadata
```yaml
task_id: KN_BZ_003
agent: kennedy-business
type: optimization
complexity: medium
estimated_time: 45min
source: "Ultimate No B.S. Business Success — Five Keys to Multiplied Cash Flow"
```

## Purpose

Apply Kennedy's Five Keys to Multiplied Cash Flow to dramatically improve business profitability without necessarily increasing customer count.

> "You don't need more customers. You need more money from each customer. Increase any ONE of the five keys by just 10% and you'll see a 10% revenue lift. Increase all five by 10% and you'll see a 61% revenue lift." — Dan Kennedy

## The Framework: Five Keys to Multiplied Cash Flow

```
KEY 1: Number of Customers      × 10% = 10% more revenue
KEY 2: Average Transaction Value × 10% = compound effect
KEY 3: Purchase Frequency        × 10% = compound effect
KEY 4: Customer Retention Rate   × 10% = compound effect
KEY 5: Profit Margin Per Sale    × 10% = compound effect
ALL 5: × 10% each              = 61% revenue increase!
```

## Input Required
```yaml
input:
  business: ""
  current_metrics:
    customers: ""
    avg_transaction: ""
    purchase_frequency: ""
    retention_rate: ""
    profit_margin: ""
```

## Step-by-Step Process

### Step 1: Baseline All 5 Keys
Document current state of each key.

### Step 2: Identify Quick Wins per Key
For each key, what is the easiest 10% improvement?

### Step 3: Calculate Compound Impact
Show the math of improving all 5 by even small percentages.

### Step 4: Prioritize and Implement
Which key has the most room for improvement? Start there.

## Output Template
```yaml
output:
  cash_flow_optimization:
    baseline: {}
    improvement_strategies:
      key_1_customers: []
      key_2_transaction: []
      key_3_frequency: []
      key_4_retention: []
      key_5_margin: []
    compound_impact: ""
    priority_order: []
    implementation_plan: []
```


handoff:
  to: "kennedy-offers"
  trigger: "Business assessment complete"
  context: "Business diagnostics and improvement plan"


## Quality Gate
```yaml
quality:
  - [ ] All 5 keys baselined with numbers
  - [ ] Improvement strategies for each key
  - [ ] Compound impact calculated
  - [ ] Priority order established
  - [ ] Implementation plan with timeline
```

## Handoff
- -> **kennedy-offers** for transaction value increases
- -> **kennedy-referrals** for customer count growth
- -> **kennedy-magnetic** for retention improvements

---
*Task: KN_BZ_003 | Agent: kennedy-business | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No current business metrics available"

elicit:
  - question: "What are your current metrics for: customers, avg transaction, frequency, retention, margins?"
    required: true

output_example: |
  ## Cash Flow Optimization — Output
  **Agent:** kennedy-business
  - 5 keys baselined and strategies per key
  - Compound impact calculated
  - Priority implementation plan

completion_criteria:
  - "All 5 keys addressed"
  - "Compound math shown"
  - "Implementation plan created"
```
