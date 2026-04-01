# Diagnose Marketing Holes in the Bucket

## Metadata
```yaml
task_id: KN_AU_003
agent: kennedy-audit
type: diagnosis
complexity: medium
estimated_time: 30-45min
source: "Midas Touch Course — 5 Holes in the Bucket Framework"
```

## Purpose

Identify and fix the "holes in the bucket" — the places where your marketing is losing customers, leads, and revenue. Kennedy teaches that most businesses focus on pouring more water (leads) into the bucket while ignoring the holes leaking it out.

> "Before you spend another dollar on getting more leads, plug the holes in your bucket. What good is more water if it all leaks out?" — Dan Kennedy

## The Framework: 5 Holes in the Bucket

| Hole | Where It Leaks | Common Causes |
|------|---------------|---------------|
| 1 | Lead Capture | No opt-in, weak lead magnet, no follow-up |
| 2 | Lead-to-Sale Conversion | Weak sales process, no urgency, no follow-up |
| 3 | Customer Retention | No communication, no ascension, forgotten |
| 4 | Referral Generation | No system, no ask, no incentive |
| 5 | Reactivation | Lost customers ignored, no win-back campaign |

## Input Required
```yaml
input:
  business: ""
  lead_flow: ""
  conversion_rate: ""
  retention_rate: ""
  referral_rate: ""
  reactivation_efforts: ""
```

## Step-by-Step Process

### Step 1: Assess Each Hole
For each of the 5 holes, measure the leak size (1-10).

### Step 2: Calculate Revenue Lost per Hole
What is each leak costing you monthly?

### Step 3: Prioritize Fixes
Fix the biggest, easiest-to-plug holes first.

### Step 4: Design Plugs for Each Hole
Specific actions to stop each leak.

## Output Template
```yaml
output:
  bucket_diagnosis:
    holes:
      - hole: "Lead Capture"
        leak_severity: "/10"
        monthly_loss: ""
        plug: ""
      - hole: "Conversion"
        leak_severity: "/10"
        monthly_loss: ""
        plug: ""
      - hole: "Retention"
        leak_severity: "/10"
        monthly_loss: ""
        plug: ""
      - hole: "Referral"
        leak_severity: "/10"
        monthly_loss: ""
        plug: ""
      - hole: "Reactivation"
        leak_severity: "/10"
        monthly_loss: ""
        plug: ""
    total_monthly_leak: ""
    priority_fix_order: []
    ninety_day_plan: []
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Marketing audit complete"
  context: "Audit findings and 90-day action plan"


## Quality Gate
```yaml
quality:
  - [ ] All 5 holes assessed with severity score
  - [ ] Revenue loss estimated per hole
  - [ ] Fixes are specific and actionable
  - [ ] Priority order based on revenue impact
  - [ ] 90-day plan to plug top 3 holes
```

## Handoff
- -> **kennedy-magnetic** for lead capture improvements
- -> **kennedy-referrals** for referral system
- -> **kennedy-direct-response** for conversion optimization

---
*Task: KN_AU_003 | Agent: kennedy-audit | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business data provided"

elicit:
  - question: "Describe your current lead flow, conversion, retention, and referral rates."
    required: true

output_example: |
  ## Holes in the Bucket — Output
  **Source Framework:** 5 Holes in the Bucket
  **Agent:** kennedy-audit

  - All 5 holes assessed
  - Revenue leak calculated
  - Priority fixes designed

completion_criteria:
  - "All 5 holes assessed"
  - "Revenue loss estimated"
  - "Fixes prioritized"
```
