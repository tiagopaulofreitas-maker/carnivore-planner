import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const app=fs.readFileSync('app.js','utf8');
const dish={name:'Teste',items:{entrecote:495,ovos:3,manteiga:15}};
const c={state:{cookScale:{0:.5},prepared:{}},mealAt:()=>dish,practicalSteps:()=>[],category:()=>'',esc:String,tipFor:()=>'',cpHeroTime:()=>'',money:String,calc:()=>20,equipbar:()=>'',batchUI:()=>'',products:{entrecote:['Entrecôte'],ovos:['Ovos'],manteiga:['Manteiga']}};
const start=app.includes('function consultationScale(')?app.indexOf('function consultationScale('):app.indexOf('function practicalRecipe(');
vm.runInNewContext(app.slice(start,app.indexOf('function batchUI(',start)),c);
const html=c.practicalRecipe(0);
assert.ok(html.includes('1,5 un.'),'Half of three eggs must not silently round to two eggs');
assert.ok(html.includes('247,5 g'),'Half of 495g must not silently round to 248g');
console.log('PASS: half scale preserves fractional grams and eggs');
const protectedData={stock:{entrecote:1000,ovos:10},manualMeals:{0:0},batch:{maminha:2},stockUsedDays:{1:[1]},prepared:{'day-1':true},checked:{'0-ovos':true}};
Object.assign(c.state,JSON.parse(JSON.stringify(protectedData)));
const snapshot=JSON.stringify(Object.fromEntries(Object.keys(protectedData).map(k=>[k,c.state[k]])));
let saves=0;c.save=()=>saves++;c.render2=()=>{};
const scaleSource=app.slice(app.indexOf('function scaleRecipe(')).split('\n')[0];vm.runInNewContext(scaleSource,c);
for(const scale of [.5,1,2]){
 c.scaleRecipe(0,scale);
 const items=c.consultationItems(dish,c.consultationScale(0));
 assert.equal(items.ovos,3*scale);assert.equal(items.entrecote,495*scale);
 assert.equal(dish.items.ovos,3);assert.equal(dish.items.entrecote,495);
 const shown=c.practicalRecipe(0);
 assert.ok(shown.includes('aria-pressed="true"'));
 assert.ok(shown.includes('O plano, as compras, os lotes e o consumo de stock usam 1×'));
 assert.equal(JSON.stringify(Object.fromEntries(Object.keys(protectedData).map(k=>[k,c.state[k]]))),snapshot);
}
assert.equal(saves,3);c.scaleRecipe(0,99);assert.equal(saves,3);
c.state.cookScale[0]=99;assert.equal(c.consultationScale(0),1);assert.equal(c.state.cookScale[0],99,'Fallback must not overwrite legacy settings');
console.log('PASS: all three consultation scales, exact eggs/grams, explicit scope, invalid input and preserved plan/stock/history');
