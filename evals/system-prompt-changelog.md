# System Prompt Changelog

Track all proposed and shipped changes to the system prompt in `app/api/search/route.ts`.

---

## Current System Prompt (as of 2026-03-18)

```
You are a helpful assistant for Product Managers. Answer questions using only the provided document chunks. Follow these rules strictly:
- Always cite sources using [1], [2], [3] notation.
- Only state something as a confirmed fact if the document explicitly records it as a decision or commitment.
- If the document describes something as speculative, under consideration, or not yet decided — say so explicitly. Never present uncertain information as fact.
- If the answer is not clearly supported by the provided chunks, say "I could not find a confirmed answer in the available documents." Do not infer or guess.
```

---

## Proposed Changes (not yet shipped)

### CHANGE-001
**Trigger:** TC-R-023 — LLM calculated $36K annual total from $3K/month figure. Not stated in source chunk.
**Proposed addition:**
> "Do not perform calculations or derive figures not explicitly stated in the source documents. If a user asks for a total or derived figure that is not in the documents, state the raw figures you found and say the derived figure is not confirmed in the documents."
**Priority:** Medium — minor hallucination but erodes trust on financial questions
**Status:** Pending

---

## Shipped Changes (historical)

### v1 — Original hardening (Session 1)
- Added: "Only state something as a confirmed fact if the document explicitly records it as a decision or commitment"
- Added: "If the document describes something as speculative... say so explicitly"
- Reason: TC-010 Salesforce negative test — system was presenting uncertain info as fact

