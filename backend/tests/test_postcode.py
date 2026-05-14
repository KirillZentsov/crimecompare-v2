"""Tests for postcode validation and normalization (no DB calls)."""
import pytest
from app.services.postcode_lookup import (
    PostcodeAutocomplete,
    is_valid_postcode,
    normalize_postcode,
    to_search_key,
)

ac = PostcodeAutocomplete()


class TestNormalize:
    def test_adds_space_before_last_three(self):
        assert normalize_postcode("CO27QG") == "CO2 7QG"

    def test_preserves_existing_space(self):
        assert normalize_postcode("CO2 7QG") == "CO2 7QG"

    def test_uppercases(self):
        assert normalize_postcode("co2 7qg") == "CO2 7QG"

    def test_strips_whitespace(self):
        assert normalize_postcode("  CO2 7QG  ") == "CO2 7QG"

    def test_empty_returns_empty(self):
        assert normalize_postcode("") == ""


class TestToSearchKey:
    def test_removes_space(self):
        assert to_search_key("CO2 7QG") == "CO27QG"

    def test_uppercases(self):
        assert to_search_key("co2 7qg") == "CO27QG"

    def test_already_no_space(self):
        assert to_search_key("DE11TQ") == "DE11TQ"

    def test_empty_returns_empty(self):
        assert to_search_key("") == ""


class TestValidateFormat:
    @pytest.mark.parametrize("postcode", [
        "CO2 7QG",
        "DE1 1TQ",
        "SW1A 1AA",
        "EC1A 1BB",
        "W1A 0AX",
        "M1 1AE",
        "B1 1BB",
    ])
    def test_valid_postcodes(self, postcode):
        valid, err = ac.validate_format(postcode)
        assert valid is True
        assert err is None

    @pytest.mark.parametrize("postcode,reason", [
        ("", "empty"),
        ("   ", "whitespace only"),
        ("ABC", "too short"),
        ("12345678", "too long"),
        ("1234 5AB", "starts with digit"),
        ("ABCD EFG", "wrong format"),
    ])
    def test_invalid_postcodes(self, postcode, reason):
        valid, err = ac.validate_format(postcode)
        assert valid is False, f"Expected invalid for: {reason}"
        assert err is not None


class TestIsValidPostcode:
    def test_valid(self):
        assert is_valid_postcode("CO2 7QG") is True

    def test_invalid(self):
        assert is_valid_postcode("NOTAPOSTCODE") is False

    def test_empty(self):
        assert is_valid_postcode("") is False
