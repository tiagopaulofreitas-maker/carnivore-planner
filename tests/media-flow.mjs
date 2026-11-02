import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=fs.readFileSync('recipe-media.js','utf8');
const app=fs.readFileSync('app.js','utf8');
const raw=vm.runInNewContext('('+app.match(/const raw=(\[[\s\S]*?\]);\s*const meals=/)[1]+')');
const variants=vm.runInNewContext('('+app.match(/const lagartosRecipes=(\[[\s\S]*?\]);\s*lagartosRecipes\.forEach/)[1]+')');
const meals=raw.map(([name,method,line])=>({name,method,items:Object.fromEntries(line.split(',').map(part=>{const [k,q]=part.split(':');return [k,+q]}))})).concat(variants);
const mockDocument={
 getElementById:()=>null,
 addEventListener:()=>{},
 createElement:tag=>({
   tagName:tag,children:[],className:'',dataset:{},
   classList:{add(){}},style:{},appendChild(child){this.children.push(child)},
   setAttribute(){},addEventListener(){},remove(){}
 })
};
const context={
 window:{addEventListener:()=>{}},
 document:mockDocument,
 requestAnimationFrame:()=>{},
 console
};
vm.runInNewContext(root,context,{filename:'recipe-media.js'});
const images=context.window.CPRecipeMedia;
assert.ok(images);
assert.equal(meals.length,33);
let tests=0;
for(let i=0;i<meals.length;i++){
 const small=images.urlFor(meals[i],'thumb');
 const large=images.urlFor(meals[i],'large');
 assert.match(small,/^https:\/\/images\.unsplash\.com\/photo-/);
 assert.match(small,/w=220/);
 assert.match(large,/w=840/);
 assert.ok(large!==small);
 const frame=images.make(meals[i],'thumb');
 assert.equal(frame.children.length,2,'Photo needs fallback plus image');
 assert.equal(frame.children[1].loading,'lazy');
 assert.ok(frame.children[1].alt.includes('Fotografia ilustrativa'));
 tests++;
}
const ui=fs.readFileSync('daily-flow.js','utf8');
const stock=fs.readFileSync('shopping-stock.js','utf8');
assert.match(ui,/confirm\(/,'Suggestion changes must require confirmation');
assert.match(ui,/state\.manualMeals\[day\]=index/,'Confirmation must update plan');
assert.match(ui,/cp82-hero-quick/,'Daily shortcuts missing');
assert.match(ui,/cp82-next/,'Upcoming dinners missing');
assert.match(stock,/cp82-reconcile-btn/,'Stock purchase workflow missing');
assert.match(stock,/if\(!confirm\(/,'Purchased item transfer must have user confirmation');
const sw=fs.readFileSync('sw.js','utf8');
const index=fs.readFileSync('index.html','utf8');
for(const name of ['recipe-media','plan-intelligence','daily-flow']){
 assert.ok(sw.includes(name+'.js?v=92'),name+' not cached');
 assert.ok(index.includes(name+'.js?v=92'),name+' not linked');
}
assert.ok(index.includes('upgrade.css?v=92'));
assert.ok(sw.includes('images.unsplash.com'));
console.log('PASS: '+tests+' recipe photo mappings, offline fallbacks, daily UX and explicit stock confirmations');
