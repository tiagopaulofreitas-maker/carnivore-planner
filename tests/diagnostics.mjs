import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const one={name:'Entrecôte',items:{entrecote:350},method:'pan'};
const meals=Array.from({length:33},(_,i)=>({...one,name:'Prato '+i}));
const state={currentTab:'budget',manualMeals:{2:3},stock:{entrecote:732},prepared:{'day-2':true}};
const initial=JSON.stringify(state);
const root={querySelector:()=>null};
const fakeWindow={
 CP_RELEASE:'8.10.4',innerWidth:390,
 addEventListener(){},
 cpOpenLibrary(){},
 cpGuideSteps(){return ['one','two','three','four','five']},
 CPRecipeMedia:{urlFor(){return 'https://images.unsplash.com/photo-example?w=220'}},
 CPPlanIntelligence:{eligibility(){return [{netEuros:2.0}]}},
 CPShoppingMath:{weekProjection(){return {rows:[{key:'entrecote'}],netCost:0}}}
};
const context={
 window:fakeWindow,
 document:{getElementById:()=>root,querySelectorAll:()=>Array.from({length:5}),documentElement:{scrollWidth:390}},
 navigator:{userAgent:'Android',serviceWorker:{controller:{}}},
 localStorage:{getItem(key){assert.equal(key,'cp-v11');return JSON.stringify(state)}},
 meals,mealAt:i=>meals[i],state,console,
 MutationObserver:class{observe(){}},
 requestAnimationFrame:()=>{}
};
vm.runInNewContext(fs.readFileSync('app-diagnostics.js','utf8'),context,{filename:'app-diagnostics.js'});
const report=fakeWindow.CPDiagnostics.run();
assert.equal(report.version,'8.10.4');
assert.equal(report.modules.length,10);
assert.equal(report.modules.filter(m=>m.ok).length,10);
const summary=fakeWindow.CPDiagnostics.summary(report);
assert.ok(summary.includes('Carnivore Planner v8.10.4'));
assert.ok(!summary.includes('732'));
assert.ok(!summary.includes('manualMeals'));
assert.equal(JSON.stringify(state),initial,'Diagnostics must never modify state');
console.log('PASS: 10/10 diagnostics, privacy-safe report, no saved-state changes');

context.navigator.serviceWorker.controller=null;
assert.equal(fakeWindow.CPDiagnostics.run().modules.at(-1).ok,false,'Support alone must not claim PWA is active');
context.meals[0].items={entrecote:-3};
assert.equal(fakeWindow.CPDiagnostics.run().modules.find(x=>x.label==='Biblioteca de receitas').ok,false);
console.log('PASS: inactive service worker and invalid recipe contents are reported');
