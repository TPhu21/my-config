# Native PTB integration: verified boundary (2026-11-21)

This branch is diagnostics only. **Do not enable it in Shadowrocket**: it contains
no module and changes neither subscriptions nor camera filtering.

## User-authorized, sanitized HTTP Toolkit evidence

Native client (Locket iOS 2.73.0) POSTs JSON to
`https://api.locketcamera.com/generateFilteredImage`.

- PTB experiment: `filter_id=photobooth_4cut`, `filter_type=normal`,
  `prompt=photobooth_4cut`. HTTP 200, JSON
  `{"result":{"errors":["Unable to load filter data"],"status":400}}`.
- Built-in `bowling_ball`: `filter_type=normal`, text prompt.
  HTTP 200, JSON `{"result":{"errors":["Generation limit reached"],"status":431}}`.

The preceding Firebase Storage upload returned HTTP 200, but that does not
prove the later image generation succeeded. The displayed PTB IDs are not
proven to exist in the official Locket service's filter registry.

**No successful native response example was captured.** Do not invent a JSON
success envelope, spoof entitlements, transform errors into success responses,
or proxy real images / tokens to the Photo Studio.

## Owned engine is a different contract

The deployed Render studio advertises `native_locket_integration=false`.
It accepts authenticated image bytes (multipart or base64) and returns PNG
bytes or its own base64 PNG wrapper. It does not accept the Locket request
shape (`image_url`, `filter_id`, `filter_type`, `prompt`) as a native API.

## Next test required for a real integration

Capture a *successful, authorized* native generation request and response
only on an account with remaining generation quota. Retain method, path,
Content-Type and **field names/types only**; strip image content, JWT,
App Check, device/account IDs, signed URLs and query parameters. Confirm
whether native completion is synchronous or job-based and how the resulting
image is downloaded. Independently verify that any integration is authorized.

The offline classifier `native_ptb_contract.py` and tests intentionally
classify known failures only; unverified success is always `unknown`.
