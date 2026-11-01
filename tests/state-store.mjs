import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const defaults={start:'2026-11-01',hour:'19:00',budget:400,day:0,week:0,prices:{},checked:{},notes:{}};
function fixture(original){
 const data=new Map(original===undefined?[]:[['cp-v11',original]]);let failKey=null;
 const context={window:{},localStorage:{getItem:k=>data.get(k)??null,setItem(k,v){if(k===failKey)throw Error('QuotaExceededError');data.set(k,v)}}};
 vm.runInNewContext(fs.readFileSync('state-store.js','utf8'),context);
 return {store:context.window.CPStateStore,data,fail:k=>failKey=k};
}
const original=JSON.stringify({...defaults,manualMeals:{0:32},stock:{duroc:850,ovos:4},prices:{duroc:6.25},notes:{0:'<texto pessoal>'},customFutureField:{enabled:true}});
const good=fixture(original),loaded=good.store.load(defaults);
assert.equal(loaded.stock.duroc,850);assert.equal(loaded.prices.duroc,6.25);assert.equal(loaded.manualMeals[0],32);
assert.equal(loaded.customFutureField.enabled,true,'Unknown fields must survive valid migrations');
assert.equal(good.store.write(loaded),true);
for(const bad of ['{broken','null','[]',JSON.stringify({...defaults,prices:null}),JSON.stringify({...defaults,manualMeals:{0:999}}),JSON.stringify({...defaults,weightLog:[{date:'<img onerror=alert(1)>',kg:70}]})]){
 const f=fixture(bad),state=f.store.load(defaults);
 assert.equal(state.start,defaults.start);assert.equal(f.store.status().blocked,true);
 assert.equal(f.store.write(state),false);assert.equal(f.data.get('cp-v11'),bad,'Invalid original was overwritten');
 assert.equal(f.store.original(),bad);
}
for(const bad of [{start:'2026-02-30'},{hour:'25:00'},{stock:{ovos:1.5}},{budget:-1},{stock:{duroc:Infinity}},{equipment:'<svg>'},{stockMeta:{duroc:null}}]){
 assert.throws(()=>good.store.validate({...defaults,...bad},defaults));
}
const next=good.store.validate({...defaults,budget:500},defaults);
good.fail('cp-v11');assert.equal(good.store.replace(next),false);
assert.equal(good.data.get('cp-v11'),JSON.stringify(loaded),'Failed import changed the original');
assert.ok(good.store.status().message);
good.fail(null);assert.equal(good.store.replace(next),true);
assert.equal(good.data.get('cp-v11-before-import'),JSON.stringify(loaded));
assert.equal(JSON.parse(good.data.get('cp-v11')).budget,500);
assert.equal(good.store.status().blocked,false);
const blockedRead={window:{},localStorage:{getItem(){throw Error('SecurityError')}}};
vm.runInNewContext(fs.readFileSync('state-store.js','utf8'),blockedRead);
assert.equal(blockedRead.window.CPStateStore.load(defaults).budget,400);
assert.equal(blockedRead.window.CPStateStore.status().blocked,true);
console.log('PASS: legacy state preservation, invalid/corrupt data isolation, storage denial, quota failure and recoverable atomic import');

const ledger=fixture(JSON.stringify({...defaults,stockUsedDays:{0:[0,1],1:0}}));
const ledgerState=ledger.store.load(defaults);
assert.deepEqual(Array.from(ledgerState.stockUsedDays[0]),[0,1]);
assert.equal(ledgerState.stockUsedDays[1],0);
assert.equal(ledger.store.write(ledgerState),true);
const reloaded=ledger.store.load(defaults);
assert.deepEqual(Array.from(reloaded.stockUsedDays[0]),[0,1]);
console.log('PASS: new consumption history and legacy numeric markers survive save/reload');
