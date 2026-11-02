/* Planned complete portions are independent of recipe consultation scales. */
(function(global){
'use strict';
function count(map,day){return [1,2,3,4,5,6].includes(map?.[day])?map[day]:1}
function meal(base,map,day){
 const n=count(map,day);if(!base||n===1)return base;
 return {...base,baseItems:base.items,items:Object.fromEntries(Object.entries(base.items).map(([k,q])=>[k,q*n]))};
}
function locked(data,day,elapsed){
 return !Number.isInteger(day)||day<0||day>29||day<Math.max(0,elapsed)||!!data.prepared?.['day-'+day]||
  Object.hasOwn(data.stockUsedDays||{},day)||Number(data.cookStep?.[day]||0)>0;
}
function edit(data,day,n,elapsed){
 if(locked(data,day,elapsed)||!Number.isInteger(n)||n<1||n>6)throw Error('Não é possível alterar as porções deste dia.');
 return {...data.planPortions,[day]:n};
}
global.CPPlanPortions={count,meal,locked,edit};
if(typeof document==='undefined')return;
function install(){
 if(typeof state==='undefined'||state.currentTab!=='recipe'||state.previewMode)return;
 const root=document.getElementById('root');if(!root||root.querySelector('[data-plan-portions]'))return;
 const hero=root.querySelector('.hero');if(!hero)return;
 const day=state.day,n=count(state.planPortions,day),elapsed=planPosition().elapsed;
 const section=document.createElement('section');section.className='card';section.dataset.planPortions='';
 const heading=document.createElement('h3');heading.textContent='Porções no plano · dia '+(day+1);
 const label=document.createElement('label');label.textContent='Porções completas previstas ';
 const select=document.createElement('select');select.setAttribute('aria-label','Porções no plano');
 for(let i=1;i<=6;i++){const o=document.createElement('option');o.value=i;o.textContent=i+(i===1?' porção':' porções');o.selected=i===n;select.append(o)}
 select.disabled=locked(state,day,elapsed);label.append(select);
 const note=document.createElement('p');note.className='small';note.textContent=select.disabled?
  'Consulta protegida: dia passado, refeição concluída, consumo registado ou confeção em curso. Os históricos mantêm-se.':
  '1 porção corresponde aos ingredientes da receita base. Esta escolha altera compras, custo previsto, lotes e quantidades a cozinhar. Não desconta stock. A escala de consulta mantém-se independente. Para mais porções, usa um recipiente adequado ou cozinha em várias levas; os tempos não se multiplicam.';
 const summary=document.createElement('p');summary.dataset.plannedIngredients='';
 summary.textContent='Previsto neste dia: '+Object.entries(mealAt(day).items).map(([key,q])=>(products[key]?.[0]||key)+': '+q.toLocaleString('pt-PT')+(key==='ovos'?' un.':' g')).join(' · ');
 select.addEventListener('change',()=>{
  const value=Number(select.value);
  if(!confirm('Guardar '+value+' porções no dia '+(day+1)+'? As compras e as quantidades previstas serão recalculadas. O stock e os históricos mantêm-se.')){select.value=String(n);return}
  const previous=state.planPortions;
  try{state.planPortions=edit(state,day,value,planPosition().elapsed)}catch(e){select.value=String(n);alert(e.message);return}
  if(save()===false){state.planPortions=previous;select.value=String(n);return}
  render2();requestAnimationFrame(()=>document.querySelector('[data-plan-portions] select')?.focus({preventScroll:true}));
 });
 section.append(heading,label,summary,note);hero.after(section);
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install()})}
document.addEventListener('DOMContentLoaded',()=>{
 const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true});schedule();
});
})(typeof window!=='undefined'?window:globalThis);
