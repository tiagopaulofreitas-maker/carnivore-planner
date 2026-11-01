const CACHE='carnivore-planner-v84';
const PHOTO_CACHE='carnivore-photo-cache-v1';
const ASSETS=['./app-diagnostics.js?v=84','./upgrade.css?v=84','./recipe-media.js?v=84','./plan-intelligence.js?v=84','./daily-flow.js?v=84','./shopping-math.js?v=84','./shopping-stock.js?v=84','./cooking-guide.js?v=84','./recipe-library.js?v=84','./theme.css?v=84','./experience.js?v=84','./selector.js?v=84','./app.js?v=84','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('carnivore-planner-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.hostname==='images.unsplash.com'){
  event.respondWith(caches.open(PHOTO_CACHE).then(async cache=>{
   const cached=await cache.match(request);
   if(cached)return cached;
   const response=await fetch(request);
   if(response.ok||response.type==='opaque'){
    event.waitUntil(cache.put(request,response.clone()).then(async()=>{
     const keys=await cache.keys();
     if(keys.length>26)await Promise.all(keys.slice(0,keys.length-26).map(key=>cache.delete(key)));
    }).catch(()=>{}));
   }
   return response;
  }).catch(()=>Response.error()));
  return;
 }
 if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(new Request(request,{cache:'no-store'})).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy))}
   return response;
  }).catch(async()=>await caches.match('./index.html')||Response.error()));
  return;
 }
 event.respondWith(fetch(request).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy))}
  return response;
 }).catch(()=>caches.match(request)));
});