from io import BytesIO
from types import SimpleNamespace

from fastapi import HTTPException
from fastapi.testclient import TestClient
from PIL import Image

import ai_engine
from app import app

client = TestClient(app)


def image_blob():
    buf = BytesIO()
    Image.new('RGB', (165, 121), '#a7caeb').save(buf, format='PNG')
    return buf.getvalue()


def send(**data):
    return client.post('/api/v1/ai/edit', data=data,
                       files={'file': ('face.png', image_blob(), 'image/png')})


def test_edit_rejects_missing_instruction_and_unknown_effect():
    response = send()
    assert response.status_code == 422
    response = send(effect_id='does_not_exist')
    assert response.status_code == 422
    response = send(prompt='x' * 301)
    assert response.status_code == 422
    response = send(prompt='test', steps='3')
    assert response.status_code == 422


def test_edit_model_missing_returns_clear_503(monkeypatch):
    def unavailable():
        raise HTTPException(503, detail='image model not installed')
    monkeypatch.setattr(ai_engine, 'load_pipeline', unavailable)
    response = send(effect_id='stk_tai_tho')
    assert response.status_code == 503
    assert 'model' in response.json()['detail']


def test_edit_with_mocked_local_pipeline(monkeypatch):
    class FakePipe:
        def __call__(self, prompt, image, num_inference_steps, guidance_scale, image_guidance_scale):
            assert 'bunny' in prompt.lower()
            assert image.width % 8 == 0 and image.height % 8 == 0
            assert num_inference_steps == 20
            return SimpleNamespace(images=[Image.new('RGB', image.size, '#93adce')])
    monkeypatch.setattr(ai_engine, 'load_pipeline', lambda: FakePipe())
    response = send(effect_id='stk_tai_tho')
    assert response.status_code == 200, response.text
    with Image.open(BytesIO(response.content)) as result:
        assert result.format == 'PNG'
        assert result.width % 8 == 0


def test_edit_preserves_api_key_guard(monkeypatch):
    import app as server
    monkeypatch.setattr(server, 'API_KEY', 'very-private-key')
    response = send(prompt='make it softer')
    assert response.status_code == 401
