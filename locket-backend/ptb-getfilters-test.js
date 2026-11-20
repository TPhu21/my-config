// PTB getFilters catalog — opt-in compatibility test only.
// Synthesizes only the filter catalog for the user's own Photo Studio.
// No Firebase/RevenueCat edits, photos, tokens, UID tracking, or network redirects.
(function () {
  try {
    var u = typeof $request !== 'undefined' && $request && $request.url || '';
    if (!/^https:\/\/api\.locketcamera\.com\/getFilters(?:\?.*)?$/i.test(u)) {
      $done({});
      return;
    }
    var samples = [
      ['photobooth_4cut', 'Classic Film'],
      ['photobooth_cute', 'Pastel Cute'],
      ['pb_cortis_4cut', 'Electric Blue'],
      ['pb_shinchan_4cut', 'Color Pop'],
      ['pb_supperman_4cut', 'Hero Comic'],
      ['pb_meo_dang_yeu_4cut', 'Tiny Paws'],
      ['pb_holo_4cut', 'Holographic'],
      ['pb_photobooth_hello_kitty', 'Pink Bow'],
      ['pb_vintage', 'Vintage Paper'],
      ['pb_ripped_paper_4cut', 'Scrapbook']
    ];
    var base = 'https://phu-private-photo-studio.onrender.com/api/v1/templates/';
    var filters = samples.map(function (pair) {
      var image = base + pair[0] + '/preview?layout=grid';
      return {
        uid: pair[0],
        id: pair[0],
        name: pair[1],
        category: 'PTB Preview (Test)',
        prompt: pair[0],
        style: 'cutout',
        type: 'normal',
        filterType: 'normal',
        overlay: true,
        imageUrl: image,
        iconUrl: image,
        overlayImageUrl: image,
        overlayImageURL: image,
        icon: { url: image, iconUrl: image, remoteImage: image, sfSymbol: 'camera' },
        outputUrl: null,
        referenceImages: []
      };
    });
    // Mirror the response envelope observed in HTTP Toolkit and developer script.
    $done({
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          result: { data: { filters: filters, friend_filters: [] }, status: 200 },
          data: { filters: filters, friend_filters: [] },
          status: 200
        })
      }
    });
  } catch (_) { $done({}); }
})();
