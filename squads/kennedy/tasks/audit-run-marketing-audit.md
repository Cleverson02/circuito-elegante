# Run Complete Marketing Audit

## Metadata
```yaml
task_id: KN_AU_001
agent: kennedy-audit
type: audit
complexity: high
estimated_time: 90-120min
source: "Midas Touch Course + No B.S. Direct Marketing — Marketing Audit Framework"
```

## Purpose

Conduct a comprehensive marketing audit using Kennedy's frameworks. This audit examines every aspect of a business's marketing through the lens of direct response principles, identifying leaks, missed opportunities, and prioritizing fixes by revenue impact.

> "Most businesses have more marketing opportunities than they realize. The problem isn't a lack of customers — it's a lack of systematic exploitation of the opportunities already sitting right in front of them." — Dan Kennedy

## The Framework: Kennedy's 6-Step Marketing Audit

### Step 1: Results Triangle Assessment
Rate each side of the triangle: Message, Market, Media

### Step 2: 10 No B.S. Rules Compliance
Score compliance with all 10 rules.

### Step 3: 9 Fatal Mistakes Check
Which of the 9 fatal mistakes is this business making?

### Step 4: Money Pyramid Analysis
Where is the business in the Money Pyramid? Where could it be?

### Step 5: Marketing Triangle Scoring
```
LEADS → CONVERSION → RETENTION → REFERRALS → ASCENSION
```
Score each element 1-10.

### Step 6: Revenue Leak Identification
Where is money leaking out?

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    revenue: ""
    customer_base: ""
    years_in_business: ""

  marketing:
    current_channels: []
    current_budget: ""
    current_roi: ""
    usp: ""
    offers: []
    follow_up: ""
    referral_system: ""
    tracking: ""

  challenges:
    top_3: []
```

## Step-by-Step Process

### Step 1-6: Execute Full Audit Framework
Apply all 6 steps systematically.

### Step 7: Prioritize Findings
Rank all findings by:
1. Revenue impact (high/medium/low)
2. Ease of implementation (easy/medium/hard)
3. Speed to results (fast/medium/slow)

Quick wins = High impact + Easy + Fast → DO FIRST

### Step 8: Create the 90-Day Action Plan
Top 5 actions for immediate implementation.

## Output Template
```yaml
output:
  marketing_audit:
    date: ""
    business: ""
    overall_grade: "/100"
    results_triangle: {}
    rules_compliance: "/10"
    fatal_mistakes: "/9"
    money_pyramid: ""
    marketing_triangle: {}
    revenue_leaks: []
    priority_fixes:
      quick_wins: []
      short_term: []
      long_term: []
    ninety_day_plan: []
    estimated_revenue_impact: ""
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Marketing audit complete"
  context: "Audit findings and 90-day action plan"


## Quality Gate
```yaml
quality:
  - [ ] All 6 audit steps completed
  - [ ] Every finding supported by evidence
  - [ ] Findings prioritized by revenue impact
  - [ ] 90-day action plan with specific steps
  - [ ] Quick wins identified (do first)
  - [ ] Revenue impact estimated
  - [ ] No vague recommendations (all specific)
```

## Handoff
- -> **kennedy-direct-response** for DR implementation
- -> **kennedy-magnetic** for lead generation improvements
- -> **kennedy-referrals** for referral system creation

---
*Task: KN_AU_001 | Agent: kennedy-audit | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business information provided"
  - "No current marketing data available"

elicit:
  - question: "Describe your business, current marketing, and top 3 challenges."
    required: true
  - question: "What is your current marketing budget and ROI?"
    required: false

output_example: |
  ## COMPLETE MARKETING AUDIT — Output Example
  **Business:** Elite Fitness Training Studio (Personal Training + Group Classes)
  **Location:** Denver Metro
  **Current Revenue:** $450K/year (8 trainers, 120 active clients)
  **Audit Date:** February 2026

  ### STEP 1: Results Triangle Assessment

  **MESSAGE (Current):** "Elite Personal Training & Group Classes"
  Score: 3/10 (Generic, no differentiation, unclear USP)

  **MARKET (Current):** "Busy professionals 25-55, wanting to get fit"
  Score: 4/10 (Too broad, no clear target, no Money Pyramid positioning)

  **MEDIA (Current):** Instagram, Google Local, referrals
  Score: 5/10 (Limited channels, no direct mail, weak follow-up)

  **Triangle Health:** 4/10 overall (Major imbalance — no clear message reaching right market through right channels)

  ### STEP 2: 10 No B.S. Rules Compliance
  1. Direct response (trackable): 2/10 — No tracking on ads
  2. Unique value: 3/10 — No clear differentiation
  3. Target market clarity: 3/10 — Too broad
  4. Build a list: 4/10 — Email list exists but rarely used
  5. Follow-up: 2/10 — One-touch marketing (ads, then done)
  6. Multi-step campaigns: 1/10 — No sequences
  7. Test & measure: 1/10 — Gut-based decisions
  8. Track ROI: 1/10 — No tracking codes
  9. Referral system: 6/10 — Referrals happen but no formal system
  10. Retain customers: 5/10 — Basic newsletter, no retention funnel

  **Compliance Score: 28/100** ← MAJOR PROBLEMS

  ### STEP 3: 9 Fatal Mistakes Check
  ✓ **FATAL MISTAKE #1:** Wasting money on image advertising
  Status: GUILTY — $3K/mo on Instagram "brand awareness" with no lead tracking

  ✓ **FATAL MISTAKE #2:** Not using a USP
  Status: GUILTY — No clear differentiation from 47 other gyms in metro area

  ✓ **FATAL MISTAKE #3:** Not targeting the right prospect
  Status: GUILTY — Trying to be "for everyone" but really only successful with corporate wellness

  ✓ **FATAL MISTAKE #4:** Not building a list
  Status: PARTIALLY GUILTY — Email list of 340 people but underutilized

  ✓ **FATAL MISTAKE #5:** Not following up
  Status: GUILTY — One-and-done marketing (no nurture sequences)

  ✓ **FATAL MISTAKE #6:** Not using multi-step campaigns
  Status: GUILTY — All single-touch campaigns

  ✓ **FATAL MISTAKE #7:** Not testing
  Status: GUILTY — Running same ads for 2 years with no A/B tests

  ✓ **FATAL MISTAKE #8:** Not tracking ROI
  Status: GUILTY — No idea which channel generates which clients

  ✓ **FATAL MISTAKE #9:** Not having a referral system
  Status: GUILTY — Referrals happen randomly, no incentives

  **Fatal Mistakes Count: 9/9 GUILTY** ← CRITICAL: Business is following EVERY fatal mistake

  ### STEP 4: Money Pyramid Analysis
  **Current clients by tier:**
  - 1% ultra-rich: 2 clients @ $500/mo = $1K/mo
  - 4% rich: 18 clients @ $300/mo = $5,400/mo
  - 15% comfortable: 64 clients @ $150/mo = $9,600/mo
  - 60% paycheck-to-paycheck: 36 clients @ $80/mo = $2,880/mo
  - 20% broke: 0 clients (correctly targeting away)

  **Problem:** Trying to serve all tiers with same offering
  **Opportunity:** Current client mix is 55% from "comfortable" tier (largest paying segment)

  **Recommendation:** Build offering specifically for "comfortable" tier ($100-300K/year income, age 40-55, suburban professionals). This is 15% of market but worth 60% of revenue if targeted properly.

  ### STEP 5: Marketing Triangle Scoring (Leads → Conversion → Retention → Referrals → Ascension)

  | Element | Score | Comment |
  |---------|-------|---------|
  | **LEADS** | 3/10 | 8-12 qualified leads/month; inconsistent |
  | **CONVERSION** | 6/10 | 40% of leads convert to trial; 25% convert to paid |
  | **RETENTION** | 4/10 | 60% cancel within 6 months; no retention program |
  | **REFERRALS** | 5/10 | 25% of new clients from referrals; no system |
  | **ASCENSION** | 2/10 | No upsells to premium tiers |

  **Bottleneck:** RETENTION — Highest leverage fix

  ### STEP 6: Revenue Leaks Identification

  | Leak | Annual Loss | Severity |
  |------|-------------|----------|
  | No lead follow-up | $80K+ | HIGH |
  | No retention system | $150K+ | CRITICAL |
  | Wasted ad spend on brand awareness | $36K/year | HIGH |
  | No referral incentive system | $60K+ | MEDIUM |
  | No ascension/upsells | $45K+ | MEDIUM |
  | No email marketing to list | $20K+ | MEDIUM |

  **TOTAL ANNUAL REVENUE LEAK: $391K+**

  ### PRIORITIZED FINDINGS

  **QUICK WINS (High Impact + Easy + Fast):**
  1. Implement referral incentive system ($100/referral) → Est. $60K revenue in 90 days
  2. Start monthly retention email campaign → Est. reduce churn 15%, keep $30K
  3. Tag all leads with source in CRM → Immediate insight into which marketing works

  **SHORT-TERM (6 months):**
  1. Reposition messaging to "corporate wellness + busy professionals" (Money Pyramid tier)
  2. Implement 3-step follow-up sequence for leads (estimated +$80K/year)
  3. Create upsell path (nutrition coaching, recovery sessions) → +$45K/year potential

  **LONG-TERM (12 months):**
  1. Build direct mail campaign to corporate offices in metro
  2. Implement advanced retention system (VIP tiers, exclusive classes)
  3. Create signature offer/USP that differentiates from 47 competitors

  ### 90-DAY ACTION PLAN

  **Days 1-10:**
  [ ] Implement referral bonus ($100/successful referral)
  [ ] Set up tracking codes on all digital ads (UTM parameters)
  [ ] Begin tagging leads by source in CRM
  - Expected outcome: Immediate visibility + referral pipeline starts

  **Days 11-30:**
  [ ] Launch monthly "VIP Member Newsletter" (retention focus)
  [ ] A/B test 2 different email retention messages
  [ ] Create USP: "The Busy Professional's Fitness System (No Time? We Solve It)"
  - Expected outcome: Reduce churn, establish differentiation

  **Days 31-90:**
  [ ] Implement 5-step follow-up sequence for trial leads
  [ ] Add nutrition consultation upsell ($200/session)
  [ ] Direct mail test to 2,000 corporate decision-makers
  - Expected outcome: Increase conversions, capture new revenue streams, acquire 30+ new leads

  ### REVENUE IMPACT PROJECTION

  | Action | Timeline | Impact |
  |--------|----------|--------|
  | Referral system | Month 1 | +$5K |
  | Retention improvement | Month 2 | +$12K |
  | Follow-up sequences | Month 2 | +$8K |
  | Nutrition upsells | Month 2 | +$3K |
  | Direct mail leads | Month 3 | +$22K |
  | **90-Day Total** | | **+$50K** |
  | **Annualized Impact** | | **+$200K+** |

  ### ESTIMATED ROI
  Investment: $15K (direct mail test + email platform + staff training)
  Year 1 Revenue Impact: $200K
  **ROI: 1,333% (or 13:1)**

completion_criteria:
  - "All 6 audit steps completed with specific data"
  - "Every finding supported by evidence from client's data"
  - "Findings ranked by revenue impact (not gut feeling)"
  - "90-day action plan with specific daily/weekly steps"
  - "Quick wins identified and prioritized"
  - "Revenue impact estimated with calculations shown"
  - "No vague recommendations (all specific and actionable)"

completion_criteria:
  - "All 6 steps completed"
  - "Findings prioritized"
  - "90-day plan created"
```
