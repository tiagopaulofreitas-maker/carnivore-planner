import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('sw.js','utf8');
function harness(failInstall=false,fetcher,faults={}){
 const callbacks={},stores=new Map();let installed=0,claimed=0,network=0;
 const base='https://example.test/carnivore-planner/sw.js?v=93';
 const key=r=>new URL(typeof r==='string'?r:r.url,base).href;
 const caches={async open(name){
  if(faults.open)throw Error("Cache unavailable");
  if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);
  return {
   async addAll(requests){if(failInstall)throw Error('Network failed');for(const r of requests){assert.equal(r.cache,'reload');store.set(key(r),new Response('cached '+key(r)));}},
   async match(r){if(faults.match)throw Error("Cache read denied");return store.get(key(r))?.clone()},
   async put(r,response){if(faults.put)throw Error("QuotaExceededError");store.set(key(r),response)},
   async keys(){return [...store.keys()].map(url=>new Request(url))},
   async delete(r){return store.delete(key(r))}
  };
 },async keys(){return [...stores.keys()]},async delete(name){return stores.delete(name)}};
 const context={URL,Request,Response,caches:faults.missing?undefined:caches,self:{location:{href:base,origin:'https://example.test'},addEventListener(name,fn){callbacks[name]=fn},async skipWaiting(){installed++},clients:{async claim(){claimed++}}},async fetch(request){network++;if(fetcher)return fetcher(request);throw Error('offline')}};
 vm.runInNewContext(source,context);
 return {callbacks,stores,caches,counts:()=>({installed,claimed,network}),async install(){let pending;callbacks.install({waitUntil(p){pending=p}});await pending},async activate(){let pending;callbacks.activate({waitUntil(p){pending=p}});await pending},async fetch(path,mode='cors'){let pending;const request=new Request(new URL(path,base),{mode:mode==='navigate'?'same-origin':mode});if(mode==='navigate')Object.defineProperty(request,'mode',{value:'navigate'});callbacks.fetch({request,respondWith(p){pending=p}});return pending?await pending:null}};
}
const h=harness();await h.install();assert.equal(h.counts().installed,1);
await h.caches.open('carnivore-planner-v86');await h.caches.open('another-app');await h.activate();
assert.ok(!h.stores.has('carnivore-planner-v86'));assert.ok(h.stores.has('another-app'));
assert.equal(h.counts().claimed,1);
assert.match(await (await h.fetch('./','navigate')).text(),/cached.*index.html/);
assert.match(await (await h.fetch('./index.html?atualizar=87','navigate')).text(),/cached.*index.html/);
assert.match(await (await h.fetch('./app.js?v=93')).text(),/cached.*app.js/);
assert.equal(h.counts().network,0,'Installed shell must work without network');
assert.equal(await h.fetch('./release.json?check=1'),null,'Version checks must bypass offline cache');
assert.equal(await h.fetch('/other-app/','navigate'),null,'Do not intercept other app navigation');
const fail=harness(true);await fail.caches.open('carnivore-planner-v86');
await assert.rejects(fail.install());assert.equal(fail.counts().installed,0);assert.ok(fail.stores.has('carnivore-planner-v86'));
assert.ok(!fs.readFileSync('index.html','utf8').includes('caches.delete'),'Update control must preserve working offline cache');
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.indexOf('state-store.js')<html.indexOf('<script src="./app.js'),'State store must load before application');
console.log('PASS: atomic shell installation, offline navigation/assets, failed update retention, scoped cache cleanup and uncached release checks');
// A canonical host can redirect index.html to its directory. Cached redirected
// responses cannot be used directly for a navigation with redirect mode manual.
const redirected=harness();await redirected.install();
const redirectedHTML='<html lang="pt"><title>Preservar página</title></html>';
const cache=redirected.stores.get('carnivore-planner-v93');
cache.set('https://example.test/carnivore-planner/index.html',{clone(){
 const response=new Response(redirectedHTML,{headers:{'Content-Type':'text/html','X-Test':'preserve'}});
 Object.defineProperty(response,'redirected',{value:true});return response;
}});
for(const path of ['./','./index.html?atualizar=87']){
 const response=await redirected.fetch(path,'navigate');
 assert.equal(response.redirected,false,'Redirected cached HTML must become a navigation-safe response');
 assert.equal(response.status,200);assert.equal(response.headers.get('X-Test'),'preserve');
 assert.equal(await response.text(),redirectedHTML);
}
console.log('PASS: redirected cached HTML preserves body and headers and is safe for navigation offline');
let photoAttempts=0;
const retryPhoto=harness(false,request=>{
 photoAttempts++;const response=new Response(photoAttempts===1?'temporary error':'image',{status:photoAttempts===1?503:200});
 if(photoAttempts===1&&request.mode!=='cors')Object.defineProperty(response,'type',{value:'opaque'});return response;
});
await retryPhoto.fetch('https://images.unsplash.com/photo-test','no-cors');
assert.equal((await retryPhoto.fetch('https://images.unsplash.com/photo-test','no-cors')).status,200,'Temporary photo errors must permit retry');
console.log('PASS: transient photo HTTP failure is not permanently cached');
const legacyPhoto=harness();const legacyStore=await legacyPhoto.caches.open('carnivore-photo-cache-v1');
const legacyURL='https://images.unsplash.com/photo-legacy';
legacyPhoto.stores.get('carnivore-photo-cache-v1').set(legacyURL,{clone(){
 const r=new Response('legacy image');Object.defineProperty(r,'type',{value:'opaque'});return r;
}});
assert.equal(await (await legacyPhoto.fetch(legacyURL,'no-cors')).text(),'legacy image','Legacy opaque photos must survive offline');
assert.ok(legacyPhoto.stores.get('carnivore-photo-cache-v1').has(legacyURL));
console.log('PASS: existing opaque photo remains available offline without cache migration or deletion');
for(const fault of ['open','match','put','missing']){
 const faults={[fault]:true};const degraded=harness(false,()=>new Response('network response'),faults);
 for(const [url,mode] of [['https://images.unsplash.com/photo-quota','no-cors'],['./','navigate'],['./app.js?v=93','cors']]){
  assert.equal((await degraded.fetch(url,mode)).status,200,fault+' failure must not block online loading');
 }
}
console.log('PASS: cache open/read/quota failures preserve network loading');

const unavailable=harness(false,null,{missing:true});await assert.rejects(unavailable.install());assert.equal(unavailable.counts().installed,0);
console.log("PASS: unavailable Cache API rejects offline installation rather than claiming readiness");
