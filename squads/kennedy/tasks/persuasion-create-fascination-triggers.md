# Create Fascination Triggers

## Metadata
```yaml
task_id: KN_PR_001
agent: kennedy-persuasion
type: creation
complexity: high
estimated_time: 60min
source: "Fascination Marketing System (12 transcriptions)"
```

## Purpose

Create fascination triggers — psychological hooks that make people unable to stop thinking about your product, service, or message. Kennedy's Fascination Marketing System uses specific psychological patterns to create irresistible curiosity.

> "Fascination is the most powerful selling tool in existence. A fascinated prospect doesn't comparison-shop. They don't negotiate. They don't ask for references. They just buy." — Dan Kennedy

## The Framework: 7 Fascination Triggers

| # | Trigger | Mechanism | Example |
|---|---------|-----------|---------|
| 1 | Forbidden Knowledge | "They don't want you to know..." | Insider secrets, suppressed info |
| 2 | Mystique/Mystery | Incomplete information compels completion | "The answer surprised everyone..." |
| 3 | Power/Control | Promise of mastery over situation | "Take control of your finances" |
| 4 | Prestige/Status | Elevation above peers | "Join the top 1% who..." |
| 5 | Alarm/Urgency | Fear of threat or deadline | "Before it's too late..." |
| 6 | Vice/Rebellion | Breaking rules, shortcuts | "The 'lazy' way to..." |
| 7 | Trust/Belonging | Community, insider access | "Join our private circle" |

## Input Required
```yaml
input:
  product_service: ""
  audience: ""
  audience_desires: []
  audience_fears: []
  unique_angles: []
```

## Step-by-Step Process

### Step 1: Map Audience Psychology
What fascinates this audience? What keeps them up at night?

### Step 2: Generate Triggers for Each of the 7 Types
Create 3-5 fascination hooks per trigger type.

### Step 3: Test for Irresistibility
Would this trigger make someone stop scrolling? Stop and read? Pick up the phone?

### Step 4: Rank and Select Top Triggers
Choose the strongest for each marketing piece.

### Step 5: Deploy Across Campaign
Headlines, bullets, subject lines, hooks — fascination everywhere.

## Output Template
```yaml
output:
  fascination_triggers:
    by_type:
      forbidden_knowledge: []
      mystique: []
      power: []
      prestige: []
      alarm: []
      vice: []
      trust: []
    top_10: []
    deployment_plan:
      headlines: []
      bullets: []
      subject_lines: []
      hooks: []
```


handoff:
  to: "kennedy-copy"
  trigger: "Persuasion elements mapped"
  context: "Psychological triggers and messaging angles"


## Quality Gate
```yaml
quality:
  - [ ] All 7 trigger types explored
  - [ ] Minimum 20 total triggers generated
  - [ ] Top 10 ranked by irresistibility
  - [ ] Each trigger creates genuine curiosity gap
  - [ ] Deployment plan shows where each trigger will be used
  - [ ] Triggers are authentic, not manipulative
```

## Handoff
- -> **kennedy-copy** for integration into copy
- -> **kennedy-sales-letter** for headline and bullet creation

---
*Task: KN_PR_001 | Agent: kennedy-persuasion | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No audience psychology understood"
  - "No product or angle to fascinate about"

elicit:
  - question: "Who is your audience and what fascinates them?"
    required: true
  - question: "What unique or counter-intuitive angles does your product have?"
    required: false

output_example: |
  ## Fascination Triggers — Output
  **Source Framework:** Fascination Marketing System
  **Agent:** kennedy-persuasion

  - 7 trigger types explored
  - 20+ triggers generated
  - Top 10 ranked
  - Deployment plan

completion_criteria:
  - "All 7 types explored"
  - "20+ triggers generated"
  - "Top 10 ranked"
```
