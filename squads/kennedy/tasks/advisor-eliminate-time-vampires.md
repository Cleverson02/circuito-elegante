# Eliminate Time Vampires

## Metadata
```yaml
task_id: KN_AD_002
agent: kennedy-advisor
type: optimization
complexity: medium
estimated_time: 30-45min
source: "Renegade Millionaire Course — Time Vampires Framework + Peak Productivity"
```

## Purpose

Identify and eliminate "Time Vampires" — people, activities, and habits that drain your productive time. Kennedy's Peak Productivity System starts with ruthlessly eliminating time waste.

> "Time Vampires are everywhere. They disguise themselves as 'urgent' meetings, 'important' phone calls, and 'necessary' tasks. Your job is to drive a stake through their heart." — Dan Kennedy

## The Framework: Time Vampires

### The 5 Types of Time Vampires
1. **People Vampires** — Others who steal your time (meetings, calls, drop-ins)
2. **Task Vampires** — Low-value activities that feel productive but aren't
3. **Technology Vampires** — Email, social media, notifications
4. **Decision Vampires** — Overthinking, analysis paralysis
5. **Environment Vampires** — Distracting workplace, wrong location

### Peak Productivity Formula
```
PRODUCTIVE HOURS = Total Hours - Time Vampire Hours
INCOME PER HOUR = Revenue / Productive Hours
GOAL: Maximize income per productive hour
```

## Input Required
```yaml
input:
  typical_day: ""
  biggest_time_wasters: []
  hourly_income_target: ""
  current_productive_hours: ""
```

## Step-by-Step Process

### Step 1: Time Audit
Track a typical day hour-by-hour. Categorize each activity.

### Step 2: Identify All Time Vampires
List every vampire by type.

### Step 3: Calculate the Cost
What is each vampire costing you in lost productive hours and income?

### Step 4: Create Elimination/Reduction Plan
For each vampire: Eliminate, Delegate, Systematize, or Reduce.

### Step 5: Design Protective Systems
Gatekeepers, scheduling rules, communication protocols.

## Output Template
```yaml
output:
  time_vampires:
    vampires_identified: []
    cost_per_vampire: {}
    elimination_plan: []
    protective_systems: []
    projected_productive_hours_gained: ""
    projected_income_impact: ""
```


handoff:
  to: "kennedy-business"
  trigger: "Strategic advice complete"
  context: "Business strategy and action plan"


## Quality Gate
```yaml
quality:
  - [ ] All 5 vampire types assessed
  - [ ] Cost calculated per vampire
  - [ ] Elimination plan for each (eliminate/delegate/systematize/reduce)
  - [ ] Protective systems designed
  - [ ] Projected time and income gains calculated
```

## Handoff
- -> **kennedy-business** for system building
- -> **kennedy-advisor** for ongoing accountability

---
*Task: KN_AD_002 | Agent: kennedy-advisor | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No time usage data provided"

elicit:
  - question: "Describe a typical day and your biggest time wasters."
    required: true

output_example: |
  ## Time Vampires Elimination — Output
  **Agent:** kennedy-advisor
  - All vampires identified and costed
  - Elimination plan
  - Protective systems

completion_criteria:
  - "Vampires identified"
  - "Costs calculated"
  - "Elimination plan created"
```
