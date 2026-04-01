# Plan Lumpy Mail Campaign

## Metadata
```yaml
task_id: KN_MD_003
agent: kennedy-media
type: creation
complexity: medium
estimated_time: 30-45min
source: "No B.S. Direct Marketing — Grabber/Lumpy Mail System"
```

## Purpose

Design a lumpy mail campaign — dimensional mail with a physical "grabber" object that guarantees the envelope gets opened and the letter gets read.

> "Lumpy mail has a near-100% open rate. Why? Because people can't resist finding out what's inside that oddly shaped package. Once they open it, you've won the first battle." — Dan Kennedy

## The Framework: Grabber Mail System

### What is a Grabber?
A physical object attached to or enclosed with a sales letter that:
1. Gets the envelope opened (curiosity)
2. Ties into the sales message (relevance)
3. Makes the letter memorable (retention)

### Classic Grabbers
| Object | Message Tie-In |
|--------|---------------|
| Dollar bill | "I'm putting my money where my mouth is..." |
| Aspirin | "Tired of headaches from your current vendor?" |
| Compass | "Lost in a sea of options? Let me guide you..." |
| Bandage | "Is your marketing bleeding money?" |
| Boomerang | "This offer keeps coming back because..." |
| Seed packet | "Plant the seeds of success..." |
| Magnifying glass | "Take a closer look at these results..." |
| Toy trash can | "Ready to throw out your old approach?" |

## Input Required
```yaml
input:
  campaign: ""
  audience: ""
  message_theme: ""
  budget_per_piece: ""
  quantity: ""
```

## Step-by-Step Process

### Step 1: Choose the Grabber Object
Match the object to your sales message theme.

### Step 2: Write the Tie-In Opening
First sentence references the grabber and bridges to the message.

### Step 3: Design the Full Package
Letter + grabber + envelope + response device.

### Step 4: Source the Grabbers
Find suppliers for bulk objects, calculate cost impact.

### Step 5: Test vs. Non-Lumpy Control
Always test lumpy vs. standard to measure the lift.

## Output Template
```yaml
output:
  lumpy_mail:
    grabber_object: ""
    tie_in_opening: ""
    letter_theme: ""
    full_package: []
    cost_per_piece: ""
    sourcing: ""
    test_plan: ""
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Media plan complete"
  context: "Distribution strategy and channels"


## Quality Gate
```yaml
quality:
  - [ ] Grabber ties directly into sales message
  - [ ] Opening sentence references the grabber
  - [ ] Package design is mail-able (weight, size)
  - [ ] Cost per piece calculated including grabber
  - [ ] Test plan includes non-lumpy control
  - [ ] Grabber is relevant, not gimmicky
```

## Handoff
- -> **kennedy-copy** for letter copywriting
- -> **kennedy-media** for production and sourcing

---
*Task: KN_MD_003 | Agent: kennedy-media | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No campaign or message theme defined"

elicit:
  - question: "What is the campaign message and who is the audience?"
    required: true
  - question: "What budget per piece (including grabber)?"
    required: false

output_example: |
  ## Lumpy Mail Campaign — Output
  **Source Framework:** Grabber/Lumpy Mail System
  **Agent:** kennedy-media

  - Grabber selected with message tie-in
  - Full package design
  - Cost and sourcing plan

completion_criteria:
  - "Grabber ties to message"
  - "Package design complete"
  - "Cost calculated"
```
