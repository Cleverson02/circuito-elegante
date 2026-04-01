# Create Renegade Millionaire Strategy

## Metadata
```yaml
task_id: KN_AD_001
agent: kennedy-advisor
type: strategy
complexity: high
estimated_time: 60-90min
source: "Renegade Millionaire Course — Renegade Millionaire System"
```

## Purpose

Apply Kennedy's Renegade Millionaire mindset to create a business strategy that defies conventional wisdom. Renegade Millionaires succeed BECAUSE they think differently — not despite it.

> "Renegade Millionaires don't follow the herd. They look at what everyone else is doing and deliberately do the opposite. The money is always where the crowd isn't." — Dan Kennedy

## The Framework: Renegade Millionaire Principles

### The 10 Renegade Principles
1. **Charge premium prices** — Never compete on price
2. **Fire bad customers** — Not all customers are worth having
3. **Say no to most opportunities** — Focus beats diversification
4. **Control your time ruthlessly** — Time > Money
5. **Invest in marketing, not hope** — Every dollar must return $5+
6. **Build systems, not jobs** — The business must run without you
7. **Think contrarian** — If everyone's doing it, don't
8. **Surround yourself with winners** — Peer group determines income
9. **Speed of implementation** — Execute first, perfect later
10. **Guard your mental environment** — Garbage in, garbage out

## Input Required
```yaml
input:
  business: ""
  current_conventional_approach: ""
  industry_norms: []
  desired_outcome: ""
  current_frustrations: []
```

## Step-by-Step Process

### Step 1: Identify Conventional Thinking
What does everyone in your industry do the same way?

### Step 2: Apply Renegade Lens
For each convention, ask: "What would a Renegade Millionaire do differently?"

### Step 3: Design Contrarian Strategies
Create 3-5 strategies that go against the grain.

### Step 4: Validate Renegade Approaches
Check: is this contrarian for the sake of results, or just for attention?

### Step 5: Build Implementation Plan
Execute the Renegade strategies with Kennedy's "speed of implementation."

## Output Template
```yaml
output:
  renegade_strategy:
    conventions_identified: []
    renegade_alternatives: []
    top_3_strategies: []
    implementation_plan: []
    expected_differentiation: ""
```


handoff:
  to: "kennedy-business"
  trigger: "Strategic advice complete"
  context: "Business strategy and action plan"


## Quality Gate
```yaml
quality:
  - [ ] Industry conventions clearly identified
  - [ ] Renegade alternatives are genuinely contrarian
  - [ ] Strategies are profitable, not just different
  - [ ] Implementation follows speed principle
  - [ ] Risk assessment included
```

## Handoff
- -> **kennedy-business** for business implementation
- -> **kennedy-brand** for positioning alignment

---
*Task: KN_AD_001 | Agent: kennedy-advisor | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No industry context provided"

elicit:
  - question: "What are the conventions in your industry that everyone follows?"
    required: true
  - question: "What outcome do you want that conventional thinking hasn't delivered?"
    required: true

output_example: |
  ## Renegade Strategy — Output
  **Agent:** kennedy-advisor
  - Conventions identified
  - Contrarian alternatives
  - Implementation plan

completion_criteria:
  - "Conventions identified"
  - "Renegade strategies designed"
  - "Implementation planned"
```
