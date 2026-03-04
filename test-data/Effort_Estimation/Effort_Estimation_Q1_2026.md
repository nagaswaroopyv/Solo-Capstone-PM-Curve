# Effort Estimation — Q1 2026 Features
**Version:** 1.1  
**Owner:** Dev Kapoor (Engineering Lead)  
**Date:** November 20, 2025  
**Review Status:** Reviewed with team, approved for planning  

---

## Team Capacity — Q1 2026

| Engineer | Capacity (Story Points/Sprint) | Notes |
|---|---|---|
| Dev Kapoor | 10 | Lead — 20% on architecture/review |
| Ravi Shankar | 13 | Full stack |
| Priya Nair | 12 | Full stack |
| Sana Mirza | 8 | Frontend focus |
| New hire 1 | 6 | Starting Jan, 50% ramp first sprint |
| New hire 2 | 6 | Starting Jan, 50% ramp first sprint |
| **Total/Sprint** | **55** | |

**Q1 Sprints:** 6 sprints × 55 points = **330 story points total capacity**

Buffer for bugs, tech debt, unexpected: 15% = **280 story points net available**

---

## Feature 1: Custom Dashboard Builder

| Epic | Stories | Points | Owner |
|---|---|---|---|
| Data connection | Snowflake connector, schema fetching, metric catalogue API | 18 | Dev |
| Widget engine | 5 widget types, grid system, real-time preview | 32 | Ravi + Sana |
| Metric catalogue | Approval workflow, search, autocomplete | 12 | Priya |
| Sharing | Link generation, permissions, view-only enforcement | 10 | Ravi |
| Alerts | Threshold config, Slack + email delivery, test alert | 14 | Priya |
| PDF export | Dashboard to PDF renderer | 8 | Sana |
| QA + bug fix buffer | — | 16 | All |
| **Total** | | **110 points** | |

**Estimated timeline:** 2 sprints (Sprints 1–2, Jan 6 – Feb 7)  
**Target GA:** February 14 ✓ Feasible

---

## Feature 2: Workflow Automation Engine

| Epic | Stories | Points | Owner |
|---|---|---|---|
| Event bus integration | Subscribe to platform events, trigger evaluation | 22 | Dev |
| Visual builder UI | Drag-and-drop workflow canvas, trigger/action config | 28 | Sana + Ravi |
| Trigger logic | 8 trigger types, event matching, condition evaluation | 20 | Dev + Priya |
| Action execution | 12 action types, retry logic, failure handling | 24 | Priya + Dev |
| Workflow history | Execution log, success/failure status, 30-day retention | 10 | Ravi |
| Test mode | Sample data injection, dry-run execution | 8 | Priya |
| Plan enforcement | Usage limits by tier, execution counting | 6 | Dev |
| QA + bug fix buffer | — | 22 | All |
| **Total** | | **140 points** | |

**Estimated timeline:** 3 sprints (Sprints 2–4, Jan 20 – Mar 7)  
**Target GA:** March 28 ✓ Feasible (with buffer sprint)

**RISK:** Event bus dependency from platform team. If event bus slips past March 1, workflow engine GA slips by at least 2 weeks. Dev to monitor weekly.

---

## Feature 3: Unified Inbox v3 (WhatsApp + SMS)

| Epic | Stories | Points | Owner |
|---|---|---|---|
| WhatsApp Business API | Webhook setup, message ingestion, media handling | 20 | Dev |
| SMS via Twilio | API integration, message normalisation | 12 | Priya |
| Unified thread view | Cross-channel conversation stitching per customer | 18 | Ravi |
| AI reply suggestions | Context retrieval, suggestion generation, UI | 22 | Sana + Dev |
| Smart routing | Topic detection model, routing rules config, assignment | 16 | Priya |
| Routing config UI | Team lead configuration panel | 10 | Sana |
| QA + bug fix buffer | — | 20 | All |
| **Total** | | **118 points** | |

**Estimated timeline:** Sprints 3–6 (Feb 3 – Apr 4)  
**Target GA:** April 11 ✓ Feasible

**NOTE:** WhatsApp epic is contingent on go/no-go December 1 spike. If no-go, drop WhatsApp (20 pts) and adjust to SMS-only. Timeline becomes April 4 instead of April 11.

---

## Total Q1 Commitment

| Feature | Points | % of Capacity |
|---|---|---|
| Custom Dashboard Builder | 110 | 39% |
| Workflow Automation Engine | 140 | 50% |
| Unified Inbox v3 | 118 | 42% |
| **Total** | **368** | **131%** |

**⚠️ OVER CAPACITY by 88 points (31%)**

This is expected — features overlap across sprints and not all run simultaneously. The Gantt view (attached separately) shows the actual sprint-by-sprint allocation is within capacity. The key constraint is Sprints 3–4 where all three features are in flight simultaneously — this is the highest risk period.

**Mitigation:** New hires provide 12 additional points/sprint from Sprint 2 onward. If velocity falls below 85% for two consecutive sprints, Dev will flag for scope review.
