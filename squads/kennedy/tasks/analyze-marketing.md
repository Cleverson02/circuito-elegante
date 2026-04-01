# Analyze Marketing (Full Audit)

## Metadata
```yaml
task_id: KN_AUD_001
agent: kennedy-audit
type: analysis
complexity: high
estimated_time: 60min
source: "No B.S. Direct Marketing + Midas Touch + Ultimate Marketing Plan"
```

## Purpose

Conduct a comprehensive marketing audit using Kennedy's 5 diagnostic
frameworks: Results Triangle, 10 No B.S. Rules, 9 Fatal Marketing Mistakes,
Money Pyramid Analysis, and 5 Holes in the Bucket. Produces a prioritized
action plan with ROI projections.

> "Before you can fix marketing, you must diagnose it with the precision
> of a surgeon — not the guesswork of a gambler." -- Dan Kennedy

## Veto Conditions
```yaml
veto_conditions:
  - check: "Actual marketing data available (not assumptions)?"
    fail_action: "BLOCK — Cannot audit without evidence"
  - check: "At least one marketing material to review?"
    fail_action: "BLOCK — Need something to audit"
```

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    revenue_monthly: ""
    marketing_spend_monthly: ""
    years_in_business: 0

  marketing_data:
    current_channels: []  # List of active marketing channels
    cost_per_lead: ""
    cost_per_acquisition: ""
    customer_lifetime_value: ""
    list_size: ""
    referral_rate: ""

  materials_to_audit:
    - "Provide: current ads, letters, emails, website URL, etc."
```

## Elicitation Sequence

1. **What marketing are you currently doing?** (Channels, spend)
2. **What results are you getting?** (Leads, customers, ROI)
3. **Can you share your marketing materials?** (Ads, letters, pages)
4. **Who is your target customer?** (Demographics, psychographics)
5. **What is your biggest marketing frustration?** (Symptoms point to cause)

## Audit Framework

### Framework 1: Results Triangle
- Message evaluation (compelling? specific? differentiated?)
- Market evaluation (defined? reachable? able to pay?)
- Media evaluation (appropriate? tracked? multiple channels?)
- Alignment check (all three working together?)

### Framework 2: 10 No B.S. Rules (score 1-10 each)
Score compliance with all 10 rules.

### Framework 3: 9 Fatal Marketing Mistakes
Guilty / Not Guilty for each of the 9 mistakes.

### Framework 4: Money Pyramid Analysis
Current customer tier distribution and opportunity identification.

### Framework 5: 5 Holes in the Bucket
Each hole rated: SEALED / LEAKING / HEMORRHAGING with estimated revenue lost.

## Output Example

```markdown
# Marketing Audit Report: [Business Name]

## Executive Summary
[3-5 sentences: biggest findings, biggest opportunity, biggest risk]

## Scorecard
| Framework | Score | Rating |
|-----------|-------|--------|
| Results Triangle | X/10 | [Status] |
| 10 No B.S. Rules | X/100 | [Status] |
| 9 Fatal Mistakes | X/9 guilty | [Status] |
| Money Pyramid | [Tier] | [Opportunity] |
| 5 Holes | X/5 leaking | [Est. $$/month lost] |

## Detailed Findings
[Full analysis for each framework]

## Top 10 Priority Actions
| # | Action | Impact | Effort | Est. Revenue Impact |
|---|--------|--------|--------|---------------------|
| 1 | [Quick win] | HIGH | LOW | $X/month |
...

## ROI Projections (Top 3 Changes)
[Conservative, moderate, aggressive scenarios]
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Marketing audit complete"
  context: "Audit findings and 90-day action plan"


## Completion Criteria
```yaml
completion:
  required:
    - "All 5 frameworks scored"
    - "Executive summary written"
    - "Top 10 actions prioritized"
    - "ROI projections for top 3"
    - "Specific recommendations (not generic)"
  quality_check:
    - "Audit based on actual data, not assumptions"
    - "Recommendations are actionable"
    - "Uses Kennedy frameworks correctly"
  checklist: "checklists/marketing-audit-checklist.md"
```

---

**Version:** 1.0
**Agent:** kennedy-audit
