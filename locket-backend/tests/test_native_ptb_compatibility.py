from native_ptb_compatibility import assess_compatibility


def test_sampled_ptb_request_discloses_only_allowlisted_filter():
    result = assess_compatibility({
        "filter_id": "photobooth_4cut", "filter_type": "normal",
        "image_url": "https://private.example/photo?token=DO-NOT-LEAK",
        "analytics": {"installation_id": "SECRET"},
        "authorization": "Bearer-SECRET",
    })
    assert result["compatible"] is False
    assert result["reason"] == "native-contract-not-implemented"
    assert result["filter_id"] == "photobooth_4cut"
    assert set(result["missing"]) == {
        "authorized-image-acquisition",
        "verified-native-success-response",
        "verified-native-image-delivery",
    }
    assert "SECRET" not in repr(result)
    assert "DO-NOT-LEAK" not in repr(result)


def test_unrecognized_filter_id_does_not_leak_it():
    result = assess_compatibility({
        "filter_id": "secret-filter-id", "filter_type": "normal",
        "image_url": "https://private.example/photo?token=secret",
    })
    assert result == {"compatible": False, "reason": "unsupported-filter-id"}


def test_rejects_unverified_shapes():
    assert assess_compatibility(None)["reason"] == "not-json-object"
    assert assess_compatibility({"filter_id": "photobooth_4cut",
                                 "filter_type": "magic",
                                 "image_url": "x"})["reason"] == "unverified-filter-type"
    assert assess_compatibility({"filter_id": "photobooth_4cut",
                                 "filter_type": "normal"})["reason"] == "no-image-reference"
