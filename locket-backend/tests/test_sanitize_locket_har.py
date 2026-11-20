import json
from sanitize_locket_har import summarize

def test_sanitizer_drops_all_values_and_unrelated_traffic():
    secret = "SUPER_PRIVATE_JWT_OR_IMAGE"
    har = {"log": {"entries": [
        {
            "request": {
                "url": "https://api.locketcamera.com/generateFilteredImage?authorization=" + secret,
                "method": "POST",
                "headers": [{"name": "Content-Type", "value": "application/json"},
                            {"name": "Authorization", "value": "Bearer " + secret}],
                "postData": {"text": json.dumps({
                    "filter_id": secret,
                    "image": secret,
                    "authorization": secret,
                    "nested": {"private": secret},
                    "result": {"image_url": secret, "access_token": secret}
                })},
            },
            "response": {
                "status": 200,
                "headers": [{"name": "Content-Type", "value": "application/json"}],
                "content": {"text": json.dumps({"result": {"imageUrl": secret}, "token": secret})},
            },
        },
        {
            "request": {"url": "https://api.locketcamera.com/getAccount", "method": "GET"},
            "response": {"status": 200},
        },
        {
            "request": {"url": "https://untrusted.example.com/generateFilteredImage", "method": "POST"},
            "response": {"status": 200},
        }
    ]}}
    result = summarize(har)
    assert len(result) == 1
    row = result[0]
    assert row["action"] == "generateFilteredImage"
    assert row["status"] == 200
    assert row["request_schema"]["image"] == "string"
    assert row["request_schema"]["filter_id"] == "string"
    assert "authorization" not in row["request_schema"]
    assert "nested" not in row["request_schema"]
    assert row["response_schema"]["result"]["imageUrl"] == "string"
    report = json.dumps(result)
    assert secret not in report
    assert "Bearer" not in report
    assert "?" not in report

def test_sanitizer_skips_bodies_not_json():
    har = {"log": {"entries": [{
        "request": {
            "url": "https://us-central1-locket-4252a.cloudfunctions.net/generateFilteredImage",
            "method": "POST",
            "headers": [{"name": "Content-Type", "value": "multipart/form-data; boundary=ABC"}],
            "postData": {"text": "PRIVATE_IMAGE_BYTES"},
        },
        "response": {"status": 201, "headers": [{"name": "Content-Type", "value": "image/png"}],
                     "content": {"text": "PRIVATE_IMAGE_BYTES"}},
    }]}}
    report = json.dumps(summarize(har))
    assert "PRIVATE_IMAGE_BYTES" not in report
    assert "not-inspected" in report
