# Create an Endorsed Mailing

## Metadata
```yaml
task_id: KN_RF_002
agent: kennedy-referrals
type: creation
complexity: medium
estimated_time: 45min
source: "Ultimate No BS Referral Machine — Endorsed Mailing System"
```

## Purpose

Create an endorsed mailing — a letter or promotion sent to someone else's list with their personal endorsement. Kennedy considers this the single most powerful form of direct mail because it arrives pre-sold.

> "An endorsed mailing to someone else's customer list is the closest thing to printing money in marketing. You get the trust of the endorser transferred to you instantly." — Dan Kennedy

## The Framework: Endorsed Mailing Architecture

### How It Works
```
PARTNER (has the list) → Endorses YOU to their list → You make the offer
```

### The 3 Components
1. **The Endorsement Letter** — Written by or attributed to the partner
2. **Your Offer** — Sales letter, flyer, or package enclosed
3. **The Response Device** — How recipients respond to you

### The Power of Transferred Trust
- Cold mail: 1-3% response rate
- Endorsed mail: 5-15% response rate (3-5x lift!)

## Input Required
```yaml
input:
  your_offer: ""
  partner_business: ""
  partner_list_size: ""
  relationship_with_partner: ""
  deal_structure: ""           # Revenue share, flat fee, reciprocal
```

## Step-by-Step Process

### Step 1: Identify Ideal Endorsement Partners
Who serves your target audience but doesn't compete?

### Step 2: Propose the Partnership
Offer a win-win: revenue share, reciprocal mailing, or flat fee.

### Step 3: Write the Endorsement Letter
The partner's voice endorsing you — must sound authentic.

### Step 4: Design Your Enclosed Offer
Standard sales letter adapted for the endorsed context.

### Step 5: Plan the Mailing
Logistics: who prints, who mails, who tracks.

## Output Template
```yaml
output:
  endorsed_mailing:
    partner: ""
    endorsement_letter: ""
    your_offer_piece: ""
    response_device: ""
    deal_structure: ""
    projected_response_rate: ""
    logistics: {}
```


handoff:
  to: "kennedy-business"
  trigger: "Referral system designed"
  context: "Referral mechanics and incentive structure"


## Quality Gate
```yaml
quality:
  - [ ] Endorsement letter sounds authentic to the partner
  - [ ] Your offer is relevant to the partner's audience
  - [ ] Deal structure is win-win
  - [ ] Response device tracks source as endorsed mailing
  - [ ] Logistics planned (printing, mailing, tracking)
  - [ ] Projected response rate based on endorsed mail benchmarks
```

## Handoff
- -> **kennedy-copy** for endorsement letter writing
- -> **kennedy-media** for production and mailing

---
*Task: KN_RF_002 | Agent: kennedy-referrals | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No endorsement partner identified"
  - "No offer to promote"

elicit:
  - question: "Who is the endorsement partner and what is their list size?"
    required: true
  - question: "What offer will you promote in the endorsed mailing?"
    required: true

output_example: |
  ## Endorsed Mailing — Output
  **Source Framework:** Endorsed Mailing System
  **Agent:** kennedy-referrals

  - Endorsement letter written
  - Offer piece designed
  - Deal structure and logistics planned

completion_criteria:
  - "Endorsement sounds authentic"
  - "Offer relevant to partner's audience"
  - "Deal is win-win"
```
