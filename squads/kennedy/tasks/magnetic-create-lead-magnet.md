# Create a Lead Magnet

## Metadata
```yaml
task_id: KN_MG_001
agent: kennedy-magnetic
type: creation
complexity: high
estimated_time: 60-90min
source: "Magnetic Marketing — 3-Pillar System (Attraction)"
```

## Purpose

Create a powerful lead magnet that magnetically attracts your ideal prospects. Kennedy's Magnetic Marketing system demands that you ATTRACT prospects instead of chasing them — and the lead magnet is the core attraction device.

> "Stop chasing customers. Start attracting them. The difference between a pest and a welcome guest is a great lead magnet." — Dan Kennedy

## The Framework: Kennedy's Lead Magnet Architecture

### The 7 Types of Lead Magnets (Ranked by Perceived Value)

| # | Type | Perceived Value | Best For |
|---|------|-----------------|----------|
| 1 | Physical Book / Report | Very High | Authority building |
| 2 | Free + Shipping Book | High | Buyer conversion |
| 3 | Multi-Part Video Series | High | Complex topics |
| 4 | Toolkit / Resource Kit | High | Implementation |
| 5 | Free Report / White Paper | Medium | B2B, professional |
| 6 | Checklist / Cheat Sheet | Medium | Quick wins |
| 7 | Quiz / Assessment | Medium | Segmentation |

### The Lead Magnet Must:
1. Solve ONE specific problem immediately
2. Position you as the expert
3. Create desire for your paid offer
4. Be valuable enough to trade contact info for
5. Pre-frame the prospect for your sales message

## Input Required
```yaml
input:
  business:
    name: ""
    industry: ""
    usp: ""
    primary_offer: ""

  audience:
    who: ""
    biggest_problem: ""
    immediate_desire: ""
    awareness_level: ""

  lead_magnet:
    type_preference: ""        # Or let the system recommend
    topic: ""
    delivery: "physical | digital | both"
    budget: ""
```

## Step-by-Step Process

### Step 1: Identify the "Splinter" Problem
The lead magnet solves a SPLINTER of the larger problem your paid offer solves.
```
BIG PROBLEM (paid offer solves): ________________
SPLINTER (lead magnet solves):   ________________
```

The splinter must be:
- Specific and immediate
- Solvable in the lead magnet itself
- Connected to the bigger problem
- Creating awareness of the need for your paid solution

### Step 2: Choose the Format
Match format to audience sophistication and delivery preference.

### Step 3: Create the Content Structure
```yaml
lead_magnet_structure:
  title: ""                    # Benefit-driven, specific
  subtitle: ""                 # Adds urgency or curiosity
  section_1: ""                # Problem identification
  section_2: ""                # Why common solutions fail
  section_3: ""                # Your unique approach
  section_4: ""                # Actionable steps
  section_5: ""                # Results / case studies
  cta: ""                      # Bridge to paid offer
```

### Step 4: Write the Title (Use Kennedy's Headline Formulas)
The title is the ad for the lead magnet. It must sell the download.
- "The [Audience]'s Guide to [Desired Result]"
- "FREE Report: [Number] Ways to [Benefit] Without [Pain]"
- "[Number] Secrets Your [Industry] Doesn't Want You to Know"
- "How [Audience] Can [Result] in [Timeframe]"

### Step 5: Design the Conversion Bridge
The lead magnet must naturally lead to your paid offer:
```
Lead Magnet teaches WHAT and WHY
→ Paid offer provides HOW (implementation, tools, support)
```

## Output Template
```yaml
output:
  lead_magnet:
    title: ""
    type: ""
    format: ""
    target_audience: ""
    splinter_problem: ""
    content_outline: []
    word_count_target: ""
    delivery_method: ""
    conversion_bridge: ""
    landing_page_headline: ""
    estimated_opt_in_rate: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Magnetic system designed"
  context: "Lead magnets, shock-and-awe, follow-up sequences"


## Quality Gate
```yaml
quality:
  - [ ] Solves a specific, immediate "splinter" problem
  - [ ] Title uses proven headline formula
  - [ ] Content positions you as the authority
  - [ ] Natural bridge to paid offer
  - [ ] Valuable enough that prospect would PAY for it
  - [ ] Can be consumed in under 30 minutes
  - [ ] Includes clear CTA for next step
```

## Handoff
- -> **kennedy-copy** for lead magnet copywriting
- -> **kennedy-media** for distribution across channels
- -> **kennedy-magnetic** for shock and awe package integration

---
*Task: KN_MG_001 | Agent: kennedy-magnetic | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No target audience defined"
  - "No primary offer to bridge to"

elicit:
  - question: "Who is your target audience and what is their biggest immediate problem?"
    required: true
  - question: "What is your primary paid offer that the lead magnet bridges to?"
    required: true

output_example: |
  ## Lead Magnet Suite — Complete Output
  **Source Framework:** Magnetic Marketing 3-Pillar System
  **Agent:** kennedy-magnetic
  **Business:** Elite Fitness Personal Training (target: busy executives age 40-55)
  **Primary Offer:** 90-Day Transformation Program ($3,500)

  ### Lead Magnet #1: High Problem-Awareness ("The Wakeup Call")
  **Title:** "The 8-Minute Body Assessment: Why Your Workouts Aren't Working (Even If You're Trying Hard)"
  **Format:** PDF Report + Video (7 pages, 8-min video included)
  **Distribution:** Download via landing page
  **Splinter Problem:** "I exercise but see no results"
  **Content Outline:**
  1. The tempo mistake (most people go too slow or wrong range)
  2. The volume trap (doing too much, overtraining your nervous system)
  3. The frequency delusion (more isn't better after 40)
  4. The nutrition blindness (can't out-exercise bad nutrition)
  5. The recovery sabotage (sleep/stress destroying results)
  6. The exercise selection mistake (programs designed for 25-year-olds)
  7. The accountability gap (no one watching = no results)
  8. The hormone reality (testosterone drop, cortisol patterns)

  **Quality Metrics:**
  - Title uses proven formula: "The [metric] [outcome]: Why [belief] isn't working"
  - Contains both reading (PDF) and video (engagement)
  - Positions Elite Fitness trainer as diagnostician, not salesperson
  - Estimated 4-6% opt-in rate from target audience (busy executives)
  - Natural bridge: "Want a personalized assessment?" → booking call

  ### Lead Magnet #2: Solution-Aware ("The Hope Injection")
  **Title:** "Your FREE 30-Minute Physiology Assessment + Personalized Lift Plan"
  **Format:** Video call (booking link)
  **Conversion Hook:** "You'll leave knowing exactly which 3 things to fix first"
  **Timeline:** 30-minute discovery → "Here's your custom protocol" (email follow-up)
  **Pre-call email:** Detailed assessment questionnaire (builds urgency)
  **Post-call follow-up:** Templatized fitness plan + offer: "90-Day Transformation" ($3,500)

  ### Lead Magnet #3: Product-Aware ("The Accelerator")
  **Title:** "The Done-With-You 90-Day Transformation (Limited Spots)"
  **Format:** Limited enrollment (12 spots/quarter)
  **Positioning:** "Not generic gym membership. Custom protocol, weekly check-ins, guaranteed results."
  **Social proof:** Before/after gallery (3 executives, real results)

  ### The Magnetic System Integration
  **Phase 1 - ATTRACT:** Lead Magnet #1 (awareness) + Landing Page
  **Phase 2 - CONVERT:** Lead Magnet #2 (discovery call) + Follow-up sequence
  **Phase 3 - RETAIN:** 90-Day Program (ongoing contact) + Referral incentives

  ### Conversion Bridge Structure
  - Lead Magnet teaches: "What's blocking YOUR results" (diagnostic)
  - Discovery call provides: "Here's what to fix" (strategy)
  - Paid offer provides: "Let me implement it for you" (execution + accountability)
  - Emotional journey: "I'm frustrated → I finally understand → I need professional coaching"

  ✓ Each magnet solves immediate problem (no fluff)
  ✓ All bridge to primary offer (90-Day Transformation)
  ✓ Progressive sophistication matches awareness level (problem → solution → implementation)
  ✓ Estimated 2-3% discovery call booking rate, 40-50% convert to paid program
  ✓ Each touchpoint reinforces positioning: "Results through science, not willpower"

completion_criteria:
  - "Splinter problem identified"
  - "Content outline complete"
  - "Conversion bridge designed"
```
