# PTB → Locket with unofficial Python SDK (optional, local only)

This integration uses the open-source `locketlam` Python client to **post a
generated image into your own Locket feed**. It does not install a filter
inside the official Locket camera. Do not mistake post-upload integration
for native camera support.

Third-party SDK references:
- https://github.com/leanhminh2104/locketlam — supports `client.moments.post(image=..., is_private=True)`
- https://github.com/jumpogpo/locket-api — login/feed/reactions; its public README does not document media posting.

The SDK is not endorsed by Locket, and Locket may change its private API.
This may risk account restrictions. Use only with your own account and
photos. Do not use stolen sessions, spoof subscriptions, harvest tokens or
grant remote access to your Locket login.

## Windows local workflow

1. Download or clone this branch. From the `locket-backend` directory,
   install the optional local dependencies in a dedicated virtual environment:

   ```powershell
   py -3.11 -m venv .venv-local-sdk
   .\.venv-local-sdk\Scripts\python.exe -m pip install requests locketlam
   ```

2. Put a JPEG that **you own** in a local folder. Store the staging
   PHOTOBOOTH_API_KEY only in the current PowerShell session (do not paste it
   into chat or put it on GitHub).

3. Generate the PTB preview; this is a DRY RUN and does **not** access Locket:

   ```powershell
   .\.venv-local-sdk\Scripts\python.exe .\local_locket_sdk_bridge.py "C:\Pictures\my-photo.jpg" --out ".\my-result.jpg"
   ```

4. Review the image. If you voluntarily choose to post it to your own Locket,
   create an authenticated **local** `locketlam` session following the SDK
   documentation. Keep its session file outside the repository (not on Render,
   GitHub or a third-party VPS). Then explicitly publish to yourself only:

   ```powershell
   .\.venv-local-sdk\Scripts\python.exe .\local_locket_sdk_bridge.py "C:\Pictures\my-photo.jpg" --out ".\my-result-to-post.jpg" --session-path "C:\Private\locketlam_session.json" --publish
   ```

The `--publish` flag is the sole permission to make an SDK post.
Publishing is always `is_private=True` (self-only).
Do not rerun an explicit publish unless you intend another post.

## Limitations

- No login credentials or SDK session files are ever sent to the user's
  Render PTB backend. The SDK authentication stays on the local laptop.
- Output uses the current staging backend, which is unaffiliated with Locket.
- There is **no native camera filter** or deep link into the PTB camera.
  The result, when sent, is a new Locket moment posted through the
  unofficial SDK. Official client UI is unchanged.
- Locket API calls are made only when `--publish` is supplied with a
  working local SDK session. The GitHub CI tests use mocks only.
