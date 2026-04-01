# Run Kennedy Marketing Triangle Audit

## Metadata
```yaml
task_id: KN_AU_004
agent: kennedy-audit
type: audit
complexity: medium
estimated_time: 45min
source: "Midas Touch Course — Marketing Triangle Audit"
```

## Purpose
Audit the complete marketing funnel from leads through retention using Kennedy's Marketing Triangle scoring system.

## The Framework: Marketing Triangle Scoring
Score each element 1-10:
```
LEADS (How effectively do you generate leads?)
→ CONVERSION (How effectively do you convert leads to buyers?)
→ RETENTION (How effectively do you keep customers?)
→ REFERRALS (How systematically do you generate referrals?)
→ ASCENSION (How effectively do you upsell/cross-sell?)
```

## Input Required
```yaml
input:
  business: ""
  lead_gen_methods: []
  conversion_process: ""
  retention_activities: []
  referral_system: ""
  upsell_offers: []
```

## Output Template
```yaml
output:
  marketing_triangle_audit:
    scores:
      leads: "/10"
      conversion: "/10"
      retention: "/10"
      referrals: "/10"
      ascension: "/10"
    total: "/50"
    weakest_link: ""
    improvement_plan: []
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Marketing audit complete"
  context: "Audit findings and 90-day action plan"


## Quality Gate
```yaml
quality:
  - [ ] All 5 elements scored with evidence
  - [ ] Weakest link identified
  - [ ] Improvement plan for weakest link
  - [ ] Quick wins identified
```

---
*Task: KN_AU_004 | Agent: kennedy-audit | Version: 1.0*


## Detailed Framework

### Weekly Audit Process
1. Review all marketing spend from week
2. Classify each expense DR vs Institutional
3. Score 1-10 scale
4. Track in dashboard
5. Kill low-scorers immediately

### Monthly Deep-Dive Audit
1. Analyze ROI by channel
2. Identify winners vs losers
3. Reallocate budget
4. Test new channels at 10%
5. Review team compliance


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business marketing data provided"
elicit:
  - question: "Describe your lead gen, conversion, retention, referral, and upsell processes."
    required: true
output_example: |
  ## Marketing Triangle Audit — Output
  **Agent:** kennedy-audit
  - 5-element scorecard with improvement plan
completion_criteria:
  - "All elements scored"
  - "Improvement plan created"
```
