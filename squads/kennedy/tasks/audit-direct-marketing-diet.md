# Administer the Direct Marketing Diet

## Metadata
```yaml
task_id: KN_AU_005
agent: kennedy-audit
type: audit
complexity: medium
estimated_time: 90min
source: "No B.S. Direct Marketing (3rd Ed) — Chapter 10: 6-Step Direct Marketing Diet + Chapters 1-9"
source_sop: "sop-6-step-dr-diet.md"
frameworks:
  - "Great Divide Audit"
  - "Results Triangle Evaluation"
  - "10 No B.S. Rules Compliance"
  - "Money Pyramid Budget Allocation"
```

## Purpose

Put a business on a strict "Direct Marketing Diet" — auditing all marketing spending for DR compliance and eliminating everything that isn't measurable, accountable, and producing measurable ROI. This is the foundational audit that transforms institutional marketing budgets into high-ROI direct response operations. No exceptions. No sacred cows.

**Why This Matters:**
Kennedy estimates 99% of businesses waste 70-90% of their marketing budget on untrackable institutional advertising. The Diet forces a complete reformation of spending discipline and measurement accountability.

## The Framework: 6-Step Diet Protocol

### Step 1: INVENTORY ALL EXPENSES (Complete Transparency)
- Monthly marketing budget across ALL channels
- Historical spend (last 12 months minimum)
- Each expense line-item with:
  - Channel (direct mail, digital, print, events, etc.)
  - Amount (monthly and annual)
  - Claimed purpose (brand awareness, lead gen, customer retention, etc.)
  - Current tracking mechanism (if any)

### Step 2: CLASSIFY AS DR OR INSTITUTIONAL
Each expense must be classified as:
- **DIRECT RESPONSE:** Has offer + tracking + measurable response mechanism
- **INSTITUTIONAL:** Awareness/branding only, no tracking, no measurable response

**Red Flags (100% Institutional):**
- "Brand awareness" without offer
- Ads with no phone number, URL, or tracking code
- Sponsorships with no response mechanism
- Social media posts without trackable links
- Websites functioning as brochures (no lead capture)
- Print/outdoor without response mechanism

### Step 3: SCORE DR COMPLIANCE (1-10 Scale)
For each expense, assign DR compliance score:
- **10:** Complete DR (offer + tracking + urgency + tracking + follow-up)
- **8-9:** Strong DR (has most elements, minor gaps)
- **6-7:** Weak DR (has some elements, significant gaps)
- **4-5:** Mostly institutional with faint DR attempt
- **1-3:** Pure institutional, zero measurability
- **0:** Money literally thrown away (untrackable, unmeasurable)

### Step 4: KILL EVERYTHING SCORING BELOW 5
This is the hard line — non-negotiable:
- Scores 1-4: ELIMINATE IMMEDIATELY
- Scores 5 borderline: GIVE 30-DAY TRANSFORMATION NOTICE (must reach 7+)
- Scores 0: Already dead, don't fund renewal

### Step 5: REDIRECT BUDGET TO HIGHEST PERFORMERS
- Identify scores 9-10 (winners)
- Calculate ROI for each winner
- Allocate freed budget to proven winners first
- Test new channels at 10% of freed budget only

### Step 6: ESTABLISH MONTHLY REVIEW CADENCE
- Monthly audit of ALL new/existing marketing
- Any new expense must score 6+ to be approved
- Quarterly deep-dive on spending trends
- Annual full diet re-administration

## Input Required
```yaml
input:
  current_marketing_expenses:
    - channel: "example_channel"
      monthly_amount: 0
      annual_total: 0
      stated_purpose: ""
      current_tracking: ""
      results_if_any: ""

  business_context:
    monthly_revenue: ""
    current_marketing_percent_of_revenue: ""
    primary_customer_source: ""
    biggest_marketing_frustration: ""
```

## Output Template
```yaml
output:
  diet_results:
    total_reviewed_monthly: ""
    total_reviewed_annual: ""

    by_classification:
      direct_response:
        count: 0
        total_monthly: ""
        scoring_breakdown: {}

      institutional:
        count: 0
        total_monthly: ""
        to_eliminate: ""

    action_items:
      kill_immediately: []        # 0-3 score
      transform_30_days: []        # 4-5 score
      winners_to_expand: []        # 9-10 score

    financial_impact:
      budget_freed_monthly: ""
      budget_freed_annual: ""
      projected_reallocation: ""

    monthly_savings: ""
    new_allocation_strategy: {}

  compliance_scorecard:
    results_triangle_alignment: ""
    no_bs_rules_compliance: ""
    great_divide_position: ""
    recommended_90_day_action_plan: ""
```

## Handoff
```yaml
handoff:
  to: "kennedy-direct-response"
  trigger: "Marketing audit complete and Diet implemented"
  context: |
    - Audit findings and budget reallocation strategy
    - Winners identified for expansion testing
    - 90-day measurement dashboard
    - New expense approval protocol
```

## Detailed Elicitation Process

When user says: "I need a marketing diet"

**Question 1: Inventory**
"I need complete transparency on where every marketing dollar goes. List me:
- Monthly budget by channel
- What tracking you currently have (or don't)
- What results each channel produces (if measured)
- Anything you're not confident about
Take 30 minutes and send the list."

**Question 2: Purpose Clarification**
"For each channel, what EXACTLY is the intended response? Lead generation? Direct sales? Email signups? Brand awareness? Be specific."

**Question 3: Results Reality Check**
"For each expense, what actual results have you measured in the last 90 days? If you can't measure it, that's the answer — 'can't measure.'"

**Question 4: Competitive Context**
"What are your 3 biggest competitors doing? What would happen if you eliminated their marketing approach?"

## Quality Gate
```yaml
quality:
  - [ ] Every expense classified (DR or Institutional)
  - [ ] Every expense scored (1-10 scale)
  - [ ] Kill list created with specific dates
  - [ ] Winners identified and ROI calculated
  - [ ] 90-day action plan documented
  - [ ] Monthly review process designed
  - [ ] Next audit scheduled (30/60/90 days)
```

---
*Task: KN_AU_005 | Agent: kennedy-audit | Version: 2.0 — EXPANDED*

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No marketing expense data"
  - "Refusal to measure existing marketing"
  - "Commitment to institutional marketing non-negotiable"

elicit:
  - question: "List all marketing expenses with monthly amounts, channels, and stated results."
    required: true
    context: "This audit is only valuable if 100% transparent about current spending"

  - question: "What tracking mechanisms exist for each channel?"
    required: true
    context: "If not tracked, scores automatically 0-3 (likely cut)"

  - question: "Which marketing activities produce measurable revenue?"
    required: true
    context: "These become winners to expand"

output_example: |
  ## Direct Marketing Diet — Audit Results
  **Agent:** kennedy-audit
  **Date:** [Today]

  ### Summary
  - Total Monthly Marketing: $15,000 (12% of revenue)
  - Institutional (to cut): $8,500/month (56%)
  - Direct Response (to keep): $6,500/month (44%)
  - Projected Monthly Savings: $7,200 (48%)

  ### Action Items
  **KILL IMMEDIATELY (0-3 score):**
  - Facebook brand awareness ads ($2,000/mo) — no tracking, no offer
  - Magazine sponsorship ($1,500/mo) — untrackable
  - Brand "awareness" YouTube ($500/mo) — no CTA

  **TRANSFORM 30 DAYS (4-5 score):**
  - Email newsletter ($800/mo) — add offer and tracking to boost to 7+
  - Website ($2,500/mo hosting/design) — add lead magnet to convert to DR

  **EXPAND (9-10 score):**
  - Direct mail + tracking ($2,000/mo) — Score 9, ROI 3:1, increase to $4,000
  - Google search ads ($1,200/mo) — Score 10, ROI 5:1, increase to $2,500
  - Cold email outreach ($1,000/mo) — Score 9, ROI 4:1, test expansion to $2,000

completion_criteria:
  - "All marketing expenses classified and scored"
  - "Kill list executed with specific dates"
  - "Winners funded for testing"
  - "90-day measurement dashboard created"
  - "Monthly audit process implemented"
```
