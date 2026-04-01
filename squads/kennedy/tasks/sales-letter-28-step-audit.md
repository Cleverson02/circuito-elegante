# Audit Sales Letter Against 28 Steps

## Metadata
```yaml
task_id: KN_SL_006
agent: kennedy-sales-letter
type: audit
complexity: medium
estimated_time: 90min
source: "The Ultimate Sales Letter — 28-Step System Audit"
```

## Purpose
Audit an existing sales letter against Kennedy's 28-Step System to identify gaps, weaknesses, and missed opportunities. Score each step and provide specific improvement recommendations.

## Input Required
```yaml
input:
  sales_letter_text: ""
  current_results: ""
```

## Step-by-Step Process
### Step 1: Score each of the 28 steps (Present/Absent/Weak)
### Step 2: Identify the 3 biggest gaps
### Step 3: Prioritize fixes by conversion impact
### Step 4: Rewrite weakest sections

## Output Template
```yaml
output:
  letter_audit:
    steps_present: "/28"
    steps_weak: []
    steps_absent: []
    top_3_gaps: []
    rewrite_recommendations: []
    projected_improvement: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Sales letter complete"
  context: "Validated sales letter ready for deployment"


## Quality Gate
```yaml
quality:
  - [ ] All 28 steps assessed
  - [ ] Gaps identified with specific examples
  - [ ] Improvement recommendations are actionable
```

## Handoff
- -> **kennedy-sales-letter** for rewrites
- -> **kennedy-copy** for section improvements

---
*Task: KN_SL_006 | Agent: kennedy-sales-letter | Version: 1.0*


## 28-Step Sales Letter Framework (Condensed)

**The Proven Sequence:**
1. Attention-getting headline
2. Subheading (supports headline)
3. Lead-in (establish credibility)
4. Define problem (emotional hook)
5. Show frustration (sympathize)
6-10. Proof (case studies, testimonials)
11-14. Value proposition (benefits stacked)
15-20. Overcome objections
21-23. Guarantee (risk reversal)
24-26. Urgency and scarcity
27. Call-to-action (clear instructions)
28. PS (reinforce offer + urgency)


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No sales letter provided for audit"
elicit:
  - question: "Provide the sales letter text to audit."
    required: true
output_example: |
  ## 28-Step Audit — Output
  **Agent:** kennedy-sales-letter
  - Step-by-step compliance scorecard
  - Top 3 gaps with rewrite recommendations
completion_criteria:
  - "All 28 steps scored"
  - "Gaps identified"
  - "Rewrites recommended"
```
