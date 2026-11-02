import {chromium} from 'playwright';import {createServer} from 'node:http';import fs from 'node:fs';import assert from 'node:assert/strict';
const fixtureBuild=process.env.TEST_WORKER_SOURCE?'87':'95';
const html=`<!doctype html><main id="root"></main><script src="./recipe-media.js?v=${fixtureBuild}"></script><script>navigator.serviceWorker.register("./sw.js?v=${fixtureBuild}")</script>`;
const server=createServer((req,res)=>{const u=new URL(req.url,'http://localhost');const name=u.pathname.replace(/^\/carnivore-planner\//,'')||'index.html';if(name==='index.html'){res.setHeader('Content-Type','text/html');res.end(html);return;}if(name.includes('/')||!fs.existsSync(name)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':'text/plain');res.end(fs.readFileSync(name==='sw.js'&&process.env.TEST_WORKER_SOURCE?process.env.TEST_WORKER_SOURCE:name));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/carnivore-planner/';
const browser=await chromium.launch();const context=await browser.newContext({serviceWorkers:'allow'});let bad=false,hits=0;
const imageRoute=async route=>{hits++;await route.fulfill({status:bad?503:200,contentType:bad?'text/plain':'image/png',headers:{'Access-Control-Allow-Origin':'*','Cache-Control':'no-store'},...(bad?{body:'temporary failure'}:{path:'icon-192.png'})});};
await context.route('https://images.unsplash.com/**',imageRoute);await context.route('https://images.pexels.com/**',imageRoute);const page=await context.newPage();
try{
 await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const fixture='{"stock":{"ovos":7},"notes":{"0":"preservar — teste"},"stockUsedDays":{"0":[1]}}';
 await page.evaluate(raw=>localStorage.setItem('cp-v11',raw),fixture);
 const meal={name:'Bife de teste',items:{entrecote:200}};
 async function photo(id,size='hero',suffix='',mealSpec=meal){
  await page.evaluate(({id,size,suffix,meal})=>{const node=CPRecipeMedia.make(meal,size);node.id=id;if(suffix)node.querySelector('img').src+=suffix;document.body.append(node);},{id,size,suffix,meal:mealSpec});
  if(size==='thumb')await page.locator('#'+id).scrollIntoViewIfNeeded();
  await page.waitForFunction(id=>{const e=document.getElementById(id);return e.classList.contains('cp-photo-loaded')||e.classList.contains('cp-photo-unavailable')},id);
  return page.locator('#'+id).getAttribute('class');
 }
 async function urls(){return page.evaluate(async()=> (await (await caches.open('carnivore-photo-cache-v1')).keys()).map(r=>r.url));}
 assert.match(await photo('thumb','thumb'),/cp-photo-loaded/);assert.match(await photo('hero'),/cp-photo-loaded/);
 let saved=await urls();assert.equal(saved.length,2);assert.ok(saved.some(u=>u.includes('w=220')));assert.ok(saved.some(u=>u.includes('w=840')));
 const salmon={name:'Salmão de teste',items:{salmao:200}};
 const mackerel={name:'Cavala de teste',items:{cavala:200}},tuna={name:'Atum de teste',items:{atum:200}};
 if(process.env.EXPECT_POISONED_PHOTO!=='1'){bad=true;assert.match(await photo('pexels-fail','hero','&retry=pexels',salmon),/cp-photo-unavailable/);bad=false;assert.match(await photo('pexels-retry','hero','&retry=pexels',salmon),/cp-photo-loaded/);assert.match(await photo('pexels-thumb','thumb','',salmon),/cp-photo-loaded/);for(const [id,fish] of [['mackerel',mackerel],['tuna',tuna]]){assert.match(await photo(id+'-large','hero','',fish),/cp-photo-loaded/);assert.match(await photo(id+'-small','thumb','',fish),/cp-photo-loaded/);}}
 await context.unroute('https://images.unsplash.com/**');await context.unroute('https://images.pexels.com/**');await context.setOffline(true);await page.reload();
 if(process.env.EXPECT_POISONED_PHOTO!=='1'){assert.match(await photo('pexels-offline','hero','&retry=pexels',salmon),/cp-photo-loaded/);assert.match(await photo('pexels-thumb-offline','thumb','',salmon),/cp-photo-loaded/);for(const [id,fish] of [['mackerel',mackerel],['tuna',tuna]]){assert.match(await photo(id+'-large-offline','hero','',fish),/cp-photo-loaded/);assert.match(await photo(id+'-small-offline','thumb','',fish),/cp-photo-loaded/);}}
 assert.match(await photo('offline-thumb','thumb'),/cp-photo-loaded/);assert.match(await photo('offline-hero'),/cp-photo-loaded/);
 assert.match(await photo('unseen','hero','&cache-case=unseen'),/cp-photo-unavailable/);assert.equal((await urls()).length,process.env.EXPECT_POISONED_PHOTO==='1'?2:8);
 assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),fixture);
 await context.setOffline(false);await context.route('https://images.unsplash.com/**',imageRoute);
 bad=true;assert.match(await photo('failure','hero','&cache-case=retry'),/cp-photo-unavailable/);
 bad=false;const retry=await photo('retry','hero','&cache-case=retry');
 if(process.env.EXPECT_POISONED_PHOTO==='1'){
  assert.match(retry,/cp-photo-unavailable/);console.log('PASS: reproduced cached opaque HTTP error preventing recovery with original worker');
 }else{
  assert.match(retry,/cp-photo-loaded/,'A transient HTTP error must not poison the photo cache');
  const previous=await urls();
  await Promise.all(Array.from({length:32},(_,i)=>photo('limit-'+i,'hero','&cache-limit='+i)));
  saved=await urls();assert.ok(saved.length<=26,'Photo cache exceeded 26 entries: '+saved.length);assert.ok(saved.length>0);
  assert.ok(previous.some(u=>!saved.includes(u)),'Old entries were not evicted');
  await context.unroute('https://images.unsplash.com/**');await context.setOffline(true);await page.reload();
  const last=saved.at(-1);assert.match(await photo('retained','hero',last.slice(last.indexOf('&cache-limit='))),/cp-photo-loaded/);
  assert.match(await photo('evicted','thumb'),/cp-photo-unavailable/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),fixture);
  console.log('PASS: active real worker, both sizes cached online and after offline reload, unseen/evicted fallbacks, HTTP retry, concurrent 26-entry limit and exact saved bytes; external image server simulated');
 }
 assert.ok(hits>0);
}finally{await context.close();await browser.close();await new Promise(r=>server.close(r));}
