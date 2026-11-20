// Read-only request hook to prove that Shadowrocket actually executes
// scripts for Locket. It deliberately does not modify, redirect or forward data.
(function () {
  try {
    var url = String((typeof $request !== 'undefined' && $request && $request.url) || '');
    var eventName = /\/generateFilteredImage(?:\?|$)/i.test(url) ? 'GENERATE_HOOK_ACTIVE'
                  : /\/getFilters(?:\?|$)/i.test(url) ? 'FILTERS_HOOK_ACTIVE'
                  : 'LOСKET_HOOK_ACTIVE';
    if (typeof console !== 'undefined' && console.log)
      console.log('PTB HOOK CHECK: ' + eventName);
    if (typeof $notification !== 'undefined' && $notification && $notification.post)
      $notification.post('PTB Hook Check', 'Script được Shadowrocket thực thi', eventName);
  } catch (_) {}
  $done({});
})();
