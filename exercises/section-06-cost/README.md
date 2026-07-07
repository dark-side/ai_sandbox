# Section 6 — Model Selection and Cost Control

> **Scenario:** All 3 task types (classification, implementation, architectural review) route
> to the same frontier model. Monthly cost is $3,200. Engineering estimates that 60 % of harness
> invocations are classification tasks that don't need frontier capability.

**How we solve it:** classify tasks by capability on paper, validate with real eval data, route
accordingly, define a cascading fallback for ambiguous tasks, then turn the savings into a
reusable cost calculator.

---

## Tasks

### 1. Classify tasks by required capability

On paper (or in a markdown file), classify each task type by the model tier it actually requires:

| Task | Frontier needed? | Reasoning |
|---|---|---|
| `classify_ticket` | ? | |
| `implement_feature` | ? | |
| `architectural_review` | ? | |
| `generate_commit_message` | ? | |
| `generate_test_names` | ? | |

Save to `harness/evals/model_routing_analysis.md`.

---

### 2. Run eval suite across model tiers

For classification tasks, run your eval suite (from S2) using:
- `claude-opus-4-6` (current)
- `claude-haiku-4-5-20251001` (small model)

Measure: eval pass rate, latency, and cost per run.

Does pass rate change? If eval pass rate is unchanged, there is no reason to use
the frontier model for classification.

Document results in `harness/evals/model_routing_analysis.md`.

---

### 3. Write routing rules in `harness/config.yaml`

Update `harness/config.yaml` with evidence-based routing.

The routing decision rule is:

> If `eval_pass_rate(small) >= eval_pass_rate(frontier) - 0.02`, route to the small model.
> The 2 % tolerance accounts for eval variance across runs.

```yaml
tasks:
  classify_ticket: claude-haiku-4-5-20251001   # <-- update based on your eval evidence
  implement_feature: claude-opus-4-6
  architectural_review: claude-opus-4-6
  generate_commit_message: claude-haiku-4-5-20251001
  generate_test_names: claude-haiku-4-5-20251001
```

---

### 4. Define a cascading strategy for borderline tasks

Not every task fits cleanly into small or frontier. For the 30 % of implementation tasks
in the S6 scenario, define a cascading strategy:

1. Attempt the task with a **mid-tier model** first
2. Escalate to frontier only when **one of these signals fires**:
   - Output fails the scope-check deterministic assertion
   - Judge score is below 0.7
   - The model returns `stop_reason: max_tokens` or another low-confidence signal

Document the three escalation triggers in `harness/evals/model_routing_analysis.md`.

> **Why this matters:** cascading produces the same quality as always-frontier at lower
> average cost, without the quality risk of always-using mid-tier on hard tasks.

---

### 5. Wire the Batch API for non-blocking tasks

`generate_commit_message` and the nightly report generation are non-blocking:
the result isn't needed immediately.

Update `harness/run.py` to use the Anthropic Batch API for these tasks.
The batch job should be submitted and the job ID stored; a separate poll step
retrieves the result when ready.

---

### 6. Build a Token ROI Calculator

A one-time spreadsheet goes stale the moment pricing or ticket volume changes. Build a
reusable calculator instead. Create `harness/cost_projection.md`.

**Inputs:** requests per day, average input/output tokens per request, model tier, whether
caching or batching apply.

**Outputs:** cost per day, per month, and per engineer at current ticket volume.

**Three scenarios for the 8-engineer team:**

| Scenario | Levers | Typical saving on affected calls |
|---|---|---|
| Conservative | Routing only | 60–80 % on routed calls |
| Moderate | Routing + Batch API | + 50 % on batched calls |
| Aggressive | Routing + Batch API + Prompt caching | + up to 90 % on cached tokens |

Use the current Anthropic published rates (check the platform docs — rates change). Show
your working so the calculator stays accurate as pricing changes instead of hardcoding
numbers that drift.

---

## Acceptance criteria

- [ ] `harness/evals/model_routing_analysis.md` with classification, eval results, and cascading triggers
- [ ] `harness/config.yaml` updated with evidence-based routing rules
- [ ] Eval pass rate unchanged (or documented if it changes)
- [ ] Three escalation triggers for cascading documented in `model_routing_analysis.md`
- [ ] `harness/run.py` uses Batch API for commit message and nightly report tasks
- [ ] `harness/cost_projection.md` with 3 scenarios and numbers from published pricing

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
