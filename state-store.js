/* Browser-local persistence. Invalid originals are never overwritten by defaults. */
(function(global){
'use strict';
const KEY='cp-v11';
const maps=['prices','checked','notes','spending','stock','stockMeta','prepared','cookStep','cookScale','equipmentByDay','manualMeals','favourites','batch','stockUsedDays','completed','timers','doneSteps','cookStart'];
const equipment=['grelhador','frigideira','forno','panela','air fryer'];
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const number=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const integer=(v,max)=>number(v)&&Number.isInteger(v)&&v<=max;
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
let blocked=false,raw=null,message='',loadedDefaults={};
function banner(text){
 message=text;
 const doc=global.document;
 if(!doc?.body)return;
 let box=doc.getElementById('cp-storage-warning');
 if(!box){box=doc.createElement('p');box.id='cp-storage-warning';box.className='notice';box.setAttribute('role','alert');doc.body.prepend(box);}
 box.textContent=text;
}
function validateCookedLots(lots){
 if(!Array.isArray(lots))throw Error('Registos de cozinhados inválidos.');
 const ids=new Set();
 for(const lot of lots){
  if(!object(lot)||typeof lot.id!=='string'||!lot.id||ids.has(lot.id)||!integer(lot.recipe,32)||typeof lot.name!=='string'||!lot.name.trim()||!date(lot.preparedOn)||!['frigorifico','congelador'].includes(lot.place)||!Number.isInteger(lot.grams)||lot.grams<=0||lot.grams>100000||!object(lot.ingredients)||!Object.keys(lot.ingredients).length||Object.values(lot.ingredients).some(q=>!number(q)||q<=0)||!Array.isArray(lot.entries))throw Error('Lote cozinhado inválido.');
  ids.add(lot.id);const entries=new Set();let used=0;
  for(const e of lot.entries){
   if(!object(e)||typeof e.id!=='string'||!e.id||entries.has(e.id)||!Number.isInteger(e.grams)||e.grams<=0||!['consumo','desperdicio','correcao'].includes(e.kind)||typeof e.at!=='string'||!Number.isFinite(Date.parse(e.at)))throw Error('Movimento de cozinhados inválido.');
   entries.add(e.id);used+=e.grams;
  }
  if(used>lot.grams)throw Error('Saídas superiores ao peso cozinhado.');
 }
 return lots;
}
function validate(data,defaults){
 if(!object(data))throw Error('A cópia não contém um objeto de dados.');
 const next={...defaults,...data};
 if(next.cookedLots!==undefined)validateCookedLots(next.cookedLots);
 for(const key of maps){
  if(next[key]===undefined)next[key]={};
  if(!object(next[key]))throw Error('Campo inválido: '+key);
 }
 if(!date(next.start)||typeof next.hour!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(next.hour))throw Error('Data ou hora inválida.');
 if(!number(next.budget)||!integer(next.day,29)||!integer(next.week,4))throw Error('Orçamento ou dia inválido.');
 for(const key of ['prices','stock','spending','batch','cookStep','cookScale']){
  for(const value of Object.values(next[key]))if(!(key==='spending'&&value===null)&&!number(value))throw Error('Quantidade inválida: '+key);
 }
 if(next.planPortions!==undefined&&!object(next.planPortions))throw Error('Porções do plano inválidas.');
 for(const [day,value] of Object.entries(next.planPortions||{}))if(!/^\d+$/.test(day)||!integer(Number(day),29)||!Number.isInteger(value)||value<1||value>6)throw Error('Porções do plano inválidas.');
 if(next.stock.ovos!==undefined&&!Number.isInteger(next.stock.ovos))throw Error('Os ovos devem ser unidades inteiras.');
 for(const [day,index] of Object.entries(next.manualMeals))if(!/^\d+$/.test(day)||!integer(Number(day),29)||!integer(index,32))throw Error('Receita selecionada inválida.');
 for(const value of Object.values(next.equipmentByDay))if(!equipment.includes(value))throw Error('Equipamento inválido.');
 if(next.equipment!==undefined&&!equipment.includes(next.equipment))throw Error('Equipamento inválido.');
 for(const value of Object.values(next.notes))if(typeof value!=='string')throw Error('Nota inválida.');
 for(const value of Object.values(next.stockMeta))if(!object(value)||(value.date&&!date(value.date))||(value.place&&!['frigorifico','congelador','despensa'].includes(value.place)))throw Error('Metadados de stock inválidos.');
 if(next.weightLog===undefined)next.weightLog=[];
 if(!Array.isArray(next.weightLog)||next.weightLog.some(x=>!object(x)||!date(x.date)||!number(x.kg)||x.kg<25||x.kg>300))throw Error('Registo de peso inválido.');
 if(next.currentTab!==undefined&&!['home','recipe','cook','library','month','budget','shop','pick'].includes(next.currentTab))throw Error('Página inválida.');
 return next;
}
function load(defaults){
 loadedDefaults=defaults;
 try{raw=localStorage.getItem(KEY);return validate(raw===null?{}:JSON.parse(raw),defaults);}
 catch(error){
  blocked=true;
  banner('Não foi possível abrir os dados guardados. O original foi preservado; estás a ver um plano temporário, sem gravação. Exporta uma cópia em Ajustes antes de recuperar os dados.');
  return validate({},defaults);
 }
}
function write(next){
 if(blocked)return false;
 try{validate(next,loadedDefaults);localStorage.setItem(KEY,JSON.stringify(next));message='';global.document?.getElementById('cp-storage-warning')?.remove();return true;}
 catch(error){banner('Não foi possível guardar as alterações neste navegador. Exporta uma cópia antes de fechar a aplicação.');return false;}
}
function replace(next){
 // Keep the previous bytes before committing a validated import. A failed write
 // must leave both the current in-memory state and original storage unchanged.
 try{
  const previous=localStorage.getItem(KEY);
  if(previous!==null)localStorage.setItem(KEY+'-before-import',previous);
  localStorage.setItem(KEY,JSON.stringify(next));
  blocked=false;raw=null;message='';
  global.document?.getElementById('cp-storage-warning')?.remove();
  return true;
 }catch(error){banner('Importação não gravada: não há acesso ou espaço suficiente. Os dados anteriores foram mantidos.');return false;}
}
global.CPStateStore={validateCookedLots,validate,load,write,replace,status:()=>({blocked,message}),original:()=>raw};
})(typeof window!=='undefined'?window:globalThis);
