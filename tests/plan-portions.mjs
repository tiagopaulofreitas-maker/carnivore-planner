import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const c={window:{},state:{planPortions:{0:2,6:3,7:2},manualMeals:{6:20,7:21},stock:{duroc:2000,ovos:12},prepared:{},stockUsedDays:{},cookStep:{},cookScale:{0:.5}},meals:Array.from({length:30},(_,i)=>({name:'Prato '+i,items:{duroc:200,ovos:3}})),calc:m=>Object.values(m.items).reduce((a,b)=>a+b,0)};
c.meals[20]={name:'Costela',items:{costela:500,ovos:2}};c.meals[21]={name:'Sobras',items:{costela:400,ovos:1}};
vm.runInNewContext(fs.readFileSync('plan-portions.js','utf8'),c);
vm.runInNewContext(fs.readFileSync('shopping-math.js','utf8'),c);
const source=fs.readFileSync('app.js','utf8');
for(const [a,b] of [['function chosen(','function mealAt('],['function mealAt(','function category('],['function consultationItems(','function consultationIngredients('],['function batchForDay(','function changeBatch(']]){
 vm.runInNewContext(source.slice(source.indexOf(a),source.indexOf(b)),c);
}
const api=c.window.CPPlanPortions,before=JSON.stringify(c.state),catalog=JSON.stringify(c.meals);
assert.equal(c.mealAt(0).items.duroc,400);assert.equal(c.mealAt(0).items.ovos,6);
assert.equal(c.consultationItems(c.mealAt(0),.5).ovos,1.5,'Consultation must scale base recipe, not plan portions');
assert.equal(c.batchForDay(6).grams,2300,'Cross-week batch must sum each day’s planned portions');
const projection=c.window.CPShoppingMath.weekProjection({meals:c.meals,selected:c.state.manualMeals,planPortions:c.state.planPortions,week:1,asOfDay:6,stock:{costela:2000}});
assert.equal(projection.rows.find(x=>x.key==='costela').required,800);assert.equal(projection.rows.find(x=>x.key==='costela').toBuy,300,'Prior week reserves 1500g once');
for(const bad of [0,.5,1.5,7,NaN,'2'])assert.throws(()=>api.edit(c.state,0,bad,0));
for(const data of [{...c.state,prepared:{'day-0':true}},{...c.state,stockUsedDays:{0:0}},{...c.state,stockUsedDays:{0:[]}},{...c.state,cookStep:{0:1}}])assert.throws(()=>api.edit(data,0,3,0));
assert.throws(()=>api.edit(c.state,0,3,1));
assert.equal(api.edit(c.state,0,3,0)[0],3);assert.equal(JSON.stringify(c.state),before);assert.equal(JSON.stringify(c.meals),catalog);
c.state.previewMode=true;assert.equal(c.mealAt(0).items.duroc,200);delete c.state.previewMode;
// Consumption uses the scaled plan only after explicit confirmation, once.
Object.assign(c,{document:{getElementById:()=>({})},MutationObserver:class{observe(){}},requestAnimationFrame(){},products:{duroc:['Porco'],ovos:['Ovos']},save(){},render2(){},confirm:()=>false,alert(){}});
c.window.addEventListener=()=>{};
vm.runInNewContext(fs.readFileSync('daily-flow.js','utf8'),c);
c.state.prepared['day-0']=true;c.window.CPDailyFlow.consume(0);assert.equal(c.state.stock.ovos,12);
c.confirm=()=>true;c.window.CPDailyFlow.consume(0);assert.equal(c.state.stock.ovos,6);assert.equal(c.state.stock.duroc,1600);
c.window.CPDailyFlow.consume(0);assert.equal(c.state.stock.ovos,6);
console.log('PASS: complete plan portions, independent fractional consultation, cross-week shopping/batch reservation, history locks, invalid inputs, no mutations and confirmed once-only consumption');
