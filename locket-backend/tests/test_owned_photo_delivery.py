"""Owned client JSON -> JPEG delivery; no Locket request forwarding."""
from io import BytesIO
from urllib.parse import urlsplit
from fastapi.testclient import TestClient
from PIL import Image
import app
import owned_photo_delivery as delivery

def synthetic_png():
    out=BytesIO()
    Image.new("RGB",(128,96),"#6d86d6").save(out,"PNG")
    return out.getvalue()

def test_secure_create_and_jpeg_download(monkeypatch):
    monkeypatch.setattr(app,"API_KEY","test-nonproduction-secret")
    monkeypatch.setattr(app,"REQUIRE_AUTH",True)
    delivery._store.clear()
    client=TestClient(app.app)
    payload={"template_id":"photobooth_4cut","caption":"LOCAL TEST"}
    files={"file":("synthetic.png",synthetic_png(),"image/png")}
    forbidden=client.post("/api/v1/owned-photo/render",data=payload,files=files)
    assert forbidden.status_code == 401
    result=client.post("/api/v1/owned-photo/render",data=payload,files=files,
                       headers={"X-API-Key":"test-nonproduction-secret"})
    assert result.status_code == 200, result.text
    document=result.json()
    assert document["format"] == "private-photo-studio-delivery-v1"
    assert document["native_locket_integration"] is False
    assert document["mime_type"] == "image/jpeg"
    assert document["status"] == 200
    assert "test-nonproduction-secret" not in result.text
    path=urlsplit(document["image_url"]).path
    image=client.get(path)
    assert image.status_code == 200
    assert image.headers["content-type"] == "image/jpeg"
    assert image.content[:3] == bytes([255, 216, 255])
    with Image.open(BytesIO(image.content)) as photo:
        assert photo.format == "JPEG"
        assert photo.size == (834,714)
    assert client.get("/api/v1/owned-photo/images/not-a-token").status_code == 404

def test_expiration_and_template_validation(monkeypatch):
    monkeypatch.setattr(app,"API_KEY","test-nonproduction-secret")
    delivery._store.clear()
    client=TestClient(app.app)
    header={"X-API-Key":"test-nonproduction-secret"}
    wrong=client.post("/api/v1/owned-photo/render",data={"template_id":"random"},
        files={"file":("synthetic.png",synthetic_png(),"image/png")},headers=header)
    assert wrong.status_code == 422
    result=client.post("/api/v1/owned-photo/render",
        files={"file":("synthetic.png",synthetic_png(),"image/png")},headers=header)
    assert result.status_code == 200
    path=urlsplit(result.json()["image_url"]).path
    entry=next(iter(delivery._store.values()))
    monkeypatch.setattr(delivery.time,"monotonic",lambda:entry.expires_at+1)
    assert client.get(path).status_code == 404

def test_pinned_public_origin_ignores_host_header(monkeypatch):
    monkeypatch.setattr(app, "API_KEY", "offline-only")
    monkeypatch.setattr(app, "REQUIRE_AUTH", True)
    monkeypatch.setenv("PHOTOBOOTH_PUBLIC_BASE_URL", "https://phu-private-photo-studio-staging.onrender.com")
    delivery._store.clear()
    client=TestClient(app.app, base_url="https://untrusted.example")
    response=client.post(
        "/api/v1/owned-photo/render",
        headers={"X-API-Key":"offline-only", "Host":"evil.invalid"},
        files={"file":("s.png",synthetic_png(),"image/png")},
    )
    assert response.status_code == 200
    url=response.json()["image_url"]
    assert url.startswith("https://phu-private-photo-studio-staging.onrender.com/api/v1/owned-photo/images/")
    assert "evil.invalid" not in url

def test_reject_public_request_without_pinned_origin(monkeypatch):
    monkeypatch.setattr(app, "API_KEY", "offline-only")
    monkeypatch.setattr(app, "REQUIRE_AUTH", True)
    monkeypatch.delenv("PHOTOBOOTH_PUBLIC_BASE_URL", raising=False)
    client=TestClient(app.app, base_url="https://untrusted.example")
    response=client.post("/api/v1/owned-photo/render",
        headers={"X-API-Key":"offline-only"},
        files={"file":("s.png",synthetic_png(),"image/png")})
    assert response.status_code == 503

def test_reject_insecure_or_malformed_origin_config(monkeypatch):
    monkeypatch.setattr(app, "API_KEY", "offline-only")
    monkeypatch.setattr(app, "REQUIRE_AUTH", True)
    client=TestClient(app.app)
    for unsafe in ("http://example.com", "https://example.com/x",
                   "https://name:password@example.com", "https://example.com/?token=x"):
        monkeypatch.setenv("PHOTOBOOTH_PUBLIC_BASE_URL", unsafe)
        response=client.post("/api/v1/owned-photo/render",
            headers={"X-API-Key":"offline-only"},
            files={"file":("s.png",synthetic_png(),"image/png")})
        assert response.status_code == 503
