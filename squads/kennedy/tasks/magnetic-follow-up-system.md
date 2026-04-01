# Design Multi-Touch Follow-Up System

## Metadata
```yaml
task_id: KN_MG_007
agent: kennedy-magnetic
type: setup
complexity: high
estimated_time: 60min
source: "Magnetic Marketing — Follow-Up Imperative + No B.S. Rule #6"
```

## Purpose
Design a relentless multi-touch follow-up system. Kennedy's Rule #6 demands follow-up because most sales happen after 5-12 contacts — yet most businesses give up after 1-2.

> "The fortune is in the follow-up. 80% of sales are made between the 5th and 12th contact. Yet 90% of salespeople give up after the 3rd." — Dan Kennedy

## The Framework: Follow-Up Architecture
```
TOUCH 1:  Day 0  — Initial contact / response to inquiry
TOUCH 2:  Day 1  — Thank you + additional value
TOUCH 3:  Day 3  — Educational content + soft CTA
TOUCH 4:  Day 7  — Case study / testimonial
TOUCH 5:  Day 10 — Overcome objection
TOUCH 6:  Day 14 — New angle / different benefit
TOUCH 7:  Day 21 — Urgency / deadline
TOUCH 8:  Day 28 — Direct mail piece
TOUCH 9:  Day 35 — Phone call
TOUCH 10: Day 42 — "Last chance" campaign
TOUCH 11: Day 60 — Long-term nurture begins
TOUCH 12: Monthly — Newsletter / ongoing value
```

### Multi-Channel Follow-Up
Each touch should use a different channel for maximum impact:
Email → Direct mail → Phone → Email → Retargeting → Direct mail → Phone

## Input Required
```yaml
input:
  business: ""
  lead_source: ""
  offer: ""
  current_follow_up: ""
  available_channels: []
```

## Output Template
```yaml
output:
  follow_up_system:
    touch_sequence: []
    channel_per_touch: []
    content_per_touch: []
    automation_plan: ""
    long_term_nurture: ""
    projected_conversion_lift: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Magnetic system designed"
  context: "Lead magnets, shock-and-awe, follow-up sequences"


## Quality Gate
```yaml
quality:
  - [ ] Minimum 10 touches designed
  - [ ] Multiple channels used (not just email)
  - [ ] Each touch has specific content and purpose
  - [ ] Automation plan for touches 1-7
  - [ ] Long-term nurture for unconverted leads
  - [ ] Direct mail included in the sequence
```

---
*Task: KN_MG_007 | Agent: kennedy-magnetic | Version: 1.0*


## Follow-Up Sequence (Kennedy's 6-Step Model)

**Day 1-3:** Restate offer (prospect may have missed)
**Day 5-7:** New angle + urgency escalation
**Day 10-14:** "Third and final notice" (real deadline)
**Day 15-21:** CHANGE THE OFFER (different approach)
**Day 30+:** Nurture sequence (newsletter + value)
**Quarterly:** Seasonal reoffers

Each step targets different psychological barriers.


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No lead source or offer defined"
elicit:
  - question: "What is the lead source and what offer are you following up on?"
    required: true
output_example: |
  ## Follow-Up System — Output
  **Agent:** kennedy-magnetic
  - 12-touch sequence across multiple channels
completion_criteria:
  - "10+ touches designed"
  - "Multiple channels used"
  - "Automation planned"
```
