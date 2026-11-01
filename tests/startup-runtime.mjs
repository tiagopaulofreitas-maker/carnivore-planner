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
function run(withSW){
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
 const localStorage={getItem(){return null},setItem(key,value){
  assert.equal(key,'cp-v11');
  saved=value;
 }};
 const history={pushState(){},replaceState(){}};
 const location={pathname:'/',search:''};
 class MutationObserver{observe(){}}
 const factory=new Function('window','document','navigator','localStorage','history','location',
  'MutationObserver','requestAnimationFrame','setTimeout','clearTimeout','alert','confirm',
  source+'\n'+library+'\nreturn {count:meals.length,version:window.CP_RELEASE,library:typeof window.cpRenderLibrary,standaloneLibrary:typeof window.cpOpenLibrary,selected:state.currentTab}');
 return factory(window,document,navigator,localStorage,history,location,MutationObserver,
  ()=>{},()=>0,()=>{},()=>{},()=>true);
}
for(const enabled of [false,true]){
 const result=run(enabled);
 assert.equal(result.count,33,'App did not reach all three extra recipes');
 assert.equal(result.version,'8.5','App did not reach release initialization');
 assert.equal(result.library,'function','Library route not initialized');
 assert.equal(result.standaloneLibrary,'function','Independent searchable library not initialized');
 assert.ok(['home','recipe','cook','library','month','budget','shop'].includes(result.selected),'Invalid startup page');
}
assert.ok(source.includes('let oldShopping=shopping;'),'A mutable shopping reference is required');
assert.ok(!source.includes('const oldShopping=shopping;'),'Fatal assignment-to-const regression');
console.log('PASS: complete startup with and without service worker; 33 recipes and release metadata');
