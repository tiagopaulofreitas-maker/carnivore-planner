/* Carnivore Planner 7.7 — Shopping list and inventory experience.
   Keeps the original cp-v11 storage schema and does not mutate stock when an item is checked. */
(function(){
'use strict';
const root=document.getElementById('root');
const nav=document.querySelector('nav');
if(!root||!nav)return;
const math=window.CPShoppingMath;
if(!math){console.error('Shopping math missing');return;}
let mode='list',stockQuery='',queued=false;
const KINDS=[
 ['Talho', ['entrecote','picanha','lombo','vazia','alcatra','maminha','acem','costela','chambao','picada','figado','duroc','lagartos','secretos','plumas','barriga','frango','bacon']],
 ['Peixaria', ['salmao','sardinha','cavala','atum','camarao']],
 ['Ovos, queijo e manteiga', ['ovos','queijo','manteiga']]
];
const category=Object.fromEntries(KINDS.flatMap(([name,items])=>items.map(x=>[x,name])));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function el(tag,cls,text){
 const node=document.createElement(tag);if(cls)node.className=cls;
 if(text!=null)node.textContent=text;
 return node;
}
function button(title,cls,callback){
 const b=el('button',cls,title);b.type='button';b.addEventListener('click',callback);return b;
}
function cash(n){
 const v=Number(n)||0;
 return v.toLocaleString('pt-PT',{style:'currency',currency:'EUR'});
}
function amount(value,key){
 return (Math.round((Number(value)||0)*100)/100).toLocaleString('pt-PT')+(key==='ovos'?' un.':' g');
}
function calc(week){
 let currentWeek=0;
 try{currentWeek=math.weekFromIndex(typeof todayIndex==='function'?todayIndex():0)}catch(e){}
 const prices={};
 for(const key of Object.keys(products))prices[key]=Number(typeof price==='function'?price(key):products[key][1]);
 return math.weekProjection({meals,selected:state.manualMeals||{},stock:state.stock||{},week,asOfWeek:currentWeek,prices});
}
function inventoryTotal(){
 return Object.values(state.stock||{}).reduce((acc,n)=>acc+(Number(n)>0?1:0),0);
}
function markNav(){
 if(!nav)return;
 nav.querySelectorAll('button').forEach(b=>{
  const action=b.getAttribute('onclick')||'';
  const yes=action.includes("'shop'")||b.textContent.trim()==='Compras';
  b.classList.toggle('active',yes);
  if(yes)b.setAttribute('aria-current','page');
  else b.removeAttribute('aria-current');
 });
}
function render(){
 if(typeof state==='undefined'||state.currentTab!=='shop')return;
 if(!state.stock||typeof state.stock!=='object')state.stock={};
 if(!state.checked||typeof state.checked!=='object')state.checked={};
 if(!state.spending||typeof state.spending!=='object')state.spending={};
 const pane=el('section','cp77-shopping');pane.id='cp77-shopping';
 pane.dataset.mode=mode;
 const heading=el('div','cp77-heading');
 heading.append(el('small','cp77-overline','LISTA INTELIGENTE'),el('h2','',mode==='stock'?'O que tens em casa':'Compras da semana'),
  el('p','',mode==='stock'?'Regista quantidades reais em gramas ou unidades. São usadas para calcular o que falta comprar.':'Organiza as compras de sábado e aproveita o que já tens no frigorífico ou congelador.'));
 const tabs=el('div','cp77-tabs');
 tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Ver lista de compras ou stock');
 const listBtn=button('🛒 Lista de compras','',()=>{mode='list';render();});
 const stockBtn=button('📦 Stock em casa · '+inventoryTotal(),'',()=>{mode='stock';render()});
 listBtn.classList.toggle('current',mode==='list');stockBtn.classList.toggle('current',mode==='stock');
 listBtn.setAttribute('aria-pressed',String(mode==='list'));stockBtn.setAttribute('aria-pressed',String(mode==='stock'));
 tabs.append(listBtn,stockBtn);
 pane.append(heading,tabs);
 if(mode==='list')renderList(pane);
 else renderStock(pane);
 root.replaceChildren(pane);
 markNav();
}
function renderList(target){
 const week=Math.max(0,Math.min(4,Math.floor(Number(state.week)||0)));
 const summary=calc(week);
 const weeks=el('div','cp77-weeks');weeks.setAttribute('role','group');weeks.setAttribute('aria-label','Semana do plano');
 for(let i=0;i<5;i++){
  const count=Math.min(7,30-i*7);
  const b=button('Semana '+(i+1)+' · '+count+' dias','',()=>{state.week=i;save();render()});
  b.classList.toggle('active',i===week);b.setAttribute('aria-pressed',String(i===week));
  weeks.appendChild(b);
 }
 target.appendChild(weeks);
 const stat=el('div','cp77-stats');
 const metrics=[
   [cash(summary.netCost),'Falta comprar'],
   [cash(summary.coveredCost),'Coberto pelo stock'],
   [cash(summary.grossCost),'Valor total dos ingredientes']
 ];
 metrics.forEach(([val,label],i)=>{const box=el('div','cp77-stat'+(i===0?' main':''));box.append(el('strong','',val),el('small','',label));stat.appendChild(box)});
 target.appendChild(stat);
 const note=el('p','cp77-note',summary.isPast?
  'Esta semana já passou. O stock atual não foi aplicado retroativamente; as quantidades mostram o plano original.':
  week===summary.asOfWeek?
  'O stock registado é descontado da semana atual. Marcar uma compra não altera automaticamente o inventário.':
  'Previsão: o stock atual é reservado primeiro às semanas anteriores e não é contado duas vezes. As compras futuras ainda não estão incluídas.');
 target.appendChild(note);
 const pending=summary.rows.filter(x=>x.toBuy>0.001).sort((a,b)=>categoryOrder(a.key)-categoryOrder(b.key)||a.key.localeCompare(b.key,'pt-PT'));
 const covered=summary.rows.filter(x=>x.toBuy<=0.001);
 const done=pending.filter(x=>!!state.checked[week+'-'+x.key]).length;
 const heading=el('div','cp77-list-title');
 heading.append(el('h3','','O que falta comprar'),el('small','',done+' de '+pending.length+' itens marcados'));
 const section=el('section','cp77-section');
 section.appendChild(heading);
 if(!pending.length)section.appendChild(el('p','cp77-empty','Já tens todos os ingredientes desta semana, segundo o stock registado.'));
 let last='';
 pending.forEach(item=>{
  const group=category[item.key]||'Outros';
  if(group!==last){section.appendChild(el('h4','cp77-group',group));last=group}
  section.appendChild(shoppingRow(item,week));
 });
 target.appendChild(section);
 if(covered.length){
  const details=el('details','cp77-covered');
  const title=el('summary','','✓ Já tens em casa · '+covered.length+' ingredientes');
  details.appendChild(title);
  covered.forEach(item=>{
   const line=el('div','cp77-covered-row');
   line.append(el('span','',products[item.key]?.[0]||item.key),el('strong','',amount(item.required,item.key)));
   details.appendChild(line);
  });
  target.appendChild(details);
 }
 const buttons=el('div','cp77-actions');
 buttons.append(
  button('📋 Copiar o que falta','cp77-primary',()=>copyPending(summary)),
  button('Desmarcar compras','cp77-secondary',()=>{
   if(!confirm('Desmarcar os produtos desta semana? As quantidades em stock mantêm-se.'))return;
   Object.keys(state.checked).filter(key=>key.startsWith(week+'-')).forEach(k=>delete state.checked[k]);
   save();render();
  })
 );
 target.appendChild(buttons);
 const cost=el('section','cp77-spend');
 const label=el('label','','Gasto real nesta semana (€)');
 const input=el('input');input.type='number';input.min='0';input.max='99999';input.step='0.01';
 input.inputMode='decimal';input.value=Number.isFinite(Number(state.spending[week]))&&state.spending[week]!=null?String(state.spending[week]):'';
 input.placeholder='Ex.: 85,50';input.setAttribute('aria-label','Gasto real desta compra em euros');
 input.addEventListener('change',()=>{
  const raw=input.value.trim();
  if(raw===''){delete state.spending[week];save();return;}
  const v=Number(raw);
  if(!Number.isFinite(v)||v<0||v>99999){alert('Introduz um valor de 0 a 99999 euros.');return;}
  state.spending[week]=Math.round(v*100)/100;save();
 });
 label.appendChild(input);
 cost.append(label,el('small','','A estimativa considera ingredientes, não embalagens inteiras ou promoções.'));
 target.appendChild(cost);
}
function categoryOrder(key){
 const kind=category[key];
 return kind==='Talho'?0:kind==='Peixaria'?1:kind==='Ovos, queijo e manteiga'?2:3;
}
function shoppingRow(item,week){
 const label=el('label','cp77-item');
 const check=el('input');check.type='checkbox';
 check.checked=!!state.checked[week+'-'+item.key];
 check.setAttribute('aria-label','Marcar '+(products[item.key]?.[0]||item.key)+' como comprado');
 const name=el('div','cp77-item-name');
 name.appendChild(el('strong','',products[item.key]?.[0]||item.key));
 name.appendChild(el('small','','Plano: '+amount(item.required,item.key)+' · coberto: '+amount(item.covered,item.key)));
 const right=el('strong','cp77-qty',amount(item.toBuy,item.key));
 label.classList.toggle('checked',check.checked);
 check.addEventListener('change',()=>{
  state.checked[week+'-'+item.key]=check.checked;
  save();label.classList.toggle('checked',check.checked);
  const found=root.querySelector('.cp77-list-title small');
  if(found){
   // Updated from visible checkboxes, without redrawing the page.
   const chosen=root.querySelectorAll('.cp77-item input:checked').length;
   const total=root.querySelectorAll('.cp77-item input').length;
   found.textContent=chosen+' de '+total+' itens marcados';
  }
 });
 label.append(check,name,right);
 return label;
}
async function copyPending(summary){
 const week=summary.week;
 const remaining=summary.rows.filter(r=>r.toBuy>0.001&&!state.checked[week+'-'+r.key]);
 const body='Carnivore Planner · Semana '+(week+1)+'\n'+
   (remaining.length?remaining.map(r=>'☐ '+(products[r.key]?.[0]||r.key)+': '+amount(r.toBuy,r.key)).join('\n'):'Nada em falta.')+
   '\nValor estimado: '+cash(remaining.reduce((sum,r)=>sum+r.netCost,0));
 try{
  if(!navigator.clipboard?.writeText)throw Error('Clipboard indisponível');
  await navigator.clipboard.writeText(body);
  announce('Lista copiada. Podes colar no WhatsApp ou nas notas.');
 }catch(error){
  if(typeof downloadText==='function')downloadText('compras-semana-'+(week+1)+'.txt',body,'text/plain');
  else window.prompt('Copia a lista:',body);
  announce('Lista preparada para copiar ou guardar.');
 }
}
function announce(text){
 const notice=root.querySelector('.cp77-live');
 if(notice)notice.textContent=text;
}
function renderStock(target){
 const tools=el('div','cp77-stock-tools');
 const search=el('input');search.type='search';search.placeholder='Procurar ingrediente…';search.value=stockQuery;
 search.autocomplete='off';search.setAttribute('aria-label','Pesquisar ingredientes do stock');
 const sub=el('p','cp77-note','Quantidade disponível neste momento, antes das próximas refeições. O stock não é reduzido automaticamente ao marcar uma compra.');
 tools.append(search,sub);
 target.appendChild(tools);
 const items=el('div','cp77-stock-items');
 const inputs=[];
 KINDS.forEach(([kind,keys])=>{
  const area=el('section','cp77-stock-group');
  area.appendChild(el('h3','',kind));
  keys.forEach(key=>{
   if(!products[key])return;
   const line=el('label','cp77-stock-item');
   line.dataset.search=norm(products[key][0]+' '+key);
   const title=el('span','',products[key][0]);
   const editor=el('span','cp77-stock-editor');
   const input=el('input');input.type='number';input.min='0';input.step=key==='ovos'?'1':'5';
   input.inputMode='numeric';input.value=String(Math.max(0,Number(state.stock[key])||0));
   input.setAttribute('aria-label',products[key][0]+' em casa');
   const unit=el('span','',key==='ovos'?'un.':'g');
   editor.append(input,unit);line.append(title,editor);area.appendChild(line);
   inputs.push({key,line,input});
   input.addEventListener('change',()=>{
    const n=Number(input.value);
    if(!Number.isFinite(n)||n<0||n>100000||(key==='ovos'&&!Number.isInteger(n))){
      alert('Indica uma quantidade válida e não negativa. Para ovos usa unidades inteiras.');
      input.value=String(Number(state.stock[key])||0);return;
    }
    if(n===0)delete state.stock[key];else state.stock[key]=n;
    save();
    const tab=root.querySelector('.cp77-tabs button:last-child');
    if(tab)tab.textContent='📦 Stock em casa · '+inventoryTotal();
    announce('Stock atualizado. A lista de compras será recalculada.');
   });
  });
  items.appendChild(area);
 });
 target.appendChild(items);
 const live=el('p','cp77-live','Alterações ao stock são guardadas automaticamente.');live.setAttribute('role','status');
 target.appendChild(live);
 search.addEventListener('input',()=>{
  stockQuery=search.value;
  let shown=0;
  inputs.forEach(({line})=>{
   const yes=line.dataset.search.includes(norm(stockQuery));
   line.hidden=!yes;if(yes)shown++;
  });
  items.querySelectorAll('.cp77-stock-group').forEach(group=>{
   group.hidden=![...group.querySelectorAll('.cp77-stock-item')].some(row=>!row.hidden);
  });
  live.textContent=shown+' ingredientes encontrados.';
 });
 if(stockQuery)search.dispatchEvent(new Event('input'));
}
const oldRender=typeof render2==='function'?render2:null;
if(oldRender){
 render2=function(){
  oldRender();
  if(state.currentTab==='shop')render();
 };
}
const originalSetTab=typeof setTab==='function'?setTab:null;
if(originalSetTab){
 setTab=function(tab){
  if(tab==='shop')mode='list';
  originalSetTab(tab);
 };
}
document.addEventListener('click',e=>{
 const clicked=e.target.closest?.('nav button');
 if(!clicked)return;
 const onclick=clicked.getAttribute('onclick')||'';
 if(onclick.includes("'shop'")||clicked.textContent.trim()==='Compras'){
  e.preventDefault();e.stopImmediatePropagation();
  mode='list';
  if(typeof setTab==='function')setTab('shop');
  else{state.currentTab='shop';save();render()}
 }
},true);
function schedule(){
 if(queued)return;
 queued=true;
 requestAnimationFrame(()=>{
  queued=false;
  if(typeof state!=='undefined'&&state.currentTab==='shop'&&!root.querySelector('#cp77-shopping'))render();
 });
}
new MutationObserver(schedule).observe(root,{childList:true});
window.addEventListener('pageshow',schedule);
if(typeof state!=='undefined'&&state.currentTab==='shop')render();
})();