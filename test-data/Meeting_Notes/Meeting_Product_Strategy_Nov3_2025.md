# Meeting Notes — Product Strategy
**Date:** November 3, 2025  
**Facilitator:** Meera Iyer  
**Attendees:** CEO (Vikram Nair), CPO (Meera Iyer), Head of Sales (Tanya Bose), Head of CS (Rohan Das), Priya Nair, Arjun Mehta  
**Purpose:** Q1 2026 Product Strategy Alignment  

---

## Context

This meeting was called to align on product priorities for Q1 2026 following a difficult Q3 — we missed our ARR target by 14% and lost 3 enterprise accounts citing product gaps in automation and reporting. The agenda was set by Vikram to ensure product and go-to-market are pulling in the same direction heading into the new year.

---

## Key Discussion Points

### 1. Why We Missed Q3 ARR Target

Tanya presented the sales team's post-mortem. Three root causes identified:
- Competitors (HubSpot, Intercom) have significantly more mature automation capabilities — this came up in 8 of 12 lost deals in Q3
- Our reporting and dashboard story is weak — prospects ask for self-serve dashboards and we demo Metabase, which requires SQL
- Response time to customer support queries averaging 4.2 hours — far above the < 1 hour expectation in mid-market

Vikram noted: "We have a great core product but we're losing deals on table stakes features that our competitors have had for 2 years."

### 2. Product Priorities for Q1 2026

After 90 minutes of discussion, the following priority order was agreed:

**Priority 1 — Workflow Automation Engine (ship by March 2026)**
Rationale: Comes up in the highest percentage of lost deals. Sales team confident this alone could recover 4–6 deals currently in late-stage negotiation.

**Priority 2 — Custom Dashboard Builder (ship by February 2026)**
Rationale: Shorter build timeline, high visibility in demos. Tanya committed to featuring it in all Q1 enterprise demos.

**Priority 3 — Unified Inbox v3 — WhatsApp + SMS (ship by April 2026)**
Rationale: Critical for CS-heavy accounts (our fastest-growing segment) but longer integration timeline due to WhatsApp API complexity.

**Deprioritised for Q1: AI Lead Scoring Engine**
Rationale: High build complexity, requires clean CRM data we don't yet have. Moved to Q2 2026 planning.

### 3. Resource Discussion

Arjun raised concern that shipping all three priorities with the current team of 6 engineers is aggressive. Vikram agreed to hire 2 additional engineers by end of November, targeting start date of January 2026. Meera to update roadmap timelines once hiring is confirmed.

### 4. Go-to-Market Alignment

- Tanya: Sales team will not pitch Workflow Automation in demos until it's in beta. Hard commitment.
- Rohan: CS team needs 4-week heads-up before any feature launches that change customer workflows.
- Meera: Will share a release calendar with 6-week lookahead starting in December.

---

## Decisions Made

- Q1 2026 priority order locked: Automation → Dashboards → Unified Inbox v3
- AI Lead Scoring Engine moved to Q2 2026
- Vikram approved headcount: 2 additional engineers hired by end of November
- Meera to publish 6-week rolling release calendar starting December 1

---

## Action Items

| Action | Owner | Due |
|---|---|---|
| Update roadmap with Q1 priority order | Meera | Nov 7 |
| Begin JD drafting for 2 engineering hires | Vikram | Nov 5 |
| Share release calendar template with CS team | Meera | Dec 1 |
| Confirm event bus timeline with platform team | Arjun | Nov 10 |

---

## What Was NOT Decided

- Exact pricing for WhatsApp usage costs — deferred to pricing team
- Whether to partner with Zapier or build natively for automation (native won, but partnership as distribution channel still under consideration)
- Mobile app roadmap — explicitly out of scope for this meeting
