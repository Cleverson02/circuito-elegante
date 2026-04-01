# Apply the 25 Eternal Truths Assessment

## Metadata
```yaml
task_id: KN_AD_003
agent: kennedy-advisor
type: assessment
complexity: medium
estimated_time: 90min
source: "Renegade Millionaire — 25 Eternal Truths + The Ultimate No B.S. Business Success Book"
source_sop: "sop-25-eternal-truths.md"
frameworks:
  - "Renegade Millionaire System"
  - "Wealth Creation vs. Income Paradox"
  - "Business Maturity Framework"
```

## Purpose

Assess a business owner's behavior, beliefs, and practices against Kennedy's 25 Eternal Truths — the timeless principles that separate millionaires from the chronically struggling. These truths transcend industry, market, and circumstance. They are the mindset bedrock upon which all wealth is built.

**Why This Matters:**
Most business owners violate these truths unknowingly, sabotaging their own success. The assessment identifies which truths are being violated and prescribes specific mindset and behavioral corrections.

## The Framework: 25 Eternal Truths (Complete Reference)

1. **Discipline is the master virtue** — All wealth flows from disciplined thinking and action
2. **Speed of implementation determines wealth** — Fast execution beats perfect planning
3. **The marketplace rewards value creation, not effort** — Your hustle is invisible to customers
4. **Cash flow is king, not revenue** — You cannot spend revenue or market share
5. **Your network determines your net worth** — Who you know amplifies what you do
6. **You must guard your time more fiercely than your money** — Time is non-renewable capital
7. **Marketing is the #1 business function** — Everything else depends on customer acquisition
8. **Systems run the business, people run the systems** — Build systems, hire operators
9. **Charge premium prices** — Value-based pricing, never commodity pricing
10. **Fire problem customers** — The wrong customer costs more than lost revenue
11. **The best business is a subscription/recurring business** — Predictable revenue compounds wealth
12. **You must reinvent your business every 3-5 years** — Markets evolve, businesses stagnate
13. **Success requires relentless focus** — Multi-tasking is a poverty mindset
14. **Your personal health affects business health** — You cannot lead if you're broken
15. **Debt is a tool, not a burden** — Strategic debt accelerates wealth creation
16. **You must have a written plan** — Vague thoughts produce vague results
17. **You need a mentor with scars** — Learn from someone who earned their success
18. **Your business should free you, not imprison you** — If you can't leave, you don't own a business
19. **The money is in the list** — Customer relationships are your most valuable asset
20. **Test everything** — What works in theory must work in practice
21. **You must earn the respect of the marketplace** — Reputation compounds over time
22. **Results come from 80/20 thinking** — 20% of your activities generate 80% of results
23. **You cannot out-work your way to wealth** — Work smarter, not longer
24. **The marketplace demands proof** — Assertions are worthless without evidence
25. **Renegade thinking beats conventional wisdom** — Do the opposite of what the broke do

## Assessment Process

### Step 1: INTERVIEW THE OWNER (30 min)

**Questions to Elicit Truth-Violation Patterns:**

- "Where do you spend 80% of your time in the business? (identifies focus violation)"
- "What's your biggest frustration right now? (reveals truth gaps causing pain)"
- "How much time do you guard for strategic work vs. reactive work? (time value assessment)"
- "Who are your top 5 customers? Why? What would you do to keep them? (network/customer quality)"
- "What's your business plan? Written or mental? When was it last updated? (discipline assessment)"
- "What's your cash position? (revenue vs. cash flow understanding)"
- "How much are you willing to charge? Why? (pricing mindset)"
- "What systems do you have? How dependent are you on your personal involvement? (scaling readiness)"
- "Who's your mentor? Who challenges your thinking? (learning velocity)"
- "What would it take for you to leave the business for 3 months? (true ownership test)"

### Step 2: SCORE EACH RELEVANT TRUTH (1-10 Scale)

For each truth, assess:
- **Score 9-10:** Owner lives this truth consistently
- **Score 7-8:** Owner mostly adheres, occasional lapses
- **Score 5-6:** Owner acknowledges but inconsistent application
- **Score 3-4:** Owner violates regularly, causing business friction
- **Score 1-2:** Owner completely rejects or ignorant of this truth

### Step 3: IDENTIFY TOP 3 GAPS (Highest-Impact Violations)

Focus on the truths scoring lowest that have highest revenue impact:
- Discipline/Focus violations (stopping hemorrhaging)
- Cash flow violations (immediate survival)
- Marketing violations (customer acquisition failure)
- Pricing violations (leaving money on table)
- Systems violations (scaling ceiling)

### Step 4: BUILD ACTION PLAN

For each top-3 gap:
- **The Truth:** State it clearly
- **Current Violation:** How is it being broken?
- **30-Day Action:** Specific behavior change
- **90-Day Result:** Measurable outcome
- **Mindset Shift Required:** What belief must change?

## Input Required

```yaml
input:
  business_owner:
    name: ""
    background: ""
    years_in_business: ""

  business_context:
    industry: ""
    annual_revenue: ""
    team_size: ""
    biggest_frustration: ""

  current_state:
    time_allocation: {}          # How owner spends time
    cash_position: ""            # Cash vs. revenue
    top_customers: []            # Who drives revenue
    growth_ceiling: ""           # Why growth has plateaued
    personal_involvement: ""     # Can owner step away?
```

## Output Template

```yaml
output:
  assessment_summary:
    truths_scored: 0/25
    average_score: 0.0

  truth_scorecard:
    # Each truth scored 1-10 with evidence
    discipline:
      score: 0
      evidence: ""
    speed_of_implementation:
      score: 0
      evidence: ""
    # ... all 25 truths

  top_3_gaps:
    gap_1:
      truth: ""
      current_violation: ""
      impact: ""

      action_plan_30day: []
      action_plan_90day: []

      mindset_shift: ""
      measurement: ""

  renegade_readiness_score: 0/100

  recommendations:
    immediate_actions: []
    books_to_study: []
    behavioral_changes: []
```

## Handoff

```yaml
handoff:
  to: "kennedy-business"
  trigger: "Truth assessment complete"
  context: |
    - 25 Truths scorecard
    - Top 3 gaps identified
    - 90-day action plan
    - Mindset shifts required
```

## Detailed Elicitation Process

When user says: "I want a Eternal Truths assessment"

**Part 1: Business Context (5 min)**
"Tell me about your business: industry, revenue, team size, years running. What's your biggest frustration right now?"

**Part 2: Time Allocation (5 min)**
"How do you spend your time? Give me percentages: What % revenue-generating? Leadership/strategy? Firefighting? Deep work?"

**Part 3: Customers & Cash (5 min)**
"Who are your top 5 customers? Why them? What's your cash position vs. revenue? Are you profitable?"

**Part 4: Growth Reality (5 min)**
"Where is growth plateaued? What's stopping you from 3x revenue? Can you take 3 months off without the business failing?"

**Part 5: Mindset Probing (5 min)**
"What beliefs do you have about wealth, pricing, delegation, marketing? Where do those come from?"

## Quality Gate

```yaml
quality:
  - [ ] All 25 truths assessed (or relevant subset scored)
  - [ ] Scores supported by evidence from interview
  - [ ] Top 3 gaps clearly prioritized by revenue impact
  - [ ] 30-day and 90-day actions are specific and measurable
  - [ ] Mindset shifts identified and articulated
  - [ ] Owner sees themselves in the assessment
  - [ ] Action plan is actionable (not theoretical)
```

---
*Task: KN_AD_003 | Agent: kennedy-advisor | Version: 2.0 — EXPANDED*

## Task Anatomy Compliance

```yaml
veto_conditions:
  - "No business context provided"
  - "Owner unwilling to be honest about current state"
  - "Owner not open to mindset correction"

elicit:
  - question: "Describe your business, revenue, team size, and biggest frustration."
    required: true
    context: "Need baseline business context"

  - question: "How do you spend your time currently? (Give % breakdown)"
    required: true
    context: "Identifies discipline and focus violations"

  - question: "Who are your top 5 customers and why?"
    required: true
    context: "Reveals customer quality and network understanding"

  - question: "What's your cash position? Monthly burn? Runway?"
    required: true
    context: "Exposes cash flow vs. revenue confusion"

output_example: |
  ## 25 Eternal Truths Assessment — Output
  **Owner:** John Smith | **Business:** Consulting Firm | **Revenue:** $500K

  ### Truth Scorecard (25 Truths, avg 5.8/10)
  - Discipline (4/10): "I'm doing everything myself — no systems"
  - Speed (6/10): "I plan well but implement slowly"
  - Value Creation (7/10): "Clients love me but I don't charge enough"
  - Cash Flow (3/10): "Growing revenue but bleeding cash"
  - Network (5/10): "Some relationships but not cultivated systematically"
  - Time Guard (2/10): "I work 60+ hours, no strategic blocks"
  - Marketing (6/10): "Getting referrals but no systematic lead gen"

  ### Top 3 Gaps
  1. **Time Guard (Score 2)** — Owner works 60+ hrs, no leverage, can't scale
     - 30-day: Block 10 hrs/week for strategy only. Delegate execution.
     - 90-day: Hire operations manager. Owner does strategic work only.
     - Mindset: "I must be leveraged to scale, not busy."

  2. **Cash Flow (Score 3)** — Revenue growing but cash declining
     - 30-day: Weekly cash forecast. Cut unnecessary expenses.
     - 90-day: Move to retainer model for predictable cash.
     - Mindset: "Cash is the only number that matters."

  3. **Systems (Truth #8, Score 2)** — Everything depends on owner
     - 30-day: Document 3 core processes owner currently does.
     - 90-day: Hire and train 2 people to run those processes.
     - Mindset: "I don't own a business if I can't leave it."

  ### Renegade Readiness: 42/100
  - Owner has energy and market fit
  - Fatal gaps in systems, time management, and cash discipline
  - High coaching responsiveness — can fix fast

completion_criteria:
  - "Owner sees specific evidence of truth violations"
  - "Top 3 gaps prioritized by business impact"
  - "30/90-day action plan is written and specific"
  - "Owner commits to mindset shift"
  - "Follow-up scheduled (30 days)"
```
