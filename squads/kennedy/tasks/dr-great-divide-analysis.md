# Perform The Great Divide Analysis

## Metadata
```yaml
task_id: KN_DR_005
agent: kennedy-direct-response
type: analysis
complexity: medium
estimated_time: 30min
source: "No B.S. Direct Marketing — The Great Divide (DR vs Institutional)"
```

## Purpose

Analyze all marketing spending to identify what is Direct Response (measurable, accountable) vs Institutional (unmeasurable "awareness"). Kennedy demands that every marketing dollar be accountable.

> "There's a Great Divide in marketing: on one side is Direct Response, where every dollar is accountable. On the other side is Institutional marketing, where money disappears into a black hole of 'brand awareness.' Choose your side." — Dan Kennedy

## The Framework: The Great Divide

### Direct Response Characteristics
- Specific offer with deadline
- Clear call to action
- Trackable response mechanism
- Measurable ROI
- Copy-driven, not design-driven

### Institutional Characteristics
- No specific offer
- No call to action
- No tracking
- "Brand awareness" as the goal
- Design-driven, not copy-driven

## Input Required
```yaml
input:
  business: ""
  marketing_budget: ""
  marketing_activities: []
```

## Step-by-Step Process

### Step 1: List ALL Marketing Activities and Spending
### Step 2: Classify Each as DR or Institutional
### Step 3: Calculate the Split (% DR vs % Institutional)
### Step 4: Convert Institutional to DR Where Possible
### Step 5: Eliminate Pure Institutional Spending

## Output Template
```yaml
output:
  great_divide:
    total_budget: ""
    dr_spending: ""
    institutional_spending: ""
    split_percentage: ""
    conversion_plan: []    # Convert institutional to DR
    elimination_plan: []   # Eliminate pure institutional
    projected_savings: ""
```


handoff:
  to: "kennedy-media"
  trigger: "DR campaign designed"
  context: "Campaign structure with tracking"


## Quality Gate
```yaml
quality:
  - [ ] All activities classified
  - [ ] Split calculated with percentages
  - [ ] Conversion plan for institutional items
  - [ ] Elimination plan for waste
  - [ ] Target: 80%+ of budget in DR
```

## Handoff
- -> **kennedy-audit** for full marketing audit
- -> **kennedy-media** for channel reallocation

---
*Task: KN_DR_005 | Agent: kennedy-direct-response | Version: 1.0*

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No marketing budget or activities listed"
elicit:
  - question: "List all your marketing activities and monthly spending per activity."
    required: true
output_example: |
  ## Great Divide Analysis — Output
  **Agent:** kennedy-direct-response
  - All activities classified DR vs Institutional
  - Conversion and elimination plans
completion_criteria:
  - "All activities classified"
  - "Conversion plan created"
  - "Target split defined"
```
