# Score Business Against 25 Eternal Truths

## Metadata
```yaml
task_id: KN_BZ_005
agent: kennedy-business
type: assessment
complexity: medium
estimated_time: 45min
source: "Ultimate No B.S. Business Success — 25 Eternal Truths Scorecard"
```

## Purpose
Score a business owner and their business against Kennedy's 25 Eternal Truths to identify the fundamental principles being violated that are limiting growth.

## The Framework: 25 Eternal Truths Categories

### Mindset Truths (1-8)
1. Discipline is the master virtue
2. The marketplace is brutally Darwinian
3. No one is coming to save you
4. Speed of implementation = speed of wealth
5. You become the average of your 5 closest associates
6. Guard your mental environment fanatically
7. Comfort is the enemy of achievement
8. Action beats perfection every time

### Business Truths (9-16)
9. Cash flow is more important than revenue
10. Marketing is the #1 business function
11. Every business is a marketing business
12. Systems run the business
13. Charge premium prices or die slowly
14. Fire bad customers ruthlessly
15. Your time is your most valuable asset
16. The best investment is in yourself

### Wealth Truths (17-25)
17. Multiple income streams mandatory
18. Think like an investor, not an employee
19. Build assets, not just income
20. Plan your exit from day one
21. Network strategically, not randomly
22. Protect your assets aggressively
23. Taxes are the biggest expense — plan accordingly
24. Hire professionals for professional work
25. Legacy thinking changes everything

## Input Required
```yaml
input:
  business_owner: ""
  business: ""
  self_assessment: ""
```

## Output Template
```yaml
output:
  truths_scorecard:
    mindset: {}
    business: {}
    wealth: {}
    total: "/250"
    top_3_violations: []
    action_plan: []
```


handoff:
  to: "kennedy-offers"
  trigger: "Business assessment complete"
  context: "Business diagnostics and improvement plan"


## Quality Gate
```yaml
quality:
  - [ ] All 25 truths scored
  - [ ] Top 3 violations identified with evidence
  - [ ] Action plan for each violation
  - [ ] Mindset shifts identified
```

---
*Task: KN_BZ_005 | Agent: kennedy-business | Version: 1.0*

## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No business owner context"
elicit:
  - question: "Describe yourself as a business owner and your biggest challenges."
    required: true
output_example: |
  ## 25 Truths Scorecard — Output
  **Agent:** kennedy-business
  - Complete scorecard with violation fixes
completion_criteria:
  - "All 25 scored"
  - "Action plan created"
```
