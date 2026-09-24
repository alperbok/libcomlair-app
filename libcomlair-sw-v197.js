const CACHE="libcomlair-v197";
const START="./test-v197-vision-app.html?mode=installed";
const ASSETS=[
  "./test-v197-vision-app.html",
  "./style.css",
  "./libcomlair-icon-v195.svg",
  "./libcomlair-render-voice-v195.js",
  "./libcomlair-voice-engine-v189.js",
  "./libcomlair-ui-v188.js",
  "./libcomlair-category-engine-v173.js",
  "./libcomlair-accessibility-engine-v173.js",
  "./libcomlair-data-engine-v173.js",
  "./libcomlair-detail-engine-v173.js",
  "./libcomlair-transport-engine-v173.js",
  "./libcomlair-repair-engine-v175.js",
  "./libcomlair-selftest-v189.js",
  "./libcomlair-v196-secure.js",
  "./libcomlair-v157-directions.js",
  "./libcomlair-pwa-v197.js"
];
self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(x=>cache.add(x)));
  })());
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(event.request,{cache:"no-store"});
      const cache=await caches.open(CACHE);
      cache.put(event.request,fresh.clone()).catch(()=>{});
      return fresh;
    }catch(_){
      return (await caches.match(event.request,{ignoreSearch:true})) || (await caches.match("./test-v197-vision-app.html"));
    }
  })());
});