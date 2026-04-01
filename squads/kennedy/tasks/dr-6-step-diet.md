# Apply the 6-Step Direct Marketing Diet

## Metadata
```yaml
task_id: KN_DR_006
agent: kennedy-direct-response
type: optimization
complexity: medium
estimated_time: 45min
source: "No B.S. Direct Marketing — 6-Step Direct Marketing Diet"
```

## Purpose

Put your marketing on Kennedy's "Direct Marketing Diet" — a systematic process to cut waste, focus spending on what works, and make every marketing dollar maximally productive.

> "Most businesses are marketing-obese — bloated with activities that produce nothing. The Direct Marketing Diet trims the fat and leaves only muscle." — Dan Kennedy

## The Framework: 6-Step Diet

### Step 1: Audit Everything
List every marketing activity and its measured results.

### Step 2: Kill What Doesn't Perform
If you can't measure it or it's losing money — kill it.

### Step 3: Double Down on Winners
Take budget from losers and feed it to winners.

### Step 4: Add Accountability to Everything
Every remaining activity gets tracking.

### Step 5: Test New Channels (Small Scale)
Allocate 10-15% of budget to testing new approaches.

### Step 6: Review Monthly
Monthly discipline: what's working, what's not, reallocate.

## Input Required
```yaml
input:
  marketing_activities: []
  budget_per_activity: []
  results_per_activity: []
```

## Step-by-Step Process

Execute the 6 steps sequentially with detailed action items.

## Output Template
```yaml
output:
  marketing_diet:
    activities_audited: []
    activities_killed: []
    activities_doubled: []
    tracking_added: []
    test_budget: ""
    monthly_review_template: ""
    projected_efficiency_gain: ""
```


handoff:
  to: "kennedy-media"
  trigger: "DR campaign designed"
  context: "Campaign structure with tracking"


## Quality Gate
```yaml
quality:
  - [ ] All activities audited
  - [ ] Underperformers identified and killed
  - [ ] Winners identified and scaled
  - [ ] Tracking on every surviving activity
  - [ ] Test budget allocated (10-15%)
  - [ ] Monthly review process established
```

## Handoff
- -> **kennedy-audit** for ongoing monitoring
- -> **kennedy-media** for channel optimization

---
*Task: KN_DR_006 | Agent: kennedy-direct-response | Version: 1.0*

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No marketing activity data available"
elicit:
  - question: "List your marketing activities with budgets and measured results."
    required: true
output_example: |
  ## Marketing Diet — Output
  **Agent:** kennedy-direct-response
  - Activities killed, doubled, and tracked
  - Monthly review template
completion_criteria:
  - "6 steps executed"
  - "Budget reallocated"
  - "Review process created"
```
