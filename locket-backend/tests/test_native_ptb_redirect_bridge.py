"""Synthetic tests for experimental native request->JPEG bridge; no Locket calls."""
import json
from urllib.parse import urlsplit

from fastapi.testclient import TestClient
from PIL import Image

import app
import native_ptb_redirect_bridge as bridge
import owned_photo_delivery


def test_redirect_disabled_by_default(monkeypatch):
    monkeypatch.delenv("PHOTOBOOTH_NATIVE_BRIDGE_ENABLED", raising=False)
    response = TestClient(app.app).post("/generateFilteredImage", json={
        "filter_id": "photobooth_4cut",
        "filter_type": "normal",
        "image_url": "https://firebasestorage.googleapis.com/test.jpg"
    })
    assert response.status_code == 503
    assert TestClient(app.app).get("/native-ptb/status").json()["bridge_enabled"] is False


def test_accepts_signed_photo_url_renders_own_image_and_json(monkeypatch):
    monkeypatch.setenv("PHOTOBOOTH_NATIVE_BRIDGE_ENABLED", "1")
    monkeypatch.setenv("PHOTOBOOTH_PUBLIC_BASE_URL",
                       "https://phu-private-photo-studio-staging.onrender.com")
    owned_photo_delivery._store.clear()
    async def fake_fetch(url):
        assert url.startswith("https://firebasestorage.googleapis.com/")
        return Image.new("RGB", (60, 40), (255, 50, 20))
    monkeypatch.setattr(bridge, "_fetch_photo", fake_fetch)
    bridge._hits.clear()
    client = TestClient(app.app)
    response = client.post("/generateFilteredImage", json={
        "filter_id": "photobooth_4cut",
        "filter_type": "normal",
        "image_url": "https://firebasestorage.googleapis.com/test.jpg?token=TEST",
        "prompt": "photobooth_4cut"
    })
    assert response.status_code == 200, response.text
    result = response.json()
    urls = [result["image_url"], result["result"]["image_url"],
            result["result"]["data"]["image_url"]]
    assert len(set(urls)) == 1
    assert result["native_locket_integration"] is False
    image = client.get(urlsplit(urls[0]).path)
    assert image.status_code == 200
    assert image.headers["content-type"].startswith("image/jpeg")
    assert image.content.startswith(b"\xff\xd8\xff")


def test_rejects_other_filters_and_arbitrary_host(monkeypatch):
    monkeypatch.setenv("PHOTOBOOTH_NATIVE_BRIDGE_ENABLED", "1")
    client = TestClient(app.app)
    other_filter = client.post("/generateFilteredImage", json={
        "filter_id": "bowling_ball", "filter_type": "normal",
        "image_url": "https://firebasestorage.googleapis.com/photo.jpg"
    })
    assert other_filter.status_code == 422
    arbitrary_url = client.post("/generateFilteredImage", json={
        "filter_id": "photobooth_4cut", "filter_type": "normal",
        "image_url": "https://evil.example/photo.jpg"
    })
    assert arbitrary_url.status_code == 422


def test_rejects_sensitive_local_urls(monkeypatch):
    for bad in ("http://127.0.0.1/a", "https://127.0.0.1/a",
                "https://firebasestorage.googleapis.com.evil.test/x",
                "https://user:pw@storage.googleapis.com/a",
                "https://storage.googleapis.com:1234/a"):
        try:
            bridge._image_source_url(bad)
        except Exception as exc:
            assert getattr(exc, "status_code", None) == 422
        else:
            raise AssertionError("Unexpectedly accepted: " + bad)
