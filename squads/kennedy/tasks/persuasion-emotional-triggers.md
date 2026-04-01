# Map Emotional Trigger Architecture

## Metadata
```yaml
task_id: KN_PR_003
agent: kennedy-persuasion
type: analysis
complexity: medium
estimated_time: 90min
source: "Mind Hijacking Course — Emotional Trigger Architecture"
```

## Purpose
Map the complete emotional trigger architecture for a target audience — understanding which emotions drive their buying decisions and how to ethically activate them in marketing.

## The Framework: Emotional Trigger Map
```
PRIMARY TRIGGERS (drive the decision):
  Fear → What they're afraid of losing
  Greed → What they desperately want to gain

SECONDARY TRIGGERS (amplify the primary):
  Guilt → What they feel bad about
  Pride → What would make them feel superior

TERTIARY TRIGGERS (close the sale):
  Urgency → Why they must act now
  Belonging → Community they want to join
```

## Input Required
```yaml
input:
  audience: ""
  product_context: ""
  known_desires: []
  known_fears: []
```

## Output Template
```yaml
output:
  emotional_architecture:
    primary_triggers: []
    secondary_triggers: []
    tertiary_triggers: []
    trigger_deployment_map:
      headline: ""
      opening: ""
      body: ""
      offer: ""
      close: ""
```


handoff:
  to: "kennedy-copy"
  trigger: "Persuasion elements mapped"
  context: "Psychological triggers and messaging angles"


## Quality Gate
```yaml
quality:
  - [ ] All trigger levels mapped
  - [ ] Triggers are audience-specific, not generic
  - [ ] Deployment map shows where each trigger is used
  - [ ] Ethical boundaries maintained
```

---
*Task: KN_PR_003 | Agent: kennedy-persuasion | Version: 1.0*


## Kennedy's Core Emotional Triggers

1. **Loss Aversion** (fear of missing out)
2. **Social Proof** (others are doing it)
3. **Scarcity** (limited availability)
4. **Authority** (expert says so)
5. **Reciprocity** (you gave me value)
6. **Urgency** (time pressure)
7. **Curiosity** (I need to know)
8. **Belonging** (community/tribe)


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No audience defined"
elicit:
  - question: "Who is the audience and what are their desires and fears?"
    required: true
output_example: |
  ## Emotional Trigger Map — Output
  **Agent:** kennedy-persuasion
  - Complete trigger architecture with deployment plan
completion_criteria:
  - "All levels mapped"
  - "Deployment plan created"
```
