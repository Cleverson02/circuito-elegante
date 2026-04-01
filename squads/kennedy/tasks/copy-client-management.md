# Setup Copywriter's Client Management System

## Metadata
```yaml
task_id: KN_CP_005
agent: kennedy-copy
type: setup
complexity: medium
estimated_time: 90min
source: "Copywriting Academy — Client Management System"
```

## Purpose

Implement Kennedy's client management system for copywriters and marketing consultants — controlling the client relationship so the WORK (not the client's whims) drives the process.

> "The client doesn't know what they want. They know what they THINK they want. Your job is to deliver what they NEED — which is copy that sells." — Dan Kennedy

## The Framework: Kennedy's Client Management Rules

1. **Set expectations upfront** — scope, timeline, revisions
2. **Get all information BEFORE writing** — questionnaire, not meetings
3. **Present copy with rationale** — explain WHY, not just WHAT
4. **Limit revisions** — 2 rounds maximum, then it's a new project
5. **Test, don't argue** — disagreements settled by split testing
6. **Get paid upfront** — at least 50% before starting

## Input Required
```yaml
input:
  service_type: ""
  typical_project: ""
  current_client_issues: []
```

## Step-by-Step Process

### Step 1: Create the Client Intake Questionnaire
### Step 2: Define Project Scope Template
### Step 3: Establish Revision Policy
### Step 4: Create Presentation Framework
### Step 5: Build Payment and Terms Structure

## Output Template
```yaml
output:
  client_management:
    intake_questionnaire: []
    scope_template: ""
    revision_policy: ""
    presentation_framework: ""
    terms_and_payment: ""
```


handoff:
  to: "kennedy-media"
  trigger: "Copy created and validated"
  context: "Validated copy ready for distribution"


## Quality Gate
```yaml
quality:
  - [ ] Intake questionnaire captures all needed info
  - [ ] Scope clearly defined with deliverables
  - [ ] Revision policy is firm but fair
  - [ ] Payment terms protect the copywriter
  - [ ] Process is repeatable and systematized
```

## Handoff
- -> Internal process — no external handoff needed

---
*Task: KN_CP_005 | Agent: kennedy-copy | Version: 1.0*


## Client Management System Framework

**30-Day Contact Sequence:**
- Day 1: Welcome + onboarding
- Day 7: Progress check-in
- Day 14: Problem-proofing
- Day 21: Extra value delivery
- Day 28: Satisfaction check + upsell

**Ongoing (Monthly):**
- Performance review
- Proactive recommendations
- Exclusive access to new offerings
- Personal check-in from owner


---
## Task Anatomy Compliance
```yaml
veto_conditions:
  - "No service type described"
elicit:
  - question: "What type of copy services do you provide?"
    required: true
output_example: |
  ## Client Management System — Output
  **Agent:** kennedy-copy
  - Intake questionnaire, scope template, revision policy
completion_criteria:
  - "All 6 rules implemented"
  - "Process is systematized"
```
