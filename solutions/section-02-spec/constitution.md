# PayFlow AI Harness — Constitution

Version: 1.0  
Effective: 2026-07-01  
Owners: Platform team

---

## 1. Purpose

This document is the authoritative specification for the PayFlow AI harness.
It governs what the harness may do, what it may not do, and how it must behave
when uncertain. All agents operating within this harness must follow this document.

---

## 2. Scope

The harness is authorised to read and modify files only within these directories:

```
services/payment-validator/
services/api-gateway/
```

Reading files outside this scope is permitted for context (e.g., reading ADRs in `docs/adr/`).
Writing files outside this scope is **prohibited** and must be blocked by the scope-enforcer hook.

---

## 3. Machine-verifiable gates

The following gates must all pass before any output is considered done.
A gate failure is not a suggestion — it blocks submission.

| Gate | Command | Pass condition |
|---|---|---|
| Coverage | `pytest --cov=services/payment-validator --cov-fail-under=80` | Exit code 0 |
| Existing tests | `pytest services/payment-validator/ -v` | Exit code 0, 0 failures |
| Scope | Diff contains only paths under the allowed scope | No out-of-scope paths |
| Fraud score threshold | `grep -r "0\.85" services/payment-validator/validator.py` | Threshold present in validator.py |

---

## 4. Escalation rules

Stop and request human input when:

1. The ticket description is ambiguous about which files may be modified.
2. The required change conflicts with any ADR in `docs/adr/`.
3. Any gate fails after two implementation attempts.
4. The required change would modify a versioned API endpoint's response schema.
5. The ticket asks for changes to `harness/`, `docs/`, or any other out-of-scope directory.

When escalating, write a summary of the ambiguity and the attempted approaches to a file
named `harness/escalation_<ticket_id>.md`, then stop.

---

## 5. Architectural compliance

Before implementing any ticket, retrieve the top-3 relevant ADRs from `docs/adr/`
and include them in your working context. Your implementation must not violate:

- **ADR-001:** All payment validation must go through `PaymentValidator.validate()`.
- **ADR-002:** All retries must use exponential back-off with jitter. No fixed-sleep retries.
- **ADR-003:** Schema changes must use Flyway migration scripts.
- **ADR-004:** Do not change versioned API endpoint response shapes.

---

## 6. Revision policy

This document may only be amended by:
1. A PR with at least one human approval from the platform team.
2. A description of why the amendment is needed.
3. An updated `Version` field and effective date.

Agents may not amend this document.

---

## References

- Workflow model and human touchpoints: `docs/agentic-solution-model.md`
- Scope-enforcer hook: `.claude/hooks/scope_enforcer.py`
- Eval suite: `harness/evals/run_suite.py`
