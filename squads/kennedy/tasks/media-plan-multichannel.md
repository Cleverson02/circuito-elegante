# Plan Multichannel Media Strategy

## Metadata
```yaml
task_id: KN_MD_001
agent: kennedy-media
type: strategy
complexity: high
estimated_time: 60-90min
source: "No B.S. Direct Marketing — Multimedia/Multichannel Imperative"
```

## Purpose

Design a multichannel media strategy following Kennedy's principle that the more channels you use simultaneously, the more powerful each channel becomes. Kennedy calls this the "Multimedia/Multichannel Imperative."

> "Using just one media channel is like trying to open a safe with one number. You need all the numbers in the combination. Direct mail + email + phone + retargeting — together they are 10x more powerful than any single channel." — Dan Kennedy

## The Framework: The Multichannel Matrix

### Kennedy's Preferred Channel Hierarchy
```
TIER 1 (Highest Impact):
- Direct Mail (physical, personal, persistent)
- Personal Phone/Call
- Face-to-Face

TIER 2 (Supporting):
- Email (only with permission)
- Fax (for B2B)
- Lumpy/Dimensional Mail

TIER 3 (Amplifying):
- Retargeting Ads
- Print Advertising
- Social Media (DR only, not brand)
- Podcasts / Content
```

### The Multichannel Multiplier Effect
```
1 Channel  = 1x impact
2 Channels = 3x impact (not 2x!)
3 Channels = 7x impact
4+ Channels = 10x+ impact
```

## Input Required
```yaml
input:
  campaign: ""
  audience: ""
  budget: ""
  channels_available: []
  current_channels: []
  timeline: ""
```

## Step-by-Step Process

### Step 1: Assess Available Channels
What channels can you actually use? (Budget, list, capacity)

### Step 2: Select Primary + Supporting Channels
Choose one primary (usually direct mail) and 2-3 supporting.

### Step 3: Design the Multichannel Sequence
```
Day 0: Direct mail piece sent
Day 3: Email #1 (references mail piece)
Day 5: Retargeting ads begin
Day 7: Direct mail #2 (follow-up)
Day 10: Phone call (references materials)
Day 14: Email #2 (deadline)
Day 17: Final direct mail (last chance)
```

### Step 4: Create Channel-Specific Messaging
Same core message, adapted to each channel's strengths.

### Step 5: Build Tracking by Channel
Unique tracking for each channel to measure contribution.

## Output Template
```yaml
output:
  multichannel_plan:
    channels_selected: []
    sequence_timeline: []
    channel_messaging: {}
    tracking_plan: {}
    budget_allocation: {}
    projected_multiplier: ""
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Media plan complete"
  context: "Distribution strategy and channels"


## Quality Gate
```yaml
quality:
  - [ ] Minimum 3 channels selected
  - [ ] Direct mail included (Kennedy's #1 channel)
  - [ ] Sequence timeline mapped with dates
  - [ ] Each channel has adapted messaging
  - [ ] Tracking unique per channel
  - [ ] Budget allocated with rationale
  - [ ] Follow-up built into sequence
```

## Handoff
- -> **kennedy-copy** for channel-specific copy
- -> **kennedy-direct-response** for tracking setup

---
*Task: KN_MD_001 | Agent: kennedy-media | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No campaign objective defined"
  - "No audience or budget specified"

elicit:
  - question: "What is the campaign objective and target audience?"
    required: true
  - question: "What channels do you have access to and what's your budget?"
    required: true

output_example: |
  ## Multichannel Strategy — Output
  **Source Framework:** Multimedia/Multichannel Imperative
  **Agent:** kennedy-media

  - Channel selection with rationale
  - Timed sequence across channels
  - Budget allocation and tracking plan

completion_criteria:
  - "3+ channels selected"
  - "Sequence timeline created"
  - "Tracking per channel"
```
