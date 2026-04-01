# Reactivate Lost Customers

## Metadata
```yaml
task_id: KN_RF_003
agent: kennedy-referrals
type: creation
complexity: medium
estimated_time: 45-60min
source: "Ultimate No BS Referral Machine — Lost Customer Reactivation"
```

## Purpose

Design and execute a lost customer reactivation campaign. Kennedy teaches that your past customers are the most profitable audience you have — they already know, like, and trust you. Getting them back is 5-7x cheaper than finding new customers.

> "Your biggest gold mine is not out there looking for new customers. It's right in your filing cabinet — the customers who bought from you once and never came back." — Dan Kennedy

## The Framework: Lost Customer Reactivation System

### The 4 Reactivation Approaches

| Approach | Message | Best For |
|----------|---------|----------|
| 1. "We Miss You" | Personal, emotional appeal | Relationship businesses |
| 2. "What Did We Do Wrong?" | Feedback request + re-engagement | Service businesses |
| 3. "Welcome Back" Offer | Special deal for returning customers | Product businesses |
| 4. "A Lot Has Changed" | Update on new products/improvements | Evolving businesses |

### Reactivation Sequence (Multi-Touch)
```
Touch 1: Personal letter ("We miss you")
Touch 2: Special offer (exclusive for past customers)
Touch 3: Survey ("What would bring you back?")
Touch 4: Final offer ("Last chance for this deal")
Touch 5: Phone call (for high-value customers)
```

## Input Required
```yaml
input:
  business: ""
  lost_customer_count: ""
  average_customer_value: ""
  time_since_last_purchase: ""
  reason_for_leaving: ""       # If known
  reactivation_offer: ""
```

## Step-by-Step Process

### Step 1: Identify Lost Customers
Who hasn't purchased in [X months]? Segment by value.

### Step 2: Choose Reactivation Approach
Match approach to likely reason for leaving.

### Step 3: Write the Reactivation Sequence
Multi-touch campaign over 4-6 weeks.

### Step 4: Create a Special Offer
Exclusive to returning customers — makes them feel valued.

### Step 5: Track Reactivation Results
How many came back? What was the ROI?

## Output Template
```yaml
output:
  reactivation:
    lost_customer_segment: ""
    approach: ""
    sequence: []
    special_offer: ""
    projected_reactivation_rate: ""
    projected_revenue: ""
```


handoff:
  to: "kennedy-business"
  trigger: "Referral system designed"
  context: "Referral mechanics and incentive structure"


## Quality Gate
```yaml
quality:
  - [ ] Lost customers identified and segmented
  - [ ] Approach matches likely reason for leaving
  - [ ] Multi-touch sequence (minimum 4 touches)
  - [ ] Special offer exclusive to returning customers
  - [ ] Personal tone (not mass-market feel)
  - [ ] Tracking established for reactivation results
```

## Handoff
- -> **kennedy-copy** for reactivation letter writing
- -> **kennedy-media** for multichannel delivery

---
*Task: KN_RF_003 | Agent: kennedy-referrals | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No lost customer data available"

elicit:
  - question: "How many past customers have stopped buying and how long ago?"
    required: true
  - question: "Do you know why they left?"
    required: false

output_example: |
  ## Lost Customer Reactivation — Output
  **Source Framework:** Lost Customer Reactivation System
  **Agent:** kennedy-referrals

  - Lost customers segmented
  - Multi-touch reactivation sequence
  - Special returning offer designed

completion_criteria:
  - "Customers segmented"
  - "Multi-touch sequence created"
  - "Special offer designed"
```
