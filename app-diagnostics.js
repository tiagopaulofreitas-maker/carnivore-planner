/* Carnivore Planner v8.5 — on-device diagnostic with no meal or account data in report. */
(function(){
'use strict';
const root=document.getElementById('root');
if(!root)return;
let queued=false,latest=null;
function element(tag,cls,text){
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(text!=null)e.textContent=text;
 return e;
}
function button(label,handler){
 const b=element('button','',label);
 b.type='button';b.addEventListener('click',handler);
 return b;
}
function check(label,fn){
 try{
  const result=fn();
  if(result===false)return {label,ok:false,detail:'Verificação não passou'};
  if(typeof result==='string'&&result.startsWith('Atenção:'))return {label,ok:false,detail:result};
  return {label,ok:true,detail:typeof result==='string'?result:'OK'};
 }catch(error){
  return {label,ok:false,detail:String(error?.message||error).slice(0,160)};
 }
}
function run(){
 const rows=[
  check('Armazenamento local',()=>{
   const raw=localStorage.getItem('cp-v11');
   if(!raw)return false;
   const data=JSON.parse(raw);
   return data&&typeof data==='object'?'Dados acessíveis':false;
  }),
  check('Plano de 30 dias',()=>typeof mealAt==='function'&&
   Array.from({length:30},(_,i)=>mealAt(i)).every(m=>m&&typeof m.name==='string')),
  check('Biblioteca de receitas',()=>{
   if(typeof meals==='undefined'||!Array.isArray(meals))return false;
   if(meals.length<33)return 'Atenção: só '+meals.length+' das 33 receitas carregaram.';
   if(typeof window.cpOpenLibrary!=='function')return false;
   return meals.length+' receitas e pesquisa disponíveis';
  }),
  check('Passos de confeção',()=>{
   if(typeof window.cpGuideSteps!=='function')return false;
   return window.cpGuideSteps(mealAt(0),0,'frigideira').length>=4;
  }),
  check('Configuração de fotografias',()=>{
   const u=window.CPRecipeMedia?.urlFor(mealAt(0),'thumb');
   return typeof u==='string'&&u.startsWith('https://images.unsplash.com/')?
    'Referências disponíveis (não verifica o servidor das fotos)':false;
  }),
  check('Sugestões inteligentes',()=>{
   if(!window.CPPlanIntelligence?.eligibility)return false;
   const result=window.CPPlanIntelligence.eligibility({
    meals:[mealAt(0)],stock:{},prices:{},maxResults:1,today:'2026-11-01'
   });
   return result.length===1&&Number.isFinite(result[0].netEuros);
  }),
  check('Cálculo de compras e stock',()=>{
   if(!window.CPShoppingMath?.weekProjection)return false;
   const r=window.CPShoppingMath.weekProjection({
    meals,selected:state.manualMeals||{},stock:state.stock||{},week:0,asOfWeek:0,prices:{}
   });
   return r.rows.length>0&&Number.isFinite(r.netCost);
  }),
  check('Navegação inferior',()=>document.querySelectorAll('nav .navinner button').length===5),
  check('Ecrã sem largura excedida',()=>{
   return document.documentElement.scrollWidth<=window.innerWidth+3;
  })
 ];
 const sw=!!navigator.serviceWorker;
 const controlled=!!navigator.serviceWorker?.controller;
 rows.push({
  label:'PWA / Service Worker',ok:sw,
  detail:!sw?'Não suportado':controlled?'Ativo nesta página':'Disponível; ainda não controla esta página'
 });
 const report={
  version:String(window.CP_RELEASE||
   document.querySelector('header small')?.textContent.match(/v(\d+\.\d+)/)?.[1]||
   'desconhecida'),
  createdAt:new Date().toLocaleString('pt-PT'),
  platform:navigator.userAgent.includes('Android')?'Android':'Outro navegador',
  modules:rows,
  serviceWorkerControlled:controlled
 };
 latest=report;
 return report;
}
function summarize(report){
 return 'Carnivore Planner v'+report.version+' | '+report.createdAt+'\n'+
  'Plataforma: '+report.platform+'\n'+
  report.modules.map(x=>(x.ok?'OK':'ATENÇÃO')+' — '+x.label+': '+x.detail).join('\n')+
  '\nRelatório técnico sem receitas, quantidades, preços ou outros dados pessoais.';
}
function show(){
 if(typeof state==='undefined'||state.currentTab!=='budget'||root.querySelector('#cp83-diagnostics'))return;
 const block=element('section','cp83-diagnostics');
 block.id='cp83-diagnostics';
 const header=element('div','cp83-diagnostics-head');
 header.append(
  element('h3','','Diagnóstico da aplicação'),
  element('p','','Confirma os módulos e o armazenamento neste telemóvel. Não altera as tuas receitas ou o stock.')
 );
 const actions=element('div','cp83-diagnostics-buttons');
 const status=element('div','cp83-diagnostics-status','Toca em «Verificar» para executar os testes.');
 status.setAttribute('role','status');
 const inspect=button('✓ Verificar',()=>{
  const report=run();
  const ok=report.modules.filter(x=>x.ok).length;
  status.textContent=ok+' de '+report.modules.length+' verificações técnicas passaram.';
  results.replaceChildren();
  for(const item of report.modules){
   const line=element('div','cp83-diagnostic-row');
   const ico=element('span',item.ok?'cp83-good':'cp83-alert',item.ok?'✓':'!');
   const content=element('div','');
   content.append(element('strong','',item.label),element('small','',item.detail));
   line.append(ico,content);results.appendChild(line);
  }
 });
 const copy=button('Copiar relatório',async()=>{
  if(!latest)inspect.click();
  const payload=summarize(latest);
  try{
   if(!navigator.clipboard?.writeText)throw Error('Sem acesso à área de transferência');
   await navigator.clipboard.writeText(payload);
   status.textContent='Relatório copiado. Podes colar nesta conversa.';
  }catch(error){
   const field=element('textarea','cp83-fallback');
   field.value=payload;field.readOnly=true;
   results.prepend(field);field.focus();field.select();
   status.textContent='Seleciona e copia o texto do relatório abaixo.';
  }
 });
 actions.append(inspect,copy);
 const results=element('div','cp83-diagnostics-results');
 block.append(header,actions,status,results);
 const first=root.querySelector('h2');
 if(first)first.insertAdjacentElement('afterend',block);
 else root.insertBefore(block,root.firstChild);
}
function schedule(){
 if(queued)return;queued=true;
 requestAnimationFrame(()=>{queued=false;try{show()}catch(error){console.warn('Diagnóstico:',error)}});
}
new MutationObserver(schedule).observe(root,{childList:true,subtree:false});
window.addEventListener('pageshow',schedule);
window.CPDiagnostics={run,summary:summarize,show};
schedule();
})();