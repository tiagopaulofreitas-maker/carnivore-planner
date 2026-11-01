import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('sw.js','utf8');
function harness(failInstall=false){
 const callbacks={},stores=new Map();let installed=0,claimed=0,network=0;
 const base='https://example.test/carnivore-planner/sw.js?v=87';
 const key=r=>new URL(typeof r==='string'?r:r.url,base).href;
 const caches={async open(name){
  if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);
  return {
   async addAll(requests){if(failInstall)throw Error('Network failed');for(const r of requests){assert.equal(r.cache,'reload');store.set(key(r),new Response('cached '+key(r)));}},
   async match(r){return store.get(key(r))?.clone()},
   async put(r,response){store.set(key(r),response)},
   async keys(){return [...store.keys()].map(url=>new Request(url))},
   async delete(r){return store.delete(key(r))}
  };
 },async keys(){return [...stores.keys()]},async delete(name){return stores.delete(name)}};
 const context={URL,Request,Response,caches,self:{location:{href:base,origin:'https://example.test'},addEventListener(name,fn){callbacks[name]=fn},async skipWaiting(){installed++},clients:{async claim(){claimed++}}},async fetch(){network++;throw Error('offline')}};
 vm.runInNewContext(source,context);
 return {callbacks,stores,caches,counts:()=>({installed,claimed,network}),async install(){let pending;callbacks.install({waitUntil(p){pending=p}});await pending},async activate(){let pending;callbacks.activate({waitUntil(p){pending=p}});await pending},async fetch(path,mode='cors'){let pending;callbacks.fetch({request:{url:new URL(path,base).href,method:'GET',mode},respondWith(p){pending=p}});return pending?await pending:null}};
}
const h=harness();await h.install();assert.equal(h.counts().installed,1);
await h.caches.open('carnivore-planner-v86');await h.caches.open('another-app');await h.activate();
assert.ok(!h.stores.has('carnivore-planner-v86'));assert.ok(h.stores.has('another-app'));
assert.equal(h.counts().claimed,1);
assert.match(await (await h.fetch('./','navigate')).text(),/cached.*index.html/);
assert.match(await (await h.fetch('./index.html?atualizar=87','navigate')).text(),/cached.*index.html/);
assert.match(await (await h.fetch('./app.js?v=87')).text(),/cached.*app.js/);
assert.equal(h.counts().network,0,'Installed shell must work without network');
assert.equal(await h.fetch('./release.json?check=1'),null,'Version checks must bypass offline cache');
assert.equal(await h.fetch('/other-app/','navigate'),null,'Do not intercept other app navigation');
const fail=harness(true);await fail.caches.open('carnivore-planner-v86');
await assert.rejects(fail.install());assert.equal(fail.counts().installed,0);assert.ok(fail.stores.has('carnivore-planner-v86'));
assert.ok(!fs.readFileSync('index.html','utf8').includes('caches.delete'),'Update control must preserve working offline cache');
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.indexOf('state-store.js')<html.indexOf('<script src="./app.js'),'State store must load before application');
console.log('PASS: atomic shell installation, offline navigation/assets, failed update retention, scoped cache cleanup and uncached release checks');
