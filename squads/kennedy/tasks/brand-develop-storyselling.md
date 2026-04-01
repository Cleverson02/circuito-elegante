# Develop StorySelling System

## Metadata
```yaml
task_id: KN_BR_002
agent: kennedy-brand
type: creation
complexity: high
estimated_time: 60min
source: "No B.S. Brand-Building by DR — StorySelling (4 Key Factors)"
```

## Purpose

Develop a complete StorySelling system — the integration of storytelling with selling that Kennedy identifies as the most powerful branding tool in direct response. StorySelling makes your brand memorable, relatable, and persuasive simultaneously.

> "Facts tell. Stories sell. The best brands are the best storytellers — but every story must lead to a sale." — Dan Kennedy

## The Framework: StorySelling 4 Key Factors

### Factor 1: Authenticity
The story must be TRUE. Fabricated stories eventually destroy brands.

### Factor 2: Relevance
The story must connect to the audience's desires, fears, or aspirations.

### Factor 3: Emotion
The story must evoke genuine feelings — not just inform.

### Factor 4: Memorability
The story must be unique enough to stick in the mind.

### StorySelling Story Types
1. **Origin Story** — How the business/founder began
2. **Customer Stories** — Transformations you've facilitated
3. **Failure Stories** — What went wrong and what you learned
4. **Mission Stories** — Why you do what you do
5. **Against-All-Odds Stories** — Overcoming adversity

## Input Required
```yaml
input:
  founder_story: ""
  business_origin: ""
  customer_transformations: []
  failures_and_lessons: []
  mission: ""
  audience: ""
```

## Step-by-Step Process

### Step 1: Mine for Stories
Inventory every story asset: origin, customer, failure, mission.

### Step 2: Apply the 4 Factors to Each Story
Score each story on Authenticity, Relevance, Emotion, Memorability.

### Step 3: Craft the Master Story
The primary narrative that defines your brand.

### Step 4: Create Supporting Stories
Stories for different contexts: sales letters, ads, presentations.

### Step 5: Build Story Deployment Plan
Which stories in which channels at which stages.

## Output Template
```yaml
output:
  storyselling:
    master_story: ""
    supporting_stories: []
    story_scores: []
    deployment_plan: {}
```


handoff:
  to: "kennedy-copy"
  trigger: "Brand strategy defined"
  context: "Brand positioning and messaging framework"


## Quality Gate
```yaml
quality:
  - [ ] Master story passes all 4 factors
  - [ ] Minimum 5 supporting stories
  - [ ] Each story has a selling purpose
  - [ ] Stories are authentic, not manufactured
  - [ ] Deployment plan covers all marketing channels
```

## Handoff
- -> **kennedy-copy** for story-based copy
- -> **kennedy-sales-letter** for story integration

---
*Task: KN_BR_002 | Agent: kennedy-brand | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No founder/business stories to work with"

elicit:
  - question: "What is your origin story and what customer transformations can you share?"
    required: true

output_example: |
  ## StorySelling System — Output
  **Source Framework:** StorySelling 4 Key Factors
  **Agent:** kennedy-brand

  - Master story crafted
  - 5+ supporting stories
  - Deployment plan

completion_criteria:
  - "Master story created"
  - "4 factors validated"
  - "Deployment plan designed"
```
