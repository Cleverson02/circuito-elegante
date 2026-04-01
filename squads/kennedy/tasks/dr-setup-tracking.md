# Setup Campaign Tracking Infrastructure

## Metadata
```yaml
task_id: KN_DR_002
agent: kennedy-direct-response
type: setup
complexity: medium
estimated_time: 45min
source: "No B.S. Direct Marketing — Rule #4: Tracking & Measurement"
```

## Purpose

Design and implement tracking infrastructure that makes every marketing dollar accountable. Kennedy's Rule #4 demands that you know exactly which dollar brought which result.

> "Half of all advertising is wasted. The problem is, most marketers don't know which half. In direct response, you know EXACTLY which ads work and which don't — because you track everything." — Dan Kennedy

## The Framework: The Accountability Imperative

### What Must Be Tracked
```
SOURCE       → Where did they come from? (mail piece, ad, referral)
RESPONSE     → What did they do? (call, visit, buy, opt-in)
CONVERSION   → Did they buy? How much? When?
LIFETIME     → What's their total value over time?
ROI          → For every $1 spent, how many came back?
```

### Kennedy's Tracking Toolkit
1. **Unique phone numbers** per campaign / per media
2. **Unique URLs** per campaign
3. **Source codes** on reply cards, coupons, order forms
4. **Priority codes** for phone orders
5. **Split test tracking** (A vs B vs control)
6. **Cost-per-lead** and **cost-per-sale** calculations
7. **Lifetime customer value** tracking

## Input Required
```yaml
input:
  campaign_name: ""
  channels_used: []
  campaign_pieces: []
  response_mechanisms: []       # phone, web, mail, in-person
  budget_total: ""
  tracking_tools_available: []  # CRM, analytics, call tracking, etc.
```

## Step-by-Step Process

### Step 1: Assign Unique Identifiers to Every Campaign Piece
Every single marketing piece gets its own tracking code:
- Direct mail piece A → Phone: 800-XXX-1001, URL: yourdomain.com/a1
- Direct mail piece B → Phone: 800-XXX-1002, URL: yourdomain.com/a2
- Email campaign → UTM: ?utm_source=email&utm_campaign=jan-sale
- Print ad → "Mention code DK-2026 for your discount"

### Step 2: Design the Response Capture System
How will you capture and record every response?
```yaml
response_capture:
  phone: "Call tracking software, script for asking source code"
  web: "Landing pages with analytics, form submissions tracked"
  mail: "Reply cards with source codes, PO box per campaign"
  in_person: "Staff trained to ask 'How did you hear about us?'"
```

### Step 3: Create the Tracking Dashboard
Simple weekly tracking:
```
Campaign | Sent/Impressions | Responses | Response Rate | Sales | Revenue | Cost | ROI
---------|-----------------|-----------|---------------|-------|---------|------|----
Mail A   | 1,000           | 45        | 4.5%          | 12    | $12,000 | $2,500 | 380%
Email B  | 5,000           | 200       | 4.0%          | 30    | $15,000 | $500   | 2900%
```

### Step 4: Establish Benchmarks and Thresholds
Define success/failure thresholds before launching:
```yaml
benchmarks:
  response_rate_target: ""
  cost_per_lead_max: ""
  cost_per_sale_max: ""
  roi_minimum: ""
  breakeven_timeline: ""
```

### Step 5: Build the Test Protocol
Document exactly how tests will be conducted:
- Control vs. Challenger
- Single variable per test
- Statistical significance threshold
- Decision criteria for rolling out winner

## Output Template
```yaml
output:
  tracking_infrastructure:
    campaign: ""
    tracking_codes: []
    response_capture: {}
    dashboard_template: ""
    benchmarks: {}
    test_protocol: ""
    review_schedule: ""
```


handoff:
  to: "kennedy-media"
  trigger: "DR campaign designed"
  context: "Campaign structure with tracking"


## Quality Gate
```yaml
quality:
  - [ ] Every campaign piece has a unique tracking identifier
  - [ ] All response channels have capture mechanisms
  - [ ] Dashboard template created with key metrics
  - [ ] Benchmarks established before launch
  - [ ] Test protocol documented
  - [ ] Review schedule set (weekly minimum)
  - [ ] Staff trained on response capture
```

## Handoff
- -> **kennedy-audit** for ongoing performance analysis
- -> **kennedy-direct-response** for campaign optimization based on data

---
*Task: KN_DR_002 | Agent: kennedy-direct-response | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No campaign pieces defined to track"
  - "No response mechanisms identified"

elicit:
  - question: "What channels and campaign pieces need tracking?"
    required: true
  - question: "What tracking tools do you have available (CRM, analytics, etc.)?"
    required: false

output_example: |
  ## Tracking Infrastructure — Output
  **Source Framework:** No B.S. Direct Marketing Rule #4
  **Agent:** kennedy-direct-response

  - Unique tracking codes for all campaign pieces
  - Response capture system design
  - Dashboard template and benchmarks

completion_criteria:
  - "Every piece has unique tracking"
  - "Response capture designed for all channels"
  - "Benchmarks established"
```
