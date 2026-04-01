# Design Classic Mail-Order Ad

## Metadata
```yaml
task_id: KN_MD_005
agent: kennedy-media
type: creation
complexity: medium
estimated_time: 90min
source: "No B.S. Direct Marketing — Classic Mail-Order Ad Structure"
```

## Purpose
Design a classic direct response print ad following the proven mail-order advertising structure that has worked for over 100 years.

> "The classic mail-order ad structure has survived because it works. Headline, body, offer, CTA, response device. It's been tested more times than any other format in advertising history." — Dan Kennedy

## The Framework: Classic Mail-Order Structure
```
1. HEADLINE (largest type, benefit-driven)
2. SUB-HEADLINE (supports/expands headline)
3. OPENING (hook the reader)
4. BODY COPY (benefits, proof, story)
5. OFFER (what they get, what it costs)
6. GUARANTEE (risk reversal)
7. CTA (exactly what to do)
8. RESPONSE DEVICE (phone, URL, coupon)
9. DEADLINE (reason to act now)
```

## Input Required
```yaml
input:
  product: ""
  audience: ""
  publication: ""
  ad_size: ""
  offer: ""
```

## Output Template
```yaml
output:
  mail_order_ad:
    headline: ""
    subheadline: ""
    body_copy: ""
    offer: ""
    guarantee: ""
    cta: ""
    response_device: ""
    deadline: ""
    layout_specs: ""
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Media plan complete"
  context: "Distribution strategy and channels"


## Quality Gate
```yaml
quality:
  - [ ] All 9 elements present
  - [ ] Headline uses proven Kennedy formula
  - [ ] Response device is trackable
  - [ ] Deadline is real
  - [ ] Ad could work as a standalone sales piece
```

---
*Task: KN_MD_005 | Agent: kennedy-media | Version: 1.0*


## Classic Mail-Order Ad Structure

**Proven 9-Element Sequence:**
1. Attention-Getting Headline (with implied benefit)
2. Establish Credibility (authority, proof)
3. Define Problem (emotional connection)
4. Present Solution (your offer)
5. Proof/Evidence (testimonials, guarantees)
6. Stack Value (bonus, urgency, scarcity)
7. Risk Reversal (guarantee, trial period)
8. Clear CTA (phone number, URL, instructions)
9. Urgency/Deadline (limited offer window)


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No product or audience defined"
elicit:
  - question: "What product, audience, and publication is this ad for?"
    required: true
output_example: |
  ## Mail-Order Ad — Output
  **Agent:** kennedy-media
  - Complete 9-element ad with layout specs
completion_criteria:
  - "All 9 elements present"
  - "Response device trackable"
```
