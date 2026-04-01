# Design Premium Offer for Affluent Clients

## Metadata
```yaml
task_id: KN_AF_002
agent: kennedy-affluent
type: creation
complexity: high
estimated_time: 60min
source: "Affluent Client Attraction Playbook — Premium Offer Design"
```

## Purpose

Design a premium-tier offer specifically for affluent clients. Affluent buyers don't want the cheapest option — they want the BEST option with maximum certainty, minimum friction, and elevated status.

> "The affluent don't buy products. They buy certainty, convenience, and status. Your premium offer must deliver all three." — Dan Kennedy

## The Framework: Premium Offer Architecture

### What Affluent Clients Pay Premium For
1. **Done-For-You** (not DIY)
2. **Guaranteed Results** (not "try and see")
3. **Personal Attention** (not group/mass)
4. **Speed** (not at their convenience, at THEIR timeline)
5. **Exclusivity** (not available to everyone)
6. **White Glove Service** (every detail handled)

### Premium Offer Components
```
CORE SERVICE (Done-For-You, not DIY)
+ GUARANTEED RESULT (specific outcome promised)
+ PERSONAL ACCESS (direct line, priority response)
+ EXCLUSIVE BONUSES (not available at lower tiers)
+ CONCIERGE SUPPORT (every detail handled)
+ STATUS MARKERS (VIP designation, exclusive community)
```

## Input Required
```yaml
input:
  current_offer: ""
  current_price: ""
  target_affluent_client: ""
  what_affluent_want: []
  delivery_capacity: ""
```

## Step-by-Step Process

### Step 1: Identify What Affluent Clients Would Pay 5-10x For
What would make this worth 5-10x the standard price?

### Step 2: Design the Done-For-You Version
Convert DIY elements into done-for-you.

### Step 3: Add Guaranteed Results
What specific outcome can you promise?

### Step 4: Layer in Exclusivity
Application process, limited spots, VIP access.

### Step 5: Price for Premium
Price should be 5-10x the standard offer — and feel like a bargain for what's included.

## Output Template
```yaml
output:
  premium_offer:
    name: ""
    price: ""
    vs_standard_price: ""
    components: []
    guarantee: ""
    exclusivity: ""
    capacity: ""
    positioning: ""
```


handoff:
  to: "kennedy-offers"
  trigger: "Affluent market analysis complete"
  context: "High-net-worth positioning and psychology"


## Quality Gate
```yaml
quality:
  - [ ] Offer includes done-for-you elements
  - [ ] Guaranteed result is specific
  - [ ] Personal access / concierge included
  - [ ] Exclusivity mechanisms present
  - [ ] Price is 5-10x standard
  - [ ] Affluent client would see this as the obvious choice
```

## Handoff
- -> **kennedy-offers** for offer stack integration
- -> **kennedy-sales-letter** for premium offer presentation

---
*Task: KN_AF_002 | Agent: kennedy-affluent | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No current offer to upgrade"
  - "No affluent client profile defined"

elicit:
  - question: "What do you currently offer and at what price?"
    required: true
  - question: "What would a 'white glove' version of your service look like?"
    required: true

output_example: |
  ## Premium Offer — Output
  **Source Framework:** Affluent Client Attraction Playbook
  **Agent:** kennedy-affluent

  - Premium offer with done-for-you elements
  - Guaranteed result and exclusivity
  - 5-10x pricing justified

completion_criteria:
  - "Done-for-you elements included"
  - "Guaranteed result specific"
  - "Premium pricing justified"
```
