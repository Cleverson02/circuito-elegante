# Build Personal Brand by Direct Response

## Metadata
```yaml
task_id: KN_BR_003
agent: kennedy-brand
type: creation
complexity: high
estimated_time: 60min
source: "No B.S. Brand-Building by DR — Personal Brand Chapter + Celebrity Authority"
```

## Purpose
Build a personal brand through direct response — becoming the recognized authority and celebrity in your niche. Kennedy teaches that personal branding is the fastest path to premium pricing and market dominance.

> "The personal brand IS the business brand. When you are the authority, every marketing piece you send carries your credibility with it." — Dan Kennedy

## The Framework: Celebrity Authority Building
1. **Published Author** — Write a book or authoritative report
2. **Speaker** — Present at industry events
3. **Media Presence** — Articles, interviews, podcast appearances
4. **Proprietary System** — Named framework or methodology
5. **Client Results** — Documented transformations
6. **Awards/Recognition** — Industry accolades
7. **Association** — Connection to other authorities

## Input Required
```yaml
input:
  name: ""
  expertise: ""
  current_authority_assets: []
  target_niche: ""
  goals: ""
```

## Output Template
```yaml
output:
  personal_brand:
    authority_assets_current: []
    authority_assets_to_create: []
    celebrity_positioning: ""
    content_strategy: ""
    media_plan: []
    timeline: ""
```


handoff:
  to: "kennedy-copy"
  trigger: "Brand strategy defined"
  context: "Brand positioning and messaging framework"


## Quality Gate
```yaml
quality:
  - [ ] Current authority assets inventoried
  - [ ] Gaps identified with creation plan
  - [ ] Celebrity positioning defined
  - [ ] Content strategy supports authority
  - [ ] All builds brand AND sells
```

---
*Task: KN_BR_003 | Agent: kennedy-brand | Version: 1.0*


## Personal Brand Components

1. **Origin Story** (Why you do this)
2. **Core Values** (What you stand for)
3. **Expertise** (What you can do)
4. **Transformation** (What results clients get)
5. **Voice** (How you communicate)
6. **Visibility** (Where prospects find you)
7. **Authority** (Why trust you)
8. **Community** (Who else endorses you)


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No expertise or niche defined"
elicit:
  - question: "What is your expertise and what authority assets do you have?"
    required: true
output_example: |
  ## Personal Brand — Output
  **Agent:** kennedy-brand
  - Authority assets plan and celebrity positioning
completion_criteria:
  - "Authority assets planned"
  - "Celebrity positioning defined"
```
