import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const meals=[
 {name:'A',items:{duroc:200,ovos:2}},
 {name:'B',items:{duroc:100,ovos:1}}
];
let selection=0,accepted=true,confirmations=0;
const state={prepared:{'day-0':true},stock:{duroc:1000,ovos:10},stockUsedDays:{}};
const context={
 window:{addEventListener(){}},document:{getElementById:()=>({})},
 MutationObserver:class{observe(){}},requestAnimationFrame(){},
 state,meals,products:{duroc:['Porco'],ovos:['Ovos']},
 mealAt:()=>meals[selection],chosen:()=>selection,
 confirm(){confirmations++;return accepted},save(){},render2(){},alert(){}
};
vm.runInNewContext(fs.readFileSync('daily-flow.js','utf8'),context);
const consume=()=>context.window.CPDailyFlow.consume(0);
consume();assert.equal(state.stock.duroc,800);assert.equal(state.stock.ovos,8);
consume();assert.equal(state.stock.duroc,800,'Repeated click deducted twice');
selection=1;consume();assert.equal(state.stock.duroc,700);assert.equal(state.stock.ovos,7);
selection=0;consume();assert.equal(state.stock.duroc,700,'A -> B -> A deducted A twice');
assert.deepEqual(Array.from(state.stockUsedDays[0]),[0,1]);
assert.equal(confirmations,2,'Already consumed recipes should not prompt again');
state.stockUsedDays={0:0};selection=0;consume();assert.equal(state.stock.duroc,700,'Legacy marker was ignored');
selection=1;accepted=false;consume();assert.equal(state.stock.duroc,700);assert.equal(state.stockUsedDays[0],0,'Cancelled action changed history');
accepted=true;consume();assert.deepEqual(Array.from(state.stockUsedDays[0]),[0,1]);
assert.equal(state.stock.duroc,600);
state.prepared['day-0']=false;state.stockUsedDays={};consume();assert.equal(state.stock.duroc,600,'Unfinished meal deducted inventory');
console.log('PASS: stock consumption is once per day/recipe, A-B-A safe, backward compatible and cancellation leaves data unchanged');
