# Analyze Campaign Results

## Metadata
```yaml
task_id: KN_DR_003
agent: kennedy-direct-response
type: analysis
complexity: medium
estimated_time: 45-60min
source: "No B.S. Direct Marketing — Rules #4, #8, #9"
```

## Purpose

Analyze direct response campaign results with Kennedy's unforgiving, numbers-only approach. No vanity metrics, no excuses — only results that tie directly to revenue. Every campaign either made money or it didn't.

> "Results Rule. Period. Not creativity. Not awards. Not impressions. RESULTS. Did the phone ring? Did the cash register open? That's all that matters." — Dan Kennedy

## The Framework: Kennedy's Results Analysis

### The Only Metrics That Matter
```
1. Cost Per Lead (CPL)         → Total cost / total leads
2. Cost Per Sale (CPS)         → Total cost / total sales
3. Return On Investment (ROI)  → (Revenue - Cost) / Cost x 100
4. Lifetime Customer Value (LCV) → Average revenue per customer over lifetime
5. Allowable Acquisition Cost  → LCV x acceptable % for acquisition
```

### The Great Divide Analysis
Separate DR results from institutional/brand spending:
- DR: Measurable, accountable, directly tied to revenue
- Institutional: Unmeasurable "awareness" spending (Kennedy says eliminate it)

## Input Required
```yaml
input:
  campaign_name: ""
  campaign_data:
    total_sent: 0
    total_responses: 0
    total_sales: 0
    total_revenue: 0
    total_cost: 0
    timeframe: ""
  by_channel: []             # Breakdown per channel
  by_piece: []               # Breakdown per campaign piece
  test_results: []           # A/B test data if available
```

## Step-by-Step Process

### Step 1: Calculate Core Metrics
```yaml
core_metrics:
  response_rate: ""          # Responses / Sent
  conversion_rate: ""        # Sales / Responses
  cost_per_lead: ""          # Cost / Responses
  cost_per_sale: ""          # Cost / Sales
  revenue_per_sale: ""       # Revenue / Sales
  roi_percentage: ""         # (Revenue - Cost) / Cost x 100
  break_even_point: ""       # When does it pay for itself?
```

### Step 2: Channel-by-Channel Comparison
Which channels performed best? Rank by ROI, not volume.

### Step 3: A/B Test Analysis
If tests were run, declare winners with data:
```
Test: Headline A vs Headline B
Headline A: 4.2% response | $45 CPL | 320% ROI
Headline B: 2.8% response | $67 CPL | 180% ROI
WINNER: Headline A → Roll out to full list
```

### Step 4: The Kennedy Verdict
Apply Kennedy's brutal honesty:
- Did this campaign make money? YES/NO
- If YES: What can we scale?
- If NO: What needs to change (message, market, or media)?

### Step 5: Action Plan
Based on results, what happens next?
- Scale winners
- Kill losers (no sentimentality)
- Test new variables on promising campaigns
- Reallocate budget to highest ROI channels

## Output Template
```yaml
output:
  campaign_analysis:
    campaign: ""
    verdict: "PROFITABLE | BREAKEVEN | UNPROFITABLE"
    core_metrics: {}
    channel_ranking: []
    test_winners: []
    action_plan:
      scale: []
      kill: []
      test_next: []
      budget_reallocation: {}
```


handoff:
  to: "kennedy-media"
  trigger: "DR campaign designed"
  context: "Campaign structure with tracking"


## Quality Gate
```yaml
quality:
  - [ ] All core metrics calculated with actual numbers
  - [ ] Channel comparison shows clear ranking
  - [ ] A/B test results declared with winners
  - [ ] Kennedy verdict is honest and data-driven
  - [ ] Action plan is specific with next steps
  - [ ] No vanity metrics cited (impressions, reach, engagement without conversion)
```

## Handoff
- -> **kennedy-audit** for deep-dive money pyramid analysis
- -> **kennedy-direct-response** for campaign iteration and scaling

---
*Task: KN_DR_003 | Agent: kennedy-direct-response | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No campaign data provided"
  - "No cost or revenue numbers available"

elicit:
  - question: "What campaign data do you have (responses, sales, costs, revenue)?"
    required: true
  - question: "Were A/B tests run? If so, what was tested?"
    required: false

output_example: |
  ## Campaign Analysis — Output
  **Source Framework:** No B.S. Rules #4, #8, #9
  **Agent:** kennedy-direct-response

  - Core metrics calculated
  - Channel ranking by ROI
  - Action plan: scale, kill, test

completion_criteria:
  - "All core metrics calculated"
  - "Honest verdict rendered"
  - "Action plan with specific next steps"
```
