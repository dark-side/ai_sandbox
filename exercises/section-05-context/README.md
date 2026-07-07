# Section 5 — Context and Memory Engineering

> **Scenario:** Agents are re-inventing patterns already documented in the ADRs. `BillingService.java`
> implements a fixed-sleep retry that violates ADR-002. Each harness run uses 80,000 tokens,
> 70,000 of which are static (system prompt + constitution + all ADRs sent on every call).
> At 300 runs per day this is a 40 % cost overrun against projection.

**How we solve it:** measure the current context composition, build and validate a retrieval
layer, apply caching, then add a scratchpad for long sessions.

---

## Tasks

### 1. Measure baseline context usage

Run the harness on 3 different tickets. For each run, capture:
- Total input tokens
- Total output tokens
- Which portion of input tokens came from static context (system prompt + constitution + ADRs)
  vs dynamic context (the ticket itself)

Write your measurements to `harness/evals/context_baseline.md`.  
Calculate the static/dynamic ratio. Is the static content being sent on every call?

---

### 2. Build ADR retrieval

The ADRs in `docs/adr/` contain the patterns agents should follow. Instead of
including all ADRs in every prompt, build a retrieval step:

1. Embed each ADR as a document.
2. For a given ticket description, retrieve the top-3 most relevant ADRs.
3. Measure **precision@3**: for 5 known queries, how often is the correct ADR in the top 3?

Save your retrieval implementation to `harness/retrieval/adr_retriever.py`.

**Target:** precision@3 ≥ 80 % on your 5 test queries before wiring into the harness.

---

### 3. Apply prompt caching

Mark `constitution.md` and the ADRs as cacheable in your harness calls.

Using the Anthropic API, the correct approach is to mark the system prompt content blocks
as `"cache_control": {"type": "ephemeral"}`.

Measure cost per run **before and after** applying caching on the same 3 tickets.

**Target:** cost per run reduced by ≥ 30 %.

---

### 4. Add a scratchpad summarisation step

If a harness session uses more than 8 tool calls, the context window grows large
and the agent starts "forgetting" constraints from the constitution.

Add a summarisation step: after every 8 tool calls, insert a summary of what has been
done and what constraints are still active.

Implement this in `harness/run.py` as a `summarise_if_needed(messages, tool_call_count)` function.

---

## Acceptance criteria

- [ ] `harness/evals/context_baseline.md` exists with 3 runs measured
- [ ] Static/dynamic ratio calculated and documented
- [ ] `harness/retrieval/adr_retriever.py` exists and runs
- [ ] precision@3 ≥ 80 % on 5 test queries (document results)
- [ ] Prompt caching applied in harness calls
- [ ] Cost per run reduced by ≥ 30 % (document before/after)
- [ ] Scratchpad summarisation implemented for sessions > 8 tool calls

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
