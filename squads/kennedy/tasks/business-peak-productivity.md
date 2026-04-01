# Implement Peak Productivity System

## Metadata
```yaml
task_id: KN_BZ_004
agent: kennedy-business
type: setup
complexity: medium
estimated_time: 90min
source: "Renegade Millionaire — Peak Productivity System"
```

## Purpose
Implement Kennedy's Peak Productivity System to maximize output per hour. Kennedy himself is legendarily productive — writing books, newsletters, speeches, and running multiple businesses simultaneously.

> "Productivity is not about working more hours. It's about making each hour count for 10x what a normal hour produces." — Dan Kennedy

## The Framework: Peak Productivity Principles
1. **Time blocking** — Dedicated blocks for high-value work
2. **No interruptions** — No phone, no email, no visitors during blocks
3. **Batching** — Group similar tasks together
4. **Delegation** — If someone can do it 80% as well, delegate
5. **Elimination** — If it doesn't produce results, stop doing it
6. **Deadlines** — Work expands to fill time — set tight deadlines
7. **Morning routine** — Most productive hours for most important work
8. **Energy management** — Peak energy = peak work

## Input Required
```yaml
input:
  current_schedule: ""
  highest_value_activities: []
  biggest_distractions: []
  delegation_capacity: ""
```

## Output Template
```yaml
output:
  peak_productivity:
    ideal_schedule: ""
    time_blocks: []
    elimination_list: []
    delegation_list: []
    batching_plan: []
    interruption_policies: []
    projected_productivity_gain: ""
```


handoff:
  to: "kennedy-offers"
  trigger: "Business assessment complete"
  context: "Business diagnostics and improvement plan"


## Quality Gate
```yaml
quality:
  - [ ] Ideal schedule designed with time blocks
  - [ ] High-value activities get protected time
  - [ ] Elimination list created
  - [ ] Delegation plan in place
  - [ ] Interruption policies defined
```

---
*Task: KN_BZ_004 | Agent: kennedy-business | Version: 1.0*


## Peak Productivity Framework

**Time Blocks (per Kennedy):**
- Strategic Work: 20% (highest ROI)
- Revenue Generation: 30% (direct income)
- Management: 20% (systems/people)
- Urgent/Admin: 30% (minimize this)

**Time Vampires to Eliminate:**
- Meetings without agenda
- Email reactivity
- Staff interruptions
- Perfectionism on low-value tasks
- Delegation failures


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No current schedule or activity data"
elicit:
  - question: "Describe your current daily schedule and highest-value activities."
    required: true
output_example: |
  ## Peak Productivity System — Output
  **Agent:** kennedy-business
  - Ideal schedule with protected time blocks
completion_criteria:
  - "Schedule designed"
  - "Time blocks assigned"
  - "Elimination and delegation planned"
```
