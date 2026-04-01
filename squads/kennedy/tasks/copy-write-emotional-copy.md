# Write Emotional Direct Response Copy

## Metadata
```yaml
task_id: KN_CP_004
agent: kennedy-copy
type: creation
complexity: high
estimated_time: 60-90min
source: "Copywriting Academy + Mind Hijacking — Emotional Copy Framework"
```

## Purpose

Write copy that sells through emotion, not logic. Kennedy teaches that all buying decisions are emotional — logic is used only to justify what the heart already decided.

> "People don't buy logically. They buy emotionally and justify logically. Your copy must reach the heart first, then give the brain permission to buy." — Dan Kennedy

## The Framework: Emotional Copy Architecture

### The 7 Core Emotional Triggers
1. **Fear** — of loss, of missing out, of failure
2. **Greed** — desire for more money, success, status
3. **Guilt** — not providing for family, not living up to potential
4. **Pride** — being recognized, admired, envied
5. **Lust** — desire for beauty, pleasure, comfort
6. **Anger** — at injustice, at being cheated, at the status quo
7. **Exclusivity** — being part of an elite group, insider knowledge

### The Emotional Copy Formula
```
TRIGGER EMOTION → AGITATE → OFFER RELIEF → PROVE IT WORKS → CTA
```

## Input Required
```yaml
input:
  audience: ""
  primary_emotional_trigger: ""
  secondary_triggers: []
  product_service: ""
  transformation_promise: ""
  copy_type: "sales letter | ad | email | landing page"
```

## Step-by-Step Process

### Step 1: Map the Emotional Landscape
What emotions does the audience feel about this problem?

### Step 2: Choose Primary and Secondary Triggers
Lead with the strongest, layer in supporting emotions.

### Step 3: Write the Emotional Opening
The first paragraph must hit them in the gut.

### Step 4: Agitate with Empathy
Show you understand their pain better than they do.

### Step 5: Transition to Solution
The relief should feel visceral, not logical.

### Step 6: Prove with Emotional Testimony
Use stories and testimonials that evoke emotion, not just data.

## Output Template
```yaml
output:
  emotional_copy:
    primary_trigger: ""
    emotional_opening: ""
    agitation_section: ""
    solution_bridge: ""
    proof_stories: []
    emotional_cta: ""
    word_count: 0
```


handoff:
  to: "kennedy-media"
  trigger: "Copy created and validated"
  context: "Validated copy ready for distribution"


## Quality Gate
```yaml
quality:
  - [ ] Primary emotional trigger clearly identified and deployed
  - [ ] Opening paragraph creates visceral emotional response
  - [ ] Agitation section demonstrates deep empathy
  - [ ] Solution presented as emotional relief, not just features
  - [ ] Proof includes emotional stories, not just statistics
  - [ ] CTA leverages both desire and fear of missing out
  - [ ] Logic elements support (not lead) the emotional argument
```

## Handoff
- -> **kennedy-persuasion** for psychological trigger refinement
- -> **kennedy-sales-letter** for sales letter integration

---
*Task: KN_CP_004 | Agent: kennedy-copy | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No emotional triggers identified for audience"
  - "No audience defined"

elicit:
  - question: "Who is the audience and what emotions do they feel about this problem?"
    required: true
  - question: "What transformation does your product promise?"
    required: true

output_example: |
  ## Emotional Copy — Output
  **Source Framework:** Copywriting Academy + Mind Hijacking
  **Agent:** kennedy-copy

  - Emotional opening that hits viscerally
  - Agitation with empathy
  - Solution as emotional relief
  - Proof through stories

completion_criteria:
  - "Primary trigger deployed effectively"
  - "Emotional opening creates response"
  - "CTA leverages desire and fear"
```
