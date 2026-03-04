# Meeting Notes — Sprint Retrospective
**Date:** January 31, 2026  
**Facilitator:** Meera Iyer  
**Attendees:** Ravi Shankar, Priya Nair, Arjun Mehta, Dev Kapoor, Sana Mirza  
**Sprint:** Sprint 14 (Jan 17 – Jan 31, 2026)  

---

## Sprint 14 Summary

**Planned story points:** 42  
**Completed story points:** 34  
**Velocity:** 81% (below our 90% target)

Three stories were not completed: WhatsApp integration testing (8 pts), Smart routing configuration UI (6 pts), and the metric catalogue approval workflow (4 pts). All three carry over to Sprint 15.

---

## What Went Well

- AI reply suggestion prototype shipped on day 3 of the sprint — ahead of schedule. Meera credited clear acceptance criteria and a dedicated pairing session on day 1.
- Design and engineering alignment was notably better this sprint. Ravi introduced a "design handoff checklist" that reduced back-and-forth questions by an estimated 60%.
- Arjun's workflow automation engine planning doc was well-received by stakeholders — no revision requests, which is unusual.
- Zero production incidents during the sprint. Dev noted this is the first sprint in 6 months with clean production uptime.

---

## What Didn't Go Well

- WhatsApp Business API integration hit an unexpected rate limiting issue from Meta's side — 1,000 messages/hour cap that wasn't in the documentation. This blocked testing for 3 days while Ravi worked with Meta support.
- Smart routing UI was descoped mid-sprint when Sana identified a dependency on the event bus that won't be ready until March. This should have been caught in sprint planning.
- Two team members were out sick on overlapping days (Jan 22–24) which created a bottleneck on code review — 6 PRs were waiting for more than 24 hours.
- Priya flagged that the lead scoring model's training data issue (CRM gaps pre-2023) has not been formally escalated. It's been in the open questions section of the PRD for 6 weeks with no owner.

---

## Action Items

| Action | Owner | Due Date |
|---|---|---|
| Escalate CRM data gap issue to data engineering team | Priya | Feb 5, 2026 |
| Update sprint planning checklist to include dependency validation | Meera | Feb 3, 2026 |
| Explore Meta WhatsApp API rate limit workaround (batching) | Ravi | Feb 7, 2026 |
| Define backup reviewer process for when primary reviewers are out | Dev | Feb 5, 2026 |
| Add event bus dependency to workflow automation project timeline | Arjun | Feb 3, 2026 |

---

## Decisions Made

- **Decision:** Smart routing UI will not enter Sprint 15. Will be scoped into Sprint 16 once event bus ETA is confirmed.
- **Decision:** The design handoff checklist becomes mandatory starting Sprint 15 for all stories > 3 points.
- **Decision:** Sprint planning will include a mandatory "dependencies check" step before stories are committed.

---

## Open Questions

- Should we bring in a contract Meta technical support resource to accelerate WhatsApp integration? Cost estimated at $3,500 for 2-week engagement.
- Is the March event bus ETA firm or a rough estimate? Arjun to confirm with platform team.
- How do we handle the 4 carryover stories — do they get re-estimated or carry original points?

---

## Team Sentiment

Anonymous pulse check at end of retro (1–5 scale):
- Sprint overall: 3.4/5
- Team collaboration: 4.1/5
- Clarity of priorities: 3.2/5
- Confidence in Sprint 15: 3.8/5

Lowest score was clarity of priorities — Meera to address in Sprint 15 kickoff by sharing a visual priority stack before planning begins.
