# Create DR Brand-Building Strategy

## Metadata
```yaml
task_id: KN_BR_001
agent: kennedy-brand
type: strategy
complexity: high
estimated_time: 60-90min
source: "No B.S. Guide to Brand-Building by Direct Response"
```

## Purpose

Build a brand through direct response marketing, not the other way around. Kennedy's approach is revolutionary: brand equity is a BY-PRODUCT of direct response marketing, not the goal. You build brand by selling, not by "building awareness."

> "Brand building without direct response is just expensive ego stroking. Real brands are built by selling — every sale strengthens the brand, and the brand makes every sale easier." — Dan Kennedy

## The Framework: Kennedy's Winning Formula

### The Winning Formula
```
ACQUISITION via Direct Response + RETENTION via Brand Loyalty = Maximum Profitability
```

### Brand-Building by DR Principles
1. Every marketing piece must sell AND build brand simultaneously
2. Brand equity comes from customer experience, not advertising
3. StorySelling is the bridge between DR and branding
4. Celebrity/authority is the fastest path to brand power
5. Consistent positioning across all touchpoints

### The Disney/Hefner Model
Kennedy uses Disney and Playboy as examples of brands built through selling:
- Disney: Every movie is a profit center AND brand builder
- Playboy: Every magazine issue sold AND built the brand

## Input Required
```yaml
input:
  business: ""
  current_brand_perception: ""
  desired_brand_perception: ""
  usp: ""
  story: ""
  dr_marketing_channels: []
```

## Step-by-Step Process

### Step 1: Define Brand Positioning (Through DR Lens)
What do you want to be known for? This must be provable through sales results.

### Step 2: Create the StorySelling Foundation
Kennedy's 4 Key Factors of StorySelling:
1. Authenticity — True, not manufactured
2. Relevance — Connects to audience desires
3. Emotion — Evokes feelings
4. Memorability — Sticks in the mind

### Step 3: Design DR Campaigns That Build Brand
Every piece of marketing does double duty.

### Step 4: Build Celebrity/Authority Assets
What makes you THE authority in your space?

### Step 5: Create Brand Consistency Guidelines
Ensure the brand message is consistent across all DR channels.

## Output Template
```yaml
output:
  dr_brand:
    brand_position: ""
    storyselling_foundation: {}
    winning_formula:
      acquisition_dr: []
      retention_brand: []
    authority_assets: []
    consistency_guidelines: {}
    implementation_plan: []
```


handoff:
  to: "kennedy-copy"
  trigger: "Brand strategy defined"
  context: "Brand positioning and messaging framework"


## Quality Gate
```yaml
quality:
  - [ ] Brand position defined through DR lens
  - [ ] StorySelling 4 factors addressed
  - [ ] Every marketing piece sells AND builds brand
  - [ ] Authority/celebrity assets planned
  - [ ] Consistency guidelines created
  - [ ] No "awareness only" campaigns
```

## Handoff
- -> **kennedy-direct-response** for DR campaign design
- -> **kennedy-copy** for StorySelling copy
- -> **kennedy-media** for multichannel brand consistency

---
*Task: KN_BR_001 | Agent: kennedy-brand | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business story or positioning defined"
  - "No DR marketing in place to build brand through"

elicit:
  - question: "What do you want your brand to be known for?"
    required: true
  - question: "What is your origin story and what makes you the authority?"
    required: true

output_example: |
  ## DR Brand Strategy — Output
  **Source Framework:** Brand-Building by Direct Response
  **Agent:** kennedy-brand

  - Brand position through DR lens
  - StorySelling foundation
  - Winning Formula implementation
  - Authority asset plan

completion_criteria:
  - "Brand position defined"
  - "StorySelling foundation created"
  - "Every piece sells AND builds brand"
```
