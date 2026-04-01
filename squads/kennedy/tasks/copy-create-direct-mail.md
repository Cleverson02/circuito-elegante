# Create Direct Mail Copy

## Metadata
```yaml
task_id: KN_CP_002
agent: kennedy-copy
type: creation
complexity: high
estimated_time: 60-90min
source: "Copywriting Academy + Ultimate Sales Letter — Direct Mail Copywriting"
```

## Purpose

Write direct mail copy that gets opened, read, and responded to. Kennedy considers direct mail the most powerful marketing channel — it's physical, personal, and cuts through digital noise.

> "Direct mail is the most reliable, predictable, controllable way to sell. While everyone else is fighting for attention in the inbox, your mail arrives in their hands." — Dan Kennedy

## The Framework: Direct Mail Copy System

### The 3 Jobs of Direct Mail Copy
1. **GET OPENED** — Envelope copy, format, lumpy mail
2. **GET READ** — Headline, opening, fascination
3. **GET RESPONSE** — Offer, urgency, response device

### The A-Pile / B-Pile Decision
Every piece of mail gets sorted in 3 seconds:
- **A-Pile:** Personal, interesting, must-open → YOUR mail goes here
- **B-Pile:** Junk, obvious ads, generic → Dies on the kitchen counter

## Input Required
```yaml
input:
  campaign: ""
  audience: ""
  offer: ""
  format: "letter | postcard | self-mailer | package | lumpy"
  budget_per_piece: ""
  list_source: ""
```

## Step-by-Step Process

### Step 1: Choose Mail Format
Match format to offer and audience.

### Step 2: Design the Envelope (A-Pile Strategy)
Options: blank envelope, teaser copy, handwriting, odd size, lumpy.

### Step 3: Write the Letter
Follow Kennedy's sales letter structure adapted for mail.

### Step 4: Design Response Device
Make responding as easy as possible: reply card, phone number, URL, QR code.

### Step 5: Add Personalization Elements
Name, city, industry-specific references.

## Output Template
```yaml
output:
  direct_mail_piece:
    format: ""
    envelope_strategy: ""
    letter_copy: ""
    response_device: ""
    personalization: []
    production_specs: {}
    estimated_response_rate: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Copy created and validated"
  context: "Validated copy ready for distribution"


## Quality Gate
```yaml
quality:
  - [ ] A-Pile envelope strategy designed
  - [ ] Headline follows Kennedy formula
  - [ ] Copy follows sales letter structure
  - [ ] Clear response device included
  - [ ] Personalization elements specified
  - [ ] Production specs provided
  - [ ] Would YOU open and read this if it arrived?
```

## Handoff
- -> **kennedy-media** for production and mailing logistics
- -> **kennedy-sales-letter** for long-form letter refinement

---
*Task: KN_CP_002 | Agent: kennedy-copy | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No target audience or offer defined"
  - "No mailing list identified"

elicit:
  - question: "Who is the audience and what offer are you mailing?"
    required: true
  - question: "What format do you prefer (letter, postcard, lumpy mail)?"
    required: false

output_example: |
  ## Direct Mail Copy — Output
  **Source Framework:** Copywriting Academy + Ultimate Sales Letter
  **Agent:** kennedy-copy

  - Complete mail piece with envelope, letter, response device
  - A-Pile strategy for maximum open rates
  - Production specs for printing and mailing

completion_criteria:
  - "A-Pile strategy designed"
  - "Complete copy written"
  - "Response device included"
```
