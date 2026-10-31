const CACHE='carnivore-planner-v77';
const ASSETS=['./shopping-math.js?v=77','./shopping-stock.js?v=77','./cooking-guide.js?v=77','./recipe-library.js?v=77','./theme.css?v=77','./experience.js?v=77','./selector.js?v=77','./app.js?v=77','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png'];
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