# Product Requirements Document
## AI Lead Scoring Engine
**Version:** 2.1  
**Status:** In Review  
**Author:** Priya Nair  
**Date:** January 2026  

---

## 1. Background & Problem Statement

Our sales team currently qualifies leads manually using gut instinct and basic demographic data. This takes 2–3 hours per rep per day and results in inconsistent qualification — senior reps convert leads at 34% while junior reps average 18%. We are losing an estimated $420K in annual revenue from misqualified leads that competitors are closing.

The core problem: we have no systematic way to predict which leads are most likely to convert, so reps waste time on low-quality leads and miss high-intent signals on good ones.

---

## 2. Proposed Solution

Build an AI-powered lead scoring engine that assigns a score of 0–100 to every inbound lead based on behavioural signals, firmographic data, and historical conversion patterns. Scores are surfaced in the CRM (HubSpot) with a breakdown of contributing factors so reps understand why a lead scored high or low.

---

## 3. Target Users

- **Primary:** Sales Development Representatives (SDRs) — 12 current users
- **Secondary:** Account Executives (AEs) — 8 current users
- **Tertiary:** Sales Manager for pipeline reporting

---

## 4. Jobs to Be Done

- JTBD 1: Know which leads to call first without spending time manually reviewing each one
- JTBD 2: Understand why a lead scored high so the opening conversation is more targeted
- JTBD 3: Trust the score enough to deprioritise low-scoring leads without fear of missing deals

---

## 5. Functional Requirements

| # | Requirement | Priority |
|---|---|---|
| FR1 | System must score every new lead within 60 seconds of CRM entry | Must |
| FR2 | Score must be visible in HubSpot lead view without additional clicks | Must |
| FR3 | Score breakdown must show top 3 contributing factors with plain-English labels | Must |
| FR4 | System must re-score leads automatically when key fields are updated | Must |
| FR5 | Reps must be able to flag a score as incorrect with one click | Should |
| FR6 | Model must retrain monthly using flagged corrections and new conversion data | Should |
| FR7 | Manager dashboard must show score distribution and conversion rate by score band | Should |
| FR8 | System must integrate with Salesforce as a future connector (V2) | Won't |

---

## 6. Scoring Model — Signal Categories

**Behavioural Signals (40% weight)**
- Pricing page visits: high intent signal
- Demo request: highest intent signal
- Email open rate over last 14 days
- Time spent on product pages

**Firmographic Signals (35% weight)**
- Company size: 50–500 employees is ideal customer profile
- Industry vertical match
- Tech stack compatibility (detected via Clearbit)
- Geography: APAC and EMEA priority markets

**Historical Signals (25% weight)**
- Similar companies that converted in last 12 months
- Deal size of comparable accounts
- Sales cycle length for similar profiles

---

## 7. Non-Functional Requirements

- Scoring latency: < 60 seconds from lead creation to score visible in CRM
- Model accuracy: >= 75% precision on high-scoring leads (score > 70)
- Uptime: 99.5% during business hours across APAC and EMEA time zones
- Data privacy: No PII stored outside our existing HubSpot data boundary

---

## 8. Success Metrics

| Metric | Baseline | Target (6 months) |
|---|---|---|
| Lead qualification time per rep | 2.5 hours/day | < 1 hour/day |
| Junior rep conversion rate | 18% | > 25% |
| Senior rep conversion rate | 34% | > 38% |
| High-score lead conversion (score > 70) | Unknown | > 45% |

---

## 9. Risks

- **Data quality risk:** Historical CRM data has gaps — leads before 2023 are missing firmographic fields. Mitigation: train model only on 2023–present data initially.
- **Rep trust risk:** If reps don't trust scores, they won't use them. Mitigation: show score breakdown always, run 4-week parallel trial where reps work both ways.
- **Model drift risk:** Conversion patterns change with market conditions. Mitigation: monthly retraining plus quarterly manual model review.

---

## 10. Open Questions

- Should we build the model in-house or use a third-party scoring API (6sense, MadKudu)?
- How do we handle leads with insufficient data for reliable scoring?
- What score threshold triggers automatic SDR assignment vs manual review?
