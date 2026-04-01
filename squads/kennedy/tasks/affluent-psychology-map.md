# Map Affluent Psychology

## Metadata
```yaml
task_id: KN_AF_003
agent: kennedy-affluent
type: analysis
complexity: medium
estimated_time: 45min
source: "Affluent Client Attraction Playbook — Affluent Psychology Map"
```

## Purpose
Map the psychology of affluent buyers — how they think, decide, and buy differently from mass-market consumers. Understanding affluent psychology is the prerequisite for selling to them.

> "The affluent don't think like the middle class. They buy differently, decide differently, and value differently. Market to them with mass-market psychology and they'll ignore you." — Dan Kennedy

## The Framework: Affluent Psychology Differences

| Factor | Mass Market | Affluent |
|--------|-----------|---------|
| Price | Lower is better | Higher = better quality |
| Time | Will invest time to save money | Will pay money to save time |
| Decision | Comparison shops extensively | Delegates or decides fast |
| Trust | Needs convincing | Needs validation of quality |
| Risk | Fears losing money | Fears wasting time |
| Status | Functional value | Status/identity value |
| Service | Self-service acceptable | Expects white-glove |
| Access | Public offerings fine | Wants exclusive/private |

## Input Required
```yaml
input:
  target_affluent: ""
  industry: ""
  current_understanding: ""
```

## Output Template
```yaml
output:
  affluent_psychology:
    buying_triggers: []
    decision_process: ""
    communication_preferences: []
    deal_breakers: []
    status_markers: []
    marketing_implications: []
```


handoff:
  to: "kennedy-offers"
  trigger: "Affluent market analysis complete"
  context: "High-net-worth positioning and psychology"


## Quality Gate
```yaml
quality:
  - [ ] All 8 psychology factors mapped
  - [ ] Buying triggers specific to this audience
  - [ ] Communication preferences defined
  - [ ] Marketing implications actionable
```

---
*Task: KN_AF_003 | Agent: kennedy-affluent | Version: 1.0*


## Detailed Elicitation Process

When user says: "I need to attract affluent clients"

**Question 1: Target Definition**
"Who exactly is your affluent target? Age, income, profession, aspirations, frustrations?"

**Question 2: Current Gap**
"Why aren't affluent clients coming to you now? Are you attracting wrong tier?"

**Question 3: Differentiation**
"What makes you different for affluent? Why should they choose you?"

**Question 4: Psychological Profile**
"What keeps your affluent target up at night? What do they desire most?"


## Output Template (Enhanced)

```yaml
output:
  affluent_psychology_map:
    target_profile:
      demographics: {}
      psychographics: {}
      values: {}
      fears: []

    affluent_psychology_drivers:
      time_scarcity: ""
      status_consciousness: ""
      exclusivity_need: ""
      legacy_thinking: ""

    positioning_angles:
      angle_1: ""
      angle_2: ""
      angle_3: ""

    messaging_strategy:
      tone: ""
      vocabulary: ""
      proof_types: ""
      authority_signals: ""

    offer_structure:
      pricing_positioning: ""
      exclusivity_mechanism: ""
      premium_justification: ""
```


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No affluent target defined"
elicit:
  - question: "Who is the affluent audience you want to understand?"
    required: true
output_example: |
  ## Affluent Psychology Map — Output
  **Agent:** kennedy-affluent
  - Complete psychology map with marketing implications
completion_criteria:
  - "All factors mapped"
  - "Implications actionable"
```
