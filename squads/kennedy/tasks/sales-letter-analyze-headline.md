# Analyze and Optimize Headlines

## Metadata
```yaml
task_id: KN_SL_002
agent: kennedy-sales-letter
type: analysis
complexity: medium
estimated_time: 30-45min
source: "The Ultimate Sales Letter — 12 Fill-in-the-Blank Headline Formulas"
```

## Purpose

Analyze existing headlines against Kennedy's 12 proven headline formulas and optimize for maximum pulling power. The headline is 80% of the ad's effectiveness — get this wrong and everything else is wasted.

> "On average, five times as many people read the headline as read the body copy. When you have written your headline, you have spent eighty cents out of your dollar." — Referenced by Kennedy from David Ogilvy

## The Framework: Kennedy's Headline Analysis System

### The 4 Headline Jobs
Every headline must do ALL four:
1. **STOP** the reader (interrupt the pattern)
2. **SELECT** your audience (qualify who this is for)
3. **COMMUNICATE** a complete message (main promise)
4. **COMPEL** them into the body copy (create curiosity gap)

### The 12 Kennedy Headline Formulas

| # | Formula | Power Level |
|---|---------|-------------|
| 1 | Warning/Threat | High urgency |
| 2 | Question that qualifies | High targeting |
| 3 | How-To with objection handled | High credibility |
| 4 | News/announcement | High curiosity |
| 5 | Testimonial-driven | High proof |
| 6 | Free offer lead | High response |
| 7 | Reason-Why numbered list | High specificity |
| 8 | If-Then conditional | High relevance |
| 9 | Secrets revealed | High curiosity |
| 10 | Challenge/dare | High engagement |
| 11 | Guarantee lead | High trust |
| 12 | Story opening | High connection |

## Input Required
```yaml
input:
  headlines_to_analyze: []       # List of current headlines
  audience: ""
  primary_benefit: ""
  awareness_level: ""
  medium: "direct mail | email | web | print ad | social"
```

## Step-by-Step Process

### Step 1: Score Each Headline (4 Jobs Test)
```
Headline: "[Your headline here]"

STOP power (1-10):      ___  Does it interrupt the reader's pattern?
SELECT power (1-10):    ___  Does it qualify the right audience?
COMMUNICATE power (1-10): ___  Does it convey the main benefit?
COMPEL power (1-10):    ___  Does it force reading the next line?
TOTAL: ___/40
```

### Step 2: Identify Formula Match
Map each headline to Kennedy's 12 formulas. Headlines that don't match any formula are likely weak.

### Step 3: Apply the A-Pile Test
Would this headline, seen on an envelope or email subject line, get opened? Or would it land in the B-pile (trash)?

### Step 4: Generate 10 Alternatives
For each weak headline, generate 10 alternatives using different formulas.

### Step 5: Rank and Recommend Top 3
Score all alternatives and pick the top 3 for testing.

## Output Template
```yaml
output:
  headline_analysis:
    original_headline: ""
    score: "/40"
    formula_match: ""
    weaknesses: []
    recommendations: []
    top_3_alternatives:
      - headline: ""
        formula: ""
        score: "/40"
      - headline: ""
        formula: ""
        score: "/40"
      - headline: ""
        formula: ""
        score: "/40"
    test_recommendation: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Sales letter complete"
  context: "Validated sales letter ready for deployment"


## Quality Gate
```yaml
quality:
  - [ ] Each headline scored on all 4 jobs
  - [ ] Formula match identified for each headline
  - [ ] A-Pile test applied
  - [ ] Minimum 10 alternatives generated
  - [ ] Top 3 alternatives scored and ranked
  - [ ] Test plan for headline variations included
```

## Handoff
- -> **kennedy-copy** for fascination bullets to support chosen headline
- -> **kennedy-media** for A/B test setup across channels

---
*Task: KN_SL_002 | Agent: kennedy-sales-letter | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No headlines provided for analysis"
  - "No target audience defined"

elicit:
  - question: "What headlines do you want analyzed?"
    required: true
  - question: "Who is the target audience and what is the primary benefit?"
    required: true

output_example: |
  ## Headline Analysis — Output
  **Source Framework:** 12 Fill-in-the-Blank Headline Formulas
  **Agent:** kennedy-sales-letter

  - Scored analysis of each headline (4 jobs test)
  - 10+ alternative headlines generated
  - Top 3 recommendations with split-test plan

completion_criteria:
  - "All headlines scored on 4-job framework"
  - "Minimum 10 alternatives generated"
  - "Top 3 ranked with rationale"
```
