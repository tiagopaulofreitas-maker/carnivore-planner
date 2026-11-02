/* Explicit weighed cooked food ledger, independent of raw stock and plan demand. */
(function(global){
'use strict';
const remaining=lot=>lot.grams-lot.entries.reduce((n,e)=>n+e.grams,0);
function record(lots,lot){
 const existing=lots.find(x=>x.id===lot.id);if(existing)return lots;
 const next=[...lots,{...lot,ingredients:{...lot.ingredients},entries:[]}];
 global.CPStateStore.validateCookedLots(next);return next;
}
function take(lots,id,entry){
 const lot=lots.find(x=>x.id===id);if(!lot)throw Error('Lote não encontrado.');
 if(lot.entries.some(e=>e.id===entry.id))return lots;
 const next=lots.map(x=>x.id===id?{...x,entries:[...x.entries,{...entry}]}:x);
 global.CPStateStore.validateCookedLots(next);return next;
}
global.CPCookedLots={remaining,record,take};
if(typeof document==='undefined')return;
const make=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el};
const uid=()=>crypto.randomUUID();
function commit(next){const previous=state.cookedLots;state.cookedLots=next;if(save()===false){state.cookedLots=previous;return false}render2();return true}
function install(){
 if(typeof state==='undefined'||!['recipe','month'].includes(state.currentTab)||state.previewMode)return;
 const root=document.getElementById('root');if(!root||root.querySelector('[data-cooked-lots]'))return;
 const box=make('section');box.className='card';box.dataset.cookedLots='';box.append(make('h3','Cozinhados e sobras registados'));
 box.append(make('p','Regista o peso que efetivamente cozinhaste e pesaste. São gramas de alimento já cozinhado, não o peso cru do plano. Este registo não altera compras, conclusões nem stock de ingredientes e não comprova conservação adequada.'));
 if(state.currentTab==='recipe'){
  const day=state.day,base=meals[chosen(day)],form=make('form');form.dataset.cookedRecord='';const operation=uid();
  const input=make('input');input.type='number';input.min='1';input.max='100000';input.step='1';input.required=true;input.setAttribute('aria-label','Peso efetivamente cozinhado em gramas');
  const label=make('label','Peso efetivamente cozinhado (g) ');label.append(input);
  const date=make('input');date.type='date';date.required=true;const now=new Date();const today=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');date.value=today;date.max=today;date.setAttribute('aria-label','Data da preparação');
  const place=make('select');place.setAttribute('aria-label','Local de conservação');for(const [v,t] of [['frigorifico','Frigorífico'],['congelador','Congelador']]){const o=make('option',t);o.value=v;place.append(o)}
  const submit=make('button','Registar cozinhado pesado');submit.type='submit';submit.className='primary';
  form.append(label,make('label','Data da preparação '),date,place,submit);
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;
   const lot={id:operation,recipe:chosen(day),name:base.name,ingredients:{...base.items},preparedOn:date.value,place:place.value,grams:Number(input.value),entries:[]};
   if(date.value>today){alert('A preparação não pode estar no futuro.');return}
   if(!confirm('Registar '+lot.grams+' g já cozinhados de '+base.name+'? Não será descontado stock de ingredientes.'))return;
   try{commit(record(state.cookedLots||[],lot))}catch(error){alert(error.message)}
  });box.append(form);
 }
 for(const lot of state.cookedLots||[]){
  const row=make('section');row.dataset.cookedLot=lot.id;row.append(make('h4',lot.name+' · '+lot.preparedOn),make('p',remaining(lot)+' g disponíveis de '+lot.grams+' g registados · '+(lot.place==='frigorifico'?'frigorífico':'congelador')));
  const history=make('details');history.append(make('summary','Histórico ('+lot.entries.length+' saídas)'));
  for(const e of lot.entries)history.append(make('p',e.at+' · '+e.grams+' g · '+e.kind));row.append(history);
  if(remaining(lot)>0){
   const form=make('form'),op=uid(),qty=make('input');qty.type='number';qty.required=true;qty.min='1';qty.max=String(remaining(lot));qty.step='1';qty.setAttribute('aria-label','Gramas a retirar de '+lot.name);
   const label=make('label','Peso a retirar (g) ');label.append(qty);const reason=make('select');reason.setAttribute('aria-label','Motivo da saída de '+lot.name);
   for(const [v,t] of [['consumo','Consumido'],['desperdicio','Descartado'],['correcao','Correção do registo']]){const o=make('option',t);o.value=v;reason.append(o)}
   const button=make('button','Confirmar saída do cozinhado');button.type='submit';button.className='quiet';form.append(label,reason,button);
   form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;if(!confirm('Retirar '+qty.value+' g deste cozinhado? O histórico será mantido. Não altera o stock de ingredientes nem marca refeições.'))return;
    try{commit(take(state.cookedLots||[],lot.id,{id:op,grams:Number(qty.value),kind:reason.value,at:new Date().toISOString()}))}catch(error){alert(error.message)}
   });row.append(form);
  }box.append(row);
 }
 if(!(state.cookedLots||[]).length)box.append(make('p','Ainda não registaste cozinhados. As sobras previstas no plano não são consideradas disponíveis.'));
 for(const form of box.querySelectorAll('form')){form.style.display='grid';form.style.gap='10px';form.style.margin='12px 0'}
 for(const input of box.querySelectorAll('input,select')){input.style.maxWidth='100%';input.style.boxSizing='border-box'}
 root.append(box);
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install()})};
document.addEventListener('DOMContentLoaded',()=>{const root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true});schedule()});
})(typeof window!=='undefined'?window:globalThis);
