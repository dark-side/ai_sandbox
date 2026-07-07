"""
Tests for PaymentValidator.

Coverage gaps (intentional — S2 exercise):
  - amount = 0.00 not tested
  - currency_code case sensitivity not tested
  - fraud_detector integration path not tested (only mocked)
  - velocity / repeat-card scenarios not tested
  - JPY decimal mismatch not tested
"""

from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest

from validator import PaymentRequest, PaymentValidator


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _make_request(**overrides) -> PaymentRequest:
    defaults = dict(
        amount="99.99",
        currency_code="USD",
        card_number="4532015112830366",  # valid Luhn
        merchant_id="MERCH_001",
        description="Test payment",
    )
    defaults.update(overrides)
    return PaymentRequest(**defaults)


def _make_validator(fraud_score: float = 0.1) -> PaymentValidator:
    v = PaymentValidator.__new__(PaymentValidator)
    mock_fd = MagicMock()
    mock_fd.score.return_value = fraud_score
    v._fraud_detector = mock_fd
    return v


# ---------------------------------------------------------------------------
# amount validation
# ---------------------------------------------------------------------------

class TestAmountValidation:
    def test_valid_amount(self):
        v = _make_validator()
        result = v.validate(_make_request(amount="100.00"))
        assert result.valid

    def test_negative_amount_rejected(self):
        v = _make_validator()
        result = v.validate(_make_request(amount="-10.00"))
        assert not result.valid
        assert any("negative" in e for e in result.errors)

    def test_amount_exceeds_maximum(self):
        v = _make_validator()
        result = v.validate(_make_request(amount="1000001.00"))
        assert not result.valid
        assert any("maximum" in e for e in result.errors)

    def test_non_numeric_amount_rejected(self):
        v = _make_validator()
        result = v.validate(_make_request(amount="abc"))
        assert not result.valid

    # MISSING: test for amount=0.00 — the boundary condition that breaks
    # the harness when processing refund reversals. (S2 exercise)


# ---------------------------------------------------------------------------
# currency validation
# ---------------------------------------------------------------------------

class TestCurrencyValidation:
    def test_valid_usd(self):
        v = _make_validator()
        result = v.validate(_make_request(currency_code="USD"))
        assert result.valid

    def test_valid_eur(self):
        v = _make_validator()
        result = v.validate(_make_request(currency_code="EUR"))
        assert result.valid

    def test_unsupported_currency_rejected(self):
        v = _make_validator()
        result = v.validate(_make_request(currency_code="XYZ"))
        assert not result.valid
        assert any("Unsupported" in e for e in result.errors)

    def test_empty_currency_rejected(self):
        v = _make_validator()
        result = v.validate(_make_request(currency_code=""))
        assert not result.valid

    # MISSING: test that lowercase "usd" is rejected (or normalised).
    # This is a known edge case that caused a support ticket. (S2 exercise)


# ---------------------------------------------------------------------------
# card number validation
# ---------------------------------------------------------------------------

class TestCardValidation:
    def test_valid_card(self):
        v = _make_validator()
        result = v.validate(_make_request(card_number="4532015112830366"))
        assert result.valid

    def test_invalid_luhn_rejected(self):
        v = _make_validator()
        result = v.validate(_make_request(card_number="4532015112830367"))
        assert not result.valid
        assert any("Luhn" in e for e in result.errors)

    def test_too_short_rejected(self):
        v = _make_validator()
        result = v.validate(_make_request(card_number="123456789012"))
        assert not result.valid

    def test_card_with_spaces_valid(self):
        v = _make_validator()
        result = v.validate(_make_request(card_number="4532 0151 1283 0366"))
        assert result.valid


# ---------------------------------------------------------------------------
# merchant validation
# ---------------------------------------------------------------------------

class TestMerchantValidation:
    def test_valid_merchant(self):
        v = _make_validator()
        result = v.validate(_make_request(merchant_id="MERCH_001"))
        assert result.valid

    def test_empty_merchant_rejected(self):
        v = _make_validator()
        result = v.validate(_make_request(merchant_id=""))
        assert not result.valid

    def test_whitespace_only_merchant_rejected(self):
        v = _make_validator()
        result = v.validate(_make_request(merchant_id="   "))
        assert not result.valid


# ---------------------------------------------------------------------------
# fraud score path — only mocked; no real integration test
# ---------------------------------------------------------------------------

class TestFraudDetectorIntegration:
    def test_high_fraud_score_rejected(self):
        v = _make_validator(fraud_score=0.9)
        result = v.validate(_make_request())
        assert not result.valid
        assert any("fraud" in e.lower() for e in result.errors)

    def test_borderline_fraud_score_accepted(self):
        v = _make_validator(fraud_score=0.84)
        result = v.validate(_make_request())
        assert result.valid

    # MISSING: end-to-end test that calls the real FraudDetector,
    # not a mock. This is the gap that allowed a threshold-change PR
    # to merge without detection. (S2 exercise)
