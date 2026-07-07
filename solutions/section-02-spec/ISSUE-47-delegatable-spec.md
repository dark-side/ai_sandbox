# Delegatable Spec: ISSUE-47 — Add Refund Validation

## 1. Goal

Add refund validation to the PayFlow payment validator so that a `PaymentRequest` with
`transaction_type: "refund"` is accepted when it carries a valid `original_transaction_id`,
and rejected otherwise — without breaking any existing payment validation behaviour.

---

## 2. Scope

**Files in (may be modified):**
- `services/payment-validator/validator.py`
- `services/payment-validator/test_validator.py`

**Files out (must not be modified):**
- Any file outside `services/payment-validator/`
- `requirements.txt` (no new dependencies)
- `fraud_detector.py` (out of scope for this ticket)

---

## 3. Acceptance criteria

| # | Criterion | How to verify (without reading the code) |
|---|---|---|
| AC1 | A `PaymentRequest` with `amount="0.00"` and `transaction_type="refund"` passes validation | `pytest -k test_zero_amount_refund_valid` exits 0 |
| AC2 | A `PaymentRequest` with `amount="0.00"` and `transaction_type="payment"` fails validation | `pytest -k test_zero_amount_non_refund_invalid` exits 0 |
| AC3 | A `PaymentRequest` with `transaction_type="refund"` and `original_transaction_id=None` fails | `pytest -k test_refund_requires_original_transaction_id` exits 0 |
| AC4 | All existing tests continue to pass | `pytest -v` exits 0 |
| AC5 | Coverage on `services/payment-validator/` is ≥ 80 % | `pytest --cov=services/payment-validator --cov-fail-under=80` exits 0 |
| AC6 | The implementation follows the `_validate_*` method pattern already in `validator.py` | LLM judge checking pattern consistency |

---

## 4. Constraints

- Must use only libraries already in `requirements.txt` (no new dependencies)
- Must follow the `_validate_*` method pattern established in `validator.py` per ADR-001
- Per ADR-001, `amount=0.00` is explicitly valid for refund reversals and authorisation holds
- No changes to public API signatures or response schemas

---

## 5. NFRs

- Coverage on `services/payment-validator/` ≥ 80 % after changes
- All existing tests pass (zero regressions)
- No new external dependencies added
- Implementation adds ≤ 50 lines to `validator.py`

---

## 6. Verification method

The agent proves it is done by running:

```
pytest --cov=services/payment-validator --cov-fail-under=80 -v
```

and attaching the full output to the run summary. Exit code 0 means all acceptance
criteria (AC1–AC5) pass. AC6 is verified by the judge eval in `harness/evals/judge_prompt.md`.
`git diff --name-only` must show only files in `services/payment-validator/`.
