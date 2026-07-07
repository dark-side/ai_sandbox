# ADR-002: Fraud Detection Approach

**Status:** Accepted  
**Date:** 2024-10-03  
**Deciders:** Security team (Rafael Santos, Elena Marsh)

---

## Context

A rule-based fraud detector was shipped in v1. After a score-threshold change
was merged without tests, all transactions were flagged for 47 minutes until
the deployment was rolled back. The incident cost $180 k in missed transaction
volume.

## Decision

### Scoring

`FraudDetector.score()` returns a float in [0.0, 1.0].  
The rejection threshold is **0.85** and is defined in the validator, not the detector.  
The detector never makes accept/reject decisions — it only scores.

### Retry policy (applies to ALL external calls from any service)

All retries against external services must use:

1. **Exponential back-off with jitter** — delay = `base_ms * 2^attempt + random(0, jitter_ms)`
   - `base_ms = 100`, `jitter_ms = 50`, `max_attempts = 3`
2. **Circuit breaker** — after 5 consecutive failures, open the circuit for 30 s.
3. **Timeout** — 2 s per attempt.

Any service that introduces a fixed-sleep retry violates this ADR.

### Test coverage requirement

`fraud_detector.py` must maintain **≥ 80 %** branch coverage measured by `pytest-cov`.
A pre-push hook must block merges where coverage drops below this threshold.

### Golden dataset

A golden dataset of 10 labelled transactions (5 clean, 5 dirty) lives in
`harness/evals/golden/`. Any change to the scoring logic must pass all 10 cases
before the PR can be reviewed.

## Consequences

- Fixed-sleep retries anywhere in the codebase are an ADR violation and must be
  remediated as a P2 issue.
- The golden dataset is the authoritative regression suite for fraud logic changes.
- Score-threshold changes require a separate ADR amendment.
