# Create Affluent Client Attraction Campaign

## Metadata
```yaml
task_id: KN_AFF_001
agent: kennedy-affluent
type: creation
complexity: high
estimated_time: 60min
source: "Affluent Client Attraction Playbook (10 transcriptions)"
```

## Purpose

Design a complete campaign to attract affluent clients using Kennedy's
premium positioning, Money Pyramid targeting, and authority-based marketing.
This is not about discounting to attract volume — it is about charging
premium prices to attract the clients who value quality over cost.

> "Stop competing on price. Compete on value, exclusivity, and the
> experience of doing business with you." -- Dan Kennedy

## Veto Conditions
```yaml
veto_conditions:
  - id: VT1-006
    check: "Money Pyramid tier identified?"
    fail_action: "BLOCK — Must know which affluent tier to target"
  - check: "Product/service quality justifies premium pricing?"
    fail_action: "HALT — Fix quality before premium positioning"
  - check: "No discounting in campaign?"
    fail_action: "VETO — NEVER discount to attract affluent. Add value instead."
```

## Input Required
```yaml
input:
  business:
    name: ""
    what_you_sell: ""
    current_price_range: ""
    desired_price_range: ""
    current_clientele: "mass market | mixed | affluent"

  affluent_targeting:
    money_pyramid_tier: "1% ultra-rich | 4% rich | 15% comfortable"
    target_income_level: ""
    geographic_targeting: ""
    industry_targeting: ""

  authority_assets:
    have_book: "Y/N"
    media_appearances: "Y/N"
    speaking_experience: "Y/N"
    high_profile_clients: "Y/N"
    awards_credentials: ""
```

## Affluent Client Psychology

The affluent DO NOT:
- Respond to discounts or "deals"
- Trust hard-sell or hype
- Want to be one of many
- Accept generic or mass-market experiences

The affluent DO:
- Value exclusivity and access
- Respect authority and credentials
- Make decisions based on peer influence
- Pay premium for time savings and convenience
- Appreciate quality materials and presentation

## Output Structure

```markdown
# Affluent Attraction Campaign: [Business Name]

## Money Pyramid Positioning
- Target tier: [Which tier and why]
- Price point: [Premium pricing with justification]
- Competitive position: [How you stand apart]

## Authority Building Elements
1. [Book/report strategy]
2. [Speaking/events plan]
3. [Media/PR approach]
4. [Credentials display]

## Premium Offer Suite
### Signature Service
[Premium flagship offer]

### VIP/Platinum Tier
[Highest-touch, highest price]

### Retainer/Advisory
[Ongoing relationship offer]

## Affluent Shock-and-Awe Package
[Premium package design — looks expensive]

## Application-Based Intake
[Application form + qualification criteria + interview script]

## Campaign Sequence
1. [Awareness — authority content]
2. [Interest — exclusive invitation]
3. [Application — gatekeeping]
4. [Interview — qualification call]
5. [Acceptance — premium onboarding]

## Affluent-Tone Copy Samples
[Sample copy that whispers, not screams]
```


handoff:
  to: "kennedy-offers"
  trigger: "Affluent market analysis complete"
  context: "High-net-worth positioning and psychology"


## Completion Criteria
```yaml
completion:
  required:
    - "Money Pyramid tier selected and justified"
    - "Premium offer suite with minimum 2 tiers"
    - "Authority building plan"
    - "Application-based intake process"
    - "Affluent shock-and-awe package"
    - "Campaign sequence mapped"
    - "NO discounting in any element"
  quality_check:
    - "Copy tone is authoritative, not salesy"
    - "Materials look premium"
    - "Gatekeeping is built into the process"
    - "Kennedy affluent principles applied throughout"
```

---

**Version:** 1.0
**Agent:** kennedy-affluent
