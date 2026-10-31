import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push('console: '+message.text())});
async function expect(condition,msg){if(!condition)throw new Error(msg)}
async function action(label,fn){await fn();console.log('PASS '+label)}
try{
 await page.goto(base,{waitUntil:'networkidle'});
 await page.waitForSelector('nav .navinner button');
 await action('App starts with 5 tabs',async()=>expect(await page.locator('nav .navinner button').count()===5,'Missing bottom tabs'));
 await action('Recipes opens search library',async()=>{
   await page.locator('nav .navinner button').filter({hasText:'Receitas'}).click();
   await page.waitForSelector('#cp73-search',{timeout:5000});
   await expect(await page.locator('.cp73-card').count()>=30,'Recipe cards missing');
 });
 await action('Recipe search filters lagartos',async()=>{
   await page.locator('#cp73-search').fill('lagartos');
   await page.waitForTimeout(200);
   const count=await page.locator('[id=cp73-cards] .cp73-card:not([hidden])').count();
   await expect(count>=1&&count<30,'Search did not filter: '+count);
 });
 await action('Favorites can be toggled',async()=>{
   await page.locator('[id=cp73-cards] .cp73-card:not([hidden]) button[aria-label*="favorito"]').first().click();
   await page.locator('#cp73-favs').check();
   await expect(await page.locator('[id=cp73-cards] .cp73-card:not([hidden])').count()>=1,'Favorite not visible');
 });
 await action('Browsing and searching do not require a day',async()=>{
   await expect(await page.locator('#cp73-day').count()===0,'Day selection visible while browsing');
   await page.locator('#cp73-favs').uncheck();
 });
 await action('Recipe preview keeps the calendar unchanged',async()=>{
   const before=await page.evaluate(()=>JSON.stringify(state.manualMeals||{}));
   await page.locator('.cp73-card:not([hidden])').first().getByText('Ver receita').click();
   await page.waitForSelector('#cp73-preview .cp73-detail');
   await expect(await page.evaluate(()=>JSON.stringify(state.manualMeals||{}))===before,'Preview altered the calendar');
 });
 await action('Recipe details include ingredients and guided steps without changing the plan',async()=>{
   await expect(await page.locator('#cp73-preview .cp75-ingredients li').count()>=1,'Ingredient list missing');
   await expect(await page.locator('#cp73-preview .cp75-steps li').count()>=2,'Cooking instructions missing');
   await expect(await page.locator('#cp73-preview .cp75-meta-chip').count()>=3,'Time, cost or equipment missing');
 });
 await action('Recipe library supports sorting by price',async()=>{
   const before=await page.evaluate(()=>JSON.stringify(state.manualMeals||{}));
   await page.locator('#cp75-sort').selectOption('price');
   const prices=await page.locator('.cp73-card').evaluateAll(items=>items.map(x=>Number(x.dataset.cost)));
   await expect(prices.every((price,i)=>i===0||prices[i-1]<=price+0.001),'Sort by price is incorrect');
   await expect(await page.evaluate(()=>JSON.stringify(state.manualMeals||{}))===before,'Sorting unexpectedly edited calendar');
 });
 await action('Adding a recipe requires a day and confirmation',async()=>{
   const before=await page.evaluate(()=>JSON.stringify(state.manualMeals||{}));
   await page.locator('#cp73-preview').getByText('Adicionar ao plano').click();
   await page.waitForSelector('#cp74-day');
   await expect(await page.evaluate(()=>JSON.stringify(state.manualMeals||{}))===before,'Calendar altered before confirmation');
   await page.locator('#cp74-day').selectOption('0');
   await page.locator('.cp74-dialog').getByText('Confirmar alteração').click();
   await page.waitForSelector('h3:text("Como queres cozinhar?")');
 });
 await action('Equipment selector stays 5 and selection distinct',async()=>{
   await page.waitForSelector('[data-equipment-selector="6.3"]');
   const buttons=page.locator('[data-method-choice]');
   await expect(await buttons.count()===5,'Wrong equipment button count');
   await expect(await page.locator('[data-method-choice][data-selected="true"]').count()===1,'Expected single selected method');
 });
 await action('Cooking view and back to library',async()=>{
   await page.getByText('Começar a cozinhar', {exact:false}).first().click();
   await page.waitForSelector('.stepbox');
   await expect(await page.locator('#root').getByText('Passo 1 de 5').count()===1,'Guided cooking did not start with 5 steps');
   for(let step=2;step<=5;step++){
     await page.getByRole('button',{name:/Próximo/}).first().click();
     await expect(await page.locator('#root').getByText('Passo '+step+' de 5').count()===1,'Wrong progress at step '+step);
   }
   await expect(await page.getByRole('button',{name:/Concluir/}).count()>=1,'Finish button missing at last step');
   await page.locator('nav .navinner button').filter({hasText:'Receitas'}).click();
   await page.waitForSelector('#cp73-search',{timeout:5000});
   await expect(await page.locator('.stepbox').count()===0,'Still showing cooking mode');
 });
 await action('Saved data remains after reload',async()=>{
   const saved=await page.evaluate(()=>localStorage.getItem('cp-v11'));
   await expect(!!saved,'No saved state');
   await page.reload({waitUntil:'networkidle'});
   await expect(!!(await page.evaluate(()=>localStorage.getItem('cp-v11'))),'Saved data lost');
 });
 await action('Layout has no horizontal document overflow',async()=>{
   const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
   await expect(size.scroll<=size.width+2,'Document overflow '+JSON.stringify(size));
 });
 await action('Monthly total uses 30 selected meals',async()=>{
   const info=await page.evaluate(()=>({actual:total(),planned:Array.from({length:30},(_,i)=>calc(mealAt(i))).reduce((a,b)=>a+b,0)}));
   await expect(Math.abs(info.actual-info.planned)<0.01,'Monthly total includes recipes not in calendar: '+JSON.stringify(info));
 });
 await action('Recipes tab from persisted cooking screen',async()=>{
   await page.evaluate(()=>{state.currentTab='cook';state.day=0;save();render2()});
   await page.waitForSelector('.stepbox');
   await page.locator('nav .navinner button').filter({hasText:'Receitas'}).click();
   await page.waitForSelector('#cp73-search',{timeout:5000});
   await expect(await page.locator('.stepbox').count()===0,'Cook screen not replaced by search library');
 });
 await action('No uncaught errors',async()=>expect(!errors.length,errors.join(' | ')));
 console.log('ALL SMOKE TESTS PASSED');
}catch(e){console.error('SMOKE FAILURE:',e.stack||e);console.error('BROWSER ERRORS:',errors);await page.screenshot({path:'smoke-failure.png',fullPage:true});process.exitCode=1}
finally{await browser.close()}
