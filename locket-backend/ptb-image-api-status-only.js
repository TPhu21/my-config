// Read-only PTB image API status observer for Shadowrocket.
// Never reads or modifies request/response bodies, headers, photo or auth data.
(function () {
  var req=(typeof $request!=='undefined' && $request)||{};
  var res=(typeof $response!=='undefined' && $response)||null;
  var url=String(req.url||'');
  var matches=url.match(/^https:\/\/(api\.locketcamera\.com|us-central1-locket-4252a\.cloudfunctions\.net)\/(generateFilteredImage|generateFilter|applyFilter|createOverlay)(?:\?.*)?$/i);
  if(!matches){$done({});return;}
  try {
    var name=matches[2],host=matches[1];
    var code=res && (res.status||res.statusCode);
    var label=res ? ('Response HTTP '+(typeof code==='number'?code:'?')) : 'Request đã gửi';
    var key='PTB_IMG_OBS_20261120_'+name+'_'+(res?'resp':'req');
    var seen=typeof $persistentStore!=='undefined' && $persistentStore.read(key)==='1';
    if(!seen&&typeof $notification!=='undefined'&&typeof $notification.post==='function'){
      $notification.post('PTB · API xử lý ảnh',name+' · '+label,
        host==='api.locketcamera.com'?'Locket API':'Locket Cloud Functions');
      if(typeof $persistentStore!=='undefined')$persistentStore.write('1',key);
    }
  } catch (_){}
  $done({});
})();
