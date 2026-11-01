import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:4173/carnivore-planner/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
await context.addInitScript(()=>{window.__controllerAtBoot=navigator.serviceWorker.controller?.scriptURL||''});
const page=await context.newPage();
await page.clock.setFixedTime(new Date('2026-11-01T12:00:00Z'));
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(base);
 await page.waitForFunction(()=>window.__controllerAtBoot.endsWith('sw.js?v=87')&&window.CP_RELEASE==='8.7');
 assert.equal(await page.evaluate(()=>window.CPDiagnostics.run().modules.every(x=>x.ok)),true);
 const original=await page.evaluate(()=>{
  state.stock={duroc:820,ovos:5};state.prices.duroc=6.35;state.manualMeals[0]=32;state.prepared['day-0']=true;state.cookStep[0]=4;save();
  return {stock:state.stock,prices:state.prices,manualMeals:state.manualMeals};
 });
 await context.setOffline(true);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.CP_RELEASE==='8.7');
 await page.getByRole('button',{name:'▤ Receitas',exact:true}).click();
 await page.waitForSelector('#cp73-search');
 assert.equal(await page.locator('.cp73-card').count(),33);
 assert.deepEqual(await page.evaluate(()=>({stock:state.stock,prices:state.prices,manualMeals:state.manualMeals})),original);
 await page.getByRole('button',{name:'🛒 Compras',exact:true}).click();
 await page.waitForSelector('#cp77-shopping');
 console.log('PASS: active worker, offline reload, 33 recipes, shopping and exact saved-value preservation');
 await context.setOffline(false);
 await page.evaluate(()=>{pickMeal(0,1)});
 assert.equal(await page.evaluate(()=>state.prepared['day-0']),false);
 assert.equal(await page.evaluate(()=>state.cookStep[0]),0);
 await page.getByRole('button',{name:'⚙ Ajustes',exact:true}).click();
 page.once('dialog',d=>d.accept());
 await page.getByLabel('Hora do jantar',{exact:true}).fill('');
 await page.getByLabel('Hora do jantar',{exact:true}).press('Tab');
 assert.equal(await page.evaluate(()=>state.hour),'19:00');
 // Export/import paths: a malformed import must not overwrite a valid plan.
 const beforeImport=await page.evaluate(()=>localStorage.getItem('cp-v11'));
 const rejectedImport=page.waitForEvent('dialog').then(d=>d.accept());
 await page.locator('input[type=file]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({settings:{start:'2026-11-01',prices:{},manualMeals:{0:999}}}))});
 await rejectedImport;
 assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),beforeImport);
 const valid=JSON.parse(beforeImport);valid.stock.duroc=1234;
 page.once('dialog',d=>d.accept());
 await page.locator('input[type=file]').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({settings:valid}))});
 await page.waitForFunction(()=>state.stock.duroc===1234);
 assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11-before-import')),beforeImport);
 console.log('PASS: meal edits clear completion, empty time rejected, invalid import unchanged, valid import keeps recovery bytes');
 // Midweek UI integration, with consumption applied exactly once.
 const midweek=await page.evaluate(()=>{
  state.start='2026-10-29';state.week=0;state.prepared={};state.stockUsedDays={};
  state.manualMeals=Object.fromEntries(Array.from({length:30},(_,i)=>[i,6]));
  for(const d of [0,1,3,7])state.manualMeals[d]=0;
  const qty=meals[0].items.entrecote;state.stock={entrecote:qty*2};save();setTab('shop');
  return {qty,day:todayIndex(),selected:JSON.stringify(state.manualMeals)};
 });
 await page.waitForSelector('#cp77-shopping');
 await page.locator('.cp77-covered > summary').click();
 const currentDemand=await page.locator('.cp77-covered-row').filter({hasText:'Entrecôte'}).innerText();
 assert.equal(midweek.day,3,'Midweek fixture must be day index 3');
 assert.ok(currentDemand.includes(String(midweek.qty)),'Shopping UI still includes past meals: '+JSON.stringify({currentDemand,midweek}));
 await page.evaluate(()=>{state.prepared['day-3']=true;save()});
 page.once('dialog',d=>d.accept());
 await page.evaluate(()=>window.CPDailyFlow.consume(3));
 const afterConsumption=await page.evaluate(()=>JSON.stringify({stock:state.stock,history:state.stockUsedDays,selected:state.manualMeals,prepared:state.prepared}));
 await page.evaluate(()=>setTab('shop'));
 assert.equal(await page.locator('.cp77-item,.cp77-covered-row').filter({hasText:'Entrecôte'}).count(),0,'Completed dish is still in current shopping');
 await page.getByRole('button',{name:'Semana 2 · 7 dias',exact:true}).click();
 assert.equal(await page.locator('.cp77-item').filter({hasText:'Entrecôte'}).count(),0,'Consumed meal reserved stock again for next week');
 await page.locator('.cp77-covered > summary').click();
 assert.ok((await page.locator('.cp77-covered-row').filter({hasText:'Entrecôte'}).innerText()).includes(String(midweek.qty)));
 assert.equal(await page.evaluate(()=>JSON.stringify({stock:state.stock,history:state.stockUsedDays,selected:state.manualMeals,prepared:state.prepared})),afterConsumption,'Viewing projections changed saved data');
 await page.reload({waitUntil:'domcontentloaded'});
 assert.equal(await page.evaluate(()=>JSON.stringify({stock:state.stock,history:state.stockUsedDays,selected:state.manualMeals,prepared:state.prepared})),afterConsumption,'Midweek stock history did not survive reload');
 console.log('PASS: midweek shopping UI, once-only consumption, future reservation and exact persisted data');
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:844});
  for(const name of ['⌂ Hoje','▦ Plano','▤ Receitas','🛒 Compras','⚙ Ajustes']){
   await page.getByRole('button',{name,exact:true}).click();
   const widthInfo=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
   assert.ok(widthInfo[0]<=widthInfo[1]+3,`${name} overflows at ${width}: ${widthInfo}`);
  }
 }
 console.log('PASS: all five tabs without horizontal overflow at 320, 390, 768 and 1280 pixels');
 assert.deepEqual(errors,[],'Uncaught application errors');
 // Corruption fixture lives only in this isolated browser context.
 await page.evaluate(()=>localStorage.setItem('cp-v11','{broken'));
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForSelector('#cp-storage-warning');
 assert.equal(await page.evaluate(()=>localStorage.getItem('cp-v11')),'{broken');
 assert.equal(await page.evaluate(()=>window.CP_RELEASE),'8.7');
 console.log('PASS: corrupt storage shows recovery notice, boots the app and preserves original bytes');
}finally{await browser.close()}
