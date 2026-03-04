# Product Requirements Document
## Workflow Automation Engine
**Version:** 1.0  
**Status:** Discovery — Not Yet Approved  
**Author:** Arjun Mehta  
**Date:** January 2026  

---

## 1. Problem Statement

Teams using our platform currently perform 12–15 repetitive manual tasks per day that follow predictable patterns — assigning tickets when status changes, sending Slack notifications when deals close, updating CRM fields when customer health scores drop. These tasks consume an estimated 45 minutes per team member per day across our user base.

Competitors (Zapier, Make) offer generic automation but require users to leave our platform and manage integrations externally. Our users want automation that understands our product's native objects (deals, tickets, health scores) without complex external setup.

---

## 2. Proposed Solution

Build a native workflow automation engine with an if-this-then-that trigger/action model. Users define triggers (events that happen in our platform) and actions (what should happen automatically). Initial release supports 8 trigger types and 12 action types covering our most requested automation patterns.

---

## 3. Trigger Types (V1)

1. Deal stage changes to [stage]
2. Customer health score drops below [threshold]
3. Support ticket created with [tag]
4. Contact property updated to [value]
5. Form submission received from [form]
6. Meeting booked via calendar link
7. Invoice overdue by [X] days
8. NPS response received with score [range]

---

## 4. Action Types (V1)

1. Send email from [template] to [recipient]
2. Send Slack message to [channel]
3. Create task assigned to [user]
4. Update contact property [field] to [value]
5. Add contact to [sequence]
6. Remove contact from [sequence]
7. Create deal in [stage]
8. Add tag to contact
9. Send in-app notification to [user]
10. Webhook — POST to [URL] with [payload]
11. Create support ticket with [details]
12. Assign ticket to [team member]

---

## 5. Functional Requirements

| # | Requirement | Priority |
|---|---|---|
| FR1 | Users must be able to create a workflow using a visual builder with no code | Must |
| FR2 | Workflows must execute within 60 seconds of trigger event | Must |
| FR3 | Workflow history must show last 30 days of executions with success/failure status | Must |
| FR4 | Failed workflows must retry automatically up to 3 times before alerting the user | Must |
| FR5 | Users must be able to test a workflow with sample data before activating | Must |
| FR6 | Workflows must support conditional branching (if/else logic) | Should |
| FR7 | Multi-step workflows must support up to 10 sequential actions | Should |
| FR8 | Workflow templates library — 20 pre-built common automation patterns | Should |
| FR9 | Team-level workflow sharing and approval before activation | Won't (V2) |

---

## 6. Usage Limits by Plan

| Plan | Active Workflows | Executions/Month | Branching |
|---|---|---|---|
| Starter | 5 | 500 | No |
| Growth | 25 | 5,000 | Yes |
| Enterprise | Unlimited | Unlimited | Yes |

---

## 7. Success Metrics

| Metric | Baseline | Target (90 days) |
|---|---|---|
| Manual repetitive tasks per user per day | 12–15 | < 5 |
| Time saved per user per day | 0 (no automation) | > 30 minutes |
| Workflow activation rate (created vs activated) | N/A | > 70% |
| Automation as reason for upgrade (Growth plan) | Unknown | Track from launch |

---

## 8. Key Risks

- **Complexity risk:** Users may find visual builder confusing if workflows have too many steps. Mitigation: limit V1 to linear workflows, add branching only when UX is validated.
- **Reliability risk:** Failed automations at critical moments (deal stage change, overdue invoice) damage trust severely. Mitigation: retry logic, clear failure notifications, audit log always available.
- **Abuse risk:** Webhook action could be used to exfiltrate data. Mitigation: webhook URLs must be allowlisted by account admin before use.

---

## 9. Dependencies

- Requires unified event bus — currently in development by platform team, ETA March 2026
- Slack integration upgrade needed for channel-level targeting (current integration is user-level only)
- Email template system must support dynamic variable injection — confirmed compatible
