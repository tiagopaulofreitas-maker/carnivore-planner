import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const app=fs.readFileSync('app.js','utf8');
const guide=fs.readFileSync('cooking-guide.js','utf8');
const products=vm.runInNewContext('('+app.match(/const products=(\{[^;]+\});/)[1]+')');
const raw=vm.runInNewContext('('+app.match(/const raw=(\[[\s\S]*?\]);\s*const meals=/)[1]+')');
assert.equal(raw.length,30);
assert.equal(Object.keys(products).length,26);
assert.equal(products.duroc[0],'Cachaço de porco sem osso');
assert.ok(products.duroc[1]>0&&products.duroc[1]<9,'Expected regular pork reference price');
const dish=raw.find(x=>x[2].includes('duroc:'));
assert.ok(dish);
assert.match(dish[0],/cachaço de porco/);
assert.equal(dish[2].includes('duroc:250'),true,'Internal ingredient key must remain compatible with saved stock');
assert.ok(!app.includes('Porco Duroc'),'Old consumer-facing pork name survives');
assert.ok(!guide.includes('Corta o Duroc'),'Old preparation instruction survives');
assert.match(guide,/cachaço de porco sem osso/);
for(const [name,method,line] of raw){
 assert.ok(name&&method);
 for(const item of line.split(',')){
  const [key,qty]=item.split(':');
  assert.ok(Object.hasOwn(products,key),'Missing ingredient: '+key);
  assert.ok(Number(qty)>0,'Invalid quantity '+name);
 }
}
assert.ok(app.includes("localStorage.getItem('cp-v11')"),'Stored-data key changed');
assert.ok(app.includes("window.CP_RELEASE='8.4'"),'Release label mismatch');
console.log('PASS: 30 dishes, 26 products, regular pork label and price, unchanged stock key and user data');
