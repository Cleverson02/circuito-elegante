# Create Business Turnaround Plan

## Metadata
```yaml
task_id: KN_BZ_002
agent: kennedy-business
type: strategy
complexity: high
estimated_time: 60-90min
source: "Ultimate No B.S. Business Success — 8-Step Turnaround System"
```

## Purpose

Design a business turnaround plan using Kennedy's 8-Step Turnaround System. When a business is struggling, this systematic approach stops the bleeding and creates a path to recovery.

> "Every struggling business has more assets than it realizes. The turnaround isn't about finding something new — it's about properly exploiting what you already have." — Dan Kennedy

## The Framework: 8-Step Turnaround System

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Stop the Bleeding | Immediate (Day 1) |
| 2 | Generate Immediate Cash | Week 1 |
| 3 | Reactivate Past Customers | Week 1-2 |
| 4 | Maximize Current Customers | Week 2-3 |
| 5 | Fix the Marketing | Week 2-4 |
| 6 | Cut Waste Ruthlessly | Week 1-2 |
| 7 | Build Systems | Month 2-3 |
| 8 | Scale What Works | Month 3+ |

## Input Required
```yaml
input:
  business: ""
  current_revenue: ""
  burn_rate: ""
  cash_runway: ""
  customer_base: ""
  biggest_problems: []
  assets_available: []
```

## Step-by-Step Process

### Step 1-8: Execute Full Turnaround System
Apply all 8 steps with specific actions for this business.

### Quick Cash Strategies (Week 1)
- Send reactivation campaign to past customers
- Create a flash sale for existing customers
- Collect overdue receivables
- Sell unused assets or inventory
- Create a high-value, high-margin offer

## Output Template
```yaml
output:
  turnaround_plan:
    eight_steps: []
    quick_cash_actions: []
    waste_to_cut: []
    systems_to_build: []
    timeline: {}
    projected_recovery: ""
```


handoff:
  to: "kennedy-offers"
  trigger: "Business assessment complete"
  context: "Business diagnostics and improvement plan"


## Quality Gate
```yaml
quality:
  - [ ] All 8 steps addressed with specific actions
  - [ ] Quick cash strategies identified for Week 1
  - [ ] Waste cuts identified with savings estimates
  - [ ] Timeline is aggressive but realistic
  - [ ] Cash flow projections included
```

## Handoff
- -> **kennedy-referrals** for reactivation campaigns
- -> **kennedy-audit** for marketing fixes
- -> **kennedy-advisor** for strategic oversight

---
*Task: KN_BZ_002 | Agent: kennedy-business | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business financial data provided"

elicit:
  - question: "What is your current revenue, burn rate, and cash runway?"
    required: true
  - question: "What past customer base and assets do you have?"
    required: true

output_example: |
  ## Turnaround Plan — Output
  **Agent:** kennedy-business
  - 8-step plan with timeline
  - Quick cash strategies for Week 1
  - Waste cuts and system builds

completion_criteria:
  - "All 8 steps addressed"
  - "Quick cash identified"
  - "Timeline created"
```
