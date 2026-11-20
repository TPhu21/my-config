# Owned Photo Studio: JSON -> short-lived JPEG URL

This optional endpoint is designed for **our own authorized clients**, not
the Locket iOS application. It does not emulate the official undocumented
`generateFilteredImage` protocol, perform host rewrites, grant Gold, read
Firebase images, proxy image URLs, or accept Locket authentication tokens.

## API

`POST /api/v1/owned-photo/render`
- `multipart/form-data`: required `file` (JPEG/PNG/WebP; 8 MB max),
  `template_id` (one of the existing original studio templates), optional
  `layout`, `style`, `caption`.
- `X-API-Key`: required when `PHOTOBOOTH_REQUIRE_AUTH=1` and
  `PHOTOBOOTH_API_KEY` is set on the backend; do not commit this key.
- Returns JSON `{ "format":"private-photo-studio-delivery-v1",
  "status":200, "image_url":"...", "mime_type":"image/jpeg",
  "expires_in_seconds":600, "native_locket_integration":false }`.
- The HTTPS `image_url` is a short-lived, bearer-capability URL. Whoever has it
  can fetch the image until expiration. Keep response URLs private.

`GET /api/v1/owned-photo/images/{token}`
- Returns `image/jpeg`, HTTP 200 for a valid token; 404 otherwise.
- No client API key in the download URL. Tokens are random and not
  reusable after expiration.
- Storage is in-memory, maximum 16 JPEGs at a time / 4 MB each / TTL 10
  minutes. A worker restart, multiple processes or memory eviction invalidates
  links. **This is a single-process proof of concept, not durable storage**.

### Test with a synthetic or own image

```powershell
$env:PHOTOBOOTH_API_KEY = "<YOUR_PRIVATE_KEY>"
curl.exe -X POST "http://127.0.0.1:8000/api/v1/owned-photo/render" `
  -H "X-API-Key: $env:PHOTOBOOTH_API_KEY" `
  -F "file=@C:\\Pictures\\owned-test.png" `
  -F "template_id=photobooth_4cut"
```

Parse `image_url` from the JSON and GET it in your browser. When deployed
externally, serve only over HTTPS and set a canonical public URL at your
reverse proxy. Avoid copying full image URLs into public logs or chats.

## Current status

- Built only on `feature/ptb-native-contract-diagnostics`.
- Not on `main`, not deployed to Render; `render.yaml` still deploys
  `main`.
- No changes to Shadowrocket modules, Gold feature flags or PTB routing.
- Does not prove native Locket compatibility.
