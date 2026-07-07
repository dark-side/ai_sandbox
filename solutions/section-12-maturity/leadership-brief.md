# PayFlow — Agentic Maturity Leadership Brief

Date: 2026-07-01  
Author: Platform Team

---

## Current State

**Effective level: L2 — Engineer Directs AI**

Engineers prompt the harness for feature tickets; every output is reviewed at line level
before any code is committed. Three observable facts:

1. `harness/run.py` has no eval gate — no automated quality check between generation and commit.
2. `test_validator.py` has 34% coverage on `fraud_detector.py` — known gap, no gate to enforce it.
3. `AGENTS.md` contains zero machine-verifiable gates — all instructions are advisory.

**Bottleneck:** Absence of an eval suite (L3 requirement). Without an eval gate, engineers
cannot trust any output without reading every line, which caps throughput at line-review speed.

---

## Target State

**L3 — AI Executes with Eval Gate**

The agent runs tasks end-to-end; an automated eval suite scores output before any human sees it.
Engineers review the eval report, not every line of code.

Exit criteria:
- `python harness/evals/run_suite.py` gates every PR
- Coverage ≥ 80% enforced as a pre-push gate
- Scope enforcement hook blocks out-of-scope writes with a failure-injection test

---

## Uplift Plan

**Single highest-leverage action:** Build the deterministic eval suite (Section 3 of the curriculum).

Estimated effort: 2 engineer-days.  
Addressed by: Section 3 — Evaluation-Driven Development.

Sequence:
1. Classify acceptance criteria as deterministic or judge (4 hours)
2. Write deterministic assertions (4 hours)
3. Wire as pre-push hook (2 hours)
4. Build 5-case golden dataset and validate (2 hours)

---

## Economics

| Metric | Current (L2) | Projected (L3) |
|---|---|---|
| Time per feature ticket | 4h (2h generation + 2h line review) | 2.5h (2h generation + 30min eval report review) |
| Tickets/engineer/week | 5 | 8 |
| Cost per ticket (API) | $3.20 (all on Opus) | $1.80 (with routing from Section 6) |
| Monthly API spend (8 engineers) | $3,200 | $1,440 |

**ROI of moving from L2 to L3:**  
- Throughput gain: 60 % more tickets per engineer per week
- Cost reduction: $1,760/month in API spend
- Engineer time saved: ~12h/week across the team (freed from line-level review)
- Uplift cost: 2 engineer-days ≈ 16 engineer-hours

**Payback period: < 2 days** (16h of saved review time in the first week offsets the build cost).
