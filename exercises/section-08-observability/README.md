# Section 8 — Observability and Attribution

> **Scenario:** The engineering manager asks four questions. The current answer to all of them
> is "we don't know."
>
> 1. What percentage of harness runs produce output that passes our eval suite?
> 2. What is the average cost per ticket?
> 3. What is the p95 latency of the model call?
> 4. What percentage of tool calls fail?

**How we solve it:** instrument every operation with spans, build the four-metric dashboard,
add an online gate, then attach attribution to every agent-originated commit.

---

## Tasks

### 1. Instrument `harness/run.py` with OpenTelemetry spans

Add OTel instrumentation to `harness/run.py`:

| Span name | What it wraps |
|---|---|
| `payflow.harness.model_call` | The Anthropic API call |
| `payflow.harness.tool_invocation` | Each tool call made by the agent |
| `payflow.harness.retrieval` | ADR retrieval (from S3) |
| `payflow.harness.eval_suite` | The eval suite run |

Each span should record:
- Start / end time (automatic with OTel)
- `model` attribute on `model_call`
- `tool_name` attribute on `tool_invocation`
- `input_tokens`, `output_tokens`, `cost_usd` on `model_call`
- `pass` / `fail` on `eval_suite`

---

### 2. Compute the 4 metrics from trace data

After running the harness on 3 tickets, compute:

| Metric | How to compute |
|---|---|
| Eval pass rate | `count(eval_suite where pass=true) / count(eval_suite)` |
| $/ticket | Sum of `cost_usd` across all `model_call` spans for one ticket |
| p95 latency | 95th percentile of `model_call` duration in milliseconds |
| Tool failure rate | `count(tool_invocation where status=ERROR) / count(tool_invocation)` |

Write the computation logic in `harness/observability/metrics.py`.

---

### 3. Add online pre-push check

Before `git push`, run a fast online check:

1. **Scope check** — verify no files outside the allowed scope were modified
2. **Fast judge** — a single LLM call (on Haiku) that checks if the output is
   obviously broken (empty files, syntax errors, missing tests)

This is different from the full eval suite (S2) — it should complete in < 30 seconds.

Add this to the pre-push hook alongside the S2 eval suite.

---

### 4. Add commit trailers to agent-originated commits

Implement a `PostToolUse` hook (or a git `post-commit` hook) that adds attribution
trailers to any commit created by the harness:

```
Co-authored-by: agent-harness
X-AI-Harness-Version: <version>
X-AI-Model: <model identifier>
```

---

## Acceptance criteria

- [ ] `harness/run.py` has OTel spans for all 4 span types
- [ ] `harness/observability/metrics.py` computes all 4 metrics
- [ ] Running on 3 tickets produces trace output (Langfuse, Jaeger, or terminal JSON)
- [ ] All 4 manager questions can be answered with numbers from the traces
- [ ] Pre-push hook includes scope check + fast judge (< 30 s)
- [ ] Agent-originated commits have attribution trailers

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
