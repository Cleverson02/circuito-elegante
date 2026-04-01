# Write a Lift Note

## Metadata
```yaml
task_id: KN_CP_007
agent: kennedy-copy
type: creation
complexity: low
estimated_time: 15min
source: "The Ultimate Sales Letter — Step 20: The Lift Note"
```

## Purpose
Write a "lift note" — a short, personal note on a separate slip that accompanies a sales letter. It acts as a second voice endorsing the offer and has been proven to increase response rates by 10-25%.

> "The lift note is like having a friend lean over and whisper 'Seriously, you should read this.' It's a second opinion that adds credibility." — Dan Kennedy

## The Framework: Lift Note Styles
1. **"Frankly" note:** "Frankly, I wasn't sure about including this letter..."
2. **Third-party endorsement:** Someone else vouching for the sender
3. **Behind-the-scenes:** "What they didn't tell you in the letter..."
4. **Urgency amplifier:** "I need to warn you about the deadline..."
5. **Personal appeal:** Handwritten-style, intimate tone

## The Framework: 5 Lift Note Styles

Each style creates a different psychological effect:

### Style 1: The "Frankly" Note (Doubt-to-Confidence Bridge)
Opens with skepticism, overcomes it with evidence.
- **Tone:** Honest, slightly reserved
- **Hook:** "Frankly, I wasn't convinced either..."
- **Best for:** Skeptical audiences, expensive offers
- **Effect:** Builds credibility through vulnerability

### Style 2: Third-Party Endorsement (Authority Borrowing)
Someone respected vouches for sender/offer.
- **Tone:** Enthusiastic but measured
- **Hook:** "I showed this to [respected person] and they said..."
- **Best for:** New offers, premium positioning
- **Effect:** Transfers credibility from endorser to offer

### Style 3: Behind-the-Scenes Revelation (Hidden Knowledge)
Reveals information "they" didn't put in the letter.
- **Tone:** Confidential, insider
- **Hook:** "What they didn't tell you in this letter is..."
- **Best for:** Competitive positioning, secret advantages
- **Effect:** Creates special knowledge advantage for reader

### Style 4: Urgency Amplifier (Deadline Intensifier)
Reinforces scarcity/urgency from different angle.
- **Tone:** Serious, matter-of-fact
- **Hook:** "I need to warn you about the deadline..."
- **Best for:** Limited-time offers, declining opportunities
- **Effect:** Second voice emphasizing real urgency

### Style 5: Personal Appeal (Human Connection)
Handwritten-style, intimate, one-person-to-one conversation.
- **Tone:** Warm, personal, direct
- **Hook:** "I'm writing this personally to you..."
- **Best for:** Relationship offers, premium services
- **Effect:** Creates human intimacy in mass communication

## Input Required

```yaml
input:
  sales_letter_context:
    main_offer: ""
    price_point: ""
    target_market: ""
    main_letter_positioning: ""

  letter_body:
    headline: ""
    key_promise: ""
    proof_points: ""
    call_to_action: ""

  lift_note_objective:
    purpose: "increase response | overcome objection | add credibility | emphasize urgency"
    target_objection: ""

  who_signs:
    name: ""
    title: ""
    relationship_to_offer: ""
```

## Output Template

```yaml
output:
  lift_note:
    style: "frankly | endorsement | behind-scenes | urgency | personal"
    strategic_purpose: ""

    copy:
      full_text: ""
      word_count: 0
      key_phrases: []

    signer:
      name: ""
      title: ""
      reason_credible: ""

    format:
      specification: "handwritten style on cream paper | 3x5 yellow sticky | printed letterhead"
      physical_appearance: ""
      size_guidance: ""

    psychological_impact:
      objection_addressed: ""
      belief_shift: ""
      probability_of_reading: ""

    distribution:
      placement: "top of envelope | loosely inserted | taped to letter"
      visibility: "immediately obvious on envelope opening"
```

## Handoff

```yaml
handoff:
  to: "kennedy-media"
  trigger: "Lift note copy complete and approved"
  context: |
    - Approved lift note copy
    - Format and placement specifications
    - Printing/production requirements
    - A/B testing plan (if applicable)
```

## Detailed Elicitation Process

When user says: "I need a lift note"

**Question 1: Letter Context**
"I need to see your sales letter first. What's the main offer, the price, who you're targeting, and what problem you're solving?"

**Question 2: Obstacle Identification**
"What do you think prospects are skeptical about? Is it price? The offer? The company? Your credibility? That's what the lift note should address."

**Question 3: Signer Authority**
"Who should sign this? You? A customer? A celebrity? Someone the prospect respects? This determines the style."

**Question 4: Letter Gaps**
"Is there any information the sales letter doesn't cover that would help close the sale? Any objection not addressed? Any proof not shown?"

**Question 5: Format Reality**
"How will this arrive? In the envelope? On top? Separate card? This affects impact and perceived authenticity."

## Quality Gate

```yaml
quality:
  - [ ] Sounds personal and authentic (not corporate)
  - [ ] Adds new information OR new perspective (not mere repetition)
  - [ ] Word count 50-150 words (short enough to actually read)
  - [ ] Different voice from main letter (proves separate person/perspective)
  - [ ] Format specified exactly (for production team)
  - [ ] Addresses specific objection or fear
  - [ ] Call-to-action clear (if applicable)
  - [ ] Signer authority explained (why trust this person?)
  - [ ] Psychological impact predictable (increases response 10-25%)
```

---
*Task: KN_CP_007 | Agent: kennedy-copy | Version: 2.0 — EXPANDED*

## Task Anatomy Compliance

```yaml
veto_conditions:
  - "No sales letter context provided"
  - "Unclear who will sign the lift note"
  - "No specific objection to address"

elicit:
  - question: "Show me your sales letter. What's the main offer and price?"
    required: true
    context: "Need context to know what lift note should emphasize"

  - question: "What's the biggest objection or doubt a prospect has?"
    required: true
    context: "Lift note should address the #1 concern"

  - question: "Who would you like to sign this? (You, customer, expert, etc.)"
    required: true
    context: "Determines style and psychological impact"

  - question: "How will this arrive? (Top of envelope, inside loose, separate card, etc.)"
    required: true
    context: "Format affects perceived authenticity"

output_example: |
  ## Lift Note — Output
  **Agent:** kennedy-copy
  **Sales Letter:** Premium Consulting Offer ($5,000)
  **Style:** Behind-the-Scenes Revelation

  ### Copy (87 words)
  ---
  **From: Robert, Senior Client Success Manager**

  "What they didn't mention in this letter is why 43% of our clients stay 3+ years when industry average is 1.2 years. It's not just results — we actually care about your personal growth. We turn clients into friends. That's why the price isn't actually $5k — it's an investment in a relationship with people who will challenge you for a decade."

  **— Robert**
  ---

  ### Production Specs
  - **Format:** Printed on cream cardstock (matches envelope)
  - **Font:** Handwritten-style (Calibre or similar)
  - **Size:** 4x6 card
  - **Placement:** Inserted loosely on top of letter (immediately visible on envelope opening)
  - **Signer:** Robert (real person, photo optional but powerful)

  ### Psychological Impact
  - **Objection Addressed:** "Why is this so expensive?"
  - **Belief Shift:** "This is a premium relationship, not a commodity transaction"
  - **Probability of Reading:** 95%+ (personal note always read)
  - **Expected Lift:** +12-18% response rate

completion_criteria:
  - "Authentic personal voice"
  - "Under 150 words"
  - "Addresses specific objection"
  - "Different from main letter"
  - "Format production-ready"
  - "Signer authority clear"
```
