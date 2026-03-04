# Product Roadmap — Q1 2026
**Version:** 2.0 (Updated post-November strategy meeting)  
**Owner:** Meera Iyer  
**Last Updated:** November 7, 2025  
**Status:** Approved  

---

## Strategic Theme: From Core to Complete

Q1 2026 is about closing the product gaps that are costing us deals. We have a strong core product — the Q1 roadmap adds the table-stakes features that enterprise prospects expect and that our most engaged customers have been requesting for 12+ months.

Success looks like: winning back 2 of the 3 enterprise deals currently in late-stage negotiation, reducing churn rate below 2%, and ending Q1 with ARR > $4.5M.

---

## Priority 1: Workflow Automation Engine
**Target Ship:** March 28, 2026  
**Owner:** Arjun Mehta  
**Status:** Technical design in progress  

### What we're building
A native if-this-then-that automation builder that lets non-technical users create workflows triggered by events in our platform. V1 ships with 8 trigger types and 12 action types covering the most requested automation patterns.

### Why it's Priority 1
Came up in 8 of 12 lost deals in Q3 2025. Sales team has 4 late-stage deals where automation capability is the stated blocker. Shipping this could recover $240K ARR in Q1 alone.

### Key Milestones
- Technical design doc complete: November 15
- Engineering kickoff: January 6, 2026
- Internal alpha: February 20
- Beta with 10 pilot customers: March 7
- General availability: March 28

### Dependencies
- Unified event bus from platform team (ETA: March 2026 — CRITICAL PATH)
- Slack integration upgrade for channel-level targeting
- Email template system variable injection (confirmed compatible)

---

## Priority 2: Custom Dashboard Builder
**Target Ship:** February 14, 2026  
**Owner:** Ravi Shankar  
**Status:** Design review complete — engineering starting November 25  

### What we're building
A no-code drag-and-drop dashboard builder for non-technical business stakeholders. Connects to Snowflake via pre-approved metric catalogue. Supports 5 widget types, automatic 4-hour refresh, link sharing, and threshold alerts.

### Why it's Priority 2
Shorter build timeline than automation — can ship in 6 weeks of engineering. High demo impact. Analytics team currently turning away 14 report requests per week that this feature will make self-serve.

### Key Milestones
- Engineering kickoff: November 25
- Internal alpha: January 16
- Beta with analytics team power users: January 23
- General availability: February 14

### Dependencies
- Snowflake read-only connector (existing — confirmed compatible)
- Slack integration for alert delivery (existing — no changes needed)
- Metric catalogue approval workflow (internal process — Priya to own)

---

## Priority 3: Unified Inbox v3 (WhatsApp + SMS)
**Target Ship:** April 11, 2026  
**Owner:** Meera Iyer  
**Status:** WhatsApp API spike in progress — go/no-go December 1  

### What we're building
Extension of existing Unified Inbox to add WhatsApp Business and SMS (Twilio) channels. AI-suggested replies based on conversation history. Smart routing to assign conversations to the right team member.

### Why it's Priority 3
Fastest growing customer segment (CS-heavy accounts) needs multi-channel inbox. Currently cited in churn exit interviews. Longer timeline due to WhatsApp API complexity.

### Key Milestones
- WhatsApp API go/no-go: December 1, 2025
- Engineering kickoff: January 13, 2026
- WhatsApp integration complete: February 27
- SMS integration complete: March 13
- AI reply suggestions complete: March 27
- General availability: April 11

### Risk: WhatsApp Rate Limiting
Meta's WhatsApp Business API has a 1,000 messages/hour cap. At our projected volume (top 20 customers), this is a constraint in the first 6 months. Mitigation: message batching and queue management. Re-evaluate rate limit expansion with Meta in Q2.

---

## Deprioritised for Q1: AI Lead Scoring Engine
**Earliest possible start:** Q2 2026  
**Reason for deferral:** High build complexity requires clean historical CRM data. Pre-2023 CRM data has significant gaps that would degrade model accuracy. Data engineering team to address data quality issue in Q1; revisit scoring engine in Q2.

---

## Metrics We're Tracking

| Metric | Q4 2025 Baseline | Q1 2026 Target |
|---|---|---|
| ARR | $3.6M | > $4.5M |
| Churn rate | 3.2% | < 2% |
| Lost deals citing product gaps | 8/12 in Q3 | < 3/10 in Q1 |
| Analytics team report backlog | 14 requests/week | < 3 requests/week |
| Average customer response time | 4.2 hours | < 1.5 hours |

---

## What's NOT on the Q1 Roadmap

- Mobile app full launch (beta continues, GA in Q2 if NPS > 40)
- Salesforce native integration (V2 of automation engine, Q3 earliest)
- AI features beyond Unified Inbox reply suggestions
- Self-serve onboarding redesign (Q2 — tied to time-to-value improvement work)
