# Coverage Annotations — Reference Solution (S11)

After running per-agent and end-to-end evals on 10 representative tickets, each task type is
annotated **Well-supported**, **Partial**, or **Gap**. The map tells you exactly where the
eval suite needs strengthening before the orchestrated system can be trusted in production.

| Task type | Annotation | Evidence | Action |
|---|---|---|---|
| impl — scope adherence | Well-supported | `eval_impl` scope check passes; dirty cases (out-of-scope write) reliably fail | none |
| impl — coverage ≥ 80% | Well-supported | Deterministic assertion; no false negatives across 10 tickets | none |
| test — tests pass | Well-supported | `eval_test` runs the suite; failing tests block the handoff | none |
| **test — tests cover changed files** | **Partial → Gap** | `eval_test` checks tests *pass*, not that they *exercise* `impl.changed_files`. Trace analysis found 2/10 tickets where tests passed on unchanged code | Add assertion: each changed module is imported/exercised by ≥1 new test |
| docs — required fields present | Well-supported | `eval_docs` checks trailers + api_changes mentioned | none |
| e2e — assembled PR meets ticket spec | Partial | Passes per-agent evals but 3/10 fail end-to-end when `api_changes` is dropped at the impl→test handoff | Strengthen handoff validation (done in `handoff_schema.py`) + add dirty case |

## The canonical S11 gap

The highest-value gap sits at the **impl-agent → test-agent handoff boundary**. Each agent
passes its own eval, but nothing verifies the tests *meaningfully cover* the changed files —
so a green suite can still ship untested code. This is a **Partial** that becomes a **Gap**
under real traffic.

## Closing a Partial

1. Derive a dirty case from the real-trace failure (tests pass on unchanged code).
2. Confirm the new dirty case now **fails** the strengthened `eval_test`.
3. Re-annotate the task type as **Well-supported** (or **Gap** if the eval still misses it).
