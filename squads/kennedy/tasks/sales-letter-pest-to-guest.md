# Apply Pest-to-Welcome-Guest Transformation

## Metadata
```yaml
task_id: KN_SL_005
agent: kennedy-sales-letter
type: strategy
complexity: medium
estimated_time: 30-45min
source: "The Ultimate Sales Letter — Pest-to-Welcome-Guest Framework"
```

## Purpose

Transform your marketing approach from "pest" (unwanted interruption) to "welcome guest" (eagerly anticipated). Kennedy's framework turns cold outreach into warm invitation through positioning, pre-framing, and value-first approaches.

> "There are only two kinds of salespeople: pests and welcome guests. The pest pushes his product on anyone with a pulse. The welcome guest is invited in because he brings value." — Dan Kennedy

## The Framework: Pest vs. Welcome Guest

### The Pest (What to STOP Doing)
```
- Cold-calling without pre-frame
- Mass advertising without targeting
- Leading with "Buy my stuff"
- Commodity positioning
- Competing on price
- Chasing prospects
- No differentiation
```

### The Welcome Guest (What to START Doing)
```
- Magnetic attraction via lead magnets
- Pre-frame before contact (shock & awe)
- Leading with education and value
- Expert/authority positioning
- Competing on unique value
- Prospects come to you
- Clear USP differentiation
```

## Input Required
```yaml
input:
  current_approach: ""         # How you currently reach prospects
  pest_behaviors: []           # What "pest" activities you're doing
  audience: ""
  expertise: ""
  available_content: []        # Books, reports, case studies, etc.
```

## Step-by-Step Process

### Step 1: Audit Current "Pest" Behaviors
Identify everything in your current marketing that feels like an interruption.

### Step 2: Design the Authority Positioning
What makes you the expert they WANT to hear from?
- Published materials (books, reports, articles)
- Media appearances
- Speaking engagements
- Client results / case studies
- Proprietary systems / frameworks

### Step 3: Create the Pre-Frame Sequence
Before any sales conversation, prospects should encounter:
1. Educational content that demonstrates expertise
2. Social proof that validates credibility
3. A "shock and awe" package that overwhelms with value
4. A clear invitation (not a pitch) to take the next step

### Step 4: Build the Magnetic Attraction System
Replace outbound "pest" activities with inbound "welcome guest" systems:
- Lead magnet that solves a real problem
- Free report / book / video that positions as authority
- Referral system from existing clients
- Strategic alliances with other welcome guests

### Step 5: Test the Transformation
Measure: Are prospects now coming to YOU, or are you still chasing them?

## Output Template
```yaml
output:
  pest_to_guest:
    pest_behaviors_identified: []
    guest_positioning_elements: []
    pre_frame_sequence: []
    magnetic_attraction_system: []
    transformation_timeline: ""
    expected_shift: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Sales letter complete"
  context: "Validated sales letter ready for deployment"


## Quality Gate
```yaml
quality:
  - [ ] All pest behaviors identified and mapped
  - [ ] Authority positioning elements defined
  - [ ] Pre-frame sequence designed with 3+ touchpoints
  - [ ] Magnetic attraction system replaces at least 3 pest behaviors
  - [ ] Prospects will come to YOU, not the other way around
  - [ ] USP clearly differentiates from commodity competitors
```

## Handoff
- -> **kennedy-magnetic** for lead magnet creation
- -> **kennedy-offers** for USP refinement
- -> **kennedy-brand** for authority positioning

---
*Task: KN_SL_005 | Agent: kennedy-sales-letter | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No current marketing approach described"
  - "No target audience defined"

elicit:
  - question: "How do you currently reach and contact prospects?"
    required: true
  - question: "What expertise or authority elements do you have?"
    required: false

output_example: |
  ## Pest-to-Welcome-Guest Transformation — Output
  **Source Framework:** Ultimate Sales Letter Pest-to-Guest
  **Agent:** kennedy-sales-letter

  - Pest behavior audit
  - Welcome guest positioning system
  - Pre-frame sequence design

completion_criteria:
  - "All pest behaviors identified"
  - "Guest positioning designed"
  - "Magnetic attraction system defined"
```
