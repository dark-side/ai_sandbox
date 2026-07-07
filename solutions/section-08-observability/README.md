# Reference Solution — Section 8: Observability and Attribution

Files in this reference solution:

- `run_with_otel.py` — `harness/run.py` instrumented with OpenTelemetry spans
  (`ticket` root → `retrieval` / `model_call` / `tool_invocation` / `eval_suite` children),
  using GenAI semantic-convention attribute names.
- `metrics.py` — computes the four operational metrics from exported spans.
- `commit_trailer_hook.py` — appends AI attribution trailers to agent-originated commits.

## The four manager questions → four metrics

| Question | Metric | Source spans |
|---|---|---|
| What % of runs pass evals? | eval pass rate | `eval_suite.eval.pass` |
| What does a ticket cost? | $/ticket | sum `model_call.cost_usd` per ticket |
| What is p95 model latency? | p95 latency | `model_call` durations |
| What % of tool calls fail? | tool failure rate | `tool_invocation.tool.status == ERROR` |

## Why p95, not average

The 95th percentile captures tail latency the mean hides: a 10 s p95 means 1 in 20 calls
takes 10 s+. Averages smooth that away and hide the worst user experience.

## Why a commit trailer, not a PR-description note

A trailer lives in the commit-message body, so it travels with the commit through
squash-merge, rebase, fork, and archive restore. A PR description survives none of those.
`git log --grep="X-AI-Model"` on any checkout answers the compliance audit.

## Online pre-push check (Task 3)

The fast pre-push gate is deliberately *not* the full eval suite: a sub-second scope check
plus one Haiku judge call (< 30 s total). On failure it blocks the push and writes a
structured failure report to the trace, so the engineer sees it immediately instead of in a
CI notification three minutes later. Wire it into the same pre-push hook as the S3 suite.
