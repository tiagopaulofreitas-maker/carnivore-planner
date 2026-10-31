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
 const prior=new Set(current.slice(Math.max(0,dayIndex-4),dayIndex).filter(Boolean).map(m=>family(m)));
 const todayUTC=Date.parse(today+'T12:00:00');
 return meals.map((meal,index)=>{
  const ingredients=Object.entries(meal.items||{});
  const required=ingredients.reduce((v,[k,q])=>v+num(q)*(k==='ovos'?60:1),0);
  let covered=0,soon=0,netEuros=0,needsReview=false;
  for(const [k,q] of ingredients){
   const need=num(q),inStock=num(stock[k]),price=num(prices[k]);
   const indicatedDate=stockMeta[k]?.date;
   const parsed=indicatedDate?Date.parse(indicatedDate+'T12:00:00'):NaN;
   const delta=Number.isFinite(parsed)&&Number.isFinite(todayUTC)?Math.round((parsed-todayUTC)/86400000):NaN;
   // A past reference date triggers review; stock stays untouched but is not
   // assumed usable for a recipe recommendation.
   const review=inStock>0&&Number.isFinite(delta)&&delta<0;
   if(review)needsReview=true;
   const supply=review?0:Math.min(need,inStock);
   const weight=k==='ovos'?60:1;
   covered+=supply*weight;
   if(supply>0&&Number.isFinite(delta)&&delta>=0&&delta<=3)soon+=supply*weight;
   netEuros+=Math.max(0,need-supply)*price/(k==='ovos'?1:1000);
  }
  const coverage=required?covered/required:0;
  const near=required?soon/required:0;
  const minutes=time(meal,index);
  const euros=cost(meal,prices);
  const variety=!prior.has(family(meal));
  const cheap=1/(1+netEuros/12);
  const quick=1/(1+minutes/45);
  let score;
  if(mode==='quick')score=quick*10+coverage*1.5+cheap;
  else if(mode==='budget')score=cheap*10+coverage*.8+quick*.2;
  else if(mode==='variety')score=(variety?7:0)+coverage*2+cheap+quick;
  else score=coverage*7+near*5+cheap+quick;
  return {index,meal,coverage,near,euros,netEuros,minutes,variety,needsReview,score};
 }).filter(x=>!!x.meal).sort((a,b)=>{
   if(mode==='budget')return a.netEuros-b.netEuros||b.coverage-a.coverage||a.euros-b.euros;
   if(mode==='quick')return a.minutes-b.minutes||b.coverage-a.coverage||a.netEuros-b.netEuros;
   return b.score-a.score||a.netEuros-b.netEuros;
 }).slice(0,maxResults);
}
global.CPPlanIntelligence={eligibility,cost,time,family};
})(typeof window!=='undefined'?window:globalThis);
