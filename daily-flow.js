/* Carnivore Planner v8.0–8.2 — quick daily workflow, guided choices and stock-aware suggestions.
   Enhancements only: all persistent state remains under cp-v11. */
(function(){
'use strict';
const root=document.getElementById('root');
if(!root)return;
const engine=window.CPPlanIntelligence;
const media=window.CPRecipeMedia;
let mode='stock',pending=false;
const filters=[
 ['stock','📦 Usar stock'],
 ['quick','⚡ Pouco tempo'],
 ['budget','💶 Gastar menos'],
 ['variety','✨ Variar']
];
function create(tag,cls,text){
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!=null)el.textContent=text;
 return el;
}
function action(label,cls,callback){
 const b=create('button',cls,label);
 b.type='button';b.addEventListener('click',callback);
 return b;
}
function euro(n){return (Number(n)||0).toLocaleString('pt-PT',{style:'currency',currency:'EUR'})}
function currentDay(){try{return typeof todayIndex==='function'?todayIndex():0}catch(e){return Math.max(0,Number(state?.day)||0)}}
function prices(){return Object.fromEntries(Object.keys(products||{}).map(k=>[k,typeof price==='function'?price(k):products[k][1]]))}
function recommendations(day,selectedMode){
 if(!engine||typeof meals==='undefined'||typeof state==='undefined')return [];
 const chosenMeals=Array.from({length:30},(_,i)=>typeof mealAt==='function'?mealAt(i):meals[i]);
 return engine.eligibility({
  meals,stock:state.stock||{},stockMeta:state.stockMeta||{},
  prices:prices(),day,current:chosenMeals,mode:selectedMode,
  today:((()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})()),
  maxResults:4
 });
}
function confirmMeal(index,day){
 if(typeof state==='undefined'||typeof mealAt!=='function'||!meals[index])return;
 const previous=mealAt(day);
 const next=meals[index];
 if(previous===next)return;
 if(!confirm('Alterar o dia '+(day+1)+'?\n\nAtual: '+previous.name+'\nNovo: '+next.name+'\n\nA lista de compras será recalculada.'))return;
 if(!state.manualMeals||typeof state.manualMeals!=='object')state.manualMeals={};
 state.manualMeals[day]=index;
 if(state.prepared?.['day-'+day])state.prepared['day-'+day]=false;
 if(state.cookStep)state.cookStep[day]=0;
 state.day=day;state.currentTab='recipe';
 if(typeof save==='function')save();
 if(typeof render2==='function')render2();
 window.scrollTo(0,0);
}
function consumedRecipes(day){
 const entry=state.stockUsedDays?.[day];
 // Older installations stored just the latest recipe index for each day.
 return Array.isArray(entry)?entry:Number.isInteger(entry)?[entry]:[];
}
function consumeStock(day){
 if(typeof state==='undefined'||typeof mealAt!=='function')return;
 const meal=mealAt(day),index=typeof chosen==='function'?chosen(day):day;
 if(!state.prepared?.['day-'+day])return;
 if(consumedRecipes(day).includes(index))return;
 const available=Object.entries(meal.items||{}).filter(([key])=>Number(state.stock?.[key])>0);
 if(!available.length){alert('Não existem ingredientes deste prato registados no stock.');return;}
 const lines=available.map(([k,required])=>{
  const used=Math.min(Number(state.stock[k])||0,Number(required)||0);
  return (products[k]?.[0]||k)+': '+used+(k==='ovos'?' un.':' g');
 });
 if(!confirm('Descontar do stock o que consumiste no jantar do dia '+(day+1)+'?\n\n'+lines.join('\n')+
  '\n\nEsta operação só será aplicada uma vez por receita.'))return;
 if(!state.stockUsedDays||typeof state.stockUsedDays!=='object')state.stockUsedDays={};
 for(const [key,qty] of available){
  const left=Math.max(0,(Number(state.stock[key])||0)-(Number(qty)||0));
  if(left>0)state.stock[key]=left;
  else {delete state.stock[key];if(state.stockMeta)delete state.stockMeta[key];}
 }
 state.stockUsedDays[day]=[...consumedRecipes(day),index];
 save();render2();
}
function renderSuggestions(holder,day){
 const box=create('section','cp82-recommendations');
 box.dataset.cpSuggestions='yes';
 const title=create('div','cp82-recs-title');
 title.append(create('h3','','Sugestões para o teu jantar'),
  create('p','','Usa o que tens, poupa tempo ou varia. As sugestões excluem sobras, porque o stock não confirma porções já cozinhadas. Nada é trocado automaticamente.'));
 const tabs=create('div','cp82-mode-tabs');
 tabs.setAttribute('role','group');
 tabs.setAttribute('aria-label','Tipo de sugestão');
 filters.forEach(([id,label])=>{
  const btn=action(label,mode===id?'active':'',()=>{mode=id;update();});
  btn.dataset.mode=id;btn.setAttribute('aria-pressed',String(mode===id));tabs.appendChild(btn);
 });
 const choices=create('div','cp82-choices');
 function update(){
  [...tabs.querySelectorAll('button')].forEach(b=>{
   const yes=b.dataset.mode===mode;
   b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));
  });
  const ranked=recommendations(day,mode);
  choices.replaceChildren();
  for(const suggestion of ranked){
   const {index,meal,coverage,euros,netEuros,minutes,near,variety,needsReview}=suggestion;
   const card=create('div','cp82-choice');
   if(media)card.appendChild(media.make(meal,'thumb'));
   else card.appendChild(create('span','cp82-icon','🥩'));
   const body=create('div','cp82-choice-info');
   const name=create('strong','',meal.name);
   const desc=create('small','',
    (minutes>=60?Math.round(minutes/60*10)/10+' h':minutes+' min')+
    ' · '+euro(netEuros)+' por comprar ('+euro(euros)+' total) · '+Math.round(coverage*100)+'% disponível'+
    (near>0?' · Data próxima':'')+
    (needsReview?' · Verificar datas do stock':'')+
    (mode==='variety'&&variety?' · Boa variedade':''));
   body.append(name,desc);
   const open=action('Ver','cp82-text-action',()=>{
    if(typeof window.cpOpenLibrary==='function'){
     window.cpOpenLibrary();
     const q=document.getElementById('cp73-search');
     if(q){q.value=meal.name;q.dispatchEvent(new Event('input',{bubbles:true}));q.focus()}
    }
   });
   const change=action('Escolher','cp82-pick',()=>confirmMeal(index,day));
   const controls=create('div','cp82-choice-actions');controls.append(open,change);
   card.append(body,controls);choices.appendChild(card);
  }
 }
 box.append(title,tabs,choices);
 holder.appendChild(box);
 update();
}
function home(){
 if(typeof state==='undefined'||state.currentTab!=='home')return;
 const hero=root.querySelector('.hero');
 if(!hero)return;
 const day=currentDay(),meal=mealAt(day);
 // The old button pointed to recipe details despite being labelled "cook now".
 const primary=[...hero.querySelectorAll('button')].find(b=>b.textContent.includes('Cozinhar agora'));
 if(primary&&!primary.dataset.cpDirectCook){
  primary.dataset.cpDirectCook='1';
  primary.textContent='▶ Cozinhar agora';
  primary.removeAttribute('onclick');
  primary.addEventListener('click',e=>{
   e.stopPropagation();
   if(typeof startKitchen==='function')startKitchen(day);
   else if(typeof routeDay==='function')routeDay(day);
  });
 }
 if(!hero.querySelector('.cp82-hero-quick')){
  const quick=create('div','cp82-hero-quick');
  quick.append(
   action('▤ Ver receita','cp82-secondary',e=>{if(typeof routeDay==='function')routeDay(day)}),
   action('🛒 Lista de sábado','cp82-secondary',()=>{
    state.week=Math.max(0,Math.min(4,Math.floor(day/7)));save();setTab('shop');
   })
  );
  hero.appendChild(quick);
 }
 if(root.querySelector('#cp82-home'))return;
 const block=create('div','cp82-home');
 block.id='cp82-home';
 const progress=create('section','cp82-day-progress');
 const complete=Array.from({length:30},(_,i)=>!!state.prepared?.['day-'+i]).filter(Boolean).length;
 progress.append(create('small','','30 JANTARES · PROGRESSO'),create('strong','',complete+' / 30 concluídos'));
 const meter=create('div','cp82-progress-track');
 const bar=create('span');bar.style.width=(complete/30*100)+'%';meter.appendChild(bar);progress.appendChild(meter);
 block.appendChild(progress);
 const selectedId=typeof chosen==='function'?chosen(day):day;
 if(state.prepared?.['day-'+day]&&!consumedRecipes(day).includes(selectedId)){
  const stockAction=action('− Descontar ingredientes consumidos do stock','cp82-consume',()=>consumeStock(day));
  block.appendChild(stockAction);
 }
 const upcoming=create('section','cp82-next');
 upcoming.append(create('h3','','Próximos jantares'));
 for(let i=1;i<=3&&day+i<30;i++){
  const n=day+i,dish=mealAt(n);
  const row=create('button','cp82-next-item');
  row.type='button';
  if(media)row.appendChild(media.make(dish,'thumb'));
  const words=create('span','cp82-next-info');
  words.append(create('small','','Dia '+(n+1)),create('strong','',dish.name));
  row.append(words,create('span','','›'));
  row.addEventListener('click',()=>routeDay(n));
  upcoming.appendChild(row);
 }
 if(day<29)block.appendChild(upcoming);
 else block.appendChild(create('p','','Este é o último jantar do plano. Não será iniciado outro ciclo automaticamente.'));
 renderSuggestions(block,day);
 hero.insertAdjacentElement('afterend',block);
 // Hide the former redundant "Tomorrow" section, retaining accessible next-three list.
 const headers=[...root.querySelectorAll('h3.section')];
 const tomorrow=headers.find(h=>h.textContent.trim()==='Amanhã');
 if(tomorrow){
  const next=tomorrow.nextElementSibling;
  tomorrow.classList.add('cp82-legacy-hidden');
  if(next?.classList.contains('tile'))next.classList.add('cp82-legacy-hidden');
 }
}
function stock(){
 if(typeof planPosition==='function'&&planPosition().status!=='active')return;
 if(typeof state==='undefined'||state.currentTab!=='shop')return;
 const view=root.querySelector('#cp77-shopping[data-mode="stock"]');
 if(!view||view.querySelector('[data-cp-suggestions]'))return;
 const target=create('div','cp82-inventory-recs');
 const day=currentDay();
 renderSuggestions(target,day);
 view.appendChild(target);
}
function kitchen(){
 if(typeof state==='undefined'||!['recipe','cook'].includes(state.currentTab))return;
 if(root.querySelector('.cp82-slow-tip'))return;
 const meal=mealAt(state.day);
 if(!isSlowMeal(meal))return;
 const slow=create('div','cp82-slow-tip');
 const range=window.cpGuideTime?.(meal,typeof chosen==='function'?chosen(state.day):state.day);
 const mins=Number(range?.[1])||240;
 const hour=(String(state.hour||'19:00').split(':').map(Number));
 const serve=(Number.isFinite(hour[0])?hour[0]:19)*60+(hour[1]||0);
 const start=(serve-mins+1440)%1440;
 slow.textContent='⏳ Preparação antecipada: para servir às '+String(state.hour||'19:00')+', começa por volta das '+
  String(Math.floor(start/60)).padStart(2,'0')+':'+String(start%60).padStart(2,'0')+
  '. A cozedura lenta depende do corte; confirma sempre a maciez.';
 const target=root.querySelector('.hero')||root.querySelector('.stepbox');
 if(target)target.insertAdjacentElement('afterend',slow);
}
function settings(){
 if(state.currentTab!=='budget'||root.querySelector('#cp82-view-choice'))return;
 const panel=create('section','cp82-setting');
 panel.id='cp82-view-choice';
 const label=create('div','');
 label.append(create('strong','','Interface compacta'),create('small','','Reduz o espaço entre cartões sem esconder receitas ou dados.'));
 const btn=action(state.compactView?'Ativa':'Desativada','cp82-setting-toggle',()=>{
  state.compactView=!state.compactView;
  if(typeof save==='function')save();
  document.body.classList.toggle('cp82-compact',!!state.compactView);
  btn.textContent=state.compactView?'Ativa':'Desativada';
  btn.setAttribute('aria-pressed',String(!!state.compactView));
 });
 btn.setAttribute('aria-pressed',String(!!state.compactView));
 panel.append(label,btn);
 const heading=root.querySelector('h2');
 if(heading)heading.insertAdjacentElement('afterend',panel);
 else root.insertBefore(panel,root.firstChild);
}
function apply(){
 if(typeof state==='undefined')return;
 document.body.classList.toggle('cp82-compact',!!state.compactView);
 try{
  if(state.currentTab==='budget')settings();
  if(state.currentTab==='home')home();
  if(state.currentTab==='shop')stock();
  if(['recipe','cook'].includes(state.currentTab))kitchen();
 }catch(error){console.warn('Atalhos diários:',error)}
}
function schedule(){
 if(pending)return;
 pending=true;
 requestAnimationFrame(()=>{pending=false;apply()});
}
new MutationObserver(schedule).observe(root,{childList:true,subtree:false});
window.addEventListener('pageshow',schedule);
window.CPDailyFlow={suggest:recommendations,open:confirmMeal,consume:consumeStock};
schedule();
})();
