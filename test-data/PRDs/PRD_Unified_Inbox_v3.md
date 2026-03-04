# Product Requirements Document
## Unified Inbox v3
**Version:** 3.0  
**Status:** LOCKED — Heading to Engineering  
**Author:** Meera Iyer  
**Date:** November 2025  

---

## 1. Background

Unified Inbox v1 and v2 shipped in 2024 and consolidated email and in-app notifications. User research in Q3 2025 showed that 67% of our power users also manage customer conversations across WhatsApp Business and SMS, neither of which are currently integrated. These users maintain 3 separate inboxes simultaneously, leading to missed messages and slow response times.

Average response time across fragmented inboxes: 4.2 hours. Industry benchmark for our segment: < 1 hour. This gap is cited in 3 of our last 5 churned customer exit interviews as a contributing factor.

---

## 2. What's New in v3

V3 extends the existing Unified Inbox to include:
- WhatsApp Business API integration
- SMS (Twilio) integration  
- AI-suggested replies based on conversation history
- Smart routing — automatically assign conversations to the right team member based on topic detection

V1 and V2 remain backward compatible. No migration required.

---

## 3. Target Users

- **Primary:** Customer Success Managers at companies with 50–200 customers — 340 current users matching this profile
- **Secondary:** Support team leads managing multi-channel queues

---

## 4. Jobs to Be Done

- JTBD 1: See all customer conversations in one place regardless of which channel they came through
- JTBD 2: Respond to customers faster by having context from previous interactions surfaced automatically
- JTBD 3: Route conversations to the right team member without manual triage

---

## 5. Functional Requirements — V3 Additions

| # | Requirement | Priority |
|---|---|---|
| FR1 | WhatsApp Business messages must appear in unified inbox within 30 seconds of receipt | Must |
| FR2 | SMS messages via Twilio must appear in unified inbox within 30 seconds of receipt | Must |
| FR3 | Conversation history across all channels must be visible in a single thread view per customer | Must |
| FR4 | AI must suggest 3 reply options based on conversation context and past responses | Should |
| FR5 | Smart routing must assign conversations based on detected topic with > 80% accuracy | Should |
| FR6 | Agents must be able to accept, reject, or modify AI-suggested replies | Must |
| FR7 | Routing rules must be configurable by team lead without engineering involvement | Should |

---

## 6. AI Reply Suggestions — Design Constraints

The AI suggestion feature carries specific constraints agreed with the legal team:

- AI suggestions must be clearly labelled as AI-generated in the UI
- Agents cannot send an AI reply without manually confirming it
- Conversation data used for suggestion training must remain within our data boundary — no third-party model training on customer data
- Suggestion accuracy will be measured by agent acceptance rate — target > 60% acceptance

---

## 7. Success Metrics

| Metric | Baseline | Target (60 days post-launch) |
|---|---|---|
| Average customer response time | 4.2 hours | < 1.5 hours |
| Agent context-switching between tools | 3 tools open simultaneously | 1 tool |
| AI reply acceptance rate | N/A | > 60% |
| Smart routing accuracy | N/A (manual) | > 80% |
| Churn mentions of slow response | 3 of last 5 exits | 0 in next quarter |

---

## 8. Pricing Impact

WhatsApp Business API costs are variable — $0.005–$0.02 per message depending on country. This introduces a usage-based cost component not present in v1/v2. Decision: pass WhatsApp messaging costs through to customers at cost + 15% margin. Pricing team to update plan documentation before launch.

---

## 9. Open Questions

- Maximum conversation history to load per customer thread? Storage implications at scale.
- How do we handle customers who contact via multiple channels with different email addresses — same person, different identity?
- Regulatory compliance for WhatsApp Business in GDPR markets — legal review in progress.
