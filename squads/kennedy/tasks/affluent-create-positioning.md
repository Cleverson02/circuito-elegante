# Create Affluent Client Positioning

## Metadata
```yaml
task_id: KN_AF_001
agent: kennedy-affluent
type: strategy
complexity: high
estimated_time: 60-90min
source: "Affluent Client Attraction Playbook (10 transcriptions)"
```

## Purpose

Position your business to attract affluent clients — the top 1-5% who pay premium prices without haggling, refer others like them, and stay loyal for life. Kennedy teaches that affluent marketing requires fundamentally different positioning than mass-market marketing.

> "The affluent don't buy the cheapest. They buy the best. They don't negotiate — they validate. Position yourself as the best, and price becomes irrelevant." — Dan Kennedy

## The Framework: Affluent Client Attraction System

### Affluent Psychology Map
What the affluent value (different from mass market):
1. **Time savings** over money savings
2. **Exclusivity** over accessibility
3. **Expertise** over generalism
4. **Certainty** over hope
5. **Status** over practicality
6. **Relationship** over transaction
7. **Privacy** over publicity
8. **Quality** over quantity

### Premium Positioning Framework
```
MASS MARKET:        "We're affordable and accessible"
PREMIUM:            "We're the best in our category"
ULTRA-PREMIUM:      "We serve a select few who demand the absolute best"
```

## Input Required
```yaml
input:
  business: ""
  current_positioning: ""
  current_client_profile: ""
  desired_client_profile: ""
  premium_capabilities: []
  credentials: []
```

## Step-by-Step Process

### Step 1: Define Your Affluent Ideal Client
Demographics, psychographics, buying behavior of affluent target.

### Step 2: Audit Current Positioning
Where are you positioned now? What signals are you sending?

### Step 3: Design Premium Positioning Elements
- Language shifts (from mass-market to affluent)
- Visual identity upgrade
- Pricing structure (premium, not discounted)
- Service delivery (white glove)
- Communication style (personal, private)

### Step 4: Create Exclusivity Mechanisms
- Application process
- Limited availability
- Invitation only
- Waitlist

### Step 5: Build Authority Assets
What makes you the obvious choice for the affluent?

## Output Template
```yaml
output:
  affluent_positioning:
    ideal_affluent_client: {}
    current_vs_desired: {}
    positioning_elements: []
    exclusivity_mechanisms: []
    authority_assets: []
    pricing_strategy: ""
    implementation_timeline: ""
```


handoff:
  to: "kennedy-offers"
  trigger: "Affluent market analysis complete"
  context: "High-net-worth positioning and psychology"


## Quality Gate
```yaml
quality:
  - [ ] Affluent ideal client defined with psychographics
  - [ ] Current positioning audit complete
  - [ ] Premium positioning elements designed
  - [ ] Exclusivity mechanisms in place
  - [ ] Authority assets identified or planned
  - [ ] Pricing reflects premium positioning
  - [ ] Communication style matches affluent expectations
```

## Handoff
- -> **kennedy-brand** for brand identity alignment
- -> **kennedy-offers** for premium offer design
- -> **kennedy-copy** for affluent-targeted copy

---
*Task: KN_AF_001 | Agent: kennedy-affluent | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business information provided"
  - "No desire to serve affluent clients articulated"

elicit:
  - question: "What does your ideal affluent client look like?"
    required: true
  - question: "What premium capabilities or credentials do you have?"
    required: true

output_example: |
  ## Affluent Positioning — Output
  **Source Framework:** Affluent Client Attraction Playbook
  **Agent:** kennedy-affluent

  - Affluent ideal client profile
  - Premium positioning design
  - Exclusivity mechanisms
  - Authority asset plan

completion_criteria:
  - "Affluent client defined"
  - "Premium positioning designed"
  - "Exclusivity mechanisms created"
```
