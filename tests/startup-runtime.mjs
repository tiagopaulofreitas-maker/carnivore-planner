import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync('app.js','utf8');
const library=fs.readFileSync('recipe-library.js','utf8');
function node(){
 return {
  innerHTML:'',textContent:'',dataset:{},
  style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},
  appendChild(){},insertAdjacentElement(){},insertAdjacentHTML(){},after(){},
  querySelector(){return null},querySelectorAll(){return []},
  setAttribute(){},addEventListener(){},getBoundingClientRect(){return {}},remove(){}
 };
}
function run(withSW,initial=null){
 const root=node(),header=node(),nav=node(),small=node();
 header.querySelector=selector=>selector==='small'?small:null;
 const document={
  head:node(),body:node(),hidden:false,
  querySelector(selector){
   if(selector==='header')return header;
   if(selector==='header small')return small;
   if(selector==='nav')return nav;
   if(selector==='#root')return root;
   return null;
  },
  querySelectorAll(){return []},
  getElementById(id){return id==='root'?root:null},
  createElement(){return node()},
  addEventListener(){},
  documentElement:{scrollWidth:380}
 };
 const window={addEventListener(){}};
 const navigator=withSW?{serviceWorker:{addEventListener(){},controller:null}}:{};
 let saved='';
 const localStorage={getItem(){return initial},setItem(key,value){
  assert.equal(key,'cp-v11');
  saved=value;
 }};
 const history={pushState(){},replaceState(){}};
 const location={pathname:'/',search:''};
 class MutationObserver{observe(){}}
 const factory=new Function('window','document','navigator','localStorage','history','location',
  'MutationObserver','requestAnimationFrame','setTimeout','clearTimeout','alert','confirm',
  fs.readFileSync('plan-portions.js','utf8')+'\n'+fs.readFileSync('state-store.js','utf8')+'\n'+source+'\n'+library+'\nreturn {count:meals.length,version:window.CP_RELEASE,library:typeof window.cpRenderLibrary,standaloneLibrary:typeof window.cpOpenLibrary,selected:state.currentTab,day:state.day,stock:state.stock,manualMeals:state.manualMeals,blocked:window.CPStateStore.status().blocked,isSlowMeal}');
 const result=factory(window,document,navigator,localStorage,history,location,MutationObserver,
  ()=>{},()=>0,()=>{},()=>{},()=>true);
 return {...result,saved};
}
for(const enabled of [false,true]){
 const result=run(enabled);
 assert.equal(result.count,33,'App did not reach all three extra recipes');
 assert.equal(result.version,'8.10.4','App did not reach release initialization');
 assert.equal(result.library,'function','Library route not initialized');
 assert.equal(result.standaloneLibrary,'function','Independent searchable library not initialized');
 assert.ok(['home','recipe','cook','library','month','budget','shop'].includes(result.selected),'Invalid startup page');
}
assert.ok(source.includes('let oldShopping=shopping;'),'A mutable shopping reference is required');
assert.ok(!source.includes('const oldShopping=shopping;'),'Fatal assignment-to-const regression');
console.log('PASS: complete startup with and without service worker; 33 recipes and release metadata');

const legacy=JSON.stringify({start:'2026-11-01',hour:'19:00',budget:400,day:0,week:0,currentTab:'cook',manualMeals:{0:32},stock:{duroc:800},prices:{duroc:6}});
const resumed=run(true,legacy);
assert.equal(resumed.count,33);assert.equal(resumed.stock.duroc,800);assert.equal(resumed.manualMeals[0],32);
const corrupted=run(true,'{broken');assert.equal(corrupted.count,33);assert.equal(corrupted.blocked,true);assert.equal(corrupted.saved,'');
console.log('PASS: complete startup with selected extra recipe and corrupt storage without overwriting original');

assert.equal(run(false).isSlowMeal({method:'pan'}),false);

const nonToday=JSON.stringify({start:'2026-11-01',hour:'19:00',budget:400,day:7,week:0,currentTab:'recipe',manualMeals:{7:21},stock:{costela:200},batch:{costela:3}});
assert.equal(run(true,nonToday).day,7,'Reload must retain the recipe day being inspected, not replace it with today');
console.log('PASS: a recipe on a different day remains selected after full startup');
