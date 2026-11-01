/* Keep each installed app shell together, including when the network is offline. */
const CACHE='carnivore-planner-v87';
const PHOTO_CACHE='carnivore-photo-cache-v1';
const ASSETS=['./state-store.js?v=87','./calendar-export.js?v=87','./app-diagnostics.js?v=87','./upgrade.css?v=87','./recipe-media.js?v=87','./plan-intelligence.js?v=87','./daily-flow.js?v=87','./shopping-math.js?v=87','./shopping-stock.js?v=87','./cooking-guide.js?v=87','./recipe-library.js?v=87','./theme.css?v=87','./experience.js?v=87','./selector.js?v=87','./app.js?v=87','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png'];
const SHELL=new Set(ASSETS.map(path=>new URL(path,self.location.href).href));
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(path=>new Request(new URL(path,self.location.href),{cache:'reload'})))).then(()=>self.skipWaiting()));
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
    // Await within respondWith: do not register waitUntil after asynchronous fetch.
    await cache.put(request,response.clone()).then(async()=>{
     const keys=await cache.keys();
     if(keys.length>26)await Promise.all(keys.slice(0,keys.length-26).map(key=>cache.delete(key)));
    }).catch(()=>{});
   }
   return response;
  }).catch(()=>Response.error()));
  return;
 }
 if(url.origin!==self.location.origin)return;
 const root=new URL('./',self.location.href);
 const isPage=url.pathname===root.pathname||url.pathname===new URL('./index.html',root).pathname;
 if(request.mode==='navigate'&&isPage){
  event.respondWith(caches.open(CACHE).then(async cache=>
   await cache.match('./index.html')||await fetch(request)).catch(()=>Response.error()));
  return;
 }
 // Only known shell resources are cached; release checks always reach the server.
 if(SHELL.has(url.href))event.respondWith(caches.open(CACHE).then(async cache=>
  await cache.match(request)||await fetch(request)).catch(()=>Response.error()));
});
