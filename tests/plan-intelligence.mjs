import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={window:{}};
vm.runInNewContext(fs.readFileSync('plan-intelligence.js','utf8'),context,{filename:'plan-intelligence.js'});
const p=context.window.CPPlanIntelligence;
const meals=[
 {name:'Entrecôte',method:'pan',items:{entrecote:300,ovos:2}},
 {name:'Lagartos',method:'pan',items:{lagartos:400,ovos:2}},
 {name:'Salmão',method:'fish',items:{salmao:300}},
 {name:'Acém lento',method:'braise',items:{acem:700}},
 {name:'Hambúrguer',method:'burger',items:{picada:250,ovos:1}}
];
const opts={meals,stock:{lagartos:450,ovos:3},stockMeta:{lagartos:{date:'2026-11-02'}},today:'2026-10-31',
 prices:{entrecote:28,ovos:.35,lagartos:14,salmao:19,acem:11,picada:15},day:4,current:[meals[0],meals[0],meals[0],meals[0]],maxResults:5};
const fromStock=p.eligibility({...opts,mode:'stock'});
assert.equal(fromStock[0].index,1,'Stock priority should favour owned lagartos');
assert.ok(fromStock[0].near>0,'Expiry-sensitive weighting missing');
const fromQuick=p.eligibility({...opts,mode:'quick'});
assert.ok(fromQuick.at(-1).minutes>=fromQuick[0].minutes,'Quick mode should demote slow dishes');
const fromBudget=p.eligibility({...opts,mode:'budget'});
assert.ok(fromBudget[0].euros<=fromBudget.at(-1).euros,'Budget mode should prefer cheaper recipes');
const fromVariety=p.eligibility({...opts,mode:'variety'});
assert.notEqual(fromVariety[0].index,0,'Variety should penalize repeated beef');
assert.equal(p.family(meals[2]),'peixe');
assert.equal(p.family(meals[1]),'porco');
assert.ok(p.cost(meals[0],opts.prices)>0);
assert.equal(opts.stock.lagartos,450,'Rankings cannot consume inventory');
assert.equal(opts.current.length,4,'Rankings cannot change planned meals');
console.log('PASS: ranking by inventory, date, minutes, price and variety without changing state');
