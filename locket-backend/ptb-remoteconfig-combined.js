// Combined PTB catalog experiment: Firebase :fetch response only.
// Own Render preview templates, no photo upload, no subscription or account modifications.
// A complement to ptb-getfilters-response-compat.js in the same isolated module.
(function () {
  var req=(typeof $request!=='undefined'&&$request)||{};
  var res=(typeof $response!=='undefined'&&$response)||null;
  var url=String(req.url||'');
  if (!res || !/^https:\/\/firebaseremoteconfig\.googleapis\.com\/v1\/projects\/[^/]+\/namespaces\/[^/]+:fetch(?:\?.*)?$/i.test(url)) {
    $done({});return;
  }
  try {
    if(Number(res.status||res.statusCode||200)!==200||typeof res.body!=='string'){$done({});return;}
    var obj=JSON.parse(res.body);
    if(!obj||typeof obj!=='object'||!obj.entries||typeof obj.entries!=='object'){$done({});return;}
    var entries=obj.entries,raw=entries.camera_filter_config,config={};
    try { config=typeof raw==='string'?JSON.parse(raw):(raw&&typeof raw==='object'?raw:{}); } catch (_) { config={}; }
    if(!config||typeof config!=='object'||Array.isArray(config)) config={};
    var originalGroups=Array.isArray(config.sheet_filters)?config.sheet_filters:(Array.isArray(config.sheetFilters)?config.sheetFilters:[]);
    var originalPicker=Array.isArray(config.picker_filters)?config.picker_filters:(Array.isArray(config.pickerFilters)?config.pickerFilters:[]);
    var originalRemote=Array.isArray(config.remote_filters)?config.remote_filters:(Array.isArray(config.remoteFilters)?config.remoteFilters:[]);
    var originalFilters=Array.isArray(config.filters)?config.filters:[];
    var templates=[
      ['photobooth_4cut','Classic Film'], ['photobooth_cute','Pastel Cute'],
      ['pb_cortis_4cut','Electric Blue'], ['pb_shinchan_4cut','Color Pop'],
      ['pb_supperman_4cut','Hero Comic'], ['pb_meo_dang_yeu_4cut','Tiny Paws'],
      ['pb_holo_4cut','Holographic'], ['pb_photobooth_hello_kitty','Pink Bow'],
      ['pb_vintage','Vintage Paper'], ['pb_ripped_paper_4cut','Scrapbook']
    ];
    var ids=templates.map(function(t){return t[0];});
    function idOf(f){return typeof f==='string'?f:(f&&(f.uid||f.id))||'';}
    function combined(a,b){
      var found={},out=[];
      a.concat(b).forEach(function(item){var id=idOf(item);if(id&&!found[id]){found[id]=true;out.push(item);}});
      return out;
    }
    var groupTitle='Photobooth 📸',groups=originalGroups.map(function(g){return g;});
    var group=groups.filter(function(g){var t=g&&g.title||{};return t.en===groupTitle||t.vi===groupTitle;})[0];
    if(!group){group={title:{en:groupTitle,vi:groupTitle},filter_ids:[]};groups.push(group);}
    group.filter_ids=combined((Array.isArray(group.filter_ids)?group.filter_ids:[]),ids);
    var remote=templates.map(function(t){
      var image='https://phu-private-photo-studio.onrender.com/api/v1/templates/'+t[0]+'/preview?layout=grid';
      return {
        id:t[0],uid:t[0],name:t[1],category:groupTitle,prompt:t[0],
        style:'cutout',type:'normal',filterType:'normal',overlay:true,
        imageUrl:image,iconUrl:image,overlayImageUrl:image,overlayImageURL:image,
        tintColor:'#93C5FD',colors:['#93C5FD','#E2E8F0'],
        captureButtonColors:['#93C5FD','#E2E8F0'],
        icon:{url:image,iconUrl:image,remoteImage:image,sfSymbol:'square.grid.2x2',
              symbol:'square.grid.2x2',emoji:'📸'},
        outputUrl:null,productUrl:null,textColor:'#FFFFFF',referenceImages:[],
        requires_gold:false,requiresGold:false,is_gold:false,isGold:false,
        unlocked:true,is_unlocked:true,isUnlocked:true,free:true,
        allowsTryFilter:true,allows_try_filter:true,
        tryButtonEnabled:true,try_button_enabled:true
      };
    });
    config.sheet_filters=groups;
    config.sheetFilters=groups;
    config.picker_filters=combined(originalPicker,ids);
    config.pickerFilters=config.picker_filters;
    config.remote_filters=combined(originalRemote,remote);
    config.remoteFilters=config.remote_filters;
    config.filters=combined(originalFilters,remote);
    config.allows_custom_filters=true;
    config.allowsCustomFilters=true;
    config.show_filter_button=true;
    config.showFilterButton=true;
    config.sheet_enabled=true;
    config.sheetEnabled=true;
    config.open_sheet_immediately=true;
    config.openSheetImmediately=true;
    entries.camera_filter_config=JSON.stringify(config);
    // UI experiment gates only. Preserve all unrelated subscription and product flags.
    try {
      var gateRaw=entries.feature_gates;
      var gates=typeof gateRaw==='string'?JSON.parse(gateRaw):(gateRaw&&typeof gateRaw==='object'?gateRaw:{});
      if(gates&&typeof gates==='object'&&!Array.isArray(gates)){
        ['camera_filter_sheet','camera_filters','camera_filter','filter','filters',
         'photo_filters','camera_filter_button','custom_filters','create_filter'
        ].forEach(function(k){gates[k]='enabled';});
        entries.feature_gates=JSON.stringify(gates);
      }
    }catch(_){}
    var headers=Object.assign({},res.headers||{});
    Object.keys(headers).forEach(function(k){
      if(/^(content-length|content-encoding|etag|transfer-encoding)$/i.test(k)) delete headers[k];
    });
    headers['Content-Type']='application/json; charset=utf-8';
    try {
      var key='PTB_COMBINED_RC_20261120_A';
      var first=typeof $persistentStore==='undefined'||$persistentStore.read(key)!=='1';
      if(first&&typeof $notification!=='undefined'&&typeof $notification.post==='function'){
        $notification.post('PTB · Firebase + getFilters','Chỉ thử danh mục của Photo Studio',
          'Firebase đã thêm nhóm PTB ('+ids.length+' mẫu); remote='+config.remote_filters.length);
        if(typeof $persistentStore!=='undefined')$persistentStore.write('1',key);
      }
    }catch(_){}
    $done({body:JSON.stringify(obj),headers:headers});
  }catch(_){$done({});}
})();
