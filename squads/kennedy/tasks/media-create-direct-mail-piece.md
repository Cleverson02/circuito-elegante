# Create a Direct Mail Piece

## Metadata
```yaml
task_id: KN_MD_002
agent: kennedy-media
type: creation
complexity: medium
estimated_time: 45-60min
source: "No B.S. Direct Marketing — A-Pile Mail Strategy + Grabber/Lumpy Mail"
```

## Purpose

Design and produce a direct mail piece that lands in the A-Pile (opened and read) not the B-Pile (trash). Kennedy considers direct mail the most powerful marketing channel when done right.

> "Direct mail is the last 'quiet' channel. While everyone fights for inbox attention, your mail arrives with no competition. It sits on their desk. It's physical. It's personal. Nothing digital can match it." — Dan Kennedy

## The Framework: A-Pile Mail Design

### The 3-Second Sort
Every piece of mail gets sorted in 3 seconds:
- **A-Pile:** "This looks important/personal/interesting" → OPENED
- **B-Pile:** "This is junk/mass-produced/boring" → TRASH

### A-Pile Strategies
1. **Handwritten envelope** (or convincing simulation)
2. **Odd-sized envelope** (stands out from standard #10)
3. **Lumpy mail** (dimensional, contains an object)
4. **No return address** (creates curiosity)
5. **Priority/Express mail** (implies importance)
6. **Personalized teaser** (their name, specific reference)

## Input Required
```yaml
input:
  campaign: ""
  audience: ""
  offer: ""
  mail_format: "letter | postcard | self-mailer | package | lumpy"
  budget_per_piece: ""
  quantity: ""
  mailing_list: ""
```

## Step-by-Step Process

### Step 1: Choose the Mail Format
Match format to audience, offer, and budget.

### Step 2: Design for A-Pile Landing
Select A-Pile strategies that fit budget and audience.

### Step 3: Design the Contents
If letter: envelope + letter + response device + possible inserts.
If postcard: double-sided, headline + offer + CTA.
If lumpy: grabber item + letter.

### Step 4: Specify Production Details
Paper stock, printing, personalization, mailing specs.

### Step 5: Plan the Drop Schedule
When to mail, follow-up sequence, testing plan.

## Output Template
```yaml
output:
  mail_piece:
    format: ""
    a_pile_strategy: ""
    envelope: ""
    contents: []
    production_specs: {}
    drop_schedule: ""
    estimated_response_rate: ""
    cost_per_piece: ""
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Media plan complete"
  context: "Distribution strategy and channels"


## Quality Gate
```yaml
quality:
  - [ ] A-Pile strategy clearly defined
  - [ ] Would YOU open this if it arrived?
  - [ ] Response device is easy and clear
  - [ ] Production specs are complete
  - [ ] Drop schedule includes follow-up
  - [ ] Cost per piece calculated
```

## Handoff
- -> **kennedy-copy** for copy refinement
- -> **kennedy-direct-response** for tracking setup

---
*Task: KN_MD_002 | Agent: kennedy-media | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No audience or mailing list defined"
  - "No offer specified"

elicit:
  - question: "Who are you mailing to and what is the offer?"
    required: true
  - question: "What format and budget per piece?"
    required: false

output_example: |
  ## Direct Mail Piece — Complete Output
  **Source Framework:** A-Pile Mail Strategy + Lumpy Mail
  **Agent:** kennedy-media
  **Campaign:** Law firm targeted at $2M+ personal injury case settlement owners
  **Mailing List:** Recent settlement recipients (purchased list, 2,000 names)
  **Budget:** $2.50 per piece | **Total campaign:** $5,000

  ---

  ### A-PILE STRATEGY (Why this will be OPENED, not trashed)
  **Primary Strategy:** Lumpy Mail (dimensional object) + No Return Address + Hand-addressed envelope
  **Rationale:** Personal injury settlement recipients are primed to think about legal representation (conscious of vulnerability). Lumpy mail from unknown sender triggers curiosity.

  ---

  ### MAIL PIECE SPECIFICATIONS

  #### Envelope (Outer)
  - **Format:** 6x9 kraft envelope (odd size, stands out)
  - **Address:** Hand-written (or high-quality simulation)
  - **Return address:** NONE (creates curiosity)
  - **Lumpy element:** Contains a **Gold Coin replica** (in protective sleeve) with teaser text
  - **Teaser on envelope (pre-print):** "Your settlement should GROW, not shrink. Open to see what to do in your first 30 days."
  - **Postage:** First-class stamp (not metered = personal touch)

  #### Contents (Inside)

  **1. The Gold Coin (Lumpy element)**
  - Replica $20 gold coin in protective case
  - Attached label: "This represents your first month of lost compound growth. Don't let this happen to the rest of your settlement."
  - Purpose: Creates emotional impact + talking point

  **2. Personalized Letter (4 paragraphs, printed on cream cardstock)**

  *Paragraph 1 (Hook):*
  "Congratulations on your settlement. You just received money that took years of pain to earn. Most people make ONE critical mistake in the first 30 days that costs them 6+ figures. This letter is about making sure you don't."

  *Paragraph 2 (The problem):*
  "Your settlement is a one-time windfall. But most attorneys don't prepare clients for what comes next. You'll be approached by financial advisors, family members, and investments that promise returns. Without a PLAN, that money disappears fast."

  *Paragraph 3 (The opportunity):*
  "At [Law Firm], we protect settlements AFTER they're awarded. We connect clients with settlement specialists who structure for tax efficiency and long-term growth. NOT commission-driven advisors. Specialists focused on your outcome."

  *Paragraph 4 (The CTA):*
  "Call me personally at [Phone]. I'll send you a free 'Settlement Protection Checklist' that shows exactly what to do in the first 30 days. No obligation. Just protection."

  **3. Response Device (Perforated postcard inside letter)**
  - Headline: "YES—Send me the Settlement Protection Checklist"
  - Fields: Name, Phone, Email, Settlement Amount (optional)
  - Reply postage: Pre-paid (BRM)
  - Back-side message: "Call [Name] at [Phone] for immediate consultation"

  **4. Free Checklist Insert (2-page color PDF fold)**
  - Title: "Your First 30 Days After Settlement—The Critical Checklist"
  - 12 specific actions (don't hire X, do secure Y, investigate Z)
  - Branded with law firm logo
  - QR code linking to extended guide online

  ---

  ### PRODUCTION SPECS
  - **Paper stock:** Envelope = 80lb kraft. Letter = 32lb cream cardstock. Checklist = 80lb glossy
  - **Printing:** Full-color for envelope and checklist. Black letter for personalization
  - **Personalization:** Names + salutation only (cost-effective)
  - **Gold coin:** Bulk purchase ($0.45 per coin from supplier), includes case
  - **Assembly:** Sequence: (1) Coin in case in envelope, (2) Letter, (3) Checklist, (4) Response card on top (last thing they see)
  - **Mailing:** Via USPS First-Class (First-Class Mail Flats), tracking available

  ---

  ### DROP SCHEDULE & FOLLOW-UP
  **Drop Date:** Monday of Week 1 (test batch: 500 pieces)
  **Tracking code:** Each response card has unique ID (tracks which batch + timing)
  **Follow-up sequence (if no response within 7 days):**
  - Day 7: Email (if email captured) with digital version of checklist
  - Day 14: Postcard reminder ("Did you get the checklist?")
  - Day 21: Phone call (if phone number captured)

  ---

  ### RESPONSE EXPECTATIONS & ROI
  **Target Response Rate:** 3-5% (settlement recipients are highly motivated, high-value)
  **Conservative estimate:** 500-piece test → 15-25 responses
  **Conversation rate:** Assume 60% of responses convert to consultation
  **Consultation conversion:** Assume 40% convert to new client
  **Expected clients from 2,000 full mail:** 48-80 new clients
  **Average settlement value:** $2M+ (high-ticket, low-volume practice)

  **ROI Calculation:**
  - Total cost: $5,000 (2,000 x $2.50)
  - Expected leads: 15-25 from test (scale to ~120 from full mail)
  - Expected clients: 48-80
  - Average case value: $2M+ (your commission/fee structure)
  - **If 50 clients at $25K average fee each: $1.25M revenue on $5K spend = 250:1 ROI**

  ---

  ### A-PILE INDICATORS (Will this land in A-Pile?)
  ✓ Odd-sized envelope (stands out)
  ✓ Hand-written address (appears personal)
  ✓ No return address (creates curiosity)
  ✓ Lumpy/dimensional (must be opened to see)
  ✓ Gold coin (emotional trigger + collectible feel)
  ✓ First-class stamp (premium treatment)
  ✓ Personalized opening ("Congratulations on YOUR settlement")
  ✓ Relevant offer (addresses their current life situation)

completion_criteria:
  - "A-Pile strategy clearly defined with 4+ elements"
  - "Would YOU open this if arrived? (Pass the gut test)"
  - "Response device is easy and clear (pre-paid postcard or online)"
  - "Production specs complete and costed out"
  - "Drop schedule includes follow-up sequence (not one-shot)"
  - "Cost per piece calculated + ROI projected"
  - "Tracking mechanism established (unique IDs per batch)"
```
