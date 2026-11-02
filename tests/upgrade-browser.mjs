import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import fs from 'node:fs';

// Immutable production baseline; fixtures never contact or modify production.
const baseline='92192bc62cf5ca10d249570c86d370b5cc39df64';
const paths=execFileSync('git',['ls-tree','-r','--name-only',baseline],{encoding:'utf8'}).trim().split('\n')
 .filter(p=>!p.includes('/')&&/\.(js|css|html|json|webmanifest|svg|png)$/.test(p));
const oldFiles=new Map(paths.map(p=>[p,execFileSync('git',['show',baseline+':'+p])]));
const newFiles=new Map([...paths,'state-store.js'].map(p=>[p,fs.readFileSync(p)]));
const types={js:'text/javascript',css:'text/css',html:'text/html',json:'application/json',webmanifest:'application/manifest+json',svg:'image/svg+xml',png:'image/png'};
let revision='old',failAsset=false,failQuota=false;
const server=createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const path=url.pathname.replace(/^\/carnivore-planner\//,'')||'index.html';
 const body=(revision==='old'?oldFiles:newFiles).get(path);
 res.setHeader('Cache-Control','no-store');
 if(failAsset&&path==='state-store.js'){res.writeHead(503);res.end('injected missing asset');return;}
 if(!body){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',types[path.split('.').at(-1)]||'application/octet-stream');res.end(path==='sw.js'&&revision==='new'&&failQuota?Buffer.concat([Buffer.from("Cache.prototype.addAll=async()=>{throw new DOMException('Injected quota failure','QuotaExceededError')};\n"),body]):body);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/carnivore-planner/';
const browser=await chromium.launch({headless:true});
async function installed86(){
 revision='old';failAsset=false;failQuota=false;
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
 await context.addInitScript(()=>{window.__controllerAtBoot=navigator.serviceWorker.controller?.scriptURL||''});
 const page=await context.newPage();
 await page.clock.setFixedTime(new Date('2026-11-01T12:00:00Z'));
 // The upgrade concerns local code/data; remote photographs are not required.
 await context.route('https://images.unsplash.com/**',r=>r.abort());
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Upgrade browser error:',e.message)});
 await page.goto(base);
 await page.waitForFunction(()=>window.CP_RELEASE==='8.6'&&window.__controllerAtBoot.endsWith('sw.js?v=85'));
 const fixture=await page.evaluate(()=>{
  Object.assign(state,{
   start:'2026-11-01',hour:'20:15',budget:425.50,day:0,week:2,currentTab:'home',
   prices:{duroc:6.35,ovos:.32},stock:{duroc:820,ovos:5,picanha:200},
   stockMeta:{duroc:{place:'congelador',date:'2026-12-20'}},
   manualMeals:{0:1,8:5},prepared:{'day-3':true},cookStep:{3:4},cookScale:{0:2},
   favourites:{32:true},notes:{0:'Nota de teste — manter acentos e <texto>.'},
   spending:{0:93.25},checked:{'0-ovos':true},weightLog:[{date:'2026-10-31',kg:70.5}],
   equipment:'forno',equipmentByDay:{0:'forno'},stockUsedDays:{3:3},
   futureSetting:{preserve:true}
  });
  for(const k of ['batch','completed','timers','doneSteps','cookStart'])state[k]??={};
  save();localStorage.setItem('unrelated-test-key','preserve-me');
  return localStorage.getItem('cp-v11');
 });
 await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.CP_RELEASE==='8.6');
 assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),fixture,'Baseline changed fixture before upgrade');
 await context.setOffline(false);
 return {context,page,fixture,errors};
}
async function verify87(f){
 const {page,context,fixture}=f;
 await page.waitForFunction(()=>window.CP_RELEASE==='8.7.1'&&window.__controllerAtBoot.endsWith('sw.js?v=88'));
 assert.ok(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistration())?.active?.scriptURL.endsWith('sw.js?v=88')));
 assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),fixture,'Upgrade changed original bytes');
 assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated-test-key')),'preserve-me');
 const keys=await page.evaluate(()=>caches.keys());
 assert.ok(keys.includes('carnivore-planner-v88'));
 // The legacy worker can finish an in-flight write after activation cleanup.
 // A leftover old cache must never override the new worker's installed shell.
 await page.evaluate(async()=>{
  const old=await caches.open('carnivore-planner-v86');
  await old.put('./index.html',new Response('STALE SHELL MUST NEVER RENDER',{headers:{'Content-Type':'text/html'}}));
 });
 const assets=await page.evaluate(async()=>{
  const cache=await caches.open('carnivore-planner-v88');return (await cache.keys()).map(r=>new URL(r.url).pathname+new URL(r.url).search);
 });
 if(!assets.length)console.log('Worker cache diagnostic:',JSON.stringify(await Promise.all(context.serviceWorkers().map(w=>w.evaluate(async()=>({url:location.href,cache:typeof CACHE==='undefined'?null:CACHE,entries:await Promise.all((await caches.keys()).map(async name=>({name,urls:(await (await caches.open(name)).keys()).map(r=>r.url)})))}))))));
 assert.ok(assets.includes('/carnivore-planner/state-store.js?v=88'),'Installed shell entries: '+JSON.stringify({keys,assets}));
 assert.ok(!assets.some(p=>/\?v=8[56]$/.test(p)),'Mixed builds in installed shell');
 await context.setOffline(true);
 try{await page.reload({waitUntil:'domcontentloaded'})}
 catch(error){if(!error.message.includes('net::ERR_ABORTED'))throw error;}
 // Worker takeover may supersede the explicit reload with its own reload.
 await page.waitForFunction(()=>window.CP_RELEASE==='8.7.1'&&window.__controllerAtBoot.endsWith('sw.js?v=88'));
 await page.waitForLoadState('load');
 assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),fixture,'Offline startup changed original bytes');
 await page.getByRole('button',{name:'▤ Receitas',exact:true}).click();
 await page.waitForSelector('#cp73-search');assert.equal(await page.locator('.cp73-card').count(),33);
 await page.getByRole('button',{name:'🛒 Compras',exact:true}).click();await page.waitForSelector('#cp77-shopping');
 assert.deepEqual(f.errors,[],'Uncaught errors across upgrade');
}
try{
 const automatic=await installed86();
 // v8.6 can save an extra recipe but cannot restart with it selected before
 // extending the catalog. The candidate already fixes that startup defect.
 automatic.fixture=await automatic.page.evaluate(()=>{state.manualMeals[0]=32;save();return localStorage.getItem('cp-v11')});
 revision='new';
 await automatic.page.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration()).update()});
 await verify87(automatic);await automatic.context.close();
 console.log('PASS: real v8.6 -> v8.7.1 worker update, automatic reload, exact data bytes, cache isolation and offline recipes/shopping');

 for(const failure of ['asset','quota']){
 const failed=await installed86();revision='new';failAsset=failure==='asset';failQuota=failure==='quota';
 await failed.page.evaluate(async()=>{
  const reg=await navigator.serviceWorker.getRegistration();window.__upgradeState='checking';
  reg.addEventListener('updatefound',()=>{
   const worker=reg.installing;worker.addEventListener('statechange',()=>window.__upgradeState=worker.state);
  });
  await reg.update();
 });
 await failed.page.waitForFunction(()=>window.__upgradeState==='redundant');
 assert.equal(await failed.page.evaluate(()=>window.CP_RELEASE),'8.6');
 assert.equal(await failed.page.evaluate(()=>localStorage.getItem('cp-v11')),failed.fixture);
 await failed.context.setOffline(true);await failed.page.reload({waitUntil:'domcontentloaded'});
 await failed.page.waitForFunction(()=>window.CP_RELEASE==='8.6');
 assert.equal(await failed.page.evaluate(()=>localStorage.getItem('cp-v11')),failed.fixture);
 console.log('PASS: '+failure+' failure rejects worker installation and keeps v8.6 usable offline without changing data');
 await failed.context.setOffline(false);failAsset=false;failQuota=false;
 await failed.page.evaluate(async()=>{await (await navigator.serviceWorker.getRegistration()).update()});
 await verify87(failed);await failed.context.close();
 console.log('PASS: restoring '+failure+' permits retry to v8.7.1 with original data and offline shell intact');
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
