/* Carnivore Planner v8.6 — calendar export follows the actual 30-day plan.
   The download never alters meals, stock, local data or the user's device calendar. */
(function(global){
'use strict';
const pad=n=>String(n).padStart(2,'0');
const isoDate=d=>String(d.getFullYear())+pad(d.getMonth()+1)+pad(d.getDate());
const localStamp=d=>isoDate(d)+'T'+pad(d.getHours())+pad(d.getMinutes())+'00';
const utcStamp=d=>String(d.getUTCFullYear())+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())+
 'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';
const escapeText=value=>String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n')
 .replace(/;/g,'\\;').replace(/,/g,'\\,');
function fold(line){
 let output='',bytes=0;
 for(const ch of String(line)){
  const code=ch.codePointAt(0);
  const size=code<=127?1:code<=2047?2:code<=65535?3:4;
  if(bytes+size>75){output+='\r\n ';bytes=1}
  output+=ch;bytes+=size;
 }
 return output;
}
function parseStart(start){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(start||''));
 if(!m)throw new Error('Data de início inválida');
 const date=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]),12,0,0,0);
 if(date.getFullYear()!==Number(m[1])||date.getMonth()+1!==Number(m[2])||date.getDate()!==Number(m[3]))
  throw new Error('Data de início inválida');
 return date;
}
function parseHour(hour){
 const m=/^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(hour||''));
 if(!m)throw new Error('Hora da refeição inválida');
 return [Number(m[1]),Number(m[2])];
}
function at(base,day,hour,minute,offset=0){
 const date=new Date(base.getTime());
 date.setDate(date.getDate()+day);
 date.setHours(hour,minute,0,0);
 if(offset)date.setMinutes(date.getMinutes()+offset);
 return date;
}
function event(id,start,end,summary,description,stamp,alarm=30){
 if(!(end>start))throw new Error('Evento sem duração válida');
 return ['BEGIN:VEVENT','UID:'+id+'@carnivoreplanner.local',
  'DTSTAMP:'+stamp,'DTSTART:'+localStamp(start),'DTEND:'+localStamp(end),
  'SUMMARY:'+escapeText(summary),'DESCRIPTION:'+escapeText(description),
  'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escapeText(summary),
  'TRIGGER:-PT'+alarm+'M','END:VALARM','END:VEVENT'];
}
function build({start,hour,meals,manualMeals={},guideTime,createdAt=new Date()}={}){
 const base=parseStart(start),[h,min]=parseHour(hour);
 if(!Array.isArray(meals)||meals.length<30)throw new Error('Plano sem 30 receitas');
 const selected=manualMeals&&typeof manualMeals==='object'?manualMeals:{};
 const stamp=utcStamp(new Date(createdAt));
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN',
  'PRODID:-//Carnivore Planner//Calendario PT-PT//EN',
  'X-WR-CALNAME:'+escapeText('Carnivore Planner · 30 dias')];
 for(let i=0;i<30;i++){
  const override=Number(selected[i]);
  const index=selected[i]!=null&&Number.isInteger(override)&&override>=0&&override<meals.length?override:i;
  const meal=meals[index]||meals[i];
  if(!meal||typeof meal.name!=='string')throw new Error('Receita inválida para o dia '+(i+1));
  const dinner=at(base,i,h,min),end=at(base,i,h,min,60);
  const key=isoDate(at(base,i,12,0));
  lines.push(...event('jantar-'+key,dinner,end,'Jantar: '+meal.name,
   'Carnivore Planner · Dia '+(i+1)+' de 30. Confirma a receita e os ingredientes na aplicação.',stamp));
  if(['roast','braise'].includes(meal.method)){
   const range=typeof guideTime==='function'?guideTime(meal,index):null;
   const upper=Array.isArray(range)?Number(range[1]):NaN;
   const duration=Number.isFinite(upper)&&upper>=90&&upper<=720?upper:240;
   const prep=at(base,i,h,min,-duration-30);
   const prepEnd=at(base,i,h,min,-30);
   lines.push(...event('preparar-'+key,prep,prepEnd,
    'Preparar com antecedência: '+meal.name,
    'Cozedura lenta · duração indicativa. Confirma a receita e a segurança alimentar.',stamp));
  }
 }
 for(let w=0;w<5;w++){
  const first=at(base,w*7,12,0);
  const shopping=new Date(first.getTime());
  shopping.setDate(shopping.getDate()-((shopping.getDay()+1)%7));
  shopping.setHours(10,0,0,0);
  const end=new Date(shopping.getTime());end.setHours(11,0,0,0);
  lines.push(...event('compras-'+w+'-'+isoDate(base),shopping,end,
   'Compras Carnivore Planner · Semana '+(w+1),
   'Confirma a lista atual na aplicação: quantidades e stock podem ter mudado.',stamp));
 }
 lines.push('END:VCALENDAR');
 return lines.map(fold).join('\r\n')+'\r\n';
}
function exportCalendar(){
 try{
  if(typeof state==='undefined'||typeof meals==='undefined')throw new Error('Plano indisponível');
  const content=build({start:state.start,hour:state.hour,meals,
   manualMeals:state.manualMeals||{},guideTime:global.cpGuideTime});
  const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download='carnivore-planner-'+state.start+'.ics';
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
 }catch(error){
  console.error('Exportar calendário:',error);
  alert('Não foi possível exportar os lembretes: '+error.message);
 }
}
global.CPPlannerCalendar={build};
global.calendarExport=exportCalendar;
})(window);
