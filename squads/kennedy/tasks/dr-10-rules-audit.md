# Audit Against the 10 No B.S. Rules

## Metadata
```yaml
task_id: KN_DR_004
agent: kennedy-direct-response
type: audit
complexity: medium
estimated_time: 30-45min
source: "No B.S. Direct Marketing — The 10 Rules"
```

## Purpose

Audit any marketing piece, campaign, or business against Kennedy's 10 Non-Negotiable Rules of Direct Response Marketing. Every violation is money left on the table.

> "These are not suggestions. They are RULES. Break them at your own financial peril." — Dan Kennedy

## The Framework: 10-Rule Compliance Audit

### Rule-by-Rule Assessment

**Rule 1: There Shall Always Be One or More Offers**
```
Score: ___/10
Current: [What offers exist?]
Missing: [What offers are absent?]
Fix: [Specific action to add clear offers]
```

**Rule 2: There Shall Be a Reason to Respond NOW**
```
Score: ___/10
Current: [What urgency exists?]
Missing: [What urgency is lacking?]
Fix: [Specific urgency mechanism to add]
```

**Rule 3: Clear Instructions — Tell Them What to Do**
```
Score: ___/10
Current: [How clear is the CTA?]
Missing: [Where is confusion possible?]
Fix: [Specific instructions to add]
```

**Rule 4: Tracking and Measurement**
```
Score: ___/10
Current: [What tracking exists?]
Missing: [What isn't being tracked?]
Fix: [Specific tracking to implement]
```

**Rule 5: Brand Building as By-Product Only**
```
Score: ___/10
Current: [Is DR the primary goal?]
Missing: [Where has branding crept in without DR?]
Fix: [How to refocus on direct response]
```

**Rule 6: Follow-Up Relentlessly**
```
Score: ___/10
Current: [What follow-up exists?]
Missing: [Where do leads go cold?]
Fix: [Specific follow-up sequences to add]
```

**Rule 7: Strong Copy, Not Pretty Design**
```
Score: ___/10
Current: [Is copy the hero?]
Missing: [Where has design overridden copy?]
Fix: [How to rebalance copy vs design]
```

**Rule 8: Results Rule, Period**
```
Score: ___/10
Current: [Are decisions based on results?]
Missing: [Where are vanity metrics used?]
Fix: [What to measure instead]
```

**Rule 9: Test Everything**
```
Score: ___/10
Current: [What testing exists?]
Missing: [What is not being tested?]
Fix: [Test plan with priorities]
```

**Rule 10: Mail is King**
```
Score: ___/10
Current: [Is direct mail being used?]
Missing: [What mail opportunities exist?]
Fix: [How to integrate direct mail]
```

## Input Required
```yaml
input:
  what_to_audit: ""            # Campaign, piece, or entire business
  current_marketing_pieces: []
  current_tracking: ""
  current_follow_up: ""
  current_testing: ""
  uses_direct_mail: false
```

## Step-by-Step Process

### Step 1: Score Each Rule (1-10)
Assess compliance for each of the 10 rules.

### Step 2: Identify Critical Violations
Rules scoring below 5 are critical violations requiring immediate attention.

### Step 3: Prioritize Fixes
Rank violations by revenue impact (highest impact first).

### Step 4: Create Remediation Plan
Specific actions for each violation with timeline.

## Output Template
```yaml
output:
  ten_rules_audit:
    subject: ""
    date: ""
    total_score: "/100"
    grade: ""                 # A (80+) B (60-79) C (40-59) D (<40)
    critical_violations: []
    remediation_plan:
      immediate: []           # Fix this week
      short_term: []          # Fix this month
      ongoing: []             # Continuous improvement
```


handoff:
  to: "kennedy-media"
  trigger: "DR campaign designed"
  context: "Campaign structure with tracking"


## Quality Gate
```yaml
quality:
  - [ ] All 10 rules scored with specific evidence
  - [ ] Critical violations identified (score < 5)
  - [ ] Remediation plan is specific and actionable
  - [ ] Priorities ranked by revenue impact
  - [ ] Timeline assigned to each fix
```

## Handoff
- -> **kennedy-audit** for deeper financial analysis
- -> **kennedy-direct-response** for campaign redesign

---
*Task: KN_DR_004 | Agent: kennedy-direct-response | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No marketing piece or campaign provided to audit"

elicit:
  - question: "What marketing piece, campaign, or business should I audit?"
    required: true
  - question: "Can you share current campaign materials and results?"
    required: false

output_example: |
  ## 10-Rules Audit — Output
  **Source Framework:** 10 No B.S. Rules of Direct Response Marketing
  **Agent:** kennedy-direct-response

  - Complete 10-rule scorecard
  - Critical violations flagged
  - Prioritized remediation plan

completion_criteria:
  - "All 10 rules scored"
  - "Critical violations identified"
  - "Remediation plan created"
```
