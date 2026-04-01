# Build a Shock and Awe Package

## Metadata
```yaml
task_id: KN_MG_002
agent: kennedy-magnetic
type: creation
complexity: high
estimated_time: 60-90min
source: "Magnetic Marketing — Shock and Awe System"
```

## Purpose

Design a Shock and Awe package that overwhelms prospects with so much proof, value, and credibility that they feel compelled to do business with you. This is Kennedy's secret weapon for converting leads into customers — a physical package so impressive it changes the dynamic from "pest" to "welcome guest."

> "The Shock and Awe package is your silent salesman. It arrives, overwhelms with value and proof, and pre-sells the prospect before you ever talk to them." — Dan Kennedy

## The Framework: Shock and Awe Architecture

### What Goes In the Package

| Component | Purpose | Format |
|-----------|---------|--------|
| Sales Letter | The pitch | Printed, 4-12 pages |
| Book/Report | Authority proof | Printed booklet |
| Testimonial Sheet | Social proof | 1-page printed |
| Case Studies | Results proof | 2-4 pages |
| Media Coverage | Third-party validation | Copies of articles |
| DVD/USB/Link | Demonstrate expertise | Video presentation |
| Credentials Sheet | Credibility | Bio, awards, certifications |
| FAQ Sheet | Objection handling | 1-page Q&A |
| "Grabber" | Attention/memory | Physical object |
| Business Card | Contact info | Premium quality |

### Shock and Awe Package Design Principles
1. **Physical is mandatory** — Digital cannot replicate the impact
2. **Overwhelming quantity** — More is more (within reason)
3. **Professional presentation** — Premium folder, quality printing
4. **Every piece has a job** — No filler, no fluff
5. **Pre-frames the sale** — Prospect is 50% sold before talking to you

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    usp: ""
    credentials: []
    media_coverage: []
    testimonials: []
    case_studies: []

  audience:
    who: ""
    typical_deal_size: ""
    decision_process: ""

  budget:
    per_package: ""
    target_quantity: ""
```

## Step-by-Step Process

### Step 1: Inventory Your Proof Assets
List everything you currently have:
```yaml
proof_inventory:
  testimonials: []
  case_studies: []
  media_mentions: []
  credentials: []
  books_published: []
  speaking_engagements: []
  awards: []
  years_in_business: ""
  clients_served: ""
  results_achieved: []
```

### Step 2: Identify Gaps and Create Missing Pieces
What proof assets are you missing? Create them:
- No book? → Write a free report or guide
- No testimonials? → Collect them NOW
- No case studies? → Document 3 client success stories
- No media? → Write articles, get on podcasts

### Step 3: Design the Package Components
For each component, define the content, format, and production specs.

### Step 4: Design the Physical Presentation
```yaml
physical_specs:
  folder_type: ""              # Presentation folder, box, envelope
  paper_quality: ""            # Premium, standard
  printing: ""                 # Full color, 2-color
  branding: ""                 # Logo, colors, professional look
  total_pieces: 0
  estimated_weight: ""
  mailing_specs: ""
```

### Step 5: Create the Delivery Trigger
When does someone receive the Shock and Awe package?
- After opting in for lead magnet
- After requesting information
- Before a scheduled appointment
- After initial phone consultation

## Output Template
```yaml
output:
  shock_awe_package:
    name: ""
    target_audience: ""
    components: []
    physical_specs: {}
    delivery_trigger: ""
    cost_per_package: ""
    estimated_conversion_lift: ""
    production_timeline: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Magnetic system designed"
  context: "Lead magnets, shock-and-awe, follow-up sequences"


## Quality Gate
```yaml
quality:
  - [ ] Minimum 8 components in the package
  - [ ] Physical format (not just digital)
  - [ ] Includes at least 3 types of proof
  - [ ] Professional presentation design specified
  - [ ] Sales letter included as centerpiece
  - [ ] Clear delivery trigger defined
  - [ ] Cost per package calculated
  - [ ] Package would impress YOU if you received it
```

## Handoff
- -> **kennedy-sales-letter** for package sales letter
- -> **kennedy-media** for production and mailing logistics
- -> **kennedy-copy** for component copywriting

---
*Task: KN_MG_002 | Agent: kennedy-magnetic | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No proof assets available (no testimonials, no case studies)"
  - "No target audience defined"

elicit:
  - question: "What proof assets do you currently have (testimonials, case studies, media, etc.)?"
    required: true
  - question: "What is your budget per package and target audience?"
    required: true

output_example: |
  ## Shock and Awe Package — Output
  **Source Framework:** Magnetic Marketing Shock and Awe System
  **Agent:** kennedy-magnetic

  - Complete package design with 8+ components
  - Physical specs and production plan
  - Delivery trigger and conversion bridge

completion_criteria:
  - "Minimum 8 components designed"
  - "Physical format specified"
  - "Production plan with cost"
```
