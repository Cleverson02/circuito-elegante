# Design the Marketing Triangle

## Metadata
```yaml
task_id: KN_MG_006
agent: kennedy-magnetic
type: creation
complexity: medium
estimated_time: 45min
source: "Magnetic Marketing — Marketing Triangle System"
```

## Purpose

Design the complete Marketing Triangle ensuring the right Message reaches the right Market through the right Media. This is the foundational strategic framework before any tactical execution.

> "The Marketing Triangle is Message-Market-Media. Get all three right and you print money. Get one wrong and you hemorrhage cash." — Dan Kennedy

## The Framework: Marketing Triangle

```
         MESSAGE
        /       \
       /   $$$$  \
      /           \
   MARKET ------- MEDIA
```

### MESSAGE: What you say
- USP
- Offer
- Hook
- Story
- Guarantee

### MARKET: Who you say it to
- Target audience definition
- List quality and source
- Audience awareness level
- Buying capacity

### MEDIA: How you deliver it
- Channel selection
- Format (mail, email, print, digital)
- Frequency and timing
- Budget allocation

## Input Required
```yaml
input:
  business: ""
  current_message: ""
  current_market: ""
  current_media: []
```

## Step-by-Step Process

### Step 1: Define the Message
### Step 2: Define the Market
### Step 3: Select the Media
### Step 4: Align All Three
### Step 5: Test the Triangle

## Output Template
```yaml
output:
  marketing_triangle:
    message:
      usp: ""
      offer: ""
      hook: ""
      guarantee: ""
    market:
      primary_target: ""
      list_source: ""
      awareness_level: ""
    media:
      primary: ""
      secondary: []
      budget: ""
    alignment_score: "/10"
    test_plan: []
```


handoff:
  to: "kennedy-media"
  trigger: "Magnetic system designed"
  context: "Lead magnets, shock-and-awe, follow-up sequences"


## Quality Gate
```yaml
quality:
  - [ ] Message is clear and compelling
  - [ ] Market is specific and reachable
  - [ ] Media matches the market's consumption habits
  - [ ] All three are aligned and reinforcing
  - [ ] Test plan to validate the triangle
```

## Handoff
- -> **kennedy-direct-response** for campaign execution
- -> **kennedy-audit** for triangle validation

---
*Task: KN_MG_006 | Agent: kennedy-magnetic | Version: 1.0*

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business context provided"
elicit:
  - question: "What is your current message, market, and media?"
    required: true
output_example: |
  ## Marketing Triangle — Output
  **Agent:** kennedy-magnetic
  - Complete triangle with alignment score
completion_criteria:
  - "All 3 sides defined"
  - "Alignment verified"
  - "Test plan created"
```
