# Design Complete Magnetic Marketing 3-Pillar System

## Metadata
```yaml
task_id: KN_MG_004
agent: kennedy-magnetic
type: creation
complexity: high
estimated_time: 90-120min
source: "Magnetic Marketing — Complete 3-Pillar System"
```

## Purpose

Design the complete Magnetic Marketing system with all three pillars working together: Attraction (lead generation), Conversion (turning leads into buyers), and Retention (maximizing lifetime value).

> "Magnetic Marketing is a SYSTEM, not a tactic. When all three pillars work together, you create a self-sustaining marketing machine." — Dan Kennedy

## The Framework: The 3-Pillar System

### Pillar 1: ATTRACTION
How you magnetically attract your ideal prospects:
- Lead magnets that compel opt-in
- Authority positioning that attracts
- Media selection for maximum reach
- Referral systems that bring warm leads

### Pillar 2: CONVERSION
How you turn interested prospects into paying customers:
- Sales letters and presentations
- Shock and Awe packages
- Follow-up sequences (7-21 touches)
- Irresistible offers with bold guarantees

### Pillar 3: RETENTION
How you keep customers buying and referring:
- Monthly communication
- Ascension path (always a next purchase)
- Community and belonging
- Customer reactivation

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    usp: ""
    current_marketing: ""

  current_state:
    attraction_grade: ""       # A-F
    conversion_grade: ""       # A-F
    retention_grade: ""        # A-F
    biggest_gap: ""

  goals:
    revenue_target: ""
    customer_acquisition_target: ""
    retention_rate_target: ""
    timeline: ""
```

## Step-by-Step Process

### Step 1: Audit Current State of Each Pillar
Score each pillar A-F and identify the weakest link.

### Step 2: Design Pillar 1 — Attraction System
```yaml
attraction_system:
  lead_magnet: ""
  authority_positioning: []
  media_channels: []
  referral_program: ""
  estimated_leads_per_month: ""
```

### Step 3: Design Pillar 2 — Conversion System
```yaml
conversion_system:
  sales_letter: ""
  shock_awe_package: ""
  follow_up_sequence: ""
  offer_stack: ""
  guarantee: ""
  estimated_conversion_rate: ""
```

### Step 4: Design Pillar 3 — Retention System
```yaml
retention_system:
  monthly_communication: ""
  ascension_path: ""
  community: ""
  reactivation: ""
  estimated_retention_rate: ""
```

### Step 5: Connect All Three Pillars
Map the customer journey from first attraction to lifetime customer.

## Output Template
```yaml
output:
  magnetic_marketing_system:
    pillar_1_attraction: {}
    pillar_2_conversion: {}
    pillar_3_retention: {}
    customer_journey_map: ""
    projected_metrics:
      leads_per_month: ""
      conversion_rate: ""
      retention_rate: ""
      ltv: ""
    implementation_timeline: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Magnetic system designed"
  context: "Lead magnets, shock-and-awe, follow-up sequences"


## Quality Gate
```yaml
quality:
  - [ ] All three pillars designed with specific components
  - [ ] Customer journey mapped end-to-end
  - [ ] Projected metrics for each pillar
  - [ ] Weakest pillar has most detailed improvement plan
  - [ ] Direct mail integrated into at least 2 pillars
  - [ ] Implementation timeline realistic
```

## Handoff
- -> **kennedy-magnetic** sub-tasks for each pillar
- -> **kennedy-audit** for system validation

---
*Task: KN_MG_004 | Agent: kennedy-magnetic | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business information provided"
  - "No current marketing state described"

elicit:
  - question: "Describe your current marketing for each pillar (attraction, conversion, retention)."
    required: true
  - question: "What are your revenue and customer acquisition goals?"
    required: true

output_example: |
  ## 3-Pillar System — Output
  **Source Framework:** Magnetic Marketing 3-Pillar System
  **Agent:** kennedy-magnetic

  - Complete system design across all 3 pillars
  - Customer journey map
  - Projected metrics and timeline

completion_criteria:
  - "All 3 pillars designed"
  - "Customer journey mapped"
  - "Metrics projected"
```
