
/* Carnivore Atelier — progressive UX enhancements, no changes to saved app schema */
(function () {
 'use strict';
 let raf = false, pendingOnly = false, wakeLock = null;
 const root = document.getElementById('root');
 const nav = document.querySelector('nav');
 if (!root) return;
 function node(tag, className, text) {
  const el = document.createElement(tag);
  if(className) el.className = className;
  if(text != null) el.textContent = text;
  return el;
 }
 function actionButton(label, action) {
  const el = node('button', '', label);
  el.type='button';el.addEventListener('click',action);
  return el;
 }
 function homeExperience(){
  const hero=root.querySelector('.hero');
  if(!hero || root.querySelector('.cp-today-insight'))return;
  const completed=Array.from({length:30},(_,i)=>!!state.prepared['day-'+i]).filter(Boolean).length;
  const today=typeof todayIndex==='function'?todayIndex():0;
  const strip=node('div','cp-today-insight');
  const cells=[
   [(Math.min(30,today+1))+'/30','Dia do plano'],
   [completed+'/30','Concluídos'],
   [typeof money==='function'?money(state.budget):String(state.budget)+' €','Orçamento']
  ];
  for(const [value,label] of cells){
   const item=node('div','cp-insight');
   item.append(node('b','',value),node('span','',label));
   strip.appendChild(item);
  }
  hero.insertAdjacentElement('afterend',strip);
 }
 function recipeExperience(){
  const hero=root.querySelector('.hero');
  if(!hero || root.querySelector('.cp-toolbar'))return;
  const bar=node('div','cp-toolbar');
  const id=typeof chosen==='function'?chosen(state.day):state.day;
  const saved=!!state.favourites?.[id];
  bar.append(
   actionButton('▤ Explorar receitas',()=>{if(typeof showMealPicker==='function')showMealPicker(state.day);else setTab('library')}),
   actionButton(saved?'★ Nos favoritos':'☆ Guardar favorito',()=>{if(typeof toggleFavourite==='function')toggleFavourite(state.day)})
  );
  hero.insertAdjacentElement('afterend',bar);
 }
 function libraryExperience(){
  const form=root.querySelector('.lib-controls');
  if(!form||root.querySelector('[data-cp-shortcuts]'))return;
  const bar=node('div','cp-toolbar');
  bar.dataset.cpShortcuts='1';
  const quick=[
    ['★ Favoritos',()=>{const input=document.getElementById('lib-favs');if(input){input.checked=true;libFilter()}}],
    ['🥩 Lagartos',()=>{const input=document.getElementById('lib-search');if(input){input.value='lagartos';libFilter()}}],
    ['⚡ Rápidas',()=>{const input=document.getElementById('lib-method');if(input){input.value='rapido';libFilter()}}]
  ];
  for(const [label,handler] of quick)bar.append(actionButton(label,handler));
  form.insertAdjacentElement('afterend',bar);
 }
 function planExperience(){
  const progress=root.querySelector('.meter');
  if(!progress||root.querySelector('[data-cp-planfilter]'))return;
  const wrap=node('div','cp-toolbar');
  wrap.dataset.cpPlanfilter='1';
  const button=actionButton('',()=>{
   pendingOnly=!pendingOnly;
   updateFilter();
  });
  wrap.appendChild(button);
  progress.insertAdjacentElement('afterend',wrap);
  function updateFilter(){
   button.textContent=pendingOnly?'✓ A mostrar só por fazer · Ver todas':'◎ Mostrar só por fazer';
   const rows=[...root.querySelectorAll('.rowline[role="link"]')];
   rows.forEach((row,i)=>{
    const isDone=!!state.prepared['day-'+i];
    row.hidden=pendingOnly&&isDone;
    if(typeof todayIndex==='function'&&i===todayIndex())row.classList.add('cp-today-row');
   });
  }
  updateFilter();
 }
 function budgetExperience(){
  if(root.querySelector('.cp-budget-progress'))return;
  const grid=root.querySelector('.grid2');
  if(!grid)return;
  const spent=Object.values(state.spending||{}).reduce((sum,x)=>sum+(Number(x)||0),0);
  const cap=Math.max(0,Number(state.budget)||0);
  const percentage=cap?Math.min(100,spent/cap*100):0;
  const wrap=node('div','cp-budget-progress');
  const row=node('div','cp-budget-row');
  row.append(node('span','','Gastos registados'),node('b','',money(spent)+' / '+money(cap)));
  const track=node('div','cp-budget-track');
  const bar=node('span');bar.style.width=percentage.toFixed(1)+'%';
  track.appendChild(bar);
  wrap.append(row,track);
  grid.insertAdjacentElement('afterend',wrap);
 }
 function cookingExperience(){
  const step=root.querySelector('.stepbox');
  if(!step||root.querySelector('[data-cp-wakelock]'))return;
  const wrap=node('div','cp-kitchen-help');wrap.dataset.cpWakelock='1';
  const text=node('span','',wakeLock?'Ecrã mantido ligado enquanto cozinhas':'Evita que o ecrã se desligue durante a receita.');
  const button=actionButton(wakeLock?'Desativar':'Ecrã ligado',async()=>{
    if(wakeLock){
      const held=wakeLock;wakeLock=null;
      try{await held.release()}catch(e){}
      text.textContent='Ecrã automático restaurado.';
      button.textContent='Ecrã ligado';
      return;
    }
    if(!('wakeLock' in navigator)){
      text.textContent='Esta função não está disponível neste navegador.';
      return;
    }
    try{
      wakeLock=await navigator.wakeLock.request('screen');
      text.textContent='Ecrã mantido ligado enquanto cozinhas.';
      button.textContent='Desativar';
      wakeLock.addEventListener('release',()=>{wakeLock=null;button.textContent='Ecrã ligado';text.textContent='O bloqueio do ecrã terminou.'},{once:true});
    }catch(e){text.textContent='Não foi possível manter o ecrã ligado.'}
  });
  wrap.append(text,button);
  step.insertAdjacentElement('beforebegin',wrap);
 }
 function apply(){
  if(typeof state==='undefined')return;
  const tab=state.currentTab||'home';
  document.body.dataset.cpView=tab;
  if(tab!=='cook' && wakeLock){
   const held=wakeLock;wakeLock=null;held.release().catch(()=>{});
  }
  if(tab==='home')homeExperience();
  if(tab==='recipe')recipeExperience();
  if(tab==='library')libraryExperience();
  if(tab==='month')planExperience();
  if(tab==='budget')budgetExperience();
  if(tab==='cook')cookingExperience();
 }
 function schedule(){
  if(raf)return;
  raf=true;
  requestAnimationFrame(()=>{raf=false;apply()});
 }
 new MutationObserver(schedule).observe(root,{childList:true,subtree:false});
 if(nav)new MutationObserver(schedule).observe(nav,{childList:true,subtree:false});
 window.addEventListener('pageshow',schedule);
 schedule();
})();
