# Create Referral System

## Metadata
```yaml
task_id: KN_REF_001
agent: kennedy-referrals
type: creation
complexity: high
estimated_time: 60min
source: "Ultimate No BS Referral Machine (20 transcriptions)"
```

## Purpose

Design a systematic referral machine using Kennedy's 11-Point Referral
System. Transforms accidental word-of-mouth into an engineered referral
engine with champion networks, endorsed mailings, and reactivation campaigns.

> "A referral is not an accident — it is an engineered outcome. The business
> with a referral SYSTEM will always outgrow the one hoping for word-of-mouth."
> -- Dan Kennedy

## Veto Conditions
```yaml
veto_conditions:
  - id: VT2-REF-001
    check: "11-Point system mapped before any referral asks?"
    fail_action: "BLOCK — Design the system before asking for referrals"
  - check: "Existing customer base to work with?"
    fail_action: "REDIRECT — Build customer base first (wf-magnetic-campaign)"
```

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    current_customer_count: 0
    current_referral_rate: ""
    average_customer_value: ""

  referral_current_state:
    how_referrals_happen_now: ""
    do_you_ask_for_referrals: "Y/N"
    do_you_reward_referrals: "Y/N"
    do_you_track_referral_sources: "Y/N"
    top_referrers: []

  champion_candidates:
    happy_customers: "List your top 10-20 most enthusiastic customers"
    strategic_partners: "Complementary businesses that serve your market"
    influencers: "People of influence in your target market"
```

## The 11-Point Referral System

1. **Set referral expectations at onboarding** — Tell new customers upfront
2. **Deliver remarkable experience** — Give them something worth referring
3. **Ask at maximum satisfaction** — Timing is everything
4. **Make referring EASY** — Tools, scripts, templates
5. **Reward referrals immediately** — Tangible, not just "thanks"
6. **Recognize referrers publicly** — Wall of fame, events, shoutouts
7. **Create referral events/occasions** — "Bring a friend" events
8. **Use endorsed mailings** — Champions mail THEIR list about you
9. **Provide referral tools** — Cards, links, kits
10. **Follow up with referred prospects** — Immediately, not when convenient
11. **Report back to referrer** — Close the loop, reinforce behavior

## Output Example

```markdown
# Referral System: [Business Name]

## 11-Point Implementation Plan

### Point 1: Set Expectations at Onboarding
- Script: "[What to say to new customers]"
- When: [At which touchpoint]

### Point 2: Remarkable Experience
- [3 specific experience upgrades]

### Point 3: Ask at Maximum Satisfaction
- Trigger moments: [When satisfaction peaks]
- Ask script: "[Exact words]"

... [all 11 points]

## Champion Circle
### Top Champions Identified (Target: 15-20)
| # | Name | Type | Estimated Reach |
|---|------|------|----------------|
| 1 | [Name] | Customer | [Reach] |

## Endorsed Mailing Templates
- Template 1: [Partner-to-their-list letter]
- Template 2: [Referral thank-you letter]

## Referral Incentive Structure
- Immediate reward: [Gift card / premium]
- Cumulative reward: [VIP tier upgrade]
- Recognition reward: [Public acknowledgment]

## 12-Month Referral Calendar
[Monthly activities mapped]

## Tracking System
- Unique referral codes per champion
- Source tracking for every new lead
- Monthly referral report template
```


handoff:
  to: "kennedy-business"
  trigger: "Referral system designed"
  context: "Referral mechanics and incentive structure"


## Completion Criteria
```yaml
completion:
  required:
    - "All 11 points mapped with specific actions"
    - "Champion Circle identified (min 10 candidates)"
    - "Endorsed mailing template created"
    - "Incentive structure defined"
    - "Tracking system designed"
    - "12-month calendar planned"
  quality_check:
    - "System is truly systematic (not just 'ask more')"
    - "Champions receive VIP treatment"
    - "Tracking on every referral source"
    - "Endorsed mailing templates are personal, not corporate"
```

---

**Version:** 1.0
**Agent:** kennedy-referrals
