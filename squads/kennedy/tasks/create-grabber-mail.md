# Create Grabber / Lumpy Mail Piece

## Metadata
```yaml
task_id: KN_MED_002
agent: kennedy-media
type: creation
complexity: medium
estimated_time: 30min
source: "Ultimate Marketing Plan + No B.S. Direct Marketing"
```

## Purpose

Design a grabber / lumpy mail piece that gets opened 99% of the time.
Grabber mail includes a physical object attached to or enclosed with the
letter that creates an unavoidable reason to open and read. This is the
ultimate A-Pile weapon.

> "Lumpy mail gets opened 99% of the time. The recipient simply cannot
> resist — curiosity demands they find out what's inside." -- Dan Kennedy

## Veto Conditions
```yaml
veto_conditions:
  - id: VT0-001
    check: "Results Triangle defined?"
    fail_action: "BLOCK"
  - check: "Target audience justifies grabber cost?"
    fail_action: "EVALUATE — Grabber mail is for high-value targets"
```

## Input Required
```yaml
input:
  campaign:
    objective: "What outcome do you want?"
    target_value: "What is a customer/deal worth?"
    budget_per_piece: "$5-50 range typical"
    quantity: ""

  target:
    description: ""
    decision_maker_level: "C-suite | VP | Manager | Business owner"
    industry: ""
    mail_environment: "Gets lots of mail? | Moderate | Little mail"
```

## Grabber Mail Library (Proven Concepts)

| Grabber Object | Tie-In Copy | Best For |
|---------------|-------------|----------|
| Dollar bill | "The dollar attached to this letter is not a bribe..." | Universal attention getter |
| Aspirin/bandaid | "I know your [problem] gives you headaches..." | Pain-based messaging |
| Toy trash can | "Don't throw away this opportunity..." | Important announcements |
| Key | "This key unlocks [benefit]..." | Access/exclusive offers |
| Boomerang | "Unlike our competitors, we always come back..." | Service guarantees |
| Compass | "Finding your way to [result]..." | Navigation/guidance |
| Magnifying glass | "Take a closer look at [benefit]..." | Discovery/investigation |
| Stress ball | "Squeeze this instead of your budget..." | Financial/stress relief |
| Sand timer | "Time is running out on [offer]..." | Urgency/deadline |
| Puzzle piece | "The missing piece to your [result]..." | Problem completion |

## Output Structure

```markdown
# Grabber Mail Piece: [Campaign Name]

## Concept
- Grabber object: [What physical item]
- Tie-in theme: [How the object connects to the message]
- Target audience: [Specific recipients]
- Cost per piece: $[X]

## Envelope / Package
- Type: [Padded envelope, box, FedEx, oversized]
- Addressing: [Hand-addressed]
- Postage: [Real stamps / Priority / FedEx]
- External appearance: [How it looks before opening]

## Letter Copy
### Grabber Tie-In Opening
"[First sentence ties the physical object to the message]"

### Problem Statement
[Connect the grabber to their pain point]

### Solution + Offer
[Your solution with specific offer]

### Call to Action
[What to do next — phone, URL, reply]

### P.S. Lines
[Reference the grabber one more time]

## Response Mechanism
- Tracked phone: [Number]
- Tracked URL: [Page]
- Reply card: [If included]

## Production Plan
- Object source: [Where to buy grabbers]
- Assembly: [In-house or outsource]
- Cost breakdown: [Object + letter + envelope + postage]
- Total cost per piece: $[X]
```


handoff:
  to: "kennedy-direct-response"
  trigger: "Media plan complete"
  context: "Distribution strategy and channels"


## Completion Criteria
```yaml
completion:
  required:
    - "Grabber object selected with clear tie-in"
    - "Letter copy with grabber reference in opening"
    - "Complete letter following Kennedy principles"
    - "Response mechanism with tracking"
    - "Production plan with cost estimates"
  quality_check:
    - "Grabber tie-in is clever, not forced"
    - "Letter stands on its own even without grabber"
    - "Budget justified by target value"
    - "Would get opened and read"
```

---

**Version:** 1.0
**Agent:** kennedy-media
