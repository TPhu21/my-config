"""Regression tests using only synthetic/sanitized HTTP Toolkit observations."""
from native_ptb_contract import classify_response


def test_unregistered_ptb_filter_is_not_a_success():
    assert classify_response(200, {"result": {
        "errors": ["Unable to load filter data"], "status": 400
    }}) == {"outcome": "failure", "reason": "filter-data-unavailable"}


def test_native_generation_limit_is_not_a_success():
    assert classify_response(200, {"result": {
        "errors": ["Generation limit reached"], "status": 431
    }}) == {"outcome": "failure", "reason": "generation-limit"}


def test_no_invented_success_schema():
    assert classify_response(200, {"result": {"errors": [], "status": 200}}) == {
        "outcome": "unknown", "reason": "native-success-contract-unverified"
    }


def test_unknown_envelope_does_not_claim_success():
    assert classify_response(200, {"image_url": "redacted"})["outcome"] == "unknown"
    assert classify_response(500, "server error")["outcome"] == "unknown"


def test_unrecognized_error_is_distinguished():
    assert classify_response(200, {"result": {
        "errors": ["Synthetic failure"], "status": 422
    }}) == {"outcome": "failure", "reason": "other-server-error"}
