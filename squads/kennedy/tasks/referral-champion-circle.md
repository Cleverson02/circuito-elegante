# Build Champion Circle of Influence

## Metadata
```yaml
task_id: KN_RF_004
agent: kennedy-referrals
type: setup
complexity: medium
estimated_time: 90min
source: "Ultimate No BS Referral Machine — Champion Circle of Influence"
```

## Purpose
Identify and cultivate your Champion Circle — the top 20% of clients who are natural connectors and can become your referral army. Kennedy teaches that a small group of Champions can generate more referrals than your entire customer base combined.

## The Framework: Champion Circle
```
Your entire customer base: 100%
├── Passive customers (80%): Buy but never refer
└── Champions (20%): Natural connectors who actively refer
    ├── Super Champions (5%): Refer 10+ people per year
    └── Regular Champions (15%): Refer 2-5 per year
```

### Champion Identification Criteria
1. High satisfaction with your product/service
2. Large personal/professional network
3. Natural connector personality
4. Already referred at least once
5. Respected in their community

## Input Required
```yaml
input:
  customer_base: ""
  past_referrals: []
  high_satisfaction_clients: []
```

## Output Template
```yaml
output:
  champion_circle:
    super_champions: []
    regular_champions: []
    cultivation_plan: []
    vip_benefits: []
    communication_cadence: ""
    referral_tools: []
```


handoff:
  to: "kennedy-business"
  trigger: "Referral system designed"
  context: "Referral mechanics and incentive structure"


## Quality Gate
```yaml
quality:
  - [ ] Champions identified with criteria scoring
  - [ ] VIP benefits designed for Champions
  - [ ] Communication cadence established
  - [ ] Referral tools provided to Champions
  - [ ] Projected referral increase calculated
```

---
*Task: KN_RF_004 | Agent: kennedy-referrals | Version: 1.0*


## Champion Circle Architecture

**3-Tier Referral Machine:**

**Tier 1: Champions** (top 5-10 clients/advocates)
- VIP treatment
- First access to new offerings
- Special benefits/pricing
- Monthly personal contact

**Tier 2: Advocates** (next 20-30)
- Regular value delivery
- Referral incentives
- Quarterly contact

**Tier 3: Promoters** (general list)
- Newsletter
- Occasional value
- Open referral requests


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No customer base to analyze"
elicit:
  - question: "Describe your customer base and any past referral activity."
    required: true
output_example: |
  ## Champion Circle — Output
  **Agent:** kennedy-referrals
  - Champions identified, VIP program designed
completion_criteria:
  - "Champions identified"
  - "VIP benefits designed"
  - "Tools provided"
```
