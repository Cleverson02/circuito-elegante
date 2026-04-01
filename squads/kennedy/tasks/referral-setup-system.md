# Setup Referral System

## Metadata
```yaml
task_id: KN_RF_001
agent: kennedy-referrals
type: setup
complexity: high
estimated_time: 60-90min
source: "Ultimate No BS Referral Machine — 11-Point Referral System"
```

## Purpose

Build a systematic, predictable referral generation machine using Kennedy's 11-Point Referral System. Most businesses get referrals by accident — this system makes them happen by design.

> "If you're not systematically generating referrals, you're leaving the easiest, cheapest, most profitable source of new business entirely to chance." — Dan Kennedy

## The Framework: Kennedy's 11-Point Referral System

| # | Point | Description |
|---|-------|-------------|
| 1 | Earn the Right | Deliver exceptional results first |
| 2 | Ask at Peak Satisfaction | Timing matters — ask when they love you |
| 3 | Make It Easy | Remove all friction from the referral process |
| 4 | Incentivize Both Sides | Reward the referrer AND the referred |
| 5 | Provide Tools | Scripts, emails, cards they can use |
| 6 | Train Your Champions | Teach best referrers how to refer |
| 7 | Create Events/Opportunities | Bring-a-friend events, workshops |
| 8 | Follow Up on Referrals Fast | 24-hour response to every referral |
| 9 | Report Back to Referrer | Tell them what happened with their referral |
| 10 | Recognize Publicly | Thank referrers publicly and generously |
| 11 | Systematize and Automate | Make it a process, not a hope |

### Champion Circle of Influence
Identify your top 20% of clients who are natural connectors and referrers. These are your "Champions" — give them VIP treatment and turn them into a referral army.

## Input Required
```yaml
input:
  business: ""
  current_referral_rate: ""
  customer_base_size: ""
  average_customer_value: ""
  current_referral_method: ""
  top_clients: []              # Best candidates for Champion Circle
```

## Step-by-Step Process

### Step 1: Audit Current Referral Activity
What referrals are you getting now? How? From whom?

### Step 2: Identify Your Champion Circle
Top 20% of clients by satisfaction, relationship, and network size.

### Step 3: Design All 11 Points
For each of the 11 points, create specific implementation.

### Step 4: Create Referral Tools
- Referral cards (physical and digital)
- Email templates referrers can forward
- Social media share templates
- Scripts for phone referrals

### Step 5: Build the Incentive Program
What do referrers get? What do referred prospects get?

### Step 6: Automate and Schedule
Put the system on autopilot with triggers and reminders.

## Output Template
```yaml
output:
  referral_system:
    eleven_points: []
    champion_circle: []
    referral_tools: []
    incentive_program: {}
    automation_plan: {}
    projected_referrals_per_month: ""
    estimated_value: ""
```


handoff:
  to: "kennedy-business"
  trigger: "Referral system designed"
  context: "Referral mechanics and incentive structure"


## Quality Gate
```yaml
quality:
  - [ ] All 11 points implemented
  - [ ] Champion Circle identified (top 20%)
  - [ ] Referral tools created (cards, emails, scripts)
  - [ ] Incentive program rewards both sides
  - [ ] Follow-up on referrals is within 24 hours
  - [ ] System is automated, not dependent on memory
  - [ ] Projected referral rate calculated
```

## Handoff
- -> **kennedy-copy** for referral tool copywriting
- -> **kennedy-media** for referral campaign distribution

---
*Task: KN_RF_001 | Agent: kennedy-referrals | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No customer base to generate referrals from"
  - "No current customer satisfaction data"

elicit:
  - question: "How many active customers do you have and what is average customer value?"
    required: true
  - question: "What referral activity currently exists?"
    required: false

output_example: |
  ## Referral System — Output
  **Source Framework:** 11-Point Referral System
  **Agent:** kennedy-referrals

  - All 11 points designed
  - Champion Circle identified
  - Referral tools created
  - Automation plan

completion_criteria:
  - "All 11 points implemented"
  - "Champion Circle defined"
  - "Tools and automation in place"
```
