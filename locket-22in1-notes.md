# Locket-only adaptation of 22in1public

Main module: https://raw.githubusercontent.com/TPhu21/my-config/main/locket-22in1-only.sgmodule

Original references:
- https://github.com/andanh447/andanh447.github.io/blob/andanh447.github.io/22in1public.sgmodule
- https://github.com/andanh447/locketgold_tool
- Source scripts there include revenuecat9999.js, deleteheaderDHT.js, locketfilter_andanh447.js and revenuecatHTVIP.js.
- Source module loads a third-party Cloudflare Worker whose implementation is not available to inspect.

This adaptation is NOT a byte-for-byte mirror. The third-party repos do not advertise a redistribution license, and the Worker source could not be inspected, so those external files were not copied. Scripts here were written independently to support Locket-only Remote Config catalog flags, request caching and a client-side entitlement response experiment.

Excluded intentionally: third-party Worker/VPS redirects, uploads of photos or auth tokens to third-party servers, the source's public P12 private certificate/password, broad Apple certificate-domain blocking, UDP-443 network blocking, and all other app-specific rules/scripts.

Expected limits: The static AI/Photobooth IDs may not appear in your Locket version and DO NOT implement AI image generation. Modifying a client-side entitlement response does not guarantee any valid paid subscription or continued Gold display. Only Locket-owned APIs and RevenueCat are matched; the RevenueCat hostname is shared by other apps, though scripts guard on the Locket User-Agent.

Install under Shadowrocket Modules; disable all other Locket modules during testing. Use your own already-trusted local certificate for HTTPS interception, if applicable.