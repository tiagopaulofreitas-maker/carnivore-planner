/* Keep each installed app shell together, including when the network is offline. */
const CACHE='carnivore-planner-v89';
const PHOTO_CACHE='carnivore-photo-cache-v1';
const ASSETS=['./plan-portions.js?v=89','./state-store.js?v=89','./calendar-export.js?v=89','./app-diagnostics.js?v=89','./upgrade.css?v=89','./recipe-media.js?v=89','./plan-intelligence.js?v=89','./daily-flow.js?v=89','./shopping-math.js?v=89','./shopping-stock.js?v=89','./cooking-guide.js?v=89','./recipe-library.js?v=89','./theme.css?v=89','./experience.js?v=89','./selector.js?v=89','./app.js?v=89','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png'];
const SHELL=new Set(ASSETS.map(path=>new URL(path,self.location.href).href));
// Cache access may reject or throw when storage is denied.
function openCache(name){return Promise.resolve().then(()=>caches.open(name));}
self.addEventListener('install',event=>{
 event.waitUntil(openCache(CACHE).then(cache=>cache.addAll(ASSETS.map(path=>new Request(new URL(path,self.location.href),{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('carnivore-planner-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.hostname==='images.unsplash.com'){
  event.respondWith(openCache(PHOTO_CACHE).then(async cache=>{
   const cached=await cache.match(request);
   if(cached&&cached.type!=='opaque')return cached;
   // Unsplash supports anonymous CORS. Inspect status so opaque HTTP errors
   // cannot become permanent broken images. Retain legacy opaque images offline.
   let response;
   try{response=await fetch(new Request(request,{mode:'cors',credentials:'omit'}));}
   catch(error){return cached||Response.error();}
   if(response.ok){
    await cache.put(request,response.clone()).then(async()=>{
     const keys=await cache.keys();
     if(keys.length>26)await Promise.all(keys.slice(0,keys.length-26).map(key=>cache.delete(key)));
    }).catch(()=>{});
   }
   return response;
  }).catch(()=>fetch(new Request(request,{mode:'cors',credentials:'omit'}))));
  return;
 }
 if(url.origin!==self.location.origin)return;
 const root=new URL('./',self.location.href);
 const isPage=url.pathname===root.pathname||url.pathname===new URL('./index.html',root).pathname;
 if(request.mode==='navigate'&&isPage){
  event.respondWith(openCache(CACHE).then(async cache=>{
   const response=await cache.match('./index.html')||await fetch(request);
   // Static hosts may redirect index.html to ./ during installation. A cached
   // redirected response is invalid for navigation's manual redirect mode.
   // Rebuild only this response; preserve the cached shell and all user data.
   return response.redirected?new Response(response.body,{status:response.status,statusText:response.statusText,headers:response.headers}):response;
  }).catch(()=>fetch(request)));
  return;
 }
 // Only known shell resources are cached; release checks always reach the server.
 if(SHELL.has(url.href))event.respondWith(openCache(CACHE).then(async cache=>
  await cache.match(request)||await fetch(request)).catch(()=>fetch(request)));
});
