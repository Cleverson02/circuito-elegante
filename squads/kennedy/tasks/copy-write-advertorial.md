# Write an Advertorial

## Metadata
```yaml
task_id: KN_CP_003
agent: kennedy-copy
type: creation
complexity: medium
estimated_time: 45-60min
source: "Copywriting Academy — Advertorial Framework"
```

## Purpose

Write an advertorial — an advertisement disguised as editorial content. Kennedy teaches that advertorials bypass reader resistance because they look like valuable content, not an ad.

> "The advertorial is one of the most powerful formats in direct response. It looks like an article, reads like an article, and sells like a sales letter." — Dan Kennedy

## The Framework: Advertorial Structure

### The 5-Part Advertorial Architecture
```
1. EDITORIAL HEADLINE     → Looks like a news story, not an ad
2. STORY LEAD            → Opens with human interest or problem
3. EDUCATION SECTION     → Teaches something valuable
4. BRIDGE TO OFFER       → Natural transition from education to product
5. CALL TO ACTION        → Specific response instructions
```

### Advertorial vs. Sales Letter
```
Sales Letter:  "Buy my product because..."
Advertorial:   "Here's a fascinating story about [problem]. By the way, there's a solution..."
```

## Input Required
```yaml
input:
  product_service: ""
  audience: ""
  problem_being_solved: ""
  newsworthy_angle: ""
  publication_format: "print | digital | both"
```

## Step-by-Step Process

### Step 1: Find the Editorial Angle
What is the news-worthy, story-worthy, or educational angle?

### Step 2: Write the Headline (Editorial Style)
Not "Buy Our Widget" but "Local Business Owner Discovers..."

### Step 3: Write the Story/Education Section
Provide genuine value — teach something useful.

### Step 4: Bridge to the Offer
Natural transition: "If you'd like to learn more..."

### Step 5: Close with CTA
Clear next step, low friction.

## Output Template
```yaml
output:
  advertorial:
    headline: ""
    subheadline: ""
    body_copy: ""
    bridge: ""
    cta: ""
    word_count: 0
    format: ""
    placement_recommendations: []
```


handoff:
  to: "kennedy-media"
  trigger: "Copy created and validated"
  context: "Validated copy ready for distribution"


## Quality Gate
```yaml
quality:
  - [ ] Reads like editorial content, not an ad
  - [ ] Provides genuine educational value
  - [ ] Bridge to offer is natural, not forced
  - [ ] Headline would work as a news/article headline
  - [ ] CTA is clear and specific
  - [ ] Matches the editorial style of target publication
```

## Handoff
- -> **kennedy-media** for placement strategy
- -> **kennedy-sales-letter** if a longer sales letter is needed

---
*Task: KN_CP_003 | Agent: kennedy-copy | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No product or problem defined"
  - "No editorial angle identified"

elicit:
  - question: "What product/service are you promoting and what problem does it solve?"
    required: true
  - question: "Is there a news-worthy or story-worthy angle to your solution?"
    required: false

output_example: |
  ## Advertorial — Output
  **Source Framework:** Copywriting Academy Advertorial Framework
  **Agent:** kennedy-copy

  - Complete advertorial copy in editorial format
  - Natural bridge to offer
  - Placement recommendations

completion_criteria:
  - "Reads like editorial content"
  - "Bridge to offer is natural"
  - "CTA included"
```
