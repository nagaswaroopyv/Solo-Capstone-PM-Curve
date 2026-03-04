# Meeting Notes — Quarterly Planning
**Date:** October 22, 2025  
**Facilitator:** Meera Iyer  
**Attendees:** Full product and engineering team (12 attendees)  
**Purpose:** Q4 2025 Planning and OKR Review  

---

## Q3 2025 OKR Review

### OKR 1: Grow ARR to $4.2M
**Result: 86% achieved — $3.6M ARR**
Key driver of miss: 3 enterprise churns in September totalling $180K ARR. Churn reasons: slow customer support response time (2 accounts), product gaps in automation (1 account).

### OKR 2: Improve NPS from 32 to 42
**Result: 72% achieved — NPS reached 38**
Improvement driven by CS team's proactive health check programme. Gap from target driven by new customer onboarding friction — average time to first value is 18 days, target was 10.

### OKR 3: Ship 3 major product features
**Result: 100% achieved**
Shipped: Unified Inbox v2, Analytics Redesign, Mobile App beta. On time, within scope.

---

## Q4 2025 OKRs (Proposed and Agreed)

### OKR 1: Stabilise ARR and stop churn
- KR1: Reduce churn rate from 3.2% to < 2% by December 31
- KR2: Achieve NPS > 42 by December 31
- KR3: Reduce average support response time from 4.2 hours to < 2 hours by November 30

### OKR 2: Build the foundation for Q1 2026 major features
- KR1: Complete technical design documents for Workflow Automation Engine by November 15
- KR2: Complete UX research and design mockups for Dashboard Builder by November 30
- KR3: Confirm WhatsApp Business API integration feasibility with a working prototype by December 15

### OKR 3: Improve engineering efficiency
- KR1: Reduce average PR review time from 28 hours to < 12 hours by December 31
- KR2: Achieve 90% sprint velocity (story points completed vs committed) for all Q4 sprints
- KR3: Zero Sev-1 production incidents in Q4

---

## Key Discussions

### Churn Prevention Priority

Rohan presented CS team's analysis of the 3 September churns. All three accounts had flagged slow response times in their CSAT surveys 6 weeks before churning — signals that weren't acted on.

Decision: Implement a health score alert system within existing CRM (not a product build — an internal process) to flag any account with CSAT < 3.5 for immediate CS outreach within 24 hours. Rohan to own.

### Engineering Capacity for Q4

Dev presented the team's capacity: 6 engineers, 3 sprints in Q4, roughly 180 story points of capacity. Technical design docs and UX research are product/design work — not in this count.

Risk flagged: If WhatsApp API prototype takes longer than expected (complex external dependency), it could push Q1 feature timeline. Dev suggested a 2-week spike with a go/no-go decision by December 1.

Decision: WhatsApp spike approved. Go/no-go December 1. If no-go, fallback is SMS-only for Unified Inbox v3.

### Pricing Review

Meera raised that our current pricing tiers haven't been reviewed since 2023. Competitor analysis shows we're underpriced at the Growth tier by approximately 20–30%. Proposal: conduct a pricing review in Q4 with the goal of implementing new pricing for new customers in Q1 2026.

Decision: Pricing review approved. Meera to own, deliver recommendation by December 15.

---

## Action Items

| Action | Owner | Due |
|---|---|---|
| Implement CSAT < 3.5 alert and outreach process | Rohan | Oct 30 |
| Begin WhatsApp API integration spike | Dev | Oct 27 |
| Go/no-go decision on WhatsApp integration | Dev + Meera | Dec 1 |
| Complete technical design for Workflow Automation | Arjun | Nov 15 |
| Complete Dashboard Builder UX research and mockups | Sana | Nov 30 |
| Pricing review and recommendation | Meera | Dec 15 |
| Reduce PR review time — implement review rotation | Dev | Nov 1 |

---

## What Was Not Decided

- AI Lead Scoring Engine timeline — explicitly deferred to Q1 2026 planning
- Mobile app full launch date — beta continues through Q4, launch in Q1 if NPS from beta > 40
- Headcount additions — Vikram to decide after Q4 financial review in November
