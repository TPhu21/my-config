from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app import app

client = TestClient(app)


def image_bytes(color: str = "#fd93b2") -> bytes:
    output = BytesIO()
    Image.new("RGB", (240, 180), color).save(output, format="PNG")
    return output.getvalue()


def test_health_and_catalog():
    assert client.get("/health").json()["status"] == "ok"
    assert "strip" in client.get("/api/v1/catalog").json()["layouts"]
    assert client.get("/").status_code == 200


def test_filter_creates_png():
    response = client.post("/api/v1/filter", files={"file": ("a.png", image_bytes(), "image/png")}, data={"style": "vintage"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    with Image.open(BytesIO(response.content)) as result:
        assert result.size == (240, 180)


def test_photobooth_both_layouts():
    for layout, expected_width in [("strip", 436), ("grid", 834)]:
        files = [("files", (f"{i}.png", image_bytes(), "image/png")) for i in range(4)]
        response = client.post("/api/v1/photobooth", files=files, data={"layout": layout, "style": "noir", "caption": "Hello"})
        assert response.status_code == 200, response.text
        with Image.open(BytesIO(response.content)) as result:
            assert result.width == expected_width
            assert result.height > 500


def test_reject_bad_upload_and_count():
    bad = client.post("/api/v1/filter", files={"file": ("x.txt", b"foo", "text/plain")})
    assert bad.status_code == 415
    not_four = client.post("/api/v1/photobooth", files=[("files", ("a.png", image_bytes(), "image/png"))])
    assert not_four.status_code == 422
    bad_style = client.post("/api/v1/filter", files={"file": ("a.png", image_bytes(), "image/png")}, data={"style": "unsupported"})
    assert bad_style.status_code == 422


def test_api_key(monkeypatch):
    import app as server
    monkeypatch.setattr(server, "API_KEY", "example-private-key")
    no_key = client.post("/api/v1/filter", files={"file": ("a.png", image_bytes(), "image/png")})
    assert no_key.status_code == 401
    with_key = client.post("/api/v1/filter", files={"file": ("a.png", image_bytes(), "image/png")}, headers={"X-API-Key": "example-private-key"})
    assert with_key.status_code == 200


def test_ai_missing_package_returns_503(monkeypatch):
    import builtins

    original_import = builtins.__import__

    def without_rembg(name, *args, **kwargs):
        if name == "rembg":
            raise ImportError("Optional AI dependency not installed")
        return original_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", without_rembg)
    response = client.post("/api/v1/ai/remove-background", files={"file": ("a.png", image_bytes(), "image/png")})
    assert response.status_code == 503
    assert "pip install" in response.json()["detail"]


def test_ai_mock_inference(monkeypatch):
    import sys
    import types
    import app as server

    fake = types.ModuleType("rembg")
    fake.remove = lambda image, session: image.convert("RGBA")
    monkeypatch.setitem(sys.modules, "rembg", fake)
    monkeypatch.setattr(server, "ai_session", lambda: object())
    response = client.post("/api/v1/ai/remove-background", files={"file": ("a.png", image_bytes(), "image/png")})
    assert response.status_code == 200
    with Image.open(BytesIO(response.content)) as result:
        assert result.mode == "RGBA"


def test_photobooth_from_one_creates_real_png():
    response = client.post(
        "/api/v1/photobooth/from-one",
        files={"file": ("single.png", image_bytes("#95bcdd"), "image/png")},
        data={"layout": "grid", "style": "vintage", "caption": "ONE SHOT",
              "template_id": "pb_holo_4cut"},
    )
    assert response.status_code == 200, response.text
    assert response.headers["content-type"] == "image/png"
    with Image.open(BytesIO(response.content)) as result:
        assert result.size[0] == 834
        assert result.size[1] > 500


def test_photobooth_from_one_rejects_invalid_input_and_needs_key(monkeypatch):
    bad_id = client.post(
        "/api/v1/photobooth/from-one",
        files={"file": ("one.png", image_bytes(), "image/png")},
        data={"template_id": "not-a-template"},
    )
    assert bad_id.status_code == 422

    import app as server
    monkeypatch.setattr(server, "API_KEY", "test-single-image-key")
    denied = client.post(
        "/api/v1/photobooth/from-one",
        files={"file": ("one.png", image_bytes(), "image/png")},
    )
    assert denied.status_code == 401
    granted = client.post(
        "/api/v1/photobooth/from-one",
        files={"file": ("one.png", image_bytes(), "image/png")},
        headers={"X-API-Key": "test-single-image-key"},
    )
    assert granted.status_code == 200
