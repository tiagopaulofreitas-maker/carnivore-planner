import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const app=fs.readFileSync('app.js','utf8');
const guide=fs.readFileSync('cooking-guide.js','utf8');
const source=app.match(/const raw=(\[[\s\S]*?\]);\s*const meals=/);
const pork=app.match(/const lagartosRecipes=(\[[\s\S]*?\]);\s*lagartosRecipes\.forEach/);
assert.ok(source&&pork,'Missing original recipes or pork variants');
const raw=vm.runInNewContext('('+source[1]+')');
const variants=vm.runInNewContext('('+pork[1]+')');
const meals=[
 ...raw.map(([name,method,line])=>({name,method,items:Object.fromEntries(
  line.split(',').map(s=>{const [key,value]=s.split(':');return [key,Number(value)]})
 )})),
 ...variants
];
const ctx={
 window:{},
 detailedSteps:()=>[],
 mealAt:i=>meals[i],
 chosen:i=>i,
 methodForDay:()=> 'frigideira',
 recommendedEquipment:()=> 'grelhador',
 requestAnimationFrame:()=>{},
 state:{currentTab:'home'}
};
vm.runInNewContext(guide,ctx,{filename:'cooking-guide.js'});
assert.equal(meals.length,33,'Expected 30 base dishes + 3 pork variants');
const methods=['grelhador','frigideira','air fryer','forno','panela'];
let cases=0;
for(let i=0;i<meals.length;i++){
 for(const method of methods){
  const steps=ctx.window.cpGuideSteps(meals[i],i,method);
  assert.equal(steps.length,5,'Wrong step count at recipe '+i+', '+method);
  for(const step of steps)assert.ok(typeof step==='string'&&step.length>=20,'Empty step at '+i);
  assert.match(steps.at(-1),/Segurança:/,'Food safety guidance missing at '+i);
  const summary=ctx.window.cpGuideTime(meals[i],i);
  assert.ok(summary?.length===2&&summary[0]>0&&summary[1]>=summary[0],'Bad duration at '+i);
  cases++;
 }
 const daySteps=ctx.detailedSteps(i);
 assert.equal(daySteps.length,5,'Planned-day cooking steps mismatched for recipe '+i);
}
assert.equal(cases,165);
assert.match(ctx.window.cpGuideSteps(meals[14],14,'panela')[1],/fervilhar/i,'Slow cooking instructions missing');
assert.match(ctx.window.cpGuideSteps(meals[31],31,'frigideira')[2],/duas ou três levas/i,'Black pork recipe details missing');
assert.match(ctx.window.cpGuideSteps(meals[10],10,'forno')[1],/190/i,'Salmon oven directions missing');

const library=fs.readFileSync('recipe-library.js','utf8');
assert.match(library,/window\.cpGuideSteps\(/,'Library does not use shared cooking guide');
const scriptHTML=fs.readFileSync('index.html','utf8');
assert.match(scriptHTML,/cooking-guide\.js\?v=86/,'Guide script not loaded');
const pwa=fs.readFileSync('sw.js','utf8');
assert.match(pwa,/cooking-guide\.js\?v=86/,'Guide is missing in offline cache');
console.log('PASS: '+cases+' equipment variants, 33 planned-day guides, safety and PWA integration');
