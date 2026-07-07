# Model Routing Analysis — Reference Solution (S6)

## 1. Capability classification (on paper, before any routing change)

| Task | Frontier needed? | Reasoning |
|---|---|---|
| `classify_ticket` | No (small) | Pattern-matching + fixed label set. Structured output, no multi-step reasoning. |
| `implement_feature` | Borderline (mid → cascade) | Reliable instruction-following on a well-specified spec. Frontier only on hard cases. |
| `architectural_review` | Yes (frontier) | Deep multi-step reasoning over large context; a wrong recommendation is expensive. |
| `generate_commit_message` | No (small) | Deterministic transform of a diff. Non-blocking. |
| `generate_test_names` | No (small) | Format/pattern task. Non-blocking. |

Rule of thumb applied: *pattern-matching / format → small · reliable instruction-following → mid · multi-step reasoning over large context → frontier.*

## 2. Eval evidence across model tiers

Eval suite from S2/S3 run on 20 classification tickets, 3 runs each:

| Task type | Model | Eval pass rate | p50 latency | Cost / call |
|---|---|---|---|---|
| `classify_ticket` | `claude-opus-4-6` (frontier) | 0.98 | 1.9 s | $0.021 |
| `classify_ticket` | `claude-haiku-4-5-20251001` (small) | 0.97 | 0.4 s | $0.0018 |
| `implement_feature` | `claude-opus-4-6` | 0.91 | 6.8 s | $0.180 |
| `implement_feature` | `claude-sonnet-4-6` (mid) | 0.86 | 4.1 s | $0.052 |
| `architectural_review` | `claude-opus-4-6` | 0.93 | 8.2 s | $0.240 |
| `architectural_review` | `claude-sonnet-4-6` | 0.71 | 5.0 s | $0.061 |

**Reading the data:**
- Classification: pass rate 0.97 vs 0.98 — within the 2 % tolerance. Frontier was over-provisioned for 60 % of calls. Route to small → **~11× cheaper** with no measurable quality loss.
- Implementation: mid-tier is 5 points below frontier — outside tolerance, but the gap only appears on hard cases. Use **cascading** (attempt mid, escalate on failure) rather than a fixed route.
- Architectural review: 22-point gap — a real capability difference. **Keep on frontier regardless of cost.**

## 3. Routing decision rule

```
if eval_pass_rate(small) >= eval_pass_rate(frontier) - 0.02:
    route to small
```

The 2 % tolerance absorbs eval variance across runs. Applied above: `classify_ticket`,
`generate_commit_message`, `generate_test_names` route to small; `architectural_review`
stays frontier; `implement_feature` uses cascading (Section 4 below).

## 4. Cascading escalation triggers (for `implement_feature`)

Attempt with `claude-sonnet-4-6` (mid) first, escalate to `claude-opus-4-6` (frontier) when **any** trigger fires:

1. Output fails the scope-check deterministic assertion (S7 hook returns non-zero).
2. Judge score on the acceptance-criteria judge is below **0.7**.
3. The model returns `stop_reason: "max_tokens"` or an explicit low-confidence signal.

This yields frontier-level quality on hard tickets at mid-tier average cost, without the
risk of always using mid-tier on the ~14 % of tickets it fails.
