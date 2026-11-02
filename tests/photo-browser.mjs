import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
let result='success',releaseLoading;
const loadingGate=new Promise(resolve=>{releaseLoading=resolve});
await context.route('https://images.unsplash.com/**',async route=>{
 if(route.request().url().includes('audit=photo-loading'))await loadingGate;
 return result==='success'?route.fulfill({status:200,contentType:'image/png',path:'icon-192.png'}):route.fulfill({status:503,body:'unavailable'});
});
const page=await context.newPage();
try{
 await page.goto('http://127.0.0.1:4173/carnivore-planner/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.CPRecipeMedia);
 async function make(id,meal){await page.evaluate(({id,meal})=>{const e=window.CPRecipeMedia.make(meal,'hero');e.id=id;const img=e.querySelector('img');if(img)img.src+='&audit='+id;document.body.append(e)},{id,meal});}
 const steak={name:'Bife de teste',items:{entrecote:200}};
 await make('photo-loading',steak);
 assert.equal(await page.locator('#photo-loading.cp-photo-loaded').count(),0);
 assert.equal(await page.locator('#photo-loading .cp-photo-fallback').count(),1);
 releaseLoading();await page.locator('#photo-loading.cp-photo-loaded').waitFor();
 await make('photo-success',steak);
 await page.locator('#photo-success.cp-photo-loaded').waitFor();
 assert.equal(await page.locator('#photo-success img').count(),1);
 result='error';await make('photo-error',steak);
 await page.locator('#photo-error.cp-photo-unavailable').waitFor();
 assert.equal(await page.locator('#photo-error img').count(),0);
 assert.equal(await page.locator('#photo-error .cp-photo-fallback').count(),1);
 await context.unroute('https://images.unsplash.com/**');
 await context.setOffline(true);await make('photo-offline',steak);
 await page.locator('#photo-offline.cp-photo-unavailable').waitFor();
 assert.equal(await page.locator('#photo-offline img').count(),0);
 console.log('PASS: real browser pending image, success, simulated HTTP 503 and offline fallbacks,');
}finally{await context.close();await browser.close();}
