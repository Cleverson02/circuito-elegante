# Design Monthly DR Newsletter

## Metadata
```yaml
task_id: KN_MD_006
agent: kennedy-media
type: creation
complexity: medium
estimated_time: 90min
source: "Magnetic Marketing + No B.S. Direct Marketing — Newsletter Strategy"
```

## Purpose
Design a monthly print newsletter that maintains the relationship, delivers value, and generates sales — all at once. Kennedy ran his famous "No B.S. Marketing Letter" for decades as his primary retention and selling tool.

> "A monthly newsletter is the single most important tool for keeping customers connected, educated, and buying. It's retention and selling wrapped in value." — Dan Kennedy

## The Framework: Newsletter Architecture
1. **Personal opening** — Conversational, like a letter from a friend
2. **Main article** — Educational content with embedded selling
3. **Case study/testimonial** — Proof of results
4. **Special offer** — Monthly promotion exclusive to subscribers
5. **Q&A section** — Answer real customer questions
6. **Action items** — Things to do this month
7. **P.S.** — Additional offer or upcoming event

### Print vs. Digital
Kennedy strongly prefers PRINT newsletters — they sit on desks, get passed around, and have staying power. Digital is supplementary.

## Input Required
```yaml
input:
  business: ""
  audience: ""
  content_topics: []
  offers_to_promote: []
```

## Output Template
```yaml
output:
  newsletter:
    name: ""
    format: "print | digital | both"
    sections: []
    page_count: ""
    frequency: "monthly"
    distribution: ""
    offers_per_issue: ""
    design_specs: ""
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Media plan complete"
  context: "Distribution strategy and channels"


## Quality Gate
```yaml
quality:
  - [ ] 7 sections present
  - [ ] Print format specified
  - [ ] Each issue has at least 1 offer
  - [ ] Content provides genuine value
  - [ ] Personal, conversational tone
```

---
*Task: KN_MD_006 | Agent: kennedy-media | Version: 1.0*


## Newsletter Architecture (Kennedy-Approved)

**Content Mix:**
- 40%: Educational/valuable content
- 30%: Personal stories/lessons learned
- 20%: Soft promotion (your offer)
- 10%: Hard call-to-action

**Frequency:** Weekly (consistent = habit)
**Length:** 500-800 words (readable in 4-5 min)
**Tone:** Personal, conversational, authority
**CTA:** Always present (not pushy, just clear)


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No audience defined"
elicit:
  - question: "Who is the newsletter for and what topics are relevant?"
    required: true
output_example: |
  ## Newsletter Design — Output
  **Agent:** kennedy-media
  - Complete newsletter template with sections
completion_criteria:
  - "7 sections designed"
  - "Print format specified"
```
