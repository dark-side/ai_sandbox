# Section 3 — Evaluation-Driven Development

> **Scenario:** `fraud_detector.py` broke a downstream service last week. A score-threshold
> change was merged without any automated eval catching it. Coverage is 34 %. Two PRs this
> quarter were merged below the 80 % threshold because there was no gate to block them.

**How we solve it:** classify every acceptance criterion, build the deterministic layer first,
add a calibrated judge, then gate every harness output behind CI rather than a local run.

---

## Tasks

### 1. Classify acceptance criteria

Take the acceptance criteria from your Section 2 delegatable spec
(`docs/issues/ISSUE-47-delegatable-spec.md`).

Classify each criterion as:
- **(D) Deterministic** — can be verified by a script with a pass/fail answer
- **(J) Judge** — requires an LLM to evaluate quality, correctness, or semantic match

Write your classification in `harness/evals/criteria_classification.md`.

---

### 2. Write deterministic assertions

Create `harness/evals/deterministic.py` with the following checks:

| Assertion | What to check |
|---|---|
| Changed files | All modified files are in `services/payment-validator/` |
| Coverage | `pytest --cov=services/payment-validator --cov-fail-under=80` exits 0 |
| Existing tests | All pre-existing tests still pass |
| Boundary case | `test_amount_zero` exists in the test file |

The script should print PASS / FAIL per assertion and exit non-zero if any fail.

---

### 3. Write a judge prompt

Create `harness/evals/judge_prompt.md`.

The judge prompt must evaluate whether the generated implementation:
- Matches the fraud detection interface contract (input/output types from `fraud_detector.py`)
- Does not change the rejection threshold (0.85 lives in `validator.py`, not `fraud_detector.py`)
- Does not introduce a new external dependency

Format: a system prompt + a `{{implementation_diff}}` placeholder.  
The judge should respond with a JSON object: `{"pass": true/false, "reason": "..."}`.

---

### 4. Build a golden dataset

Create 10–20 cases in `harness/evals/golden/`, half clean (should pass all evals) and half dirty
(should fail at least one eval). If a dirty case passes, the eval is not catching that failure mode.

```
harness/evals/golden/
├── case_01_clean.json     # valid payment, score below threshold
├── case_02_clean.json
├── case_03_clean.json
├── case_04_clean.json
├── case_05_clean.json
├── case_06_dirty_out_of_scope_write.json   # agent writes to billing-reconciler/
├── case_07_dirty_coverage_below_80.json    # coverage = 71%
├── case_08_dirty_wrong_threshold.json      # threshold moved to detector
├── case_09_dirty_wrong_fraud_logic.json    # plausible but incorrect scoring
└── case_10_dirty_broken_existing_test.json # existing test fails
```

Start with the 10 cases below. Add more dirty cases whenever a production failure reveals
a new failure mode that none of the existing dirty cases cover.

Each file should contain: `input` (ticket), `expected_outcome` (pass/fail), `reason`.

---

### 5. Wire as a pre-push hook

Create `.git/hooks/pre-push` (or a shareable version at `.claude/hooks/pre_push.sh`)
that runs `python harness/evals/run_suite.py` and blocks the push if it exits non-zero.

Create `harness/evals/run_suite.py` that:
1. Runs all deterministic assertions
2. Runs the judge on the most recent harness output
3. Runs all 10 golden cases
4. Exits 0 only if all pass

---

### 6. Gate every harness run behind a CI eval check

A passing eval run on a local machine is **not** a gate. Nothing stops a run with a failing
suite from being acted on if the check only lives on someone's laptop.

Create `.github/workflows/ci-eval.yml` that runs `python harness/evals/run_suite.py` on
every push. The CI step must **fail** if the eval suite exits non-zero.

This converts the eval suite from a developer habit into an enforced quality gate that the
whole team inherits automatically — the same logic as a required status check on tests.

```yaml
name: Eval Suite

on: [push]

jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run eval suite
        run: python harness/evals/run_suite.py
```

---

## Acceptance criteria

- [ ] `harness/evals/criteria_classification.md` exists with D/J labels
- [ ] `harness/evals/deterministic.py` exits 0 on a clean implementation
- [ ] `harness/evals/deterministic.py` exits non-zero on each dirty case
- [ ] `harness/evals/judge_prompt.md` exists with `{{implementation_diff}}` placeholder
- [ ] At least 10 golden cases exist with correct structure (5 clean + 5 dirty minimum)
- [ ] Every dirty case fails at least one eval check — if a dirty case passes, the eval has a gap
- [ ] `python harness/evals/run_suite.py` exits 0 on clean, non-zero on every dirty case
- [ ] Pre-push hook blocks a dirty push
- [ ] `.github/workflows/ci-eval.yml` exists and fails CI when eval suite exits non-zero

---



## Self-check

Run the self-check to see which acceptance criteria are still outstanding:

```bash
./verify.sh
```

It prints PASS/FAIL per criterion and exits non-zero until everything the exercise asks
for exists. Before you start it reports everything as not-done — that is expected.
