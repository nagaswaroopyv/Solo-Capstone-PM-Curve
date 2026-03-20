# Manual Eval Guide — PM Compass

Definitions, diagnostic logic, and scoring instructions for running manual evals on the RAG pipeline.

---

## Golden Dataset

- Auto-generated QA pairs used as ground truth for evals.
- Should cover **all documents** in the corpus — 1–2 QA pairs per chunk.
- Must be regenerated every time the corpus changes (e.g., after new Drive docs are ingested).
- Current corpus: 67 chunks across 14 Drive docs → target ~50–70 QA pairs.
- **The original 52-pair golden dataset is stale** — it was generated from old local test files, not Drive docs. Regenerate before running evals.

---

## Retrieval Settings

- The system returns the **top-3 chunks** (k=3) for every query.
- All eval dimensions are assessed against these 3 chunks and the answer generated from them.

---

## Eval Dimensions

### Precision
**Question:** Of the 3 chunks returned, how many were actually relevant to the question?

**How to score:**
- Look at each of the 3 returned chunks individually.
- Count how many are genuinely relevant to the question asked.
- Precision = relevant chunks / total chunks returned

| Relevant chunks | Precision |
|---|---|
| 3 of 3 | 100% |
| 2 of 3 | 67% |
| 1 of 3 | 33% |
| 0 of 3 | 0% |

**Low precision threshold:** Flag anything below 60%.
**Root cause:** Noisy retrieval — similar-topic chunks scoring too close together. Fix in v2 with reranking.

---

### Recall
**Question:** Do the 3 chunks *collectively* contain everything needed for a complete answer?

**How to score:**
- Consider all 3 chunks **together as a set**, not individually.
- Ask: "If the LLM read all 3 of these chunks, would it have everything it needs to give a complete answer?"
- Score 1–5 (1 = major gaps, 5 = fully covered).

**Not:** grading each chunk on its own. You're grading the batch.

---

### Faithfulness
**Question:** Is every claim in the answer traceable to one of the 3 returned chunks?

- Score 1–5 (1 = major hallucination, 5 = fully grounded).
- A claim that cannot be found in any of the 3 chunks = hallucination.

---

### Answer Relevance
**Question:** Does the answer actually address the question that was asked?

- Score 1–5 (1 = completely off-topic, 5 = directly answers the question).
- An answer can be faithful (no hallucination) but still irrelevant (answered the wrong question).

---

### Hallucination
**Question:** Did the answer contain any claims not supported by the retrieved chunks?

- Binary: Y / N
- If Y, fill in `Hallucination_Detail` — describe exactly what was made up.
- Hallucination ≠ incomplete answer. Incomplete = recall failure. Made-up = hallucination.

---

## Diagnosing Chopped / Incomplete Answers

When the answer shows Option 1 and Option 2 but misses Option 3, there are **exactly two failure modes** with different fixes:

### Failure Mode A — Retrieval Miss (Recall Failure)
- The chunk containing Option 3 was **never in the top-3**. The system didn't retrieve it.
- **How to confirm:** Open the side panel. Check the 3 source chunks. Option 3's chunk is not there.
- **Fix:** Lower threshold, increase k, improve chunking, add reranking layer.

### Failure Mode B — Generation Miss (Faithfulness/Completeness Failure)
- The chunk containing Option 3 **was in the top-3**, but the LLM ignored or truncated it in the answer.
- **How to confirm:** Open the side panel. Check the 3 source chunks. Option 3's chunk *is* there.
- **Fix:** Improve system prompt, increase max tokens, restructure how chunks are passed to LLM.

**These are completely different root causes. Diagnosing which one it is tells you exactly where to fix.**

---

## Low Precision — What To Do

- Do **not** try to fix low precision during eval. Just log it.
- Fill in `Root_Cause_Hypothesis` — e.g., "chunk too broad", "keyword overlap pulling wrong doc", "similar-topic chunks scoring too close".
- Come back to flagged rows in v2 and fix with reranking or better chunking.

---

## Eval Sheet Columns Reference

| Column | What to fill in |
|---|---|
| `TC_ID` | TC-001, TC-002... |
| `Category` | Simple Retrieval / Decision Reasoning / Edge Case / Adversarial / Summarization |
| `JTBD` | JTBD-1 (Q&A) / JTBD-2 (Summarize) |
| `Question` | Exact query typed into the UI |
| `Expected_Answer` | Key facts / options that must appear — not word-for-word, just substance |
| `Actual_Answer` | Copy-pasted from UI |
| `Sources_Expected` | Doc names that should be cited |
| `Sources_Returned` | Doc names the system actually cited |
| `Precision_Score` | % — relevant chunks / 3 returned (33%, 67%, 100%) |
| `Low_Precision_Flag` | Y if Precision < 60% |
| `Recall` | 1–5 — do the 3 chunks collectively contain the complete answer? |
| `Faithfulness` | 1–5 — every claim traceable to a chunk? |
| `Answer_Relevance` | 1–5 — does the answer address the question? |
| `Hallucination` | Y / N |
| `Hallucination_Detail` | What was made up (fill only if Y) |
| `Missing_Info_In_Chunks` | Y/N — was the missing info present in retrieved chunks but absent from answer? |
| `Failure_Mode` | Retrieval / Generation / Both / None |
| `Root_Cause_Hypothesis` | Observations — what likely caused the failure |
| `Pass_Fail` | Pass / Fail / Partial |
| `Notes` | Anything else worth capturing |
