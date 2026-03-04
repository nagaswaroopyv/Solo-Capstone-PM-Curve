# Product Requirements Document
## Custom Dashboard Builder
**Version:** 1.3  
**Status:** Approved — In Development  
**Author:** Ravi Shankar  
**Date:** December 2025  

---

## 1. Background & Problem Statement

Our analytics team currently builds custom reports manually in Metabase for every stakeholder request. This creates a bottleneck — the analytics team receives an average of 23 report requests per week and can fulfil only 9, leaving 14 requests unserved or delayed by 2–3 weeks.

Business stakeholders (marketing, sales, customer success) want self-serve access to their key metrics without waiting for the analytics team. The current tool (Metabase) requires SQL knowledge that non-technical stakeholders don't have.

---

## 2. Proposed Solution

Build a no-code custom dashboard builder that allows business stakeholders to create, customise, and share dashboards using a drag-and-drop interface. The builder connects to our existing data warehouse (Snowflake) and surfaces pre-approved metric definitions so stakeholders can't accidentally build incorrect metrics.

---

## 3. Target Users

- **Primary:** Marketing, Sales, and Customer Success team leads — 18 users
- **Secondary:** C-suite for executive dashboards — 4 users
- **Out of scope:** Data analysts (they continue using Metabase)

---

## 4. Jobs to Be Done

- JTBD 1: Build a dashboard showing my team's key metrics without needing SQL or analytics team help
- JTBD 2: Share a live dashboard with my manager that updates automatically without re-exporting
- JTBD 3: Set up an alert when a metric crosses a threshold so I don't have to check manually

---

## 5. Functional Requirements

| # | Requirement | Priority |
|---|---|---|
| FR1 | Users must be able to create a dashboard with drag-and-drop widgets | Must |
| FR2 | Widget types: line chart, bar chart, KPI tile, data table, pie chart | Must |
| FR3 | All metrics must use pre-approved definitions from the metric catalogue | Must |
| FR4 | Dashboards must refresh automatically every 4 hours | Must |
| FR5 | Users must be able to share dashboards via link with view-only access | Must |
| FR6 | Users must be able to set threshold alerts delivered via email or Slack | Should |
| FR7 | Dashboards must be exportable as PDF for board presentations | Should |
| FR8 | Mobile-responsive dashboard viewing (creation remains desktop-only) | Should |
| FR9 | Version history — ability to restore a dashboard to a previous state | Won't (V2) |

---

## 6. Metric Catalogue

The metric catalogue contains 47 pre-approved metric definitions across four domains:

**Revenue metrics:** MRR, ARR, Net Revenue Retention, Expansion Revenue, Churn Rate
**Marketing metrics:** CAC, Lead Volume, MQL to SQL conversion, Campaign ROI
**Product metrics:** DAU, MAU, Feature Adoption Rate, Session Duration, NPS
**Customer Success metrics:** CSAT, Time to Value, Support Ticket Volume, Escalation Rate

New metrics require a 3-day approval process through the analytics team to ensure definition consistency.

---

## 7. Non-Functional Requirements

- Dashboard load time: < 3 seconds for dashboards with up to 12 widgets
- Data freshness: metrics reflect data no older than 4 hours
- Concurrent users: support up to 50 simultaneous dashboard viewers
- Uptime: 99.9% during business hours (8am–8pm across all time zones)

---

## 8. Success Metrics

| Metric | Baseline | Target (3 months post-launch) |
|---|---|---|
| Analytics team report requests per week | 23 | < 10 |
| Time from request to dashboard live | 2–3 weeks | < 1 day (self-serve) |
| Stakeholder satisfaction with analytics access | 3.1/5 | > 4.2/5 |
| Dashboards created per month | 0 (not possible) | > 40 |

---

## 9. Design Decisions

**Decision: Pre-approved metric catalogue instead of free-form query builder**
Rationale: Free-form queries led to 6 major reporting inconsistencies in Q3 2025 where different teams were reporting different numbers for the same metric. Pre-approved metrics enforce single source of truth.

**Decision: 4-hour refresh cycle instead of real-time**
Rationale: Real-time Snowflake queries at scale would cost an estimated $8,400/month in compute. Business stakeholders confirmed that 4-hour data is sufficient for their decision-making cycles.

---

## 10. Risks

- **Adoption risk:** Stakeholders may still default to requesting reports from analytics team. Mitigation: mandatory self-serve training, analytics team to redirect all eligible requests.
- **Metric misuse risk:** Stakeholders may combine metrics incorrectly even with pre-approved definitions. Mitigation: add contextual tooltips explaining each metric and its appropriate use cases.
