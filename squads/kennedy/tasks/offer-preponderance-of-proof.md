# Build Preponderance of Proof

## Metadata
```yaml
task_id: KN_OF_003
agent: kennedy-offers
type: creation
complexity: medium
estimated_time: 45-60min
source: "Brass Balls Course — Preponderance of Proof Framework"
```

## Purpose

Assemble overwhelming proof that your product/service delivers on its promises. Kennedy's "Preponderance of Proof" means stacking so many different types of evidence that doubt becomes impossible.

> "One testimonial is a claim. Ten testimonials is a trend. A hundred testimonials, plus data, plus case studies, plus expert endorsements — that's a preponderance of proof. At that point, NOT believing you requires effort." — Dan Kennedy

## The Framework: 8 Types of Proof

| # | Type | Weight | Example |
|---|------|--------|---------|
| 1 | Testimonials | High | Customer success stories |
| 2 | Case Studies | Very High | Detailed before/after |
| 3 | Statistics / Data | High | "93% of clients see results in 30 days" |
| 4 | Expert Endorsements | High | Industry authority validates |
| 5 | Media Coverage | Very High | "As seen in Forbes, Inc, WSJ" |
| 6 | Demonstrations | Very High | Live proof it works |
| 7 | Credentials | Medium | Certifications, awards, years |
| 8 | Guarantees | High | "If it doesn't work, you pay nothing" |

## Input Required
```yaml
input:
  product_service: ""
  claims_to_prove: []
  available_proof:
    testimonials: []
    case_studies: []
    statistics: []
    endorsements: []
    media: []
    credentials: []
```

## Step-by-Step Process

### Step 1: List Every Claim You Make
What promises does your marketing make? Each one needs proof.

### Step 2: Inventory Existing Proof
What proof do you already have for each claim?

### Step 3: Identify Proof Gaps
Which claims have insufficient proof? These are vulnerabilities.

### Step 4: Create Missing Proof
Systematically fill gaps — collect testimonials, create case studies, gather data.

### Step 5: Assemble the Proof Stack
For each major claim, stack 3-5 different types of proof.

## Output Template
```yaml
output:
  proof_stack:
    claims_and_proof:
      - claim: ""
        proof_types_available: []
        proof_gaps: []
        proof_creation_plan: []
    total_proof_score: "/10"
    recommendations: []
```


handoff:
  to: "kennedy-copy"
  trigger: "Offer designed and validated"
  context: "Irresistible offer with guarantee and urgency"


## Quality Gate
```yaml
quality:
  - [ ] Every marketing claim has at least 2 types of proof
  - [ ] No major claim is unsubstantiated
  - [ ] Proof gap filling plan created
  - [ ] Testimonials are specific (results, timeframes, names)
  - [ ] At least one case study with before/after data
  - [ ] Proof stack would convince a skeptical buyer
```

## Handoff
- -> **kennedy-sales-letter** for proof section integration
- -> **kennedy-magnetic** for shock and awe package

---
*Task: KN_OF_003 | Agent: kennedy-offers | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No claims to prove identified"

elicit:
  - question: "What claims does your marketing make?"
    required: true
  - question: "What proof do you currently have (testimonials, case studies, data)?"
    required: true

output_example: |
  ## Preponderance of Proof — Output
  **Source Framework:** Brass Balls Course
  **Agent:** kennedy-offers

  - Claims mapped to available proof
  - Gaps identified with creation plan
  - Proof stack assembled

completion_criteria:
  - "Every claim has 2+ types of proof"
  - "Gaps identified and planned"
  - "Proof stack assembled"
```
