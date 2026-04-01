# Run Business Diagnostic

## Metadata
```yaml
task_id: KN_BZ_001
agent: kennedy-business
type: diagnosis
complexity: high
estimated_time: 60-90min
source: "The Ultimate No B.S. Business Success Book — 25 Eternal Truths"
```

## Purpose

Run a comprehensive business diagnostic using Kennedy's 25 Eternal Truths and Business Maturity Framework. This identifies where the business is stuck and what needs to change to reach the next level.

> "Most business problems aren't business problems. They're marketing problems disguised as business problems. Fix the marketing, and the business fixes itself." — Dan Kennedy

## The Framework: Business Maturity Levels

| Level | Stage | Revenue | Characteristics |
|-------|-------|---------|----------------|
| 1 | Startup | $0-100K | Owner does everything, no systems |
| 2 | Growth | $100K-500K | Some delegation, basic systems |
| 3 | Established | $500K-2M | Team in place, systems working |
| 4 | Scale | $2M-10M | Manager-run, owner strategic |
| 5 | Enterprise | $10M+ | Multiple divisions, self-sustaining |

### Kennedy's 25 Eternal Truths (Applied to Diagnosis)
Key truths for business diagnostics:
1. Discipline is the master virtue
2. The marketplace is brutally Darwinian
3. Income follows value creation
4. Cash flow is king
5. Marketing is the one essential business function
6. Speed of implementation determines wealth
7. Your network is your net worth
8. Time management is wealth management

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    revenue: ""
    profit_margin: ""
    team_size: ""
    years: ""
    owner_role: ""
    biggest_challenge: ""
```

## Step-by-Step Process

### Step 1: Determine Business Maturity Level
Which of the 5 levels? What's holding them at this level?

### Step 2: Apply the 25 Eternal Truths Scorecard
Score adherence to key truths (1-10 each).

### Step 3: Identify the #1 Constraint
What single thing, if fixed, would unlock the most growth?

### Step 4: Design the Breakthrough Plan
Specific actions to move to the next maturity level.

## Output Template
```yaml
output:
  business_diagnostic:
    maturity_level: ""
    constraint: ""
    truths_scorecard: {}
    breakthrough_plan: []
    timeline: ""
    expected_outcome: ""
```


handoff:
  to: "kennedy-offers"
  trigger: "Business assessment complete"
  context: "Business diagnostics and improvement plan"


## Quality Gate
```yaml
quality:
  - [ ] Maturity level identified with evidence
  - [ ] Key truths scored with specific observations
  - [ ] #1 constraint identified and justified
  - [ ] Breakthrough plan has specific, actionable steps
  - [ ] Timeline is realistic
```

## Handoff
- -> **kennedy-audit** for marketing-specific fixes
- -> **kennedy-advisor** for strategic counsel

---
*Task: KN_BZ_001 | Agent: kennedy-business | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business data provided"

elicit:
  - question: "Describe your business: revenue, team, biggest challenge."
    required: true

output_example: |
  ## Business Diagnostic — Complete Output
  **Agent:** kennedy-business
  **Business:** Digital Marketing Agency (owner + 3 employees)
  **Current Revenue:** $380K/year | **Profit Margin:** 18% | **Team:** Owner + 2 account managers + 1 designer

  ### BUSINESS MATURITY ASSESSMENT
  **Current Level:** 2 (Growth) — $100K-500K stage
  **Characteristics:** Owner does most strategy/sales. Account managers handle client work. No documented systems.

  ---

  ### 25 ETERNAL TRUTHS SCORECARD (Select)

  | Truth | Score | Observation |
  |-------|-------|------------|
  | Discipline is master virtue | 3/10 | Owner context-switches constantly; no time blocking |
  | Marketplace is Darwinian | 5/10 | Competing on price vs. value; many competitors |
  | Income follows value creation | 4/10 | Clients see agency, not unique value; easily replaceable |
  | Cash flow is king | 6/10 | Monthly retainers good, but no buffer for down months |
  | Marketing is essential | 2/10 | **CRITICAL GAP** — Zero marketing for agency. Growing by referral only. |
  | Speed of implementation | 4/10 | Projects take 8-12 weeks (industry avg: 6 weeks) |
  | Your network is net worth | 7/10 | Strong referral relationships (why scaling is hard) |
  | Time = Wealth | 2/10 | **CRITICAL GAP** — Owner working 60+ hours/week (not scalable) |

  ---

  ### #1 CONSTRAINT (What's holding this business back?)
  **THE CONSTRAINT:** Owner is the business (not documented systems) + Commodity service positioning

  **Evidence:**
  - Owner does 70% of strategy/sales work
  - Without owner, no new business acquisition
  - Staff could leave tomorrow; no systems replace them
  - Charging $3K-5K/month (commodity rate for region)
  - Competing primarily on price and owner relationships

  ---

  ### BREAKTHROUGH PLAN (Move from Level 2 → Level 3)

  **3-Month Checkpoint Goals:**

  #### Goal #1: Productize the Service (Eliminate commodity positioning)
  - Develop 3 service packages (Starter $2K, Standard $4K, Premium $8K)
  - Document proprietary process (current: "depends on project")
  - Create case study with 300%+ ROI proof
  - **Result:** Can sell service without owner presence; higher margins

  #### Goal #2: Owner Extraction from Delivery
  - Document owner's 5 most common client strategy frameworks
  - Train account manager on 3 of them
  - Hire freelance strategist for overflow
  - **Result:** Owner available for sales/strategy, not delivery

  #### Goal #3: Establish Predictable Revenue Model
  - Switch from project-based to 70% retainer + 30% project
  - Implement monthly client business reviews (locks in retention)
  - Create referral incentive program (codify what's working)
  - **Result:** Predictable revenue, lower acquisition cost

  #### Goal #4: Create A Marketing System
  - Launch 2x/month educational content (positioning as expert, not commodity)
  - Establish thought leadership (webinar, LinkedIn, guest article)
  - Build email nurture sequence for past clients
  - **Result:** Referrals + direct inbound; less reliant on owner relationships

  ---

  ### 90-DAY MILESTONES
  - **Days 1-30:** Complete service productization + case study
  - **Days 31-60:** Train account manager on 2 frameworks + launch content marketing
  - **Days 61-90:** Implement retainer model + referral program

  ---

  ### EXPECTED OUTCOMES (If executed)
  - Revenue: $380K → $450K (retainer stability, higher pricing)
  - Profit margin: 18% → 28% (fewer service delivery people needed)
  - Owner work hours: 60h → 40h (back your life)
  - **Most important:** Business valuable without owner (can sell for $200K+)

  ---

  ### HIDDEN RISKS
  - Account managers may resist system documentation (threatens job security)
  - Owner may struggle to delegate strategy (perfectionism)
  - Market may initially resist higher pricing

  **Mitigation:** Give account managers raise + equity tie-in. Run pricing test with top 5 clients first.

completion_criteria:
  - "Maturity level identified with specific evidence"
  - "5+ truths scored with specific observations"
  - "ONE constraint clearly identified and justified"
  - "Breakthrough plan has 4+ specific actions with owner involvement"
  - "90-day milestones defined with clear deliverables"
  - "Expected outcome quantified (revenue, margin, time)"
```
