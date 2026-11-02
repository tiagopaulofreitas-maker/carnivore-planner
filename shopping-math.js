/* Carnivore Planner 7.7 — pure shopping calculations.
   Units: grams for food, individual units for eggs. */
(function(global){
'use strict';
function number(value){const n=Number(value);return Number.isFinite(n)&&n>0?n:0}
function sumNeeds(meals,selected,w,{fromDay=0,prepared={},stockUsedDays={},planPortions={}}={}){
 const output={};
 for(let i=w*7;i<Math.min(30,(w+1)*7);i++){
  const override=selected?.[i];
  const index=Number.isInteger(Number(override))&&override!==undefined&&override!==null?Number(override):i;
  const history=stockUsedDays[i];
  const used=Array.isArray(history)?history.includes(index):history===index;
  if(i<fromDay||prepared['day-'+i]===true||used)continue;
  const dish=meals[index]||meals[i];
  if(!dish)continue;
  for(const [k,amount] of Object.entries(dish.items||{}))
   output[k]=(output[k]||0)+number(amount)*([1,2,3,4,5,6].includes(planPortions[i])?planPortions[i]:1);
 }
 return output;
}
function weekFromIndex(day){if(Number(day)>=30)return 5;return Math.max(0,Math.min(5,Math.floor(Math.max(0,Number(day)||0)/7)))}
function weekProjection({meals,selected={},stock={},week=0,asOfWeek=0,asOfDay,prepared={},stockUsedDays={},planPortions={},prices={}}){
 const w=Math.max(0,Math.min(4,Math.floor(Number(week)||0)));
 const day=Number.isInteger(asOfDay)?Math.max(0,Math.min(30,asOfDay)):null;
 const origin=day===null?Math.max(0,Math.min(4,Math.floor(Number(asOfWeek)||0))):weekFromIndex(day);
 const remaining={fromDay:day??origin*7,prepared,stockUsedDays,planPortions};
 const demand=sumNeeds(meals,selected,w,w<origin?{planPortions}:remaining);
 const available={};
 // The recorded stock is the inventory on hand TODAY, not what existed in past weeks.
 // For upcoming weeks reserve it once, starting with the current plan week.
 for(const key of Object.keys(demand)){
  let availableQuantity=w<origin?0:number(stock[key]);
  for(let previous=origin;previous<w;previous++){
   const prior=sumNeeds(meals,selected,previous,remaining);
   availableQuantity=Math.max(0,availableQuantity-number(prior[key]));
  }
  available[key]=availableQuantity;
 }
 const rows=Object.entries(demand).map(([key,required])=>{
  const onHand=Math.min(required,available[key]||0);
  const toBuy=Math.max(0,required-onHand);
  const unitPrice=number(prices[key]);
  const eggs=key==='ovos';
  return {key,required,covered:onHand,toBuy,stockAvailable:available[key]||0,unit:eggs?'un.':'g',
   grossCost:required*unitPrice/(eggs?1:1000),
   netCost:toBuy*unitPrice/(eggs?1:1000)};
 });
 const grossCost=rows.reduce((a,b)=>a+b.grossCost,0);
 const netCost=rows.reduce((a,b)=>a+b.netCost,0);
 return {week:w,asOfWeek:origin,isPast:w<origin,rows,grossCost,netCost,coveredCost:Math.max(0,grossCost-netCost)};
}
global.CPShoppingMath={sumNeeds,weekFromIndex,weekProjection};
})(typeof window!=='undefined'?window:globalThis);
