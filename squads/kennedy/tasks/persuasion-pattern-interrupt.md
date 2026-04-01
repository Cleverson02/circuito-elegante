# Design Pattern Interrupt Strategies

## Metadata
```yaml
task_id: KN_PR_004
agent: kennedy-persuasion
type: creation
complexity: medium
estimated_time: 30min
source: "Mind Hijacking Course — Pattern Interrupt Mechanism"
```

## Purpose
Design pattern interrupt strategies that break the prospect out of their autopilot mode and force conscious attention to your message. Without a pattern interrupt, your marketing is invisible noise.

> "Your prospect is on autopilot — scrolling, skimming, ignoring. A pattern interrupt jolts them awake. For one precious second, you have their full attention. What you do with that second determines everything." — Dan Kennedy

## The Science: Why Pattern Interrupts Work

The human brain processes ~2 million bits of information per second but only consciously experiences ~100-200. Marketing exists in the ignored 1.9+ million. A pattern interrupt violates the brain's predictive model, forcing conscious processing.

**The Interrupt Formula:** Violation of Expected Pattern → Conscious Attention → (Your message) → Prospect Engagement

Without interrupt, your message never reaches conscious processing. The prospect's brain filters it as background noise (like the coffee machine you stopped noticing).

## The Framework: 8 Pattern Interrupt Types

### Type 1: VISUAL DISRUPTION
**How it works:** Violation of visual expectations
- **Mechanisms:**
  - Handwritten envelope (vs. printed bulk mail)
  - Odd-sized mail (vs. standard #10)
  - Unusual color combination
  - Upside-down text/image
  - Missing expected element (no logo, no brand)
  - Confusing/puzzling image

- **Examples:**
  - Envelope with only first name (vs. formal address)
  - Teaser headline that makes no sense initially
  - Grayscale ad in color magazine
  - Odd package inside envelope (lumpy mail)

- **Expected Attention Lift:** 20-40%

### Type 2: VERBAL/TEXTUAL DISRUPTION
**How it works:** Statement contradicts expected messaging or violates norms
- **Mechanisms:**
  - Negative command ("Don't read this")
  - Confession/admission ("I lied about...")
  - Shocking statistic
  - Contradictory positioning ("We're the worst...")
  - Vulgar/provocative language (when unexpected)

- **Examples:**
  - "Why I'm closing my business"
  - "Stop exercising immediately"
  - "The truth they don't want you to know"
  - "I'm the most disliked [professional] in [city]"

- **Expected Attention Lift:** 30-50%

### Type 3: LOGICAL/REASONING DISRUPTION
**How it works:** Offer contradicts normal business logic
- **Mechanisms:**
  - "Free" offer from competitor
  - "Giving away our secret"
  - "Losing money on this offer"
  - Price too low for value
  - Too good to be true positioning

- **Examples:**
  - "I'm paying you to take my course"
  - "We're losing $500 on every sale"
  - "Normally $2,000 — I'm practically paying you to try"

- **Expected Attention Lift:** 25-45%

### Type 4: PHYSICAL/SENSORY DISRUPTION
**How it works:** Tactile surprise forces engagement
- **Mechanisms:**
  - Lumpy mail (lumpy envelope)
  - Textured materials
  - Dimensional objects
  - Odd weight/heft
  - Material you must touch to understand

- **Examples:**
  - Dollar bill attached to letter
  - Sand/rice in envelope
  - Puzzle piece requiring assembly
  - Heavy cardstock when expected light paper
  - Scent (perfume, cologne, distinctive scent)

- **Expected Attention Lift:** 35-60% (highest effectiveness)

### Type 5: SOCIAL PROOF DISRUPTION
**How it works:** Surprising scale of adoption/success
- **Mechanisms:**
  - Large numbers ("47,000 joined last month")
  - Unexpected sources ("Lawyers love this...")
  - Contrarian adoption ("Wealthy people are doing X")
  - Speed indicators ("8,000 signed up yesterday")

- **Examples:**
  - "More dentists switched than exist in your city"
  - "Your competitors are doing this"
  - "Sales to Fortune 500 companies tripled"

- **Expected Attention Lift:** 15-30%

### Type 6: TEMPORAL DISRUPTION
**How it works:** Timing violates expectations
- **Mechanisms:**
  - Delivery at unusual hour
  - Sequence that surprises (third contact when expecting two)
  - Timing aligned with trigger event
  - Follow-up at unexpected interval

- **Examples:**
  - Message arrives at exact moment relevant to recipient
  - Weekend delivery (not typical business mail)
  - Afternoon delivery when morning expected
  - Follow-up 13 days later (not standard 5-7)

- **Expected Attention Lift:** 10-25%

### Type 7: AUTHORITY DISRUPTION
**How it works:** Unexpected source adds credibility
- **Mechanisms:**
  - Celebrity/influencer endorsement
  - Competitor recommendation
  - Adversary testimonial
  - Expert from unexpected field

- **Examples:**
  - Competitor saying "use our competitor"
  - Enemy of industry commenting positively
  - Celebrity in unrelated field endorsing

- **Expected Attention Lift:** 25-40%

### Type 8: EMOTIONAL DISRUPTION
**How it works:** Unexpected emotional tone
- **Mechanisms:**
  - Humor in serious context
  - Seriousness in casual context
  - Vulnerability in corporate context
  - Rage/passion in typical corporate tone

- **Examples:**
  - Comedian writing marketing copy
  - CEO confessing personal failure
  - Profanity-laden direct mail (when expected formal)
  - Heartfelt personal story in business-to-business

- **Expected Attention Lift:** 20-35%

## Input Required

```yaml
input:
  audience_profile:
    who: ""
    industry: ""
    typical_media_consumption: ""
    what_they_ignore: ""

  their_autopilot_state:
    what_messages_they_filter: ""
    what_pattern_theyre_used_to: ""
    why_they_currently_ignore_you: ""

  medium:
    channel: "direct_mail | email | social | print | digital_ad | event | phone"
    format: ""
    constraints: ""

  current_approach:
    what_youre_currently_doing: ""
    response_rate_if_known: ""
    why_not_working: ""

  offer_context:
    what_youre_asking_them_to_do: ""
    why_they_should_care: ""
```

## Output Template

```yaml
output:
  pattern_interrupts_strategy:
    audience_autopilot_analysis: ""
    expected_filters: ""

    interrupt_strategies:
      visual:
        approach: ""
        execution: ""
        expected_lift: ""

      verbal:
        approach: ""
        execution: ""
        expected_lift: ""

      logical:
        approach: ""
        execution: ""
        expected_lift: ""

      physical:
        approach: ""
        execution: ""
        expected_lift: ""

      # ... other types as relevant

    primary_recommended: ""
    secondary_supporting: ""

    deployment_per_channel:
      direct_mail: ""
      email: ""
      social: ""
      # ... other channels

    follow_through_strategy:
      post_interrupt_messaging: ""
      time_to_call_to_action: ""
      proof_required: ""

    testing_plan:
      control_vs_treatment: ""
      measurement_mechanism: ""
      sample_size: ""

    expected_attention_lift: ""
    expected_response_lift: ""
```

## Handoff

```yaml
handoff:
  to: "kennedy-copy"
  trigger: "Pattern interrupt strategy designed"
  context: |
    - Pattern interrupt strategy for channel
    - Why this specific interrupt for this audience
    - Follow-through messaging required
    - Copy angles that work post-interrupt
    - Offer structure that matches interrupt promise
```

## Detailed Elicitation Process

When user says: "I need pattern interrupts"

**Question 1: Audience Analysis**
"Tell me about your audience: who are they, what do they do, what are they ignoring right now, what patterns are they used to?"

**Question 2: Current Autopilot**
"What messages are they filtering out? What do all your competitors do that makes them blend in? Why haven't they responded to you yet?"

**Question 3: Medium Reality**
"Where will this interrupt happen? Direct mail, email, phone? What are the constraints and opportunities of that channel?"

**Question 4: Offer Fit**
"What are you asking them to do? Why should they care? Does your offer deserve an interrupt?"

**Question 5: Boldness Assessment**
"How bold are you willing to be? How much can the interrupt differ from industry norms in your market?"

## Quality Gate

```yaml
quality:
  - [ ] Audience autopilot state clearly identified
  - [ ] Multiple interrupt strategies designed (3-5)
  - [ ] Primary interrupt selected with clear reasoning
  - [ ] Secondary interrupt identified as backup/rotation
  - [ ] Expected attention lift quantified (10-60%)
  - [ ] Follow-through strategy designed (not orphaned)
  - [ ] Deployment plan specific to each channel
  - [ ] Testing/measurement plan included
  - [ ] Feasible to execute (not overly complex)
  - [ ] Aligned with budget and brand constraints
```

---
*Task: KN_PR_004 | Agent: kennedy-persuasion | Version: 2.0 — EXPANDED*

## Task Anatomy Compliance

```yaml
veto_conditions:
  - "No audience defined"
  - "No channel defined"
  - "Interrupt disconnected from follow-through"

elicit:
  - question: "Who is the audience and what are they currently ignoring?"
    required: true
    context: "Identifies what pattern to interrupt"

  - question: "What channel? (direct mail, email, social, etc.)"
    required: true
    context: "Different channels need different interrupts"

  - question: "What patterns are they used to in your industry?"
    required: true
    context: "Can't interrupt what you don't understand"

  - question: "How bold are you willing to be?"
    required: true
    context: "Bolder interrupts work better but carry more risk"

output_example: |
  ## Pattern Interrupt Strategy — Output
  **Audience:** Dentists (30-55, $200K-$500K practices)
  **Channel:** Direct Mail
  **Current Autopilot:** Standard dental marketing (smiling people, testimonials, "new patients welcome")

  ### Autopilot Analysis
  Dentists receive 50+ pieces of dental marketing monthly. They automatically filter anything that looks like standard dental direct mail. Expected filters: smiling faces, patient testimonials, "new patient special" messaging.

  ### Interrupt Strategies

  1. **PHYSICAL INTERRUPT (Primary)**
     - **Approach:** Heavy, unusual object in envelope (golf ball)
     - **Execution:** Golf ball + note: "Stop losing patients to lazy dentistry"
     - **Expected Lift:** 45-55%

  2. **VERBAL INTERRUPT (Secondary)**
     - **Approach:** Shocking admission
     - **Execution:** "I hated being a dentist — until I changed one thing"
     - **Expected Lift:** 30-40%

  3. **VISUAL INTERRUPT (Backup)**
     - **Approach:** Envelope design that doesn't look like mail
     - **Execution:** Looks like certified letter (formal cardstock, "DO NOT BEND")
     - **Expected Lift:** 25-35%

  ### Recommended Deployment
  - **Primary:** Golf ball + shocking statement (70% of mail)
  - **Secondary:** Verbal interrupt only (20% of mail)
  - **Backup:** Visual interrupt (10% of mail)

  ### Follow-Through
  - **Post-Interrupt Message:** "Here's the one system that freed me from my practice..." (story)
  - **Proof:** Case study: Dr. Smith went from $200K to $450K
  - **CTA:** "30-min strategic call" (not "dentistry")

completion_criteria:
  - "Audience autopilot clearly identified"
  - "Primary + secondary interrupts designed"
  - "Expected lift 20%+ realistic"
  - "Follow-through messaging planned"
  - "Deployment plan channel-specific"
```
