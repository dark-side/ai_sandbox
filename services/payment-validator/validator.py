"""
Payment validation service for PayFlow.

Validates incoming payment requests before they are submitted to the
processing pipeline. Called by the API gateway on every POST /payments request.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Optional

from fraud_detector import FraudDetector

SUPPORTED_CURRENCIES = {"USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF"}
MAX_AMOUNT = Decimal("1000000.00")
CARD_PATTERN = re.compile(r"^\d{13,19}$")


@dataclass
class PaymentRequest:
    amount: str
    currency_code: str
    card_number: str
    merchant_id: str
    description: Optional[str] = None


@dataclass
class ValidationResult:
    valid: bool
    errors: list[str]
    fraud_score: Optional[float] = None


class PaymentValidator:
    def __init__(self) -> None:
        self._fraud_detector = FraudDetector()

    def validate(self, request: PaymentRequest) -> ValidationResult:
        errors: list[str] = []

        errors.extend(self._validate_amount(request.amount))
        errors.extend(self._validate_currency(request.currency_code))
        errors.extend(self._validate_card(request.card_number))
        errors.extend(self._validate_merchant(request.merchant_id))

        if errors:
            return ValidationResult(valid=False, errors=errors)

        fraud_score = self._fraud_detector.score(
            amount=Decimal(request.amount),
            currency=request.currency_code,
            card_number=request.card_number,
            merchant_id=request.merchant_id,
        )

        if fraud_score > 0.85:
            errors.append(f"Transaction flagged by fraud detector (score={fraud_score:.2f})")
            return ValidationResult(valid=False, errors=errors, fraud_score=fraud_score)

        return ValidationResult(valid=True, errors=[], fraud_score=fraud_score)

    # ------------------------------------------------------------------
    # private helpers
    # ------------------------------------------------------------------

    def _validate_amount(self, raw: str) -> list[str]:
        try:
            amount = Decimal(raw)
        except InvalidOperation:
            return [f"Invalid amount format: '{raw}'"]

        # BUG: no check for amount == 0.00 (boundary condition — S2 exercise)
        if amount < Decimal("0"):
            return ["Amount must not be negative"]

        if amount > MAX_AMOUNT:
            return [f"Amount {amount} exceeds maximum allowed {MAX_AMOUNT}"]

        return []

    def _validate_currency(self, code: str) -> list[str]:
        if not code:
            return ["Currency code is required"]
        # BUG: no normalisation — "usd" is rejected (edge case — S2 exercise)
        if code not in SUPPORTED_CURRENCIES:
            return [f"Unsupported currency code: '{code}'"]
        return []

    def _validate_card(self, number: str) -> list[str]:
        stripped = number.replace(" ", "").replace("-", "")
        if not CARD_PATTERN.match(stripped):
            return ["Card number must be 13–19 digits"]
        if not self._luhn_check(stripped):
            return ["Card number failed Luhn check"]
        return []

    def _validate_merchant(self, merchant_id: str) -> list[str]:
        if not merchant_id or len(merchant_id.strip()) == 0:
            return ["Merchant ID is required"]
        return []

    @staticmethod
    def _luhn_check(number: str) -> bool:
        digits = [int(d) for d in number]
        digits.reverse()
        total = 0
        for i, digit in enumerate(digits):
            if i % 2 == 1:
                digit *= 2
                if digit > 9:
                    digit -= 9
            total += digit
        return total % 10 == 0
