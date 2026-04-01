# Design a Mind Hijacking Campaign

## Metadata
```yaml
task_id: KN_PR_002
agent: kennedy-persuasion
type: creation
complexity: high
estimated_time: 60-90min
source: "Mind Hijacking Course (22 transcriptions)"
```

## Purpose

Design a marketing campaign using Kennedy's Mind Hijacking techniques — psychological patterns that capture and hold attention so powerfully that the prospect cannot think about anything else until they take action.

> "Mind hijacking is about ethically taking over the prospect's mental bandwidth. Once you hijack their thinking, they can't un-think your message. They WILL respond — the only question is when." — Dan Kennedy

## The Framework: Mind Hijacking System

### The 5 Mind Hijacking Mechanisms

**1. Pattern Interrupt**
Break their expected pattern so violently they MUST pay attention.
- Unexpected format (lumpy mail, odd-sized piece)
- Shocking statement or statistic
- Contradicting conventional wisdom

**2. Open Loop**
Start a story or present information that is deliberately incomplete.
- "The biggest mistake I ever made was..." (never finished until they respond)
- Curiosity gap that can only be closed by taking action

**3. Identity Hijack**
Make them see themselves differently.
- "If you're the kind of person who..." (they want to be that person)
- Challenge their self-image to create cognitive dissonance

**4. Future Pacing**
Have them mentally experience the result before buying.
- "Imagine waking up tomorrow and..." (vivid mental rehearsal)
- Make the future state so real they feel loss by NOT acting

**5. Emotional Anchor**
Attach your product/offer to a powerful existing emotion.
- Connect to their deepest fear or greatest desire
- Make your solution feel like the ONLY path to relief

## Input Required
```yaml
input:
  audience: ""
  audience_mental_patterns: []
  product_service: ""
  desired_action: ""
  emotional_landscape:
    fears: []
    desires: []
    frustrations: []
    aspirations: []
```

## Step-by-Step Process

### Step 1: Map the Audience's Mental Landscape
What do they think about? What patterns are they stuck in?

### Step 2: Choose Primary Hijacking Mechanism
Which of the 5 mechanisms is most powerful for this audience?

### Step 3: Design the Hijack Sequence
```
PATTERN INTERRUPT → OPEN LOOP → IDENTITY HIJACK → FUTURE PACE → EMOTIONAL ANCHOR → CTA
```

### Step 4: Write the Campaign Elements
Apply the hijack sequence across all campaign pieces.

### Step 5: Test the Hijack
Does this campaign consume the prospect's mental bandwidth?

## Output Template
```yaml
output:
  mind_hijack:
    primary_mechanism: ""
    pattern_interrupt: ""
    open_loop: ""
    identity_hijack: ""
    future_pace: ""
    emotional_anchor: ""
    campaign_elements: []
    ethical_boundaries: []
```


handoff:
  to: "kennedy-copy"
  trigger: "Persuasion elements mapped"
  context: "Psychological triggers and messaging angles"


## Quality Gate
```yaml
quality:
  - [ ] Primary hijacking mechanism selected with rationale
  - [ ] Full hijack sequence designed
  - [ ] Campaign elements created for each mechanism
  - [ ] Ethical boundaries defined (persuasion, not manipulation)
  - [ ] Test plan for measuring mental engagement
  - [ ] Open loops properly resolved in the sales process
```

## Handoff
- -> **kennedy-copy** for copy implementation
- -> **kennedy-media** for multichannel deployment

---
*Task: KN_PR_002 | Agent: kennedy-persuasion | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No audience psychology mapped"
  - "No desired action specified"

elicit:
  - question: "Who is the audience and what are their deepest fears and desires?"
    required: true
  - question: "What action do you want them to take?"
    required: true

output_example: |
  ## Mind Hijacking Campaign — Output
  **Source Framework:** Mind Hijacking Course
  **Agent:** kennedy-persuasion

  - 5 mechanisms designed
  - Full hijack sequence
  - Campaign elements created
  - Ethical boundaries defined

completion_criteria:
  - "Full hijack sequence designed"
  - "Campaign elements created"
  - "Ethical boundaries clear"
```
