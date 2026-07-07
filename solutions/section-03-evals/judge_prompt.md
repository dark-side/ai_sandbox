# Judge Prompt — Fraud Detector Interface Contract

You are a code reviewer evaluating a diff against the PayFlow fraud detection interface contract.

Evaluate the following diff against each criterion below. For each criterion, answer PASS or FAIL
with a one-sentence reason.

## Criteria

1. **Return type preserved:** `FraudDetector.score()` must still return a `float` in `[0.0, 1.0]`.
2. **Threshold location:** The rejection threshold (0.85) must remain in `validator.py`, not in `fraud_detector.py`.
3. **No new external dependencies:** No new `import` statements referencing third-party packages.
4. **Scoring-only contract:** `FraudDetector.score()` must return a score, never a boolean accept/reject decision.
5. **No global state added:** No new module-level mutable variables that persist between calls (other than `_velocity_store` which is intentional).

## Diff to evaluate

```diff
{{implementation_diff}}
```

## Response format

Respond with a JSON object:

```json
{
  "pass": true,
  "criteria": {
    "return_type_preserved": {"result": "PASS", "reason": "..."},
    "threshold_location": {"result": "PASS", "reason": "..."},
    "no_new_dependencies": {"result": "PASS", "reason": "..."},
    "scoring_only_contract": {"result": "PASS", "reason": "..."},
    "no_global_state_added": {"result": "PASS", "reason": "..."}
  },
  "summary": "One sentence overall assessment."
}
```

Set `"pass": true` only if ALL five criteria are PASS. Set `"pass": false` if any criterion fails.
