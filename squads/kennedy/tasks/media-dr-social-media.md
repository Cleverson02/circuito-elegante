# Design DR Social Media Strategy

## Metadata
```yaml
task_id: KN_MD_004
agent: kennedy-media
type: strategy
complexity: medium
estimated_time: 45-60min
source: "No B.S. Guide to Direct Response Social Media Marketing"
```

## Purpose

Design a social media strategy that follows direct response principles — every post, every ad, every piece of content must have a measurable response mechanism. No vanity metrics allowed.

> "Social media is not marketing. Social media is a CHANNEL for marketing. And like every other channel, it must follow direct response rules or it's just expensive entertainment." — Dan Kennedy

## The Framework: DR Social Media Rules

### Kennedy's Social Media Commandments
1. Every post must have a CTA (even soft CTAs count)
2. Track conversions, not likes/follows/engagement
3. Drive traffic to owned media (your list, not their platform)
4. Content must follow Hook-Story-Offer structure
5. Social media supports DR campaigns, doesn't replace them

### The DR Social Media Hierarchy
```
WORST:   "Like and share!" (vanity, no conversion)
BAD:     "Check out our blog" (traffic, no capture)
BETTER:  "Download our free guide" (lead capture)
BEST:    "Register for the free workshop" (qualified lead + conversion event)
```

## Input Required
```yaml
input:
  business: ""
  platforms: []
  audience: ""
  primary_offer: ""
  lead_magnet: ""
  current_social_strategy: ""
```

## Step-by-Step Process

### Step 1: Audit Current Social Media for DR Compliance
How much current social activity drives measurable results?

### Step 2: Design Content Calendar with DR Focus
Every piece of content has a response mechanism.

### Step 3: Create Lead Capture Funnels for Each Platform
Drive followers OFF the platform and onto your list.

### Step 4: Setup Tracking
Attribution from social to lead to sale.

### Step 5: Define Success Metrics (DR Only)
- Leads generated
- Cost per lead
- Sales from social traffic
- ROI per platform

## Output Template
```yaml
output:
  dr_social_strategy:
    platforms: []
    content_types: []
    cta_strategy: ""
    lead_capture_funnels: []
    tracking: {}
    success_metrics: {}
    content_calendar: []
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Media plan complete"
  context: "Distribution strategy and channels"


## Quality Gate
```yaml
quality:
  - [ ] Every content piece has a CTA
  - [ ] Lead capture funnels designed per platform
  - [ ] Tracking ties social activity to revenue
  - [ ] No vanity metrics as success measures
  - [ ] Content follows Hook-Story-Offer
  - [ ] Drives traffic to owned media (list)
```

## Handoff
- -> **kennedy-copy** for social content copy
- -> **kennedy-direct-response** for tracking integration

---
*Task: KN_MD_004 | Agent: kennedy-media | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No audience defined"
  - "No lead magnet or offer to drive to"

elicit:
  - question: "What platforms are you on and what offer/lead magnet do you have?"
    required: true

output_example: |
  ## DR Social Media Strategy — Output
  **Source Framework:** No B.S. DR Social Media Marketing
  **Agent:** kennedy-media

  - Platform strategy with DR focus
  - Lead capture funnels per platform
  - Tracking and success metrics

completion_criteria:
  - "Every piece has CTA"
  - "Lead capture designed"
  - "Tracking established"
```
