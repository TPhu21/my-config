from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app import app
from templates import TEMPLATES

client = TestClient(app)


def image_blob(color: str) -> bytes:
    out = BytesIO()
    Image.new('RGB', (320, 270), color).save(out, 'PNG')
    return out.getvalue()


@pytest.mark.parametrize('template_id', [t.id for t in TEMPLATES])
def test_all_template_previews(template_id):
    res = client.get(f'/api/v1/templates/{template_id}/preview')
    assert res.status_code == 200, res.text
    assert res.headers['content-type'] == 'image/png'
    with Image.open(BytesIO(res.content)) as im:
        assert im.format == 'PNG'
        assert im.width <= 350
        assert im.height <= 700


def test_templates_catalog_and_ui():
    catalog = client.get('/api/v1/catalog').json()
    assert len(catalog['templates']) == 11
    assert any(t['id'] == 'pb_holo_4cut' for t in catalog['templates'])
    assert len(client.get('/api/v1/ai/effects').json()['effects']) == 6
    assert '/api/v1/templates/pb_vintage/preview' in [t['preview_url'] for t in catalog['templates']]
    homepage = client.get('/').text
    assert 'template_id' in homepage and 'Photobooth' in homepage and 'AI Edit' in homepage


@pytest.mark.parametrize('template_id', ['pb_holo_4cut', 'photobooth_cute', 'pb_vintage'])
@pytest.mark.parametrize('layout,expected_width', [('strip', 436), ('grid', 834)])
def test_make_photobooth_from_template(template_id, layout, expected_width):
    blobs = [image_blob(c) for c in ['#ee6992', '#33a2cf', '#edd47b', '#82bf92']]
    files = [('files', (f'{i}.png', blob, 'image/png')) for i, blob in enumerate(blobs)]
    response = client.post('/api/v1/photobooth', files=files, data={
        'template_id': template_id, 'layout': layout, 'style': 'classic', 'caption': 'For you'
    })
    assert response.status_code == 200, response.text
    with Image.open(BytesIO(response.content)) as img:
        assert img.width == expected_width
        assert img.height > 650


def test_preview_images_are_visually_distinct():
    first = client.get('/api/v1/templates/photobooth_cute/preview').content
    second = client.get('/api/v1/templates/pb_holo_4cut/preview').content
    assert first != second


def test_invalid_template_and_layout():
    assert client.get('/api/v1/templates/nope/preview').status_code == 422
    assert client.get('/api/v1/templates/basic/preview?layout=unknown').status_code == 422
    files = [('files', (f'{i}.png', image_blob('#eeeeee'), 'image/png')) for i in range(4)]
    response = client.post('/api/v1/photobooth', files=files, data={'template_id': 'unknown'})
    assert response.status_code == 422
