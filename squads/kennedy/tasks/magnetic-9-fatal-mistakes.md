# Diagnose the 9 Fatal Marketing Mistakes

## Metadata
```yaml
task_id: KN_MG_005
agent: kennedy-magnetic
type: diagnosis
complexity: medium
estimated_time: 30-45min
source: "Magnetic Marketing — 9 Fatal Marketing Mistakes"
```

## Purpose

Diagnose which of Kennedy's 9 Fatal Marketing Mistakes a business is making. These are the most common killers of marketing ROI — fix them and results improve immediately.

> "These 9 mistakes aren't rare. Almost every business I audit is making at least 5 of them. Fix them, and you'll instantly improve results." — Dan Kennedy

## The Framework: 9 Fatal Marketing Mistakes

| # | Mistake | The Fix |
|---|---------|---------|
| 1 | No USP — you're a commodity | Create a unique selling proposition |
| 2 | No follow-up system | Build 7-21 touch follow-up sequence |
| 3 | No referral system | Systematize referral generation |
| 4 | No direct response approach | Apply DR principles to everything |
| 5 | No tracking/measurement | Track every marketing dollar |
| 6 | Wrong market targeting | Find your starving crowd |
| 7 | Weak or no offer | Create irresistible offers |
| 8 | Image/brand advertising | Switch to direct response |
| 9 | No customer retention program | Build retention system |

## Input Required
```yaml
input:
  business_name: ""
  industry: ""
  current_marketing_description: ""
  current_challenges: []
```

## Step-by-Step Process

### Step 1: Assess Each Mistake (Present / Not Present / Partial)
Score each mistake and document evidence.

### Step 2: Rank by Revenue Impact
Which mistakes are costing the MOST money?

### Step 3: Create Fix Priority List
Highest revenue impact + easiest to fix = do first.

### Step 4: Build 90-Day Remediation Plan
Fix the top 3 mistakes in 90 days.

## Output Template
```yaml
output:
  fatal_mistakes_diagnosis:
    business: ""
    mistakes_found: "/9"
    detailed_findings:
      - mistake: ""
        present: true/false
        evidence: ""
        revenue_impact: "high/medium/low"
        fix: ""
    priority_fixes:
      - fix: ""
        timeline: ""
        expected_impact: ""
    remediation_plan_90_days: []
```


handoff:
  to: "kennedy-media"
  trigger: "Magnetic system designed"
  context: "Lead magnets, shock-and-awe, follow-up sequences"


## Quality Gate
```yaml
quality:
  - [ ] All 9 mistakes assessed with evidence
  - [ ] Revenue impact ranked for each
  - [ ] Top 3 priority fixes identified
  - [ ] 90-day remediation plan created
  - [ ] Specific actions assigned, not vague recommendations
```

## Handoff
- -> **kennedy-audit** for deeper analysis
- -> **kennedy-direct-response** for DR implementation

---
*Task: KN_MG_005 | Agent: kennedy-magnetic | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business information provided"

elicit:
  - question: "Describe your current marketing approach and biggest challenges."
    required: true

output_example: |
  ## 9 Fatal Mistakes Diagnosis — Output
  **Source Framework:** Magnetic Marketing 9 Fatal Mistakes
  **Agent:** kennedy-magnetic

  - Each mistake assessed with evidence
  - Priority fix list
  - 90-day remediation plan

completion_criteria:
  - "All 9 assessed"
  - "Priority fixes identified"
  - "90-day plan created"
```
