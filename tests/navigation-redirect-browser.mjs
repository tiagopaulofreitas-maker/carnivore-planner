import {chromium} from 'playwright';
import {createServer} from 'node:http';
import fs from 'node:fs';
import assert from 'node:assert/strict';
// Canonical index redirects reproduce the host behavior reported on Samsung.
const html='<!doctype html><html lang="pt"><title>Redirect fixture</title><h1>Shell preservado</h1><script>navigator.serviceWorker.register("./sw.js?v=92");</script></html>';
const server=createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(u.pathname==='/carnivore-planner/index.html'){res.writeHead(308,{Location:'/carnivore-planner/'});res.end();return;}
 if(u.pathname==='/carnivore-planner/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
 const name=u.pathname.replace(/^\/carnivore-planner\//,'');
 if(name.includes('/')||!fs.existsSync(name)){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':'text/plain');res.end(fs.readFileSync(name==='sw.js'&&process.env.TEST_WORKER_SOURCE?process.env.TEST_WORKER_SOURCE:name));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port+'/carnivore-planner/';
const browser=await chromium.launch();
try{
 const context=await browser.newContext({serviceWorkers:'allow'});const page=await context.newPage();
 await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 const fixture='{"notes":{"0":"teste — preservar"},"stock":{"ovos":5},"future":{"keep":true}}';
 await page.evaluate(raw=>localStorage.setItem('cp-v11',raw),fixture);
 const metadata=await page.evaluate(async cacheName=>{const r=await (await caches.open(cacheName)).match('./index.html');return {redirected:r.redirected,url:r.url};},process.env.EXPECT_REDIRECT_FAILURE==='1'?'carnivore-planner-v87':'carnivore-planner-v92');
 assert.equal(metadata.redirected,true,'Fixture must retain a real redirected response in Cache API');
 if(process.env.EXPECT_REDIRECT_FAILURE==='1'){
  await assert.rejects(()=>page.reload({waitUntil:'load'}),/net::ERR_FAILED/);
  console.log('PASS: reproduced net::ERR_FAILED with the original worker and real cached 308 redirect');
 }else for(const offline of [false,true]){
  await context.setOffline(offline);
  await page.reload({waitUntil:'load'});
  assert.equal(await page.locator('h1').innerText(),'Shell preservado');
  assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),fixture);
  await page.goto(base+'index.html?atualizar=87',{waitUntil:'load'});
  assert.equal(await page.locator('h1').innerText(),'Shell preservado');
  assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),fixture);
 }
 await context.close();
 if(process.env.EXPECT_REDIRECT_FAILURE!=='1')console.log('PASS: real 308 redirect cached during installation; controlled reload and index navigation work online/offline with exact saved bytes');
}finally{await browser.close();await new Promise(r=>server.close(r));}
