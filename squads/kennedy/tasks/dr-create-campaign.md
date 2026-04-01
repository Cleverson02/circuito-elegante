# Create a Direct Response Campaign

## Metadata
```yaml
task_id: KN_DR_001
agent: kennedy-direct-response
type: creation
complexity: high
estimated_time: 90-120min
source: "No B.S. Direct Marketing — 10 Rules + Results Triangle"
```

## Purpose

Design a complete direct response marketing campaign following Kennedy's 10 No B.S. Rules and the Results Triangle. Every element must be measurable, trackable, and designed to generate a specific, quantifiable response.

> "If you can't measure it, you can't manage it. And if you can't manage it, you're not doing direct response marketing — you're doing 'hope and pray' marketing." — Dan Kennedy

## The Framework: Kennedy's Direct Response Foundation

### The Results Triangle
```
                    RESULTS
                   /       \
                  /         \
                 /           \
            MESSAGE -------- MARKET
                  \         /
                   \       /
                    MEDIA
```
**RESULTS = RIGHT Message + RIGHT Market + RIGHT Media**

### The 10 No B.S. Rules of Direct Response

| # | Rule | Implication |
|---|------|-------------|
| 1 | There shall always be one or more offers | Every piece demands action |
| 2 | There shall be a reason to respond now | Urgency is mandatory |
| 3 | Clear instructions on how to respond | No confusion, no friction |
| 4 | Tracking and measurement | Every dollar accountable |
| 5 | Brand building is a by-product, not a goal | Direct response first |
| 6 | Follow-up relentlessly | Most sales in follow-up |
| 7 | Strong copy, not pretty design | Copy sells, design supports |
| 8 | Results Rule, period | Only results matter |
| 9 | Test everything | Never assume, always test |
| 10 | Mail is king | Direct mail outperforms |

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    usp: ""

  results_triangle:
    message:
      big_promise: ""
      usp: ""
      offer: ""
    market:
      who: ""
      list_source: ""
      list_size: ""
    media:
      primary_channel: ""
      secondary_channels: []
      budget: ""

  campaign:
    objective: "lead gen | sale | appointment | event"
    target_response_rate: ""
    target_roi: ""
    timeline: ""
```

## Step-by-Step Process

### Step 1: Validate the Results Triangle
Before designing any campaign element, ALL three sides must be solid:

**Message Validation:**
- Is the USP clear and defensible?
- Is the offer irresistible (Kennedy's "make them feel stupid saying no" test)?
- Is there a reason to respond RIGHT NOW?

**Market Validation:**
- Is the list/audience the RIGHT people?
- Is the list clean and current?
- Are these people who CAN buy (afford it, authority, need)?

**Media Validation:**
- Does this channel reach the target market?
- Can we track response from this specific channel?
- Is the media format right for the message complexity?

### Step 2: Apply All 10 Rules
For each campaign piece, verify all 10 rules are followed:

```yaml
rules_compliance:
  rule_1_offer: ""             # What specific offer is made?
  rule_2_urgency: ""           # What is the deadline/scarcity?
  rule_3_instructions: ""      # Exactly how to respond?
  rule_4_tracking: ""          # How will we track?
  rule_5_dr_first: ""          # Is this direct response, not branding?
  rule_6_follow_up: ""         # What's the follow-up plan?
  rule_7_copy_driven: ""       # Is copy the hero, not design?
  rule_8_results: ""           # How do we define success?
  rule_9_testing: ""           # What are we testing?
  rule_10_mail: ""             # Is direct mail included?
```

### Step 3: Design the Campaign Sequence
Map the entire campaign from first touch to final follow-up:

```
STEP 1: Initial contact (mail/email/ad)
STEP 2: Response handling (what happens when they respond)
STEP 3: Immediate follow-up (within 24 hours)
STEP 4: Nurture sequence (if no immediate sale)
STEP 5: Conversion event (sales call, webinar, visit)
STEP 6: Post-sale follow-up (ascension, referral)
```

### Step 4: Build Tracking Infrastructure
Every element must have a unique tracking mechanism:
- Unique phone numbers per channel
- Unique URLs/landing pages per campaign
- Source codes on all response devices
- CRM tracking from first touch to sale

### Step 5: Design the Test Plan
What to test FIRST (highest impact):
1. List/audience selection (biggest lever)
2. Offer (second biggest lever)
3. Headline/hook (third biggest lever)
4. Copy body
5. Format/design
6. Timing

## Output Template
```yaml
output:
  dr_campaign:
    name: ""
    objective: ""
    results_triangle:
      message: ""
      market: ""
      media: ""
    campaign_sequence: []
    tracking_plan: []
    test_plan: []
    budget: ""
    projected_roi: ""
    timeline: ""
    rules_compliance_score: "/10"
```


handoff:
  to: "kennedy-media"
  trigger: "DR campaign designed"
  context: "Campaign structure with tracking"


## Quality Gate
```yaml
quality:
  - [ ] Results Triangle validated (all 3 sides solid)
  - [ ] All 10 No B.S. Rules followed in every piece
  - [ ] Campaign sequence mapped from first touch to follow-up
  - [ ] Tracking infrastructure designed for every element
  - [ ] Test plan identifies top 3 variables
  - [ ] Budget and projected ROI calculated
  - [ ] Direct mail is included (Kennedy's Rule #10)
  - [ ] Follow-up sequence of minimum 7 touches
```

## Handoff
- -> **kennedy-copy** for copywriting of campaign pieces
- -> **kennedy-media** for media buying and production
- -> **kennedy-audit** for campaign performance tracking

---
*Task: KN_DR_001 | Agent: kennedy-direct-response | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "Results Triangle not defined (message, market, or media missing)"
  - "No measurable objective specified"
  - "No tracking mechanism planned"

elicit:
  - question: "What is your Results Triangle (message, market, media)?"
    required: true
  - question: "What is the campaign objective and target ROI?"
    required: true

output_example: |
  ## DR Campaign — Output
  **Source Framework:** 10 No B.S. Rules + Results Triangle
  **Agent:** kennedy-direct-response

  - Complete campaign design with all 10 rules compliance
  - Campaign sequence from first touch to follow-up
  - Tracking and test plan

completion_criteria:
  - "Results Triangle validated"
  - "All 10 rules compliance verified"
  - "Campaign sequence complete"
```
