# Create Magnetic Marketing Campaign

## Metadata
```yaml
task_id: KN_MAG_001
agent: kennedy-magnetic
type: creation
complexity: high
estimated_time: 60min
source: "Magnetic Marketing (2018) + Magnetic Marketing Course"
```

## Purpose

Design a complete Magnetic Marketing campaign using Kennedy's 3-Pillar System:
Attract, Convert, Retain. This creates a systematic approach to lead generation
and customer conversion that replaces "chase and pray" with "attract and convert."

> "Stop chasing customers. Become magnetic. When you have the right message,
> the right market, and the right media, prospects come to YOU." -- Dan Kennedy

## Veto Conditions
```yaml
veto_conditions:
  - id: VT0-001
    check: "Results Triangle defined? (Message + Market + Media)"
    fail_action: "BLOCK — Define Results Triangle before designing campaign"
  - id: VT0-002
    check: "USP articulated?"
    fail_action: "BLOCK — No USP = no differentiation = no magnetism"
  - id: VT1-004
    check: "9 Fatal Mistakes diagnosed?"
    fail_action: "BLOCK — Diagnose before building"
```

## Input Required
```yaml
input:
  business:
    name: ""
    niche: ""
    current_marketing: "What are you doing now?"
    biggest_marketing_frustration: ""

  target_market:
    who: "Describe your ideal customer"
    money_pyramid_tier: "1% | 4% | 15% | 60% | 20%"
    congregation_sources: "Where do they hang out? (min 5)"
    what_keeps_them_up: "Their #1 problem at 3 AM"

  current_system:
    has_lead_magnet: "Y/N"
    has_follow_up: "Y/N"
    has_shock_awe: "Y/N"
    has_referral_system: "Y/N"
    has_retention_program: "Y/N"
```

## Elicitation Sequence

If user provides incomplete input, elicit in this order:

1. **Who is your starving crowd?** (Cannot proceed without this)
2. **What is your USP?** (Cannot attract without differentiation)
3. **What are you currently doing for marketing?** (Diagnose before prescribing)
4. **What is your budget range?** (Determines media options)
5. **Are you willing to use direct mail?** (Kennedy's preferred channel)

## The 3-Pillar System Framework

### Pillar 1: ATTRACT
- Design 3-5 lead magnets for different awareness levels
- Create USP that makes you the obvious choice
- Write attraction ads using DR principles
- Select and test media channels

### Pillar 2: CONVERT
- Design shock-and-awe package (minimum 5 elements)
- Build multi-step follow-up sequence (minimum 5 touches)
- Create irresistible conversion offer with guarantee
- Implement multi-media follow-up (mail + email + phone)

### Pillar 3: RETAIN
- Monthly newsletter or communication
- VIP/inner circle program
- Referral system activation
- Lost customer reactivation program

## Output Example

```markdown
# Magnetic Marketing Campaign: [Business Name]

## Results Triangle
- **Message:** [Core USP and promise]
- **Market:** [Starving crowd description]
- **Media:** [Selected channels with tracking]

## Pillar 1: ATTRACT
### Lead Magnet Suite
1. [Lead Magnet #1 — Problem-aware prospects]
2. [Lead Magnet #2 — Solution-aware prospects]
3. [Lead Magnet #3 — Product-aware prospects]

### Attraction Copy
[Headline + ad copy for each channel]

## Pillar 2: CONVERT
### Shock-and-Awe Package
1. Personalized welcome letter
2. [Authority material]
3. [Testimonial compilation]
4. [FAQ/Objection crusher]
5. [Time-sensitive offer]
6. [Premium/widget]

### Follow-Up Sequence
- Day 0: Shock-and-awe delivery
- Day 3: Follow-up letter
- Day 7: Phone call / personal video
- Day 14: Second offer with urgency
- Day 21: Final deadline notice

## Pillar 3: RETAIN
### Monthly Communication Plan
### VIP Program Design
### Referral System Setup

## Tracking Plan
[Tracking codes, URLs, phone numbers for every touchpoint]
```


handoff:
  to: "kennedy-media"
  trigger: "Magnetic system designed"
  context: "Lead magnets, shock-and-awe, follow-up sequences"


## Completion Criteria
```yaml
completion:
  required:
    - "All 3 pillars designed with specific deliverables"
    - "Minimum 3 lead magnets specified"
    - "Shock-and-awe package with 5+ elements"
    - "Follow-up sequence mapped (5+ steps)"
    - "Tracking mechanism for every channel"
    - "USP clearly stated"
    - "Results Triangle validated"
  quality_check:
    - "Uses Kennedy terminology (not Brunson)"
    - "All elements are direct response (not institutional)"
    - "Every touchpoint has a specific offer and CTA"
    - "Passes 10 No B.S. Rules compliance"
  checklist: "checklists/magnetic-marketing-checklist.md"
```

---

**Version:** 1.0
**Agent:** kennedy-magnetic
