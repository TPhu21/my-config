# Native Locket Photobooth — current integration boundary (2026-11-20)

## Preserve working iPhone setup

- Keep the last stable local Shadowrocket `locket-personal.conf` selected.
- Keep all previous experimental PTB catalog, Remote Config and getFilters modules **OFF**. They produced a PTB sheet but interfered with video/Voice and/or VPN stability on the user's iPhone.
- Never put the server's `PHOTOBOOTH_API_KEY`, real login tokens, UID, or CA private keys in a public module or GitHub source.
- Do not redirect the entire `us-central1-locket-4252a.cloudfunctions.net` host (especially `postMomentV2`) to a third-party VPS or a guessed adapter.
- Do not disable certificate validation/pinning to force interception.

## Verified / not verified

Verified from user device screenshots:
- `POST https://api.locketcamera.com/getFilters` ordinarily returned HTTP 200 with `result.data.filters=[]`.
- Combined Remote Config + getFilters **displayed** 10 Photobooth preview entries in Locket.
- Applying a displayed PTB entry returned a client-visible "Không thể áp dụng bộ lọc" error.
- An earlier experimental module caused 45-second/Voice features to disappear and the VPN to disconnect. The user has restored stable VPN behavior.

Unverified:
- Which exact image-generation endpoint the failed PTB action attempted, if any.
- Its HTTP method, request Content-Type, JSON/multipart field names and types.
- Whether the image payload is embedded, uploaded separately or referenced by a signed URL.
- The successful server response envelope accepted by the installed Locket version, and how to deliver the finished asset.
- Locket's native authorization, filter entitlement, and client-side workflow. Our own backend is not a bypass for Locket quotas or subscriber checks.

The reference developer script only redirects `cloudfunctions.net` to a private VPS and alters Remote Config/getFilters. **It does not disclose that VPS's server-side request/response contract.** Recreating the entire native image path based on the script alone would be guesswork.

## Owned-client image processing already available

Hosted API uses `PHOTOBOOTH_REQUIRE_AUTH=1` and server-side `PHOTOBOOTH_API_KEY`. Both require the private `X-API-Key` header. Never publish this key in a module.

### Multipart input

- `POST /api/v1/bridge/render`
- Form fields `file` (PNG/JPEG/WEBP), `filter_id`, optional `layout`, `style`, `caption`.
- Response is `image/png` binary.

### JSON input (NEW)

- `POST /api/v1/bridge/render-json`
- `Content-Type: application/json`
- Input example (replace only with a user-owned synthetic picture, and use a secret header stored by the client):

```json
{
  "filter_id": "photobooth_4cut",
  "image_base64": "<STANDARD_BASE64_IMAGE_BYTES>",
  "layout": "grid",
  "style": "classic",
  "caption": "PHOTOBOOTH"
}
```

- Successful response contains `format`, `filter_id`, `mime_type`, `width`, `height`, `image_base64`; the last field decodes to a real PNG.
- Input validation forbids extra fields (including `authorization`, remote image URL). Image <= 8 MiB; only PNG/JPEG/WEBP, bounded dimensions. Error responses do not echo input values.

These are documented endpoints for **our own clients**. They do **not** claim to match an undocumented Locket API. `GET /api/v1/bridge/contract` deliberately advertises `native_locket_integration=false`.

## Evidence needed before a native adapter is possible

Only in a controlled, user-authorized test, without disturbing the stable personal setup:

1. Record the failed PTB action's image-processing **method, host, path, HTTP status** and request/response **Content-Type**. Do not record account headers.
2. For JSON, record **only the key names and value types**, not values; for multipart only field names and MIME type. No photos, JWTs, installation IDs, URLs with tokens, session IDs or unredacted HAR.
3. Identify whether the real client actually sends an image-generation request. A haptic tap alone is not enough.
4. Obtain a verified allowed test response envelope for the specific native operation before writing an adapter; do not synthesize success statuses that hide server errors.
5. Add contract fixtures and offline tests; protect the working iPhone config throughout.

Do not re-enable the old PTB combined module just to gather evidence if it destabilizes VPN or removes other features. Never direct `postMomentV2` or other unrelated user data to the Photo Studio.
