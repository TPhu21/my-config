# Locket native PTB integration — feasibility gate

Checked 2026-11-21. Target: choose custom PTB directly inside the official
Locket iOS camera, capture, render, and show the generated result.

## Verified

- Owned Render staging API: authenticated multipart image upload, JSON response
  with HTTPS URL and `image/jpeg` GET. Synthetic upload end-to-end passed.
- Third-party PTB observer: `generateFilteredImage` returns JSON with
  several aliases of one HTTPS image URL. A subsequent `GET /ai-filters/...`
  returned HTTP 200 `image/jpeg`. This proves the observed third-party route
  delivers an image, **not** that the owned Render service can supply it.
- Companion web UI already has `navigator.share({files:[...]})` in Safari
  and a Photos export fallback. The Locket iOS share extension has **not**
  appeared in user testing, so do not claim direct share integration.

## Missing for native

1. An official/custom-filter registration mechanism or an independently
   verified, authorized integration contract. No public developer SDK for
   registering custom camera/PTB filters was located on official Locket pages.
2. Explicit, permitted delivery of source photo bytes to the owned backend.
   The current Locket request appears to use a remote image reference, while
   the backend accepts authenticated multipart bytes.
3. An iOS end-to-end demonstration where **Locket itself** selects a custom
   template and displays the owned backend output.

## Decision

- **NO GO** for modifying the main Shadowrocket module or forwarding
  Locket account data/photos to an arbitrary external VPS.
- Keep the known-good Locket module and production backend unchanged.
- The only operational route today is the independently hosted companion UI
  with PNG export, then an import through Locket's existing Camera Roll
  feature if the user's account supports it. This is **not native PTB**.
- Reconsider native integration if Locket publishes a supported developer
  mechanism or grants explicit written integration permission.

Official contacts/source:
- https://locket.camera/
- https://apps.apple.com/vn/app/locket-widget/id1600525061
- Support address listed on App Store: help@locketcamera.com

This file is a technical decision, not an assertion that undocumented features
cannot ever work.
