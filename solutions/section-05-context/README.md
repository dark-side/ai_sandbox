# Reference Solution — Section 5: Context and Memory Engineering

Key files in this reference solution:

- `adr_retriever.py` — TF-IDF based ADR retrieval, precision@3 ≥ 80% on 5 test queries
- `context_baseline.md` — baseline measurements (3 runs, static/dynamic ratio)
- `run_with_caching.py` — harness run.py with prompt caching applied

## Key insight: static/dynamic ratio

A typical uncached harness run on a 500-token ticket includes:
- ~2,400 tokens of static content (system prompt + constitution + all 4 ADRs)
- ~500 tokens of dynamic content (the ticket)

Static ratio = 82%. After caching, those 2,400 tokens are served from cache on repeat calls,
reducing effective cost by ~78% on cached prefixes.

## Key insight: retrieval vs full inclusion

Including all 4 ADRs in every call adds ~1,800 tokens of mostly-irrelevant context.
Retrieving only the top-2 ADRs relevant to the ticket reduces input tokens by ~50%
while maintaining the architectural guardrails that matter for that specific ticket.
