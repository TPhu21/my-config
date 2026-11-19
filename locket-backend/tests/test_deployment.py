"""Regression checks for the iPhone app and safe cloud hosting."""
from io import BytesIO
import app as server
from fastapi.testclient import TestClient
from PIL import Image

client = TestClient(server.app)

def png():
    output=BytesIO()
    Image.new("RGB",(32,32),"salmon").save(output,format="PNG")
    return output.getvalue()

def test_manifest_icon_share():
    m=client.get("/manifest.webmanifest")
    assert m.status_code==200
    assert m.json()["display"]=="standalone"
    assert m.json()["start_url"]=="/"
    icon=client.get("/favicon.svg")
    assert icon.status_code==200 and b"<svg" in icon.content
    page=client.get("/").text
    assert "manifest.webmanifest" in page
    assert "navigator.share" in page
    assert "ios-share" in page

def test_cloud_require_api_key_configured(monkeypatch):
    monkeypatch.setattr(server, "REQUIRE_AUTH", True)
    monkeypatch.setattr(server, "API_KEY", "")
    r=client.post("/api/v1/filter",files={"file":("test.png",png(),"image/png")})
    assert r.status_code==503
    assert "PHOTOBOOTH_API_KEY" in r.text
    assert client.get("/health").status_code==200

def test_cloud_rejects_missing_key(monkeypatch):
    monkeypatch.setattr(server, "REQUIRE_AUTH", True)
    monkeypatch.setattr(server, "API_KEY", "my-testing-secret")
    assert client.post("/api/v1/filter",files={"file":("test.png",png(),"image/png")}).status_code==401
    assert client.post("/api/v1/filter",files={"file":("test.png",png(),"image/png")},headers={"X-API-Key":"my-testing-secret"}).status_code==200

def test_cloud_rejects_oversize_payload(monkeypatch):
    monkeypatch.setattr(server, "REQUIRE_AUTH", True)
    monkeypatch.setattr(server, "API_KEY", "my-testing-secret")
    r=client.post("/api/v1/filter",
       files={"file":("test.png",png(),"image/png")},
       headers={"X-API-Key":"my-testing-secret","Content-Length":str(server.MAX_REQUEST_BYTES+1)})
    assert r.status_code==413
