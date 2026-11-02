import {chromium} from 'playwright';import {createServer} from 'node:http';import fs from 'node:fs';import assert from 'node:assert/strict';
const fixtureBuild=process.env.TEST_WORKER_SOURCE?'87':'93';
const html=`<!doctype html><h1>Shell de teste</h1><main id="root"></main><script src="./recipe-media.js?v=${fixtureBuild}"></script><script>navigator.serviceWorker.register("./sw.js?v=${fixtureBuild}")</script>`;
const server=createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const name=url.pathname.replace(/^\/carnivore-planner\//,'')||'index.html';if(url.pathname==='/recovery'||name==='index.html'){res.setHeader('Content-Type','text/html');res.end(url.pathname==='/recovery'?'<h1>Recuperação de teste</h1>':html);return;}if(name.includes('/')||!fs.existsSync(name)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':'text/plain');res.end(fs.readFileSync(name==='sw.js'&&process.env.TEST_WORKER_SOURCE?process.env.TEST_WORKER_SOURCE:name));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,base=origin+'/carnivore-planner/';
const browser=await chromium.launch();const context=await browser.newContext({serviceWorkers:'allow'});const page=await context.newPage();
const routeImage=route=>route.fulfill({status:200,contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'},path:'icon-192.png'});
await context.route('https://images.unsplash.com/**',routeImage);
try{
 await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);const worker=context.serviceWorkers()[0];
 const raw='{"stock":{"ovos":5},"notes":{"0":"teste de quota"},"history":[1,2]}';await page.evaluate(v=>localStorage.setItem('cp-v11',v),raw);
 async function inject(fault){await worker.evaluate(fault=>{
  self.__cacheMethods??={open:CacheStorage.prototype.open,match:Cache.prototype.match,put:Cache.prototype.put};
  CacheStorage.prototype.open=self.__cacheMethods.open;Cache.prototype.match=self.__cacheMethods.match;Cache.prototype.put=self.__cacheMethods.put;
  const fail=()=>Promise.reject(new DOMException('Injected storage failure',fault==='put'?'QuotaExceededError':'SecurityError'));
  if(fault==='open')CacheStorage.prototype.open=fail;if(fault==='match')Cache.prototype.match=fail;if(fault==='put')Cache.prototype.put=fail;
 },fault);}
 async function image(id){await page.evaluate(id=>{const e=CPRecipeMedia.make({name:'Teste',items:{entrecote:200}},'hero');e.id=id;e.querySelector('img').src+='&storage-test='+id;document.body.append(e)},id);await page.waitForFunction(id=>{const e=document.getElementById(id);return e.classList.contains('cp-photo-loaded')||e.classList.contains('cp-photo-unavailable')},id);return page.locator('#'+id).getAttribute('class');}
 async function untouched(){assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),raw);}
 if(process.env.EXPECT_CACHE_OPEN_FAILURE==='1'){
  await inject('open');assert.match(await image('before-fix'),/cp-photo-unavailable/);
  await assert.rejects(()=>page.reload(),/net::ERR_FAILED/);
  console.log('PASS: reproduced online image and navigation failure when original worker cannot open Cache API');
 }else{
  const initial=await page.evaluate(async()=>{await caches.open('carnivore-photo-cache-v1');return caches.keys()});
  for(const fault of ['open','match','put']){
   await inject(fault);assert.match(await image('online-'+fault),/cp-photo-loaded/);
   assert.equal(await page.evaluate(()=>fetch('./state-store.js?v=93').then(r=>r.ok)),true);
   await page.reload();await page.waitForFunction(()=>!!window.CPRecipeMedia);await untouched();
   await context.unroute('https://images.unsplash.com/**');await context.setOffline(true);
   if(fault==='put'){
    await page.reload();await page.waitForFunction(()=>!!window.CPRecipeMedia);
    assert.match(await image('offline-quota'),/cp-photo-unavailable/);await untouched();
   }else{
    await assert.rejects(()=>page.reload(),/net::ERR_FAILED/);
    await context.setOffline(false);await page.goto(origin+'/recovery');await untouched();
   }
   await inject(null);await context.setOffline(true);await page.goto(base);await page.waitForFunction(()=>!!window.CPRecipeMedia);await untouched();
   await context.setOffline(false);await context.route('https://images.unsplash.com/**',routeImage);
  }
  assert.deepEqual(await page.evaluate(()=>caches.keys()),initial);
  console.log('PASS: real worker with injected cache open/read/quota faults, online network fallback, offline shell under write quota, unreadable offline failure and recovery with exact saved bytes and no cache deletion');
 }
}finally{await context.close();await browser.close();await new Promise(r=>server.close(r));}
