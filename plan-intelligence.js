/* Carnivore Planner v8 — recipe rankings are suggestions, not automatic edits. */
(function(global){
'use strict';
const num=v=>Math.max(0,Number(v)||0);
function family(meal){
 const k=Object.keys(meal?.items||{});
 if(k.some(x=>['salmao','atum','cavala','sardinha','camarao'].includes(x)))return 'peixe';
 if(k.includes('frango'))return 'frango';
 if(k.some(x=>['secretos','lagartos','plumas','barriga','duroc'].includes(x)))return 'porco';
 return 'novilho';
}
function time(meal,index){
 const custom=global.cpGuideTime?.(meal,index);
 if(Array.isArray(custom)&&Number.isFinite(custom[1]))return Number(custom[1]);
 return ['roast','braise'].includes(meal.method)?240:meal.method==='leftover'?25:40;
}
function cost(meal,prices){
 return Object.entries(meal?.items||{}).reduce((sum,[k,qty])=>{
  const price=num(prices[k]);return sum+(k==='ovos'?num(qty)*price:num(qty)*price/1000);
 },0);
}
function eligibility({meals,stock={},stockMeta={},prices={},day=0,current=[],mode='stock',today='2026-11-01',maxResults=4}){
 const dayIndex=Math.max(0,Math.min(29,Math.floor(Number(day)||0)));
 const prior=new Set(current.slice(Math.max(0,dayIndex-4),dayIndex).map(m=>family(m)));
 const todayUTC=Date.parse(today+'T12:00:00');
 return meals.map((meal,index)=>{
  const ingredients=Object.entries(meal.items||{});
  const required=ingredients.reduce((v,[k,q])=>v+num(q)*(k==='ovos'?60:1),0);
  let covered=0,soon=0;
  for(const [k,q] of ingredients){
   const need=num(q);
   const supply=Math.min(need,num(stock[k]));
   const weight=k==='ovos'?60:1;
   covered+=supply*weight;
   const d=stockMeta[k]?.date;
   const delta=d?Math.round((Date.parse(d+'T12:00:00')-todayUTC)/86400000):NaN;
   if(supply>0&&Number.isFinite(delta)&&delta>=0&&delta<=3)soon+=supply*weight;
  }
  const proportion=required?covered/required:0;
  const minutes=time(meal,index),euros=cost(meal,prices);
  const variety=!prior.has(family(meal));
  const affordable=1/(1+euros/12);
  const quick=1/(1+minutes/45);
  const near=required?soon/required:0;
  let score=0;
  if(mode==='quick')score=quick*8+proportion*2+affordable;
  else if(mode==='budget')score=affordable*8+proportion*3+quick;
  else if(mode==='variety')score=(variety?7:0)+proportion*2+affordable+quick;
  else score=proportion*7+near*5+affordable+quick;
  return {index,meal,coverage:proportion,near,euros,minutes,variety,score};
 }).filter(x=>!!x.meal).sort((a,b)=>b.score-a.score||a.euros-b.euros).slice(0,maxResults);
}
global.CPPlanIntelligence={eligibility,cost,time,family};
})(typeof window!=='undefined'?window:globalThis);
