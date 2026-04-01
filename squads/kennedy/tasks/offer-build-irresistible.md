# Build an Irresistible Offer (Widget Concept)

## Metadata
```yaml
task_id: KN_OF_002
agent: kennedy-offers
type: creation
complexity: high
estimated_time: 60-90min
source: "Ultimate Marketing Plan — Widget Concept + Brass Balls Course"
```

## Purpose

Build an irresistible offer using Kennedy's "Widget" concept — a packaged, named, differentiated offer that cannot be comparison-shopped. The widget transforms a commodity service into a unique product.

> "A 'widget' is what you create when you take a service and package it into something that can be named, sold, and protected from price comparison. Nobody can comparison shop a widget because there's nothing to compare it to." — Dan Kennedy

## The Framework: The Widget Construction System

### What Makes a Widget
1. **Named** — It has a proprietary name (not generic)
2. **Packaged** — It's a defined set of deliverables
3. **Unique** — No competitor has this exact combination
4. **Valued** — Each component has an assigned value
5. **Guaranteed** — Bold risk reversal attached

### The Widget Formula
```
WIDGET = Named System + Bundled Components + Perceived Value Stack + Bold Guarantee
```

### Three Types of Offers (Kennedy)
1. **Commodity Offer** — "We do X for $Y" (WEAKEST)
2. **Enhanced Offer** — "We do X plus bonus Y for $Z" (BETTER)
3. **Widget Offer** — "The [Named System] includes [components] valued at [10x price]" (STRONGEST)

## Input Required
```yaml
input:
  product_service: ""
  current_offer: ""
  price_point: ""
  audience: ""
  what_you_deliver: []
  time_investment: ""
  results_you_produce: []
```

## Step-by-Step Process

### Step 1: Deconstruct Your Current Offer
Break down everything you currently deliver into individual components.

### Step 2: Name the System
Create a proprietary name:
- "The [Audience] [Benefit] System"
- "The [Number]-Step [Result] Method"
- "[Founder] [Topic] Protocol"

### Step 3: Build the Component Stack
Assign each component a name, description, and standalone value.

### Step 4: Add Bonus Components
What else can you add that increases value without increasing cost?

### Step 5: Design the Guarantee
Match to price point and risk tolerance.

### Step 6: Calculate Value-to-Price Ratio
Total perceived value should be minimum 5x (ideally 10x) the price.

## Output Template
```yaml
output:
  widget:
    name: ""
    tagline: ""
    components:
      - name: ""
        description: ""
        value: ""
    bonuses:
      - name: ""
        description: ""
        value: ""
    total_value: ""
    price: ""
    value_ratio: ""
    guarantee: ""
    three_types_comparison:
      commodity: ""
      enhanced: ""
      widget: ""
```


handoff:
  to: "kennedy-copy"
  trigger: "Offer designed and validated"
  context: "Irresistible offer with guarantee and urgency"


## Quality Gate
```yaml
quality:
  - [ ] Widget has a proprietary name
  - [ ] Minimum 5 named components
  - [ ] Each component has assigned value
  - [ ] Value-to-price ratio is minimum 5x
  - [ ] Cannot be comparison-shopped
  - [ ] Bold guarantee attached
  - [ ] Would feel irresponsible to say no
```

## Handoff
- -> **kennedy-sales-letter** for sales copy
- -> **kennedy-copy** for component descriptions
- -> **kennedy-persuasion** for psychological triggers

---
*Task: KN_OF_002 | Agent: kennedy-offers | Version: 1.0*

---

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No product/service described"
  - "No audience defined"

elicit:
  - question: "What do you currently sell and at what price?"
    required: true
  - question: "What results do you produce for clients?"
    required: true

output_example: |
  ## Widget (Irresistible Offer) — Output
  **Source Framework:** Ultimate Marketing Plan Widget Concept
  **Agent:** kennedy-offers

  - Named widget with proprietary system
  - Component stack with values
  - Value-to-price ratio calculated
  - Bold guarantee designed

completion_criteria:
  - "Widget has proprietary name"
  - "5+ components with values"
  - "Cannot be comparison-shopped"
```
