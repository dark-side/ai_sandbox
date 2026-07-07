"""
Fraud detection service — downstream dependency of the payment validator.

This module was the subject of the incident last week: a PR changed the
scoring threshold without any integration tests catching it, which caused
all transactions to be incorrectly flagged as fraudulent.

Coverage is currently 34 % (below the 80 % threshold). No integration
test exists that calls validator.py → fraud_detector.py end-to-end.
"""

from __future__ import annotations

import hashlib
import time
from decimal import Decimal
from typing import Optional


_HIGH_RISK_MERCHANTS = {
    "MERCH_TEST_001",
    "MERCH_SUSPENDED_042",
    "MERCH_REVIEW_107",
}

_VELOCITY_WINDOW_SECONDS = 300  # 5-minute rolling window
_VELOCITY_THRESHOLD = 5          # max transactions per window per card


class FraudDetector:
    """
    Lightweight rule-based fraud scorer.

    Returns a float in [0.0, 1.0].  Scores above 0.85 should be rejected
    by the caller (see validator.py).

    NOTE: This class is stateful (velocity tracking uses an in-process dict).
    In production it would use Redis.  The in-process store means tests that
    run in sequence can bleed state into each other — another reason integration
    tests are critical here.
    """

    def __init__(self) -> None:
        self._velocity_store: dict[str, list[float]] = {}

    def score(
        self,
        amount: Decimal,
        currency: str,
        card_number: str,
        merchant_id: str,
        timestamp: Optional[float] = None,
    ) -> float:
        ts = timestamp or time.time()
        card_key = self._hash_card(card_number)

        score = 0.0
        score += self._score_amount(amount)
        score += self._score_merchant(merchant_id)
        score += self._score_velocity(card_key, ts)
        score += self._score_currency_mismatch(currency, amount)

        return min(score, 1.0)

    # ------------------------------------------------------------------
    # scoring rules — each returns a partial score in [0.0, 0.4]
    # ------------------------------------------------------------------

    def _score_amount(self, amount: Decimal) -> float:
        if amount > Decimal("50000"):
            return 0.4
        if amount > Decimal("10000"):
            return 0.2
        if amount > Decimal("5000"):
            return 0.1
        return 0.0

    def _score_merchant(self, merchant_id: str) -> float:
        if merchant_id in _HIGH_RISK_MERCHANTS:
            return 0.4
        return 0.0

    def _score_velocity(self, card_key: str, ts: float) -> float:
        window_start = ts - _VELOCITY_WINDOW_SECONDS
        history = self._velocity_store.get(card_key, [])
        history = [t for t in history if t > window_start]
        history.append(ts)
        self._velocity_store[card_key] = history

        count = len(history)
        if count > _VELOCITY_THRESHOLD * 2:
            return 0.4
        if count > _VELOCITY_THRESHOLD:
            return 0.2
        return 0.0

    def _score_currency_mismatch(self, currency: str, amount: Decimal) -> float:
        # Heuristic: JPY amounts should never have decimal places
        if currency == "JPY" and amount != amount.to_integral_value():
            return 0.15
        return 0.0

    # ------------------------------------------------------------------

    @staticmethod
    def _hash_card(card_number: str) -> str:
        return hashlib.sha256(card_number.encode()).hexdigest()[:16]
