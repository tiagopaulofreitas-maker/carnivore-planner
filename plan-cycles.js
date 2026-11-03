/* Explicit cycle transition with immutable, independently rendered archives. */
(function(global){
'use strict';
const copy=value=>JSON.parse(JSON.stringify(value));
function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value}
function after30(start){if(!validDate(start))throw Error('Data inválida.');const d=new Date(start+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+30);return d.toISOString().slice(0,10)}
function create(data,{id,start,now,days,today=now?.slice(0,10)}){
 if(data.cycleArchives?.some(x=>x.id===id))return data;
 if(typeof id!=='string'||!id||!validDate(start)||!Number.isFinite(Date.parse(now)))throw Error('Novo ciclo inválido.');
 const firstAllowed=after30(data.start);
 if(!validDate(today)||today<firstAllowed||start<firstAllowed)throw Error('O novo ciclo só pode começar depois dos 30 dias do ciclo atual.');
 if(start<today)throw Error('Escolhe hoje ou uma data futura para o novo ciclo.');
 if(data.previewMode)throw Error('Fecha a consulta temporária antes de iniciar outro ciclo.');
 const snapshot=copy(data);delete snapshot.cycleArchives;
 const archive={id,archivedAt:now,snapshot,days:copy(days)};
 const next={...data,cycleArchives:[...(data.cycleArchives||[]),archive],start,day:0,week:0,currentTab:'month',libraryDay:0};
 for(const key of ['manualMeals','planPortions','prepared','checked','notes','spending','stockUsedDays','cookStep','cookScale','completed','timers','doneSteps','cookStart','equipmentByDay'])next[key]={};
 for(const key of ['libraryPrevious','libraryPreview','previewMode'])delete next[key];
 global.CPStateStore.validate(next,data);return next;
}
global.CPPlanCycles={create,after30};
if(typeof document==='undefined')return;
const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
function todayLocal(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function install(){
 if(typeof state==='undefined'||state.currentTab!=='month')return;
 const root=document.getElementById('root');if(!root||root.querySelector('[data-plan-cycles]'))return;
 const section=make('section');section.className='card';section.dataset.planCycles='';const heading=make('h3','Ciclos de 30 dias');heading.tabIndex=-1;section.append(heading);
 const firstAllowed=after30(state.start),today=todayLocal(),form=make('form'),op=crypto.randomUUID();
 const date=make('input');date.type='date';date.required=true;date.min=today>firstAllowed?today:firstAllowed;date.value=date.min;date.setAttribute('aria-label','Início do novo ciclo');
 const label=make('label','Início do novo ciclo ');label.append(date);const button=make('button','Arquivar e iniciar novo ciclo');button.type='submit';button.className='primary';button.disabled=today<firstAllowed||global.CPStateStore.status().blocked;
 form.append(label,button);form.style.display='grid';form.style.gap='10px';date.style.maxWidth='100%';
 section.append(make('p','Disponível após terminar os 30 dias atuais. Guarda uma cópia do ciclo anterior para consulta e inicia o plano base de 30 receitas. Os inventários, preços, favoritos, peso e preferências mantêm-se. Nada acontece automaticamente.'),form);
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;
  if(!confirm('Arquivar o ciclo iniciado em '+state.start+' e iniciar outro em '+date.value+'?\n\nO histórico anterior fica apenas para consulta. O novo plano começa sem conclusões, compras marcadas ou consumo registado. Stock e cozinhados disponíveis mantêm-se.'))return;
  try{
   if(global.CPStateStore.status().blocked)throw Error('Exporta e recupera os dados originais antes de iniciar outro ciclo.');
   const days=Array.from({length:30},(_,i)=>{const m=mealAt(i);return {name:m.name,items:{...m.items},steps:typeof detailedSteps==='function'?detailedSteps(i):[]}});
   const next=create(state,{id:op,start:date.value,now:new Date().toISOString(),today:todayLocal(),days});
   if(next===state)return;
   if(!global.CPStateStore.replace(next,'before-cycle'))return;
   state=next;if(typeof cancelTimer==='function')cancelTimer();render2();requestAnimationFrame(()=>document.querySelector('[data-plan-cycles] h3')?.focus());
  }catch(error){alert(error.message)}
 });
 for(const archive of state.cycleArchives||[]){
  const details=make('details');details.dataset.cycleArchive=archive.id;details.append(make('summary','Ciclo iniciado em '+archive.snapshot.start+' · apenas consulta'));
  details.append(make('p','As quantidades e instruções foram guardadas no momento do arquivo. As compras abaixo são os ingredientes planeados; não recalculam o stock atual.'));
  archive.days.forEach((day,i)=>{
   const d=new Date(archive.snapshot.start+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);
   const row=make('details');row.append(make('summary',d.toISOString().slice(0,10)+' · '+day.name+(archive.snapshot.prepared?.['day-'+i]?' · concluído':'')));
   row.append(make('p',Object.entries(day.items).map(([key,n])=>(products[key]?.[0]||key)+': '+n.toLocaleString('pt-PT')+(key==='ovos'?' un.':' g')).join(' · ')));
   if(archive.snapshot.notes?.[i])row.append(make('p','Nota: '+archive.snapshot.notes[i]));
   const used=archive.snapshot.stockUsedDays?.[i];if(used!==undefined)row.append(make('p','Consumo registado (IDs das receitas): '+JSON.stringify(used)));
   const ol=make('ol');for(const step of day.steps)ol.append(make('li',step));row.append(ol);details.append(row);
  });
  for(let w=0;w<5;w++){
   const needs={};for(const day of archive.days.slice(w*7,Math.min(30,w*7+7)))for(const [key,n] of Object.entries(day.items))needs[key]=(needs[key]||0)+n;
   const row=make('details');row.append(make('summary','Compras planeadas · semana '+(w+1)));
   for(const [key,n] of Object.entries(needs))row.append(make('p',(archive.snapshot.checked?.[w+'-'+key]?'✓ ':'')+(products[key]?.[0]||key)+': '+n.toLocaleString('pt-PT')+(key==='ovos'?' un.':' g')));
   if(archive.snapshot.spending?.[w]!=null)row.append(make('p','Despesa registada: '+archive.snapshot.spending[w]+' €'));details.append(row);
  }
  section.append(details);
 }
 root.prepend(section);
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install()})};
document.addEventListener('DOMContentLoaded',()=>{const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true});schedule()});
})(typeof window!=='undefined'?window:globalThis);
