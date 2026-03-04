# Decision Log
## Build vs Buy: Workflow Automation Engine
**Decision Date:** November 12, 2025  
**Decision Owner:** Meera Iyer  
**Participants:** Vikram Nair (CEO), Arjun Mehta, Dev Kapoor, Tanya Bose  
**Status:** DECIDED — Build natively  

---

## Decision

We will build the Workflow Automation Engine natively rather than partnering with or white-labelling a third-party automation platform (Zapier, Make, n8n).

---

## Context

When the automation engine was added to the Q1 2026 roadmap in November, Vikram raised the question of whether we should build from scratch or leverage existing automation infrastructure. This decision log captures the analysis and rationale.

---

## Options Evaluated

### Option A: Build Natively (CHOSEN)
Build a purpose-built automation engine that understands our platform's native objects (deals, tickets, health scores, contacts) deeply.

**Pros:**
- Full control over trigger types and data model — can expose any internal event without third-party integration complexity
- No per-execution cost at scale (third-party tools charge per automation run)
- Tighter UI integration — automation builder lives inside our product, not in an external tool
- Proprietary data stays within our system — no customer data sent to third-party platforms
- Stronger competitive moat — automation that knows our objects deeply is harder to replicate

**Cons:**
- Significant build effort — estimated 14 weeks of engineering
- We carry full maintenance and reliability burden
- Starting from zero — no existing automation logic to leverage

**Estimated cost:** 14 weeks × 2 engineers = $84,000 in engineering cost

### Option B: White-Label n8n (Open Source)
Use n8n's self-hosted open-source automation engine, customise the UI, and integrate with our platform via API.

**Pros:**
- Faster to ship — estimated 6 weeks to a working integration
- n8n has 400+ pre-built integrations we could expose immediately
- Open source — no licensing cost

**Cons:**
- n8n's data model is generic — doesn't understand our native objects natively. Every trigger would require an API call, adding latency
- Our engineering team would need to maintain a forked version of n8n — significant long-term maintenance burden
- UI integration would feel "bolted on" — different design system, different interaction patterns
- Customer data would flow through n8n's execution engine even if self-hosted — creates data governance questions

**Estimated cost:** 6 weeks integration + estimated 20% ongoing engineering overhead for maintenance

### Option C: Partner with Zapier
Surface Zapier as the recommended automation solution, build a first-class Zapier integration, and point customers to Zapier for automation needs.

**Pros:**
- Zero build effort on automation engine
- Zapier has market recognition — some customers already use it
- Fast to market — Zapier integration could be live in 2 weeks

**Cons:**
- Customers pay Zapier separately — adds friction and cost
- We have no control over Zapier's pricing, reliability, or feature direction
- Automation that lives in Zapier doesn't create data or engagement within our product — weakens retention
- Lost deal analysis shows prospects want native automation, not a pointer to another tool
- Strategically weakens our product story — we're telling customers to go elsewhere for a core feature

**Estimated cost:** Near zero build, but strategic cost is high

---

## Decision Rationale

Option A (Build Natively) was chosen for three primary reasons:

1. **Strategic differentiation:** Automation that deeply understands our native objects is a stronger competitive moat than a generic connector approach. Competitors cannot easily replicate automation built on top of our proprietary data model.

2. **Long-term economics:** Third-party automation tools charge per execution at scale. At 5,000 automations/day across our user base, Zapier's cost would be approximately $18,000/month. Native automation has zero marginal cost per execution.

3. **Customer experience:** Lost deal interviews consistently show that prospects want automation that "just works" within the product they're already using, not a separate tool they need to configure and maintain.

The 14-week build timeline is aggressive but manageable with the 2 new engineering hires starting in January.

---

## What We Will Still Use Zapier For

Even with native automation, we will maintain and improve our Zapier integration for customers who need to connect our platform to tools we don't natively integrate with. Zapier remains a distribution channel — we are not abandoning it, we are just not relying on it as our primary automation strategy.

---

## Review Trigger

This decision should be revisited if:
- Build timeline extends beyond 18 weeks (re-evaluate buy option)
- Engineering cost exceeds $120,000 (re-evaluate make vs buy economics)
- A competitor ships a superior native automation product that resets customer expectations
