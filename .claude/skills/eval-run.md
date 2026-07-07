---
name: eval-run
description: Runs the PayFlow eval suite and prints a PASS/FAIL summary with actionable details on failures.
---

## Steps

1. Run `python harness/evals/run_suite.py` (or `solutions/section-03-evals/deterministic.py` if the full suite isn't built yet).
2. Capture exit code and output.
3. Parse results:
   - Exit 0 → all pass
   - Exit non-zero → parse which assertions failed
4. Print a one-line summary followed by details on any failures.
5. If failures exist, suggest the most likely fix for each.

## Expected output (all pass)

```
Eval suite: 4/4 passed.
  [PASS] Scope check: 3 files in allowed scope
  [PASS] Coverage >= 80%: 84%
  [PASS] Existing tests: 23/23 passed
  [PASS] Zero-amount boundary test exists
```

## Expected output (with failures)

```
Eval suite: 3/4 passed. ACTION REQUIRED before push.
  [PASS] Scope check
  [FAIL] Coverage >= 80%: 71% — add tests for fraud_detector.py velocity paths
  [PASS] Existing tests
  [PASS] Zero-amount boundary test exists
```
