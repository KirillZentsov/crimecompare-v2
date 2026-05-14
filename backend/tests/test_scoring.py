"""Tests for risk_score calculation and crime summarization."""
import pytest
from app.services.crime_api import summarize_crimes, CRIME_WEIGHTS


def make_events(category: str, count: int) -> list[dict]:
    return [{"category": category} for _ in range(count)]


class TestRiskScore:
    def test_empty_events_returns_zero(self):
        result = summarize_crimes([])
        assert result["risk_score"] == 0
        assert result["total_crimes"] == 0

    def test_risk_score_capped_at_100(self):
        # 1000 violence events × weight 10 → well over 100
        events = make_events("violence-and-sexual-offences", 1000)
        result = summarize_crimes(events)
        assert result["risk_score"] == 100

    def test_risk_score_formula(self):
        # 80 violence events × weight 10 = weighted_sum 800
        # risk = min(100, 800/80 * 100) = min(100, 1000) = 100
        events = make_events("violence-and-sexual-offences", 80)
        result = summarize_crimes(events)
        assert result["risk_score"] == 100

    def test_risk_score_low(self):
        # 1 shoplifting × weight 1 = weighted_sum 1
        # risk = min(100, 1/80 * 100) = ~1
        events = make_events("shoplifting", 1)
        result = summarize_crimes(events)
        assert result["risk_score"] == round(min(100, (1 / 80) * 100))

    def test_risk_score_mixed_categories(self):
        events = make_events("robbery", 10) + make_events("shoplifting", 10)
        # weighted = 10*9 + 10*1 = 100
        # risk = min(100, 100/80 * 100) = min(100, 125) = 100
        result = summarize_crimes(events)
        assert result["weighted_sum"] == 100
        assert result["risk_score"] == 100

    def test_by_category_counts(self):
        events = make_events("burglary", 5) + make_events("drugs", 3)
        result = summarize_crimes(events)
        assert result["by_category"]["burglary"] == 5
        assert result["by_category"]["drugs"] == 3
        assert result["total_crimes"] == 8

    def test_unknown_category_uses_weight_1(self):
        events = make_events("unknown-future-category", 80)
        # weight fallback = 1, weighted_sum = 80
        # risk = min(100, 80/80 * 100) = 100
        result = summarize_crimes(events)
        assert result["weighted_sum"] == 80
        assert result["risk_score"] == 100

    def test_top_categories_limit(self):
        events = (
            make_events("burglary", 10)
            + make_events("drugs", 5)
            + make_events("shoplifting", 3)
            + make_events("robbery", 1)
        )
        result = summarize_crimes(events)
        assert len(result["top_categories"]) == 3

    def test_crime_weights_completeness(self):
        # All weights must be positive integers
        for category, weight in CRIME_WEIGHTS.items():
            assert isinstance(weight, int), f"{category} weight is not int"
            assert weight > 0, f"{category} weight must be positive"
