# Write Powerful P.S. Sections

## Metadata
```yaml
task_id: KN_SL_004
agent: kennedy-sales-letter
type: creation
complexity: low
estimated_time: 15-20min
source: "The Ultimate Sales Letter — Step 14: The P.S."
```

## Purpose

Write P.S. sections that serve as the second most-read part of any sales letter. Kennedy teaches that many readers skip to the P.S. first — it must function as a mini sales letter on its own.

> "The P.S. is the second most-read part of a letter, after the headline. Many people read the headline, skip to the P.S., then decide whether to read the rest." — Dan Kennedy

## The Framework: 5 Types of P.S.

### Type 1: Restate the Offer
Summarize the entire offer in 2-3 sentences for scanners.

### Type 2: Add Urgency/Deadline
Introduce scarcity the reader might have missed.

### Type 3: Introduce New Benefit
Add one compelling benefit NOT mentioned in the body.

### Type 4: Testimonial Close
Feature a powerful testimonial to close with proof.

### Type 5: Personal Note
Add a personal, conversational appeal.

## Input Required
```yaml
input:
  offer_summary: ""
  deadline: ""
  additional_benefit: ""
  best_testimonial: ""
  personal_angle: ""
```

## Step-by-Step Process

### Step 1: Write P.S. #1 (Offer Restatement)
Condense the entire offer into 3 sentences: what they get, what it costs, how to respond.

### Step 2: Write P.P.S. (Urgency)
Add a genuine deadline or scarcity element.

### Step 3: Write P.P.P.S. (Optional — Testimonial or New Benefit)
One additional hook for readers who need more convincing.

### Step 4: Test All P.S. Types
Draft versions using each of the 5 types, select the strongest combination.

## Output Template
```yaml
output:
  ps_section:
    ps_1:
      type: ""
      copy: ""
    pps:
      type: ""
      copy: ""
    ppps:
      type: ""
      copy: ""
    recommended_combination: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Sales letter complete"
  context: "Validated sales letter ready for deployment"


## Quality Gate
```yaml
quality:
  - [ ] P.S. #1 can stand alone as a mini sales pitch
  - [ ] Urgency element is genuine, not manufactured
  - [ ] P.S. section would convince a scanner to read the letter
  - [ ] Maximum 3 P.S. sections (more dilutes impact)
  - [ ] Each P.S. serves a different function
```

## Handoff
- -> **kennedy-sales-letter** for integration into complete sales letter

---
*Task: KN_SL_004 | Agent: kennedy-sales-letter | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No offer summary available"
  - "Sales letter body not yet written"

elicit:
  - question: "What is the core offer and any deadline/scarcity elements?"
    required: true

output_example: |
  ## P.S. Section — Output
  **Source Framework:** Ultimate Sales Letter Step 14
  **Agent:** kennedy-sales-letter

  - 3 P.S. sections with different functions
  - Standalone mini-pitch capability verified

completion_criteria:
  - "P.S. functions as standalone mini sales pitch"
  - "Urgency element is genuine"
  - "Maximum 3 P.S. sections"
```
