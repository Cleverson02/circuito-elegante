# Write Fascination Bullets

## Metadata
```yaml
task_id: KN_CP_001
agent: kennedy-copy
type: creation
complexity: medium
estimated_time: 30-45min
source: "Copywriting Academy + Fascination Marketing System"
```

## Purpose

Write fascination bullets — the curiosity-driven benefit statements that make prospects desperate to buy. Kennedy considers fascination bullets one of the most powerful copywriting tools. They create an unbearable curiosity gap that only your product can close.

> "A good fascination bullet makes the reader think 'I HAVE to know what that is.' They'll buy the entire product just to satisfy the curiosity created by one bullet." — Dan Kennedy

## The Framework: Kennedy's 12 Fascination Bullet Formulas

| # | Formula | Example |
|---|---------|---------|
| 1 | "The [adjective] secret to [result]" | "The embarrassingly simple secret to doubling your income" |
| 2 | "Why [common belief] is dead wrong" | "Why 'working harder' is actually killing your business" |
| 3 | "How to [result] without [pain]" | "How to fill your calendar without cold calling" |
| 4 | "The #1 mistake [audience] make" | "The #1 mistake dentists make with patient retention" |
| 5 | "What [authority] knows that you don't" | "What the top 1% of realtors know about listings" |
| 6 | "[Number] ways to [benefit]" | "7 ways to get referrals without asking" |
| 7 | "The truth about [topic]" | "The truth about SEO that your agency won't tell you" |
| 8 | "Warning: Don't [action] until..." | "Warning: Don't hire a contractor until you read this" |
| 9 | "The [unexpected] technique for [result]" | "The 'napkin test' that predicts if your ad will work" |
| 10 | "How [person/company] achieved [result]" | "How a plumber from Ohio built a $10M business" |
| 11 | "The little-known [thing] that [result]" | "The little-known IRS rule that saves business owners $20K" |
| 12 | "Why [doing X] guarantees [negative]" | "Why discounting guarantees you'll never get premium prices" |

## Input Required
```yaml
input:
  product_service: ""
  audience: ""
  key_benefits: []
  unique_mechanisms: []
  case_study_results: []
  common_mistakes: []
  counter_intuitive_insights: []
```

## Step-by-Step Process

### Step 1: Generate Raw Bullet List (25-40 bullets)
Write as many as possible using all 12 formulas.

### Step 2: Apply the "I MUST Know" Test
Read each bullet and ask: "Would this make me NEED to read the next page?"
- Score each bullet 1-10 on curiosity
- Keep only bullets scoring 7+

### Step 3: Arrange by Impact
Group bullets by category and sequence for maximum cumulative impact:
- Open with strongest curiosity bullet
- Alternate between different formulas
- Close with a "can't resist" bullet

### Step 4: Polish and Sharpen
- Remove any bullet that reveals the answer
- Add specifics (numbers, names, timeframes)
- Ensure each bullet is one sentence or less

## Output Template
```yaml
output:
  fascination_bullets:
    total_generated: 0
    top_20: []
    categorized:
      curiosity: []
      fear: []
      greed: []
      counter_intuitive: []
      social_proof: []
    recommended_for_sales_letter: []
    recommended_for_ad: []
```


handoff:
  to: "kennedy-media"
  trigger: "Copy created and validated"
  context: "Validated copy ready for distribution"


## Quality Gate
```yaml
quality:
  - [ ] Minimum 25 bullets generated
  - [ ] At least 6 different formulas used
  - [ ] Each bullet creates genuine curiosity (doesn't reveal the answer)
  - [ ] Specifics included (numbers, names, timeframes)
  - [ ] Top 20 scored 7+ on "I MUST know" test
  - [ ] Bullets can standalone without context
```

## Handoff
- -> **kennedy-sales-letter** for integration into sales letter
- -> **kennedy-media** for use in ads and direct mail

---
*Task: KN_CP_001 | Agent: kennedy-copy | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No product or benefits information provided"
  - "No target audience defined"

elicit:
  - question: "What product/service and what are its key benefits?"
    required: true
  - question: "What counter-intuitive insights or surprising facts can you share?"
    required: false

output_example: |
  ## Fascination Bullets — Output
  **Source Framework:** Copywriting Academy + Fascination Marketing System
  **Agent:** kennedy-copy

  - 25-40 raw bullets generated
  - Top 20 selected and scored
  - Categorized by type for different uses

completion_criteria:
  - "Minimum 25 bullets generated"
  - "Top 20 scored and ranked"
  - "Multiple formulas used"
```
