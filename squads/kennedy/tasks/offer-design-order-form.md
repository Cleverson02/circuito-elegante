# Design the Order Form as a Sales Letter

## Metadata
```yaml
task_id: KN_OF_006
agent: kennedy-offers
type: creation
complexity: medium
estimated_time: 90min
source: "The Ultimate Sales Letter — Step 22: Order Form Design"
```

## Purpose
Design the order form as a mini sales letter. Kennedy teaches that the order form is NOT just a form — it's the final selling document that many prospects read before deciding.

> "The order form should be a complete sales letter in miniature. Many people turn to the order form first to see what the offer is and how much it costs. It must sell all by itself." — Dan Kennedy

## The Framework: Order Form as Mini Sales Letter
1. **Headline** restating the main benefit
2. **Quick summary** of what they get
3. **Value stack** (brief)
4. **Guarantee** restated
5. **Price** with contrast to value
6. **Payment options**
7. **Order instructions** (clear, simple)
8. **Urgency reminder**

## Input Required
```yaml
input:
  offer: ""
  price: ""
  value_stack: []
  guarantee: ""
  response_methods: []
```

## Output Template
```yaml
output:
  order_form:
    headline: ""
    offer_summary: ""
    value_stack_brief: []
    guarantee: ""
    price: ""
    payment_options: []
    order_instructions: ""
    urgency: ""
    design_specs: ""
```


handoff:
  to: "kennedy-copy"
  trigger: "Offer designed and validated"
  context: "Irresistible offer with guarantee and urgency"


## Quality Gate
```yaml
quality:
  - [ ] Order form works as standalone sales piece
  - [ ] All 8 elements present
  - [ ] Simple, clear ordering instructions
  - [ ] Guarantee restated prominently
  - [ ] Value contrast obvious
```

---
*Task: KN_OF_006 | Agent: kennedy-offers | Version: 1.0*


## Order Form Psychology

**6-Element High-Converting Order Form:**
1. Benefit headline (not "Order Form")
2. Price positioning (save $X narrative)
3. Guarantee (clear, specific)
4. Delivery timeline (urgency + realism)
5. Risk reversal statement (confidence signal)
6. Clear CTA button (action, not "submit")

**Proven Elements:**
- Single-column layout (increases conversion)
- Offer summary above fold
- Minimal required fields
- Progress bar (if multi-step)


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No offer or pricing defined"
elicit:
  - question: "What is the offer, price, and guarantee?"
    required: true
output_example: |
  ## Order Form — Output
  **Agent:** kennedy-offers
  - Mini sales letter order form
completion_criteria:
  - "All 8 elements present"
  - "Standalone selling capability"
```
