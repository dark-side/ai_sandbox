# ADR-001: Payment Validation Strategy

**Status:** Accepted  
**Date:** 2024-09-12  
**Deciders:** Platform team (Elena Marsh, David Osei, Priya Nair)

---

## Context

PayFlow's initial MVP performed validation inside the API gateway using ad-hoc
if-statements. As volume grew, validation logic was duplicated across three
services. Three P2 incidents in Q3 2024 were caused by inconsistent validation
between the gateway and the internal payment queue consumer.

## Decision

All payment validation logic lives exclusively in `services/payment-validator/`.
No other service may validate payment fields independently.

The validator exposes a single `validate(PaymentRequest) → ValidationResult` interface.
Callers may not access individual sub-validators (`_validate_amount`, etc.) directly.

### Required validation gates (must all pass before a payment is queued)

| Gate | Rule |
|---|---|
| Amount | Decimal, non-negative, ≤ $1,000,000 |
| Currency | ISO 4217 code, in the supported-currency allow-list |
| Card number | 13–19 digits, passes Luhn check |
| Merchant ID | Non-empty, registered in merchant registry |
| Fraud score | `FraudDetector.score()` result < 0.85 |

### Boundary conditions

- `amount = 0.00` is **valid** (used for refund reversals and authorisation holds).
- `currency_code` comparison is **case-sensitive**; callers must normalise to uppercase.
- Card numbers may contain spaces or dashes; the validator strips them before the Luhn check.

## Consequences

- Single source of truth for validation reduces incident risk.
- All five gates must have deterministic unit tests with ≥ 80 % branch coverage.
- Changes to validation rules require an ADR update before implementation.
