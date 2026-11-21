"""Network- and credential-free tests of opt-in Locket SDK bridge."""
import sys
from pathlib import Path
from types import SimpleNamespace
import pytest
import local_locket_sdk_bridge as bridge


def test_validate_owned_https_origin():
    assert bridge.validate_base_url(bridge.DEFAULT_BASE) == bridge.DEFAULT_BASE
    for bad in ("http://example.com", "https://user:pw@example.com",
                "https://example.com/a", "https://example.com/?token=foo"):
        with pytest.raises(ValueError):
            bridge.validate_base_url(bad)


def test_process_owned_image_uses_own_host_and_validates_jpeg(monkeypatch):
    calls = []
    result_url = bridge.DEFAULT_BASE + "/api/v1/owned-photo/images/fake-test-token"
    def post(url, **kwargs):
        calls.append(("post", url, kwargs))
        return SimpleNamespace(
            raise_for_status=lambda:None,
            json=lambda: {"format":"private-photo-studio-delivery-v1",
                          "mime_type":"image/jpeg", "image_url":result_url}
        )
    def get(url, **kwargs):
        calls.append(("get", url, kwargs))
        return SimpleNamespace(
            raise_for_status=lambda:None,
            headers={"Content-Type":"image/jpeg"},
            content=bytes([255,216,255,10,20,30])
        )
    monkeypatch.setitem(sys.modules, "requests", SimpleNamespace(post=post, get=get))
    image = bridge.process_owned_image(bytes([1,2,3]), "offline-test-key",
                                      bridge.DEFAULT_BASE, "photobooth_4cut")
    assert image.startswith(bytes([255,216,255]))
    assert [c[0] for c in calls] == ["post", "get"]
    assert calls[0][2]["headers"]["X-API-Key"] == "offline-test-key"
    assert calls[0][2]["allow_redirects"] is False
    assert calls[1][2]["allow_redirects"] is False


def test_sdk_not_loaded_without_explicit_confirm(tmp_path):
    test_img = tmp_path / "fake.jpg"
    test_img.write_bytes(bytes([255,216,255]))
    with pytest.raises(ValueError, match="explicit"):
        bridge.publish_owned_image(test_img, tmp_path / "sdk-session.json", False)


def test_private_self_only_sdk_post_requires_existing_session(monkeypatch, tmp_path):
    image = tmp_path / "generated.jpg"
    image.write_bytes(bytes([255,216,255]))
    session = tmp_path / "local-sdk-session.json"
    session.write_text('{"offline":"fake"}')
    posts=[]
    class Client:
        def __init__(self, session_path):
            assert session_path == str(session)
            self.moments = SimpleNamespace(post=lambda **kw: posts.append(kw))
        def is_authenticated(self): return True
    monkeypatch.setitem(sys.modules, "locketlam", SimpleNamespace(LocketClient=Client))
    bridge.publish_owned_image(image,session,True)
    assert posts == [{"image":str(image),"is_private":True}]


def test_unexpected_external_image_url_is_blocked(monkeypatch):
    def post(url, **kwargs):
        return SimpleNamespace(
            raise_for_status=lambda:None,
            json=lambda: {"format":"private-photo-studio-delivery-v1",
                          "mime_type":"image/jpeg",
                          "image_url":"https://external.example/ai-filters/x"}
        )
    monkeypatch.setitem(sys.modules, "requests", SimpleNamespace(
        post=post, get=lambda *a,**k: pytest.fail("must not fetch external URL")))
    with pytest.raises(ValueError, match="unexpected image URL"):
        bridge.process_owned_image(b"abc", "offline", bridge.DEFAULT_BASE,"photobooth_4cut")
