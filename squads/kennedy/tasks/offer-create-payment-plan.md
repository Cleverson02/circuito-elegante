# Create Payment Plan Strategy

## Metadata
```yaml
task_id: KN_OF_005
agent: kennedy-offers
type: creation
complexity: low
estimated_time: 20min
source: "Brass Balls Course — Payment Plan Architecture"
```

## Purpose
Design payment plans that increase conversions without destroying cash flow. Kennedy teaches that payment plans should make the price feel insignificant while protecting the business.

> "A payment plan isn't a discount. It's a way to make the decision easier while actually charging MORE in total." — Dan Kennedy

## The Framework: Payment Plan Rules
1. Payment plan total should be 10-20% MORE than pay-in-full
2. Pay-in-full gets a "discount" (actually the real price)
3. First payment should be meaningful (not $1)
4. Number of payments = 3-6 (not 12+)
5. Auto-billing mandatory

## Input Required
```yaml
input:
  product_price: ""
  audience_price_sensitivity: ""
  delivery_timeline: ""
```

## Output Template
```yaml
output:
  payment_plan:
    pay_in_full: ""
    payment_plan_total: ""
    per_payment: ""
    number_of_payments: ""
    first_payment: ""
    savings_message: ""
```


handoff:
  to: "kennedy-copy"
  trigger: "Offer designed and validated"
  context: "Irresistible offer with guarantee and urgency"


## Quality Gate
```yaml
quality:
  - [ ] Plan total is 10-20% more than pay-in-full
  - [ ] First payment is meaningful
  - [ ] 3-6 payments maximum
  - [ ] Auto-billing specified
  - [ ] Savings message framed correctly
```

---
*Task: KN_OF_005 | Agent: kennedy-offers | Version: 1.0*


## Payment Plan Strategy

**3 Payment Plan Archetypes:**

1. **The 3-Pay** (most common)
   - $1,000 offer → $350 x 3
   - Increases accessibility
   - Improves cash flow predictability

2. **The Performance-Based**
   - "Pay X now, Y if results"
   - Builds confidence
   - Aligns incentives

3. **The Subscription**
   - Monthly recurring
   - Highest lifetime value
   - Requires trust


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No price point defined"
elicit:
  - question: "What is the product price and how price-sensitive is the audience?"
    required: true
output_example: |
  ## Payment Plan — Example Output
  **Source:** Brass Balls Course — Payment Plan Architecture
  **Agent:** kennedy-offers

  ### Case: High-Ticket Coaching Program

  **Pay-In-Full Option:**
  - Price: $5,000
  - Positioning: "Complete investment, locked-in price"

  **3-Payment Plan Option:**
  - Payment 1: $2,000 (first month, upfront commitment)
  - Payment 2: $1,900 (month 2)
  - Payment 3: $1,900 (month 3)
  - **Total: $5,800** (16% premium vs pay-in-full)
  - Auto-billing required
  - Messaging: "Spread your investment across 3 months and get started immediately"

  ### Quality Metrics:
  - ✓ Plan total ($5,800) > pay-in-full ($5,000)
  - ✓ First payment ($2,000) is meaningful
  - ✓ 3 payments (within 3-6 range)
  - ✓ Auto-billing specified
  - ✓ Messaging frames as convenience, not discount

  **Expected outcome:** 40-60% of prospects choose payment plan (higher conversion, higher total revenue)
completion_criteria:
  - "Both options priced"
  - "Plan total > pay-in-full (10-20% premium)"
  - "First payment is meaningful (not $1)"
  - "Payment count is 3-6 maximum"
  - "Auto-billing specified"
```
