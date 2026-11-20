"""JSON processing bridge tests; synthetic pixels only, no Locket traffic."""
import base64
from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

import app as server

client = TestClient(server.app)


def sample_image() -> bytes:
    buf = BytesIO()
    Image.new("RGB", (96, 64), "#64ace4").save(buf, "PNG")
    return buf.getvalue()


def request_body(**changes):
    body = {
        "filter_id": "photobooth_4cut",
        "image_base64": base64.b64encode(sample_image()).decode("ascii"),
        "layout": "grid",
        "style": "pastel",
        "caption": "SYNTHETIC ONLY",
    }
    body.update(changes)
    return body


def test_json_bridge_renders_real_png_and_advertises_independent_contract():
    contract = client.get("/api/v1/bridge/contract").json()
    assert contract["native_locket_integration"] is False
    assert contract["json_bridge"]["native_locket_protocol"] is False
    assert contract["json_bridge"]["path"] == "/api/v1/bridge/render-json"

    response = client.post("/api/v1/bridge/render-json", json=request_body())
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["format"] == "private-photo-studio-json-v1"
    assert result["mime_type"] == "image/png"
    assert result["filter_id"] == "photobooth_4cut"
    assert result["width"] == 834
    assert result["height"] > 500
    binary = base64.b64decode(result["image_base64"], validate=True)
    assert binary.startswith(b"\x89PNG\r\n\x1a\n")
    with Image.open(BytesIO(binary)) as img:
        assert img.size == (result["width"], result["height"])
        assert "exif" not in img.info


def test_json_bridge_strictly_rejects_unsafe_body_data():
    for payload in [
        request_body(filter_id="unknown-filter"),
        request_body(layout="not-a-layout"),
        request_body(style="not-a-style"),
        request_body(image_base64="NOT VALID BASE64!"),
        request_body(image_base64=base64.b64encode(b"not an image").decode("ascii")),
        request_body(authorization="Bearer-DO-NOT-FORWARD"),
        request_body(image_url="https://sensitive.example.com/photo"),
    ]:
        response = client.post("/api/v1/bridge/render-json", json=payload)
        assert response.status_code in {400, 413, 415, 422}, (response.status_code, response.text)
        assert "Bearer-DO-NOT-FORWARD" not in response.text
        assert "sensitive.example.com" not in response.text


def test_json_bridge_auth_blocks_unauthorized_upload(monkeypatch):
    monkeypatch.setattr(server, "API_KEY", "independent-bridge-test-only")
    no_key = client.post("/api/v1/bridge/render-json", json=request_body())
    assert no_key.status_code == 401
    wrong = client.post(
        "/api/v1/bridge/render-json",
        json=request_body(),
        headers={"X-API-Key": "wrong"},
    )
    assert wrong.status_code == 401
    allowed = client.post(
        "/api/v1/bridge/render-json",
        json=request_body(),
        headers={"X-API-Key": "independent-bridge-test-only"},
    )
    assert allowed.status_code == 200
    assert allowed.json()["mime_type"] == "image/png"


def test_json_bridge_rejects_large_payload_without_exposing_content():
    body = request_body(image_base64="A" * (4 * ((server.MAX_UPLOAD_BYTES + 2) // 3) + 4))
    response = client.post("/api/v1/bridge/render-json", json=body)
    assert response.status_code in {413, 422}
    assert len(response.content) < 2000
