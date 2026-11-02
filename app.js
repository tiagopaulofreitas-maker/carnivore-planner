
const products={entrecote:['Entrecôte',29],picanha:['Picanha',24],lombo:['Lombo novilho',31],vazia:['Vazia',23],alcatra:['Alcatra',18],maminha:['Maminha',17],acem:['Acém',12],costela:['Costela bovina sem osso',17],chambao:['Chambão',13],picada:['Carne picada bovina',14],figado:['Fígado',9],salmao:['Salmão',20],sardinha:['Sardinha limpa',9],cavala:['Cavala limpa',10],atum:['Atum',17],camarao:['Camarão',18],duroc:['Cachaço de porco sem osso',7.49],lagartos:['Lagartos de porco preto',16],secretos:['Secretos',15],plumas:['Plumas',17],barriga:['Barriga de porco',9],frango:['Coxa de frango sem osso',9],ovos:['Ovos/un.',.30],queijo:['Queijo curado',14],manteiga:['Manteiga',12],bacon:['Bacon',14]};
const raw=[
['Entrecôte alto e ovos','pan','entrecote:380,ovos:3,queijo:50,manteiga:10'],
['Picanha com omelete','pan','picanha:400,ovos:3,queijo:55'],
['Salmão e camarão','fish','salmao:400,camarao:140,ovos:2,manteiga:15'],
['Secretos dourados','pan','secretos:430,ovos:3,queijo:35'],
['Lombo de novilho','pan','lombo:380,ovos:3,queijo:45,manteiga:15'],
['Cavala e cachaço de porco','fish','cavala:340,duroc:250,ovos:2'],
['Hambúrguer Angus','burger','picada:440,ovos:3,queijo:55'],
['Vazia e ovos escalfados','pan','vazia:410,ovos:3,queijo:45'],
['Maminha assada (1/2)','roast','maminha:430,ovos:3,manteiga:10'],
['Maminha desfiada (2/2)','leftover','maminha:430,ovos:3,queijo:45'],
['Salmão no forno','fishoven','salmao:420,ovos:3,queijo:50,manteiga:10'],
['Entrecôte e camarão','pan','entrecote:350,camarao:160,ovos:2,manteiga:15'],
['Lagartos de porco preto e ovos','pan','lagartos:480,ovos:4,queijo:35'],
['Sardinha e alcatra','fishoven','sardinha:350,alcatra:260,ovos:2'],
['Acém braseado (1/3)','braise','acem:450,ovos:2,queijo:40'],
['Acém desfiado (2/3)','leftover','acem:450,ovos:3,queijo:45'],
['Acém gratinado (3/3)','leftover','acem:450,ovos:2,queijo:70'],
['Picanha e bacon','pan','picanha:390,ovos:3,bacon:60'],
['Atum e secretos','fish','atum:180,secretos:320,ovos:2'],
['Salmão com omelete','fish','salmao:430,ovos:4,queijo:60'],
['Costela assada (1/2)','braise','costela:450,ovos:2'],
['Costela desfiada (2/2)','leftover','costela:450,ovos:3,queijo:35'],
['Alcatra gratinada','pan','alcatra:440,ovos:3,queijo:60'],
['Plumas e sardinha','pan','plumas:380,sardinha:270,ovos:2'],
['Chambão em caldo animal','braise','chambao:500,ovos:2,queijo:45'],
['Hambúrguer com fígado','burger','picada:420,figado:100,ovos:3,queijo:35'],
['Frango com pele crocante','chicken','frango:580,ovos:3,queijo:45'],
['Barriga de porco assada','roast','barriga:340,ovos:3,queijo:35'],
['Entrecôte com salmão','pan','entrecote:320,salmao:320,ovos:2'],
['Lombo e camarão','pan','lombo:380,camarao:180,ovos:3,queijo:35']];
const meals=raw.map(([name,method,line])=>({name,method,items:Object.fromEntries(line.split(',').map(s=>{let [k,v]=s.split(':');return[k,k==='ovos'?+v:Math.round(+v*1.3/5)*5]}))}));
let defaults={start:'2026-11-01',hour:'19:00',budget:400,day:0,week:0,prices:{},checked:{},notes:{}};let state=window.CPStateStore.load(defaults);let view='today';const $=s=>document.querySelector(s);const money=n=>n.toLocaleString('pt-PT',{style:'currency',currency:'EUR'});const price=k=>state.prices[k]??products[k][1];function save(){return window.CPStateStore.write(state)}function date(i){let d=new Date(state.start+'T12:00:00');d.setDate(d.getDate()+i);return d}function datefmt(d){return d.toLocaleDateString('pt-PT',{day:'numeric',month:'short',weekday:'short'})}function calc(m){return Object.entries(m.items).reduce((s,[k,g])=>s+(k==='ovos'?g*price(k):g*price(k)/1000),0)}function total(){return Array.from({length:30},(_,i)=>calc(mealAt(i))).reduce((sum,cost)=>sum+cost,0)}function title(m,i){return '<h2>Dia '+(i+1)+' — '+m.name+'</h2><small>'+datefmt(date(i))+' · '+money(calc(m))+' ingredientes</small>'}function ingredients(m){return '<ul>'+Object.entries(m.items).map(([k,g])=>'<li>'+products[k][0]+': <b>'+(k==='ovos'?g+' unidades':g+' g')+'</b></li>').join('')+'</ul>'}
const steps={pan:['Seca a carne com papel de cozinha e tempera com sal. Prepara uma frigideira pesada.','Aquece a frigideira em lume médio-alto. Sela cada face aproximadamente 2–4 minutos para um bife de 2–3 cm; ajusta à espessura.','Confirma o ponto com termómetro; para cortes bovinos inteiros recomenda-se 63 °C no centro e repouso de 3 minutos. Para porco, também 63 °C e repouso.','Cozinha ovos numa frigideira separada e adiciona o queijo no fim. Descansa a carne 3–5 minutos antes de servir.'],fish:['Seca o peixe, verifica espinhas e tempera com sal.','Começa pelo acompanhamento de carne, se houver. Cozinha o peixe numa frigideira média cerca de 4–6 minutos por face, consoante espessura.','Peixe e marisco devem atingir 63 °C no centro; camarão deve ficar opaco.','Prepara ovos e queijo à parte e serve imediatamente.'],fishoven:['Pré-aquece o forno a 190 °C (superior/inferior). Tempera e dispõe o peixe numa travessa.','Verifica a partir de 12 minutos; o tempo depende do tamanho e espessura.','Confirma 63 °C no centro com termómetro; queijo apenas nos 2–3 minutos finais.','Prepara ovos ou carne separadamente para evitar secar o peixe.'],burger:['Molda carne bovina 100% pura em hambúrgueres, sem farinhas nem molhos.','Sela em frigideira bem quente, sem sobrepor. Vira após formar crosta.','A carne picada deve atingir 71 °C no centro.','Derrete o queijo e serve com os ovos.'],roast:['Pré-aquece o forno a 150 °C. Tempera a peça com sal e coloca-a num recipiente fundo com um pouco de água ou caldo animal puro.','Tapa bem com tampa ou alumínio. Para 800–1200 g começa a verificar após 2h30; pode demorar 3–4 horas.','Verifica a textura, sem deixar secar. A carne rica em colagénio deve ficar tenra e desfiável.','Divide logo em porções; refrigera rapidamente as sobras em caixas rasas dentro de duas horas.'],braise:['Pré-aquece o forno a 145 °C. Sela a carne numa panela própria para forno.','Acrescenta água ou caldo animal sem vegetais até um terço da altura. Tapa bem e cozinha 3–5 horas, verificando após 3 horas.','Acrescenta água quente se necessário e continua até estar bem tenra.','Retira a dose do dia e guarda as outras rapidamente no frigorífico ou congelador.'],leftover:['Usa a porção de carne previamente cozinhada que guardaste refrigerada ou congelada.','Se congelada, descongela no frigorífico; nunca deixes durante horas à temperatura ambiente.','Aquece bem até 74 °C no centro; desfia e salteia ou gratina em forno quente.','Prepara ovos/queijo e serve. Não voltes a aquecer as outras porções.'],chicken:['Pré-aquece o forno a 200 °C. Seca a pele e tempera com sal.','Assa em tabuleiro com espaço, pele para cima. Começa a verificar aos 25 minutos.','Confirma 74 °C no centro com termómetro.','Descansa 5 minutos, serve com os ovos e queijo.']};
function recipe(i){let m=meals[i];return '<div class="card">'+title(m,i)+'<h3>Ingredientes</h3>'+ingredients(m)+'<h3>Receita passo a passo</h3><ol>'+steps[m.method].map(t=>'<li>'+t+'</li>').join('')+'</ol>'+(m.method==='roast'||m.method==='braise'?'<p class="notice">🍲 Cozinhado lento: separa porções para outros dias. As compras contam cada quantidade uma única vez.</p>':'')+'<label>Notas pessoais<br><textarea id="note" rows="2" style="width:95%;background:#111;color:#fff">'+(state.notes[i]||'')+'</textarea></label><p><button onclick="state.notes['+i+']=$(&quot;#note&quot;).value;save();alert(&quot;Nota guardada&quot;)">Guardar nota</button></p></div>'}
function shopping(w){let o={};meals.slice(w*7,Math.min(30,w*7+7)).forEach(m=>Object.entries(m.items).forEach(([k,g])=>o[k]=(o[k]||0)+g));return o}
function budget(){return '<div class="card"><h2>Orçamento: '+money(state.budget)+'</h2><h3>Ingredientes previstos: '+money(total())+'</h3><p>Margem: '+money(state.budget-total())+'. Valores-alvo sujeitos a confirmação nos talões de compras.</p><label>Limite mensal (€) <input type="number" value="'+state.budget+'" onchange="updatePreference(&quot;budget&quot;,+this.value)"></label></div><div class="card"><h3>Preços reais (€/kg; ovos por unidade)</h3>'+Object.entries(products).map(([k,p])=>'<div class="line"><span>'+p[0]+'</span><input type="number" min="0" step=".01" value="'+price(k)+'" onchange="state.prices[\''+k+'\']=+this.value;save();draw()"></div>').join('')+'</div><div class="card"><h3>Preferências</h3><p>Data de início: <input type="date" aria-label="Data de início do plano" value="'+state.start+'" onchange="updatePreference(&quot;start&quot;,this.value)"></p><p>OMAD depois das 18h: <input type="time" aria-label="Hora do jantar" value="'+state.hour+'" onchange="updatePreference(&quot;hour&quot;,this.value)"></p><button onclick="calendarExport()">Exportar lembretes (.ics)</button></div>'}
function calendarExport(){let lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CarnivorePlanner//PT'];let start=new Date(state.start+'T12:00:00');const f=(d,h)=>d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)+'T'+h.replace(':','')+'00';function event(uid,d,time,end,title){lines.push('BEGIN:VEVENT','UID:'+uid+'@carnivoreplanner','DTSTAMP:20261031T120000Z','DTSTART:'+f(d,time),'DTEND:'+f(d,end),'SUMMARY:'+title.replace(/[,;]/g,' '),'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:'+title.replace(/[,;]/g,' '),'END:VALARM','END:VEVENT')}meals.forEach((m,i)=>{let d=date(i);event('meal'+i,d,state.hour,'20:00','OMAD: '+m.name);if(isSlowMeal(m))event('prep'+i,d,'14:30','15:00','Preparar assado: '+m.name)});for(let w=0;w<5;w++){let d=date(w*7);d.setDate(d.getDate()-((d.getDay()+1)%7));event('shop'+w,d,'10:00','11:00','Compras semana '+(w+1)+' - Modelo e Madeira Cash')}lines.push('END:VCALENDAR');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/calendar'}));a.download='carnivore-planner.ics';a.click()}
function draw(){save();let out='';if(view==='today'){let delta=planPosition().elapsed;if(delta>=0&&(!state.currentTab||state.currentTab==='home'))state.day=Math.min(29,delta);out='<div class="card"><small>OMAD às '+state.hour+'</small>'+title(meals[state.day],state.day)+'<p>Receita detalhada para o jantar de hoje</p><button onclick="view=\'recipe\';draw()">Ver ingredientes e preparação</button></div><div class="card"><h3>Próximo passo</h3><p>Compras ao sábado às 10h. Para assados, começa por volta das 14h30.</p></div>'}
if(view==='recipe')out=recipe(state.day)+'<button onclick="view=\'month\';draw()">Voltar ao mês</button>';
if(view==='month')out='<div class="card"><h2>30 refeições diferentes</h2>'+meals.map((m,i)=>'<div class="line"><span>Dia '+(i+1)+' · '+m.name+'</span><button onclick="state.day='+i+';view=\'recipe\';draw()">Receita</button></div>').join('')+'</div>';
if(view==='shop')out='<div class="card"><h2>Compras ao sábado · 10h</h2><div class="actions">'+[0,1,2,3,4].map(w=>'<button class="'+(state.week===w?'selected':'secondary')+'" onclick="state.week='+w+';draw()">'+(w===4?'Final':'Sem. '+(w+1))+'</button>').join('')+'</div><h3>Semana '+(state.week+1)+'</h3>'+Object.entries(shopping(state.week)).map(([k,g])=>'<label class="line"><span><input type="checkbox" '+(state.checked[state.week+'-'+k]?'checked':'')+' onchange="state.checked[\''+state.week+'-'+k+'\']=this.checked;save()"> '+products[k][0]+' · '+(k==='ovos'?g+' un.':g+' g')+'</span><b>'+money(k==='ovos'?g*price(k):g*price(k)/1000)+'</b></label>').join('')+'<p>Total consumido: '+money(Object.entries(shopping(state.week)).reduce((s,[k,g])=>s+(k==='ovos'?g*price(k):g*price(k)/1000),0))+'</p><small>Quantidades consumidas, não necessariamente embalagens inteiras.</small></div>';
if(view==='budget')out=budget();$('#root').innerHTML=out+'<p class="muted">⚕️ Dieta carnívora estrita e OMAD podem causar carências e aumentar LDL. Calorias variam com os cortes; confirma valores nutricionais e acompanha peso e análises.</p>'}
/* V1.2 improvements: browser-local backup, weekly checklist, meal tracking and robust date navigation */
const oldDraw=draw;
const oldRecipe=recipe;
let oldShopping=shopping;
const oldBudget=budget;
const extraCss=document.createElement('style');
extraCss.textContent='.pill{display:inline-block;background:#3b3227;color:#ffd7a2;border-radius:99px;padding:5px 9px;font-size:12px;margin:4px 3px 4px 0}.tip{border-left:3px solid #ebbb7c;padding:10px;background:#292b30;margin:10px 0}.tiny{font-size:13px;color:#b8bdc4}.dayrow{padding:13px 0;border-bottom:1px solid #383d44}.done{color:#86cba6}.progress{height:10px;border-radius:9px;background:#3b4049;overflow:hidden}.progress>div{height:100%;background:#eabb7d}textarea{box-sizing:border-box;border-radius:8px;padding:8px}.two{display:flex;gap:9px;flex-wrap:wrap}.two>*{flex:1}button:focus-visible{outline:3px solid white}';
document.head.appendChild(extraCss);
state.prepared=state.prepared||{};
state.weightLog=state.weightLog||[];
state.spending=state.spending||{};
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function downloadText(name,body,type){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
function backup(){
 const original=window.CPStateStore.original();
 if(window.CPStateStore.status().blocked&&original!==null){
  downloadText('carnivore-planner-original.json',original,'application/json');return;
 }
 downloadText('carnivore-planner-backup.json',JSON.stringify({version:'1.2',exportedAt:new Date().toISOString(),settings:state},null,2),'application/json');
}
function restoreFile(input){
 const file=input.files?.[0];if(!file)return;
 file.text().then(text=>{
  const parsed=JSON.parse(text),data=parsed?.settings??parsed;
  const next=window.CPStateStore.validate(data,defaults);
  next.currentTab='home';
  if(!window.CPStateStore.replace(next))throw Error('Não foi possível guardar a cópia.');
  state=next;
  if(typeof render2==='function')render2();else draw();
  alert('Cópia importada. Os teus dados anteriores foram preservados numa cópia de recuperação.');
 }).catch(error=>{alert('Não foi possível importar este ficheiro. '+error.message)});
}

function updatePreference(key,value){
 const next={...state,[key]:value};
 try{window.CPStateStore.validate(next,defaults);}
 catch(error){alert('Valor inválido. Mantive a preferência anterior.');render2();return;}
 if(!window.CPStateStore.write(next))return;
 state=next;render2();
}
function addWeight(){let w=parseFloat(document.getElementById('new-weight').value);if(!Number.isFinite(w)||w<25||w>300)return alert('Introduz um peso válido.');state.weightLog.push({date:new Date().toISOString().slice(0,10),kg:w});save();render2()}
function weeklyCost(w){return Object.entries(oldShopping(w)).reduce((sum,[k,v])=>sum+(k==='ovos'?v*price(k):v*price(k)/1000),0)}
function noteTip(m){if(m.method==='leftover')return '<div class="tip">♨️ Sobras: usa uma porção refrigerada até 3–4 dias, ou congelada. Reaquece até 74 °C no centro.</div>';if(isSlowMeal(m))return '<div class="tip">🕒 Preparação demorada: confirma o tempo antes de começar e prepara as doses futuras em recipientes baixos. Refrigerar até 2 horas após cozinhar.</div>';return '<div class="tip">🌡️ Os tempos são indicativos: um termómetro de cozinha dá mais segurança e precisão.</div>'}
recipe=function(i){const m=meals[i];let out=oldRecipe(i);out=out.replace('<h3>Receita passo a passo</h3>',noteTip(m)+'<h3>Receita passo a passo</h3>');out=out.replace('</h2>', '</h2>');out=out.replace('</div>','<span class="pill">Jantar às '+esc(state.hour)+'</span></div>');return out}
function portionDetails(i){let m=meals[i],k='day-'+i;return '<div class="card"><h3>Registo da refeição</h3><label><input type="checkbox" '+(state.prepared[k]?'checked':'')+' onchange="state.prepared[\''+k+'\']=this.checked;save();draw()"> Refeição feita</label><p class="tiny">Os valores calóricos não são garantidos: a gordura dos cortes e o peso efetivamente consumido variam. Regista o peso ao longo de várias semanas.</p></div>'}
function monthView(){let today=Math.floor((new Date().setHours(12,0,0,0)-new Date(state.start+'T12:00:00'))/86400000);let finished=Object.keys(state.prepared).filter(k=>state.prepared[k]&&k.startsWith('day-')).length;return '<div class="card"><h2>Calendário dos 30 dias</h2><p class="muted">'+finished+'/30 refeições registadas</p><div class="progress"><div style="width:'+Math.min(100,finished/30*100)+'%"></div></div><p class="tiny">Cada prato é diferente. Preparações em dose dupla ou tripla aproveitam as sobras em dias consecutivos.</p>'+meals.map((m,i)=>'<div class="dayrow"><small>'+datefmt(date(i))+'</small><div class="line" style="border:0"><span><b>'+(state.prepared['day-'+i]?'✅ ':'')+'Dia '+(i+1)+'</b> · '+esc(m.name)+'</span><button onclick="state.day='+i+';view=\'recipe\';draw()">Abrir</button></div></div>').join('')+'</div>'}
function shopView(){let w=state.week,items=Object.entries(oldShopping(w));const checked=items.filter(([k])=>state.checked[w+'-'+k]).length;let spend=state.spending[w]??'';return '<div class="card"><h2>Compras — sábado às 10h</h2><div class="actions">'+[0,1,2,3,4].map(i=>'<button class="'+(w===i?'selected':'secondary')+'" onclick="state.week='+i+';draw()">'+(i===4?'Final':'Sem. '+(i+1))+'</button>').join('')+'</div><p>'+checked+'/'+items.length+' produtos marcados</p><div class="progress"><div style="width:'+(checked/items.length*100)+'%"></div></div>'+items.map(([k,g])=>'<label class="line"><span><input type="checkbox" '+(state.checked[w+'-'+k]?'checked':'')+' onchange="state.checked[\''+w+'-'+k+'\']=this.checked;save();draw()"> '+esc(products[k][0])+' · '+(k==='ovos'?g+' un.':g+' g')+'</span><b>'+money(k==='ovos'?g*price(k):g*price(k)/1000)+'</b></label>').join('')+'<p>Ingredientes previstos: <b>'+money(weeklyCost(w))+'</b></p><p><label>Despesa real (€) <input type="number" min="0" step=".01" value="'+spend+'" onchange="state.spending['+w+']=this.value==null?null:+this.value;save();draw()"></label></p><div class="two"><button onclick="copyShop('+w+')">📋 Copiar lista</button><button class="secondary" onclick="resetWeek('+w+')">Desmarcar</button></div><p class="tiny">Podes comprar embalagens maiores e utilizar o restante noutras semanas. A despesa real deve incluir o preço completo das embalagens adquiridas.</p></div>'}
function copyShop(w){let t='Carnivore Planner — compras semana '+(w+1)+'\n'+Object.entries(oldShopping(w)).map(([k,g])=>'☐ '+products[k][0]+': '+(k==='ovos'?g+' un.':g+' g')).join('\n');navigator.clipboard?.writeText(t).then(()=>alert('Lista copiada')).catch(()=>downloadText('compras-semana-'+(w+1)+'.txt',t,'text/plain'))}
function resetWeek(w){Object.keys(state.checked).filter(k=>k.startsWith(w+'-')).forEach(k=>delete state.checked[k]);save();render2()}
function finances(){const real=Object.values(state.spending).reduce((s,x)=>s+(Number(x)||0),0);const available=state.budget-real;return '<div class="card"><h2>Orçamento do mês</h2><div class="two"><div><small>Limite</small><h2>'+money(state.budget)+'</h2></div><div><small>Estimativa dos ingredientes</small><h2>'+money(total())+'</h2></div></div><p>Gasto efetivamente registado: <b>'+money(real)+'</b></p><p>Disponível do limite: <b>'+(available>=0?'':'⚠️ ')+money(available)+'</b></p><p class="tiny">A estimativa não inclui diferenças entre o peso consumido e as embalagens completas.</p></div>'}
function weightSection(){let recent=state.weightLog.slice(-5).reverse();return '<div class="card"><h3>Acompanhar peso · objetivo 64 kg</h3><div class="two"><input id="new-weight" type="number" min="25" max="300" step=".1" placeholder="Peso kg"><button onclick="addWeight()">Guardar peso</button></div>'+recent.map(x=>'<div class="line"><span>'+esc(x.date)+'</span><b>'+esc(x.kg)+' kg</b></div>').join('')+'<p class="tiny">Avalia a média semanal do peso. Um valor isolado pode variar com água e sal.</p></div>'}
draw=function(){save();let out='';if(view==='today'){let delta=planPosition().elapsed;if(delta>=0&&(!state.currentTab||state.currentTab==='home'))state.day=Math.min(29,delta);out='<div class="card"><span class="pill">OMAD '+esc(state.hour)+'</span>'+title(meals[state.day],state.day)+'<p>Jantar planeado. Segue ingredientes, temperaturas e instruções.</p><button onclick="view=\'recipe\';draw()">👨‍🍳 Abrir receita</button></div><div class="card"><h3>Esta semana</h3><p>🛒 Compras ao sábado às 10h.</p><p>🥘 Cozinhados lentos: planeia começar algumas horas antes do jantar.</p><button class="secondary" onclick="view=\'shop\';draw()">Ver lista de compras</button></div>'+weightSection()}
if(view==='recipe')out=recipe(state.day)+portionDetails(state.day)+'<button class="secondary" onclick="view=\'month\';draw()">Voltar ao mês</button>';
if(view==='month')out=monthView();
if(view==='shop')out=shopView();
if(view==='budget')out=finances()+oldBudget()+'<div class="card"><h3>Dados e segurança</h3><p>As configurações ficam neste telemóvel. Exporta uma cópia para não as perderes.</p><div class="two"><button onclick="backup()">Guardar cópia</button><label class="pill">Importar cópia <input type="file" accept=".json,application/json" onchange="restoreFile(this)" style="max-width:140px"></label></div></div>';
document.getElementById('root').innerHTML=out+'<p class="muted">⚕️ OMAD e dieta carnívora estrita podem provocar carências nutricionais e aumento de LDL. Os números são estimativas, não uma prescrição clínica.</p>'};

draw();

/* v2.0 experience */
state.currentTab=state.currentTab||'home';state.stock=state.stock||{};state.cookStep=state.cookStep||{};state.cookScale=state.cookScale||{};state.completed=state.completed||{};state.manualMeals=state.manualMeals||{};state.favourites=state.favourites||{};state.timers=state.timers||{};state.notificationsExplained=state.notificationsExplained||false;
const uxstyle=document.createElement('style');uxstyle.textContent=`
:root{color-scheme:dark} body{background:#111317;font-size:15px}header{position:static;background:#111317;padding:19px 20px 7px}header h1{font-size:22px;letter-spacing:-.6px}header small{font-size:12px}main{padding:9px 16px 100px;max-width:640px}.card{border-radius:19px;background:#1d2229;border-color:#2e343d;padding:18px;box-shadow:none}.hero{background:linear-gradient(145deg,#39312a 0%,#24262b 58%,#20252c 100%);border:1px solid #534536;border-radius:23px;padding:20px;margin:8px 0 16px}.hero h2{font-size:26px;line-height:1.1;letter-spacing:-.7px;margin:12px 0}.hero .emoji{font-size:58px;line-height:1.2;display:block;margin:4px 0 10px}.hero .sub{color:#d8c6ae;font-size:13px}.primary{background:#ebbf87;color:#221b14;font-weight:750;border-radius:13px;padding:14px 17px}.quiet{background:#2f3742;color:#f3eadc}.notice{font-size:13px;line-height:1.5}.chip{background:#33373d;border:1px solid #4a4e56;border-radius:99px;padding:7px 11px;display:inline-block;font-size:12px;margin:3px;color:#e6ddcf}.eyebrow{font-size:11px;color:#caa982;letter-spacing:1px;font-weight:750;text-transform:uppercase}.section{font-size:19px;margin:23px 0 10px;letter-spacing:-.4px}.tile{background:#20252c;border-radius:15px;padding:14px 16px;margin:8px 0;border:1px solid #303741}.tile strong{display:block;font-size:15px}.tile small{display:block;margin-top:5px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:9px}.grid2 .tile{margin:0}.actions{gap:8px}.actions button{flex:auto}.flex{display:flex;gap:10px;align-items:center;justify-content:space-between}.flex>*{min-width:0}.subtle{color:#b4bac4;font-size:13px}.swipe{display:flex;overflow:auto;gap:8px;padding:7px 0 12px;scroll-snap-type:x mandatory}.day-chip{min-width:69px;background:#242a31;color:#ddd;border-radius:14px;padding:11px 8px;border:1px solid #3a414b;text-align:center;scroll-snap-align:start}.day-chip.active{background:#e9bb80;color:#201914}.day-chip b{display:block;font-size:19px;margin-top:5px}.stepbox{font-size:19px;line-height:1.55;padding:20px;border-radius:17px;background:#262d35;min-height:155px;margin:13px 0}.meter{height:8px;background:#373e48;border-radius:99px;overflow:hidden}.meter>div{height:100%;background:#edbe7e}.warning{padding:13px;background:#332c26;border-radius:13px;color:#e5d4c3;font-size:12px;line-height:1.55}.ingredient{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #363b43;padding:12px 0;gap:8px}.ingredient span{line-height:1.4}.ingredient button{padding:6px 10px;font-size:12px}.pillbutton{background:#2c343d;color:#e8ded2;border-radius:99px;padding:10px 13px}.navinner{display:flex;justify-content:space-around;gap:2px;max-width:650px;margin:auto;width:100%}nav{padding:10px 0 max(10px,env(safe-area-inset-bottom));background:#1b2026;border-top:1px solid #333940}nav button{font-size:12px;padding:6px 7px;min-width:65px;color:#b5bdc8}nav button.active{color:#edbe7e}nav button i{font-style:normal;display:block;font-size:19px;margin-bottom:3px}.modalbtn{width:100%;margin:10px 0}input,select,textarea{font-size:16px!important}button{transition:background .12s;touch-action:manipulation}button:active{opacity:.8}.card h3{margin-top:12px}.rowline{padding:13px 0;border-bottom:1px solid #333943}.small{font-size:12px;color:#b7bbc2}.statbig{font-size:22px;font-weight:750;letter-spacing:-.5px}.bad{color:#f3a9a3}.good{color:#b2dcac}`;document.head.appendChild(uxstyle);
function setTab(t){state.currentTab=t;view=t;save();render2();window.scrollTo(0,0)}
function routeDay(i){state.day=(i+30)%30;state.currentTab='recipe';save();render2();window.scrollTo(0,0)}
function chosen(i){return state.manualMeals?.[i]??i}
function mealAt(i){const base=meals[chosen(i)]||meals[i];return window.CPPlanPortions&&!state.previewMode?window.CPPlanPortions.meal(base,state.planPortions,i):base}
function safeText(t){return esc(t)}
function category(m){let a=Object.keys(m.items);if(a.includes('salmao')||a.includes('atum')||a.includes('cavala')||a.includes('sardinha'))return '🐟';if(a.includes('frango'))return '🍗';if(a.some(x=>['duroc','lagartos','plumas','secretos','barriga'].includes(x)))return '🍖';return '🥩'}
function isSlowMeal(m){
 if(!m||!['roast','braise'].includes(m.method))return false;
 const duration=window.cpGuideTime?.(m,meals.indexOf(m));
 return !Array.isArray(duration)||!Number.isFinite(duration[1])||duration[1]>=90;
}
function tipFor(m){let method=m.method;if(isSlowMeal(m))return '⏳ Assado lento · prepara com antecedência';if(method==='leftover')return '♨️ Aproveitar carne já cozinhada';if(method==='fishoven'||method==='roast')return '🔥 Forno';return '🍳 Preparação no momento'}
function recipeSteps(m){const name=m.name.toLowerCase();let st=steps[m.method].slice();if(m.method==='pan'){st[0]='Retira a carne do frigorífico apenas durante a preparação. Seca muito bem com papel e tempera com sal. Evita molhos vegetais se mantiveres a dieta estrita.';st[1]='Aquece uma frigideira de fundo espesso. Para um bife de 2–3 cm, começa por selar 2–4 minutos por face e ajusta ao tamanho; não confies só no relógio.'}
if(m.method==='braise'){st[0]='Aquece o forno a 145 °C. Sela a carne em panela adequada; usa apenas sal e água ou caldo animal sem aditivos.';st[1]='Tapa bem e cozinha lentamente durante 3–5 horas; verifica a ternura a partir das 3 horas, adicionando água quente se necessário.'}
return st}
function saveButton(label,action,kind=''){return '<button class="'+kind+'" onclick="'+action+'">'+label+'</button>'}
function planPosition(now=new Date()){
 const start=new Date(state.start+'T12:00:00');
 const stamp=d=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());
 const elapsed=Math.round((stamp(now)-stamp(start))/86400000);
 return {elapsed,index:Math.max(0,Math.min(29,elapsed)),status:elapsed<0?'before':elapsed>=30?'ended':'active'};
}
function todayIndex(){return planPosition().index}
function nextSaturday(){let d=new Date();let day=d.getDay(),diff=(6-day+7)%7;d.setDate(d.getDate()+diff);return datefmt(d)}
function showHome(){
 const position=planPosition();
 if(position.status!=='active')return '<section class="card" id="cp-plan-boundary"><h2>'+(position.status==='ended'?'Plano de 30 dias terminado':'O plano ainda não começou')+'</h2><p>'+(position.status==='ended'?'Terminou em '+esc(datefmt(date(29)))+'. Não foi iniciado outro ciclo.':'Começa em '+esc(datefmt(date(0)))+'.')+'</p><p>As datas, conclusões, compras e registos de consumo deste plano foram mantidos.</p>'+saveButton('Consultar plano','setTab(\'month\')','primary')+' '+saveButton('Consultar compras','setTab(\'shop\')','quiet')+'</section>';
 let i=todayIndex(),m=mealAt(i);let done=!!state.prepared['day-'+i];let tomorrow=mealAt(Math.min(i+1,29));let html='<section class="hero" onclick="if(!event.target.closest(\'button,a,input,label\'))routeDay('+i+')" role="button" tabindex="0" aria-label="Abrir detalhes da receita de hoje" onkeydown="if(event.target===this&&(event.key===\'Enter\'||event.key===\' \')){event.preventDefault();routeDay('+i+')}" style="cursor:pointer"><div class="eyebrow">HOJE · '+esc(datefmt(date(i)))+' · '+esc(state.hour)+'</div><div class="emoji">'+category(m)+'</div><h2>'+esc(m.name)+'</h2><div class="sub">'+tipFor(m)+'</div><div style="margin:15px 0"><span class="chip">⏰ '+(m.method==='braise'||m.method==='roast'?'3–5 h':'25–50 min')+'</span><span class="chip">💶 '+money(calc(m))+'</span></div>'+saveButton('👨‍🍳 Cozinhar agora','routeDay('+i+')','primary')+' '+saveButton(done?'✓ Já cozinhei':'Marcar como feito','toggleDone('+i+')','quiet')+'</section><h3 class="section">A seguir</h3><div class="grid2"><div class="tile" onclick="setTab(\'shop\')"><span style="font-size:24px">🛒</span><strong>Compras</strong><small>Sábado · 10h</small></div><div class="tile" onclick="setTab(\'budget\')"><span style="font-size:24px">💳</span><strong>Orçamento</strong><small>'+money(state.budget-total())+' de margem estimada</small></div></div><h3 class="section">Amanhã</h3><div class="tile" onclick="routeDay('+(i+1)%30+')"><div class="flex"><span style="font-size:32px">'+category(tomorrow)+'</span><div style="flex:1"><strong>'+esc(tomorrow.name)+'</strong><small>'+tipFor(tomorrow)+'</small></div><b>›</b></div></div><div class="tile"><strong>🥘 Preparações para vários dias</strong><p class="subtle">Consulta nas fichas as refeições consecutivas ligadas pelo plano atual. Confirma as porções que efetivamente preparaste.</p>'+saveButton('Ver no calendário','setTab(\'month\')','quiet')+'</div>'
 if(i===29){
  const first=html.indexOf('<h3 class="section">Amanhã</h3>');
  const last=html.indexOf('<div class="tile"><strong>🥘');
  if(first>=0&&last>first)html=html.slice(0,first)+html.slice(last);
 }
 return html;
}
function toggleDone(i){state.prepared['day-'+i]=!state.prepared['day-'+i];save();render2()}
function calendarUI(){let completed=Array.from({length:30},(_,i)=>state.prepared['day-'+i]).filter(Boolean).length;return '<div class="flex"><div><h2>O teu mês</h2><p class="subtle">30 jantares · podes trocar pratos</p></div><div class="statbig">'+completed+'/30</div></div><div class="meter"><div style="width:'+completed/30*100+'%"></div></div><div class="card">'+Array.from({length:30},(_,i)=>{let m=mealAt(i);return '<div class="flex rowline" role="link" tabindex="0" aria-label="Abrir receita do dia '+(i+1)+'" onclick="if(!event.target.closest(\'button,a,input,label\'))routeDay('+i+')" onkeydown="if(event.target===this&&(event.key===\'Enter\'||event.key===\' \')){event.preventDefault();routeDay('+i+')}" style="cursor:pointer"><div style="flex:1"><small>'+esc(datefmt(date(i)))+' · Dia '+(i+1)+'</small><div style="font-weight:650;margin-top:5px">'+category(m)+' '+esc(m.name)+(state.prepared['day-'+i]?' ✓':'')+'</div><small>'+money(calc(m))+'</small></div><button class="quiet" onclick="routeDay('+i+')">Ver ›</button></div>'}).join('')+'</div>'}
function openCooking(i){state.currentTab='cook';state.day=i;state.cookStep[i]=0;save();render2()}
function scaleRecipe(i,scale){if(![0.5,1,2].includes(scale))return;state.cookScale[i]=scale;save();render2();if(typeof document!=='undefined')document.querySelector('[data-consult-scale="'+scale+'"]')?.focus({preventScroll:true})}
function swap(i){let cur=chosen(i),next=(cur+1)%30;state.prepared['day-'+i]=false;state.cookStep[i]=0;state.manualMeals[i]=next;save();render2()}
function recipeUI(i){let m=mealAt(i),scale=state.cookScale[i]||1,el=Object.entries(m.items);return '<div class="flex"><button class="quiet" onclick="setTab(\'month\')">‹ Calendário</button><span class="eyebrow">DIA '+(i+1)+'</span></div><div class="hero"><span class="emoji">'+category(m)+'</span><h2>'+esc(m.name)+'</h2><div class="sub">'+tipFor(m)+'</div><p><span class="chip">'+money(calc(m))+'</span><span class="chip">'+(m.method==='braise'||m.method==='roast'?'3–5 horas':'25–50 min')+'</span></p>'+saveButton('Começar receita guiada','openCooking('+i+')','primary')+'</div><div class="card"><div class="flex"><h3>Ingredientes</h3><div>'+saveButton('½','scaleRecipe('+i+',0.5)','pillbutton')+saveButton('1×','scaleRecipe('+i+',1)','pillbutton')+saveButton('2×','scaleRecipe('+i+',2)','pillbutton')+'</div></div>'+el.map(([k,g])=>'<div class="ingredient"><span>'+esc(products[k][0])+'</span><strong>'+((k==='ovos')?Math.round(g*scale)+' un.':Math.round(g*scale)+' g')+'</strong></div>').join('')+'<p class="small">As quantidades são aproximadas e referem-se à parte comestível.</p></div><div class="card"><h3>Passos de preparação</h3>'+recipeSteps(m).map((t,n)=>'<div class="rowline"><span class="chip">'+(n+1)+'</span> '+esc(t)+'</div>').join('')+'</div><div class="card"><h3>Planeamento</h3><p class="subtle">'+tipFor(m)+'</p>'+saveButton('Trocar por outro prato','swap('+i+')','quiet')+' '+saveButton('Marcar como feito','toggleDone('+i+')','quiet')+'</div><div class="warning">⚕️ Os valores nutricionais e calóricos são estimativas. OMAD e dieta carnívora estrita podem causar carências e elevação do LDL.</div>'}
function cookUI(i){let m=mealAt(i),arr=recipeSteps(m),n=Math.max(0,Math.min(arr.length-1,state.cookStep[i]||0));return '<div class="flex"><button class="quiet" onclick="routeDay('+i+')">‹ Receita</button><span class="eyebrow">MODO COZINHAR</span></div><h2 style="margin-top:20px">'+esc(m.name)+'</h2><p>Passo '+(n+1)+' de '+arr.length+'</p><div class="meter"><div style="width:'+((n+1)/arr.length*100)+'%"></div></div><div class="stepbox">'+esc(arr[n])+'</div><div class="two"><button class="quiet" onclick="cookMove('+i+',-1)">← Anterior</button><button class="primary" onclick="cookMove('+i+',1)">'+(n===arr.length-1?'Terminar ✓':'Próximo →')+'</button></div><div class="card"><h3>Ingredientes</h3>'+Object.entries(m.items).map(([k,g])=>'<div class="ingredient"><span>'+products[k][0]+'</span><b>'+(k==='ovos'?g+' un.':g+' g')+'</b></div>').join('')+'</div><p class="small">Mantém o ecrã ligado nas definições do telemóvel se necessário.</p>'}
function cookMove(i,d){let stepsCount=practicalSteps(mealAt(i)).length;let next=(state.cookStep[i]||0)+d;if(next>=stepsCount){state.prepared['day-'+i]=true;state.currentTab='home';state.cookStep[i]=0}else state.cookStep[i]=Math.max(0,next);save();render2()}
function stockUI(){return '<div class="card"><h3>Frigorífico e congelador</h3><p class="subtle">Indica o que já tens em casa. A lista semanal mostra o que falta comprar.</p>'+Object.entries(products).map(([k,v])=>'<div class="ingredient"><span>'+esc(v[0])+'<small style="display:block">'+(k==='ovos'?'unidades':'gramas')+'</small></span><input type="number" min="0" style="width:85px" value="'+(state.stock[k]||0)+'" onchange="state.stock[\''+k+'\']=Math.max(0,+this.value||0);save();render2()"></div>').join('')+'</div>'}
function shopping2(){let w=state.week,items=Object.entries(oldShopping(w));return '<div class="flex"><div><h2>Compras</h2><p class="subtle">Sábado às 10h · Modelo / Madeira Cash</p></div><span class="chip">'+money(weeklyCost(w))+'</span></div><div class="swipe">'+[0,1,2,3,4].map(j=>'<button class="day-chip '+(w===j?'active':'')+'" onclick="state.week='+j+';save();render2()">'+(j===4?'Final':'Semana')+'<b>'+(j+1)+'</b></button>').join('')+'</div><div class="card"><h3>Lista semanal</h3>'+items.map(([k,g])=>{let net=Math.max(0,g-(state.stock[k]||0));return '<div class="ingredient"><label style="flex:1"><input type="checkbox" '+(state.checked[w+'-'+k]?'checked':'')+' onchange="state.checked[\''+w+'-'+k+'\']=this.checked;save();render2()"> '+esc(products[k][0])+'<small style="display:block;margin-left:27px">Precisas de '+(k==='ovos'?g+' un.':g+' g')+' · em casa '+(state.stock[k]||0)+'</small></label><strong>'+((k==='ovos')?net+' un.':net+' g')+'</strong></div>'}).join('')+'<p>Valor teórico dos ingredientes: <b>'+money(weeklyCost(w))+'</b></p><p><label>Gasto real desta compra (€) <input type="number" min="0" step=".01" value="'+(state.spending[w]??'')+'" onchange="state.spending['+w+']=this.value===\'\'?null:+this.value;save();render2()"></label></p><div class="two">'+saveButton('Copiar lista','copyShop('+w+')','primary')+saveButton('Limpar marcas','resetWeek('+w+')','quiet')+'</div></div>'+stockUI()}
function finances2(){let spent=Object.values(state.spending).reduce((s,x)=>s+(Number(x)||0),0);let diff=state.budget-spent;return '<h2>Orçamento e ajustes</h2><div class="grid2"><div class="tile"><small>Teto mensal</small><div class="statbig">'+money(state.budget)+'</div></div><div class="tile"><small>Gasto registado</small><div class="statbig">'+money(spent)+'</div></div></div><div class="card"><div class="flex"><b>Disponível</b><div class="statbig '+(diff<0?'bad':'good')+'">'+money(diff)+'</div></div><p class="small">Estimativa dos alimentos do menu: '+money(total())+'. Regista compras reais para conhecer os custos.</p><label>Limite (€) <input type="number" min="0" value="'+state.budget+'" onchange="updatePreference(&quot;budget&quot;,+this.value)"></label></div>'+weightSection()+'<div class="card"><h3>Horários</h3><p>OMAD: <input type="time" aria-label="Hora do jantar" value="'+state.hour+'" onchange="updatePreference(&quot;hour&quot;,this.value)"></p><p>Início do plano: <input type="date" aria-label="Data de início do plano" value="'+state.start+'" onchange="updatePreference(&quot;start&quot;,this.value)"></p>'+saveButton('Exportar lembretes de calendário','calendarExport()','quiet')+'<p class="small">As notificações diretas da aplicação precisam de um serviço de envio e permissões. A exportação inclui os 30 jantares atualizados, lembretes de compras e preparação antecipada para assados. Os horários são locais no calendário onde importares o ficheiro.</p></div><div class="card"><h3>Preços por produto</h3>'+Object.entries(products).map(([k,p])=>'<div class="ingredient"><span>'+esc(p[0])+'</span><input type="number" aria-label="Preço de '+esc(p[0])+'" style="width:95px" min="0" step=".01" value="'+price(k)+'" onchange="state.prices[\''+k+'\']=Math.max(0,+this.value);save();render2()"></div>').join('')+'</div><div class="card"><h3>Dados e cópia de segurança</h3><div class="two">'+saveButton('Descarregar cópia','backup()','primary')+'<label class="chip">Importar <input type="file" accept=".json,application/json" onchange="restoreFile(this)" style="width:125px"></label></div></div>'}
function render2(){save();let t=state.currentTab;let body=t==='home'?showHome():t==='month'?calendarUI():t==='shop'?shopping2():t==='budget'?finances2():t==='recipe'?recipeUI(state.day):cookUI(state.day);document.getElementById('root').innerHTML=body;let nav=document.querySelector('nav');nav.innerHTML='<div class="navinner">'+[['home','⌂','Hoje'],['month','▦','Plano'],['library','▤','Receitas'],['shop','🛒','Compras'],['budget','⚙','Ajustes']].map(([id,ic,label])=>'<button class="'+(t===id?'active':'')+'" onclick="setTab(\''+id+'\')"><i>'+ic+'</i>'+label+'</button>').join('')+'</div>';let header=document.querySelector('header');header.innerHTML='<h1>🥩 Carnivore <span style="color:#ebbf87">Planner</span></h1><small>O teu jantar, sem complicações · v2.0</small>'}
render2();

/* v2.1 practical cooking */
state.equipment=state.equipment||'grelhador';state.doneSteps=state.doneSteps||{};state.batch=state.batch||{};state.cookStart=state.cookStart||{};
const css21=document.createElement('style');css21.textContent='.equip{display:flex;gap:7px;overflow:auto;padding:8px 0}.equip button{white-space:nowrap;background:#30363e;color:#eee}.equip button.active{background:#eabb7d;color:#24190d}.how{font-size:16px;line-height:1.55}.how li{padding:12px 0;border-bottom:1px solid #3a3d42}.how li:last-child{border:0}.timer-display{font-size:32px;font-weight:800;letter-spacing:1px}.tag{font-size:12px;color:#d8be9a}.batchcard{background:#272f35;border-radius:14px;padding:13px;margin:10px 0}';document.head.appendChild(css21);
const equipments=['grelhador','air fryer','frigideira','forno'];
function setEquipment(k){state.equipment=k;save();render2()}
function equipbar(){
 const i=state.day, recommended=recommendedEquipment(mealAt(i)),selected=methodForDay(i);
 const labels={grelhador:'🔥 Grelhador','air fryer':'♨️ Air fryer',frigideira:'🍳 Frigideira',forno:'🥘 Forno',panela:'🍲 Panela'};
 return '<div class="equip-info">⭐ Recomendado: <b>'+equipmentName(recommended)+'</b><div>✓ Escolhido: <b>'+equipmentName(selected)+'</b></div></div><div class="cp-method-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%;box-sizing:border-box;overflow:visible">'+Object.entries(labels).map(([k,label])=>'<button type="button" data-method="'+k+'" class="'+(selected===k?'active':'')+'" style="width:100%;min-width:0;min-height:60px;padding:8px 2px;white-space:normal;font-size:12px;line-height:1.3" onclick="setEquipment(this.dataset.method)">'+label+'</button>').join('')+'</div>';
}
function practicalSteps(m){const a=Object.keys(m.items),fish=a.some(x=>['salmao','atum','cavala','sardinha'].includes(x));const beef=a.some(x=>['entrecote','picanha','vazia','alcatra','maminha','lombo','picada','acem','costela','chambao'].includes(x));const minced=a.includes('picada');const chicken=a.includes('frango');const slow=['braise','roast','leftover'].includes(m.method);let eq=state.equipment;if(m.method==='leftover')return ['Retira do frigorífico só a porção já cozinhada e que vais comer.','Desfia e aquece com um pouco do próprio molho, até ficar bem quente por dentro (74 °C para sobras).','Se quiseres crosta, termina rapidamente no grelhador, frigideira ou air fryer. Junta os ovos preparados à parte.'];if(slow&&m.method!=='leftover')return ['Tempera a peça com sal. Coloca num recipiente fundo com um pouco de água ou caldo de carne puro.','Tapa bem e leva ao forno a 145–150 °C. Começa a verificar após 3 horas; pode demorar 4–5 horas consoante a peça.','Quando se desfizer facilmente com um garfo, retira e deixa repousar 10 minutos. Se necessário, deixa mais tempo em vez de aumentar muito a temperatura.','Divide logo em porções. Guarda em caixas baixas no frigorífico até 3–4 dias ou congela as doses para mais tarde.'];if(minced)return ['Forma hambúrgueres sem adicionar farinha nem pão. Tempera com sal.','No '+eq+', cozinha dos dois lados até estarem bem passados no centro. Carne picada não deve ficar crua por dentro (referência de segurança: 71 °C).','Derrete o queijo nos últimos instantes e prepara os ovos à parte.'];if(chicken)return ['Seca a pele e tempera.','Usa '+(eq==='air fryer'?'a air fryer a 190 °C por cerca de 25–35 minutos':eq==='forno'?'o forno a 200 °C por cerca de 30–40 minutos':'o grelhador ou frigideira em lume médio, virando várias vezes')+'.','A carne de frango deve ficar totalmente cozinhada (74 °C no centro), sem partes cruas. Deixa repousar 5 minutos.'];if(fish&&!beef)return ['Seca o peixe e tempera com sal. Confirma que não tem espinhas.','No '+(eq==='air fryer'?'air fryer a 180 °C, começa a verificar aos 8–12 minutos':eq==='forno'?'forno a 190 °C, começa a verificar aos 12–16 minutos':eq==='grelhador'?'grelhador bem quente, grelha 3–5 minutos de cada lado':'frigideira com um pouco de gordura, cerca de 3–5 minutos por lado')+'. A espessura altera o tempo.','O peixe deve ficar opaco e separar-se facilmente em lascas (temperatura segura de referência 63 °C). Cozinha camarão até ficar opaco.','Prepara os ovos à parte e serve sem deixar o peixe secar.'];let base=eq==='grelhador'?'Pré-aquece o grelhador. Coloca a carne na grelha e começa com cerca de 3–4 minutos por lado para um bife de 2–3 cm.':eq==='air fryer'?'Pré-aquece a air fryer a 200 °C. Coloca a carne sem sobrepor e verifica após 7–10 minutos, virando a meio.':eq==='forno'?'Pré-aquece o forno a 210 °C. Num tabuleiro quente, assa cerca de 12–18 minutos, virando a meio.':'Aquece bem uma frigideira pesada. Sela a carne cerca de 2–4 minutos por lado para um bife de 2–3 cm.';return ['Seca a carne com papel e tempera com sal. Se tiver uma capa de gordura grossa, começa por a dourar. ',base,'Para o ponto malpassado, encurta um pouco; para médio, prolonga. Se o bife for muito grosso, baixa a intensidade e termina devagar. Estes tempos são só referências.','Deixa repousar 3–5 minutos para reter os sucos. Prepara ovos e queijo à parte. Para segurança alimentar, os cortes inteiros têm referência de 63 °C no centro e 3 minutos de repouso — podes optar por não usar termómetro, sabendo que o ponto visual é menos fiável.']}
function startKitchen(i){state.currentTab='cook';state.day=i;state.cookStep[i]=0;save();render2()}
function cpHeroTime(i,m){
 const id=typeof chosen==='function'?chosen(i):i;
 const times=typeof window.cpGuideTime==='function'?window.cpGuideTime(m,id):null;
 if(!Array.isArray(times)||times.length!==2)return isSlowMeal(m)?'3–5 horas':'20–45 min';
 const print=n=>n>=60?Math.floor(n/60)+'h'+(n%60?String(n%60).padStart(2,'0'):''):String(n);
 return print(times[0])+'–'+print(times[1])+(times[1]<60?' min':'');
}
function consultationScale(i){return [0.5,1,2].includes(state.cookScale[i])?state.cookScale[i]:1}
function consultationItems(meal,scale){
 return Object.fromEntries(Object.entries(meal.baseItems||meal.items).map(([key,quantity])=>[key,quantity*scale]));
}
function consultationIngredients(i){
 const m=mealAt(i),scale=consultationScale(i),items=consultationItems(m,scale);
 const format=n=>n.toLocaleString('pt-PT',{maximumFractionDigits:2});
 return '<p class="notice" data-scale-notice>Escala de consulta '+format(scale)+'×. O plano, as compras, os lotes e o consumo de stock usam as porções guardadas no plano. Os tempos são os da receita base e não multiplicam com a escala.</p>'+
  Object.entries(items).map(([key,quantity])=>'<div class="ingredient" data-consult-ingredient="'+key+'"><span>'+esc(products[key][0])+'</span><b>'+format(quantity)+(key==='ovos'?' un.':' g')+'</b></div>').join('')+
  (items.ovos%1?'<p class="small">Quantidade fracionada de ovos: bate os ovos e mede a fração indicada, ou ajusta manualmente. Não foi arredondada automaticamente.</p>':'')+
  '<p data-consult-cost>Estimativa dos ingredientes nesta consulta: '+money(calc({...m,items:m.baseItems||m.items})*scale)+'. Estimativa das porções do plano: '+money(calc(m))+'.</p>';
}
function practicalRecipe(i){const m=mealAt(i),st=practicalSteps(m),scale=consultationScale(i);return '<div class="flex"><button class="quiet" onclick="setTab(\'month\')">‹ Voltar</button><span class="eyebrow">DIA '+(i+1)+'</span></div><div class="hero"><div class="emoji">'+category(m)+'</div><h2>'+esc(m.name)+'</h2><div class="sub">'+tipFor(m)+'</div><p class="tag">⏰ '+cpHeroTime(i,m)+' · 💶 '+money(calc(m))+'</p><button class="primary" onclick="startKitchen('+i+')">' +(scale===1?'Começar a cozinhar →':'Cozinhar plano →')+'</button></div><div class="card"><h3>Como queres cozinhar?</h3>'+equipbar()+'<p class="small">A aplicação adapta os passos ao equipamento. Os assados lentos continuam a usar forno.</p></div><div class="card"><div class="flex consult-scale-heading"><h3>Ingredientes</h3><div class="consult-scale-controls">'+[0.5,1,2].map(x=>'<button class="pillbutton" data-consult-scale="'+x+'" aria-pressed="'+(scale===x)+'" onclick="scaleRecipe('+i+','+x+')">'+String(x).replace('.',',')+'×</button>').join('')+'</div></div>'+consultationIngredients(i)+'</div><div class="card"><h3>Receita simples</h3><ol class="how">'+st.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></div>'+batchUI(i)+'<div class="card"><div class="two"><button class="quiet" onclick="swap('+i+')">Trocar prato</button><button class="quiet" onclick="toggleDone('+i+')">'+(state.prepared['day-'+i]?'✓ Concluído':'Marcar como feito')+'</button></div></div>'}
function batchUI(i){
 const lot=batchForDay(i),m=mealAt(i);
 if(!lot){
  if(!isSlowMeal(m))return '';
  return '<div class="card"><h3>🥘 Cozedura antecipada</h3><p>Prepara a quantidade da receita. Só reserva doses futuras se confirmares que as vais cozinhar.</p></div>';
 }
 const label={maminha:'Maminha',acem:'Acém',costela:'Costela'}[lot.key];
 const rows=lot.days.map(d=>'<div class="ingredient"><span>'+esc(datefmt(date(d)))+' · Dia '+(d+1)+'<small style="display:block">'+esc(mealAt(d).name)+'</small></span><b>'+mealAt(d).items[lot.key]+' g</b></div>').join('');
 const cross=lot.days.some(d=>Math.floor(d/7)!==Math.floor(lot.days[0]/7));
 return '<div class="card" data-batch-plan><h3>🥘 '+label+' · planeamento do lote</h3><p>'+(lot.unlinked?'Esta receita de sobras não tem uma preparação anterior ligada no plano. Confirma que tens carne já cozinhada; o stock não comprova isso.':'O plano associa apenas as refeições consecutivas abaixo. Isto não confirma que as porções já foram cozinhadas.')+'</p><p><b>'+lot.days.length+' refeições planeadas · '+lot.grams+' g de carne (peso indicado nos ingredientes)</b></p>'+rows+
  (cross?'<p class="notice">Este lote atravessa semanas. As compras contam cada porção na data da refeição. Se decidires cozinhar tudo antes, antecipa a compra da carne da semana seguinte; não acrescentes esse peso outra vez ao total do plano.</p>':'')+
  '<p class="small">Quantidades do lote: porções guardadas no plano, sem aplicar a escala de consulta. Ovos e queijo são preparados em cada refeição. As quantidades planeadas não são um registo de carne cozinhada disponível.</p><p>Registo manual antigo de porções de '+label+': <strong>'+(state.batch[lot.key]||0)+'</strong>. Não está associado a este lote nem confirma sobras disponíveis.</p><div class="two"><button class="quiet" onclick="changeBatch(\''+lot.key+'\',-1)">− 1 porção</button><button onclick="changeBatch(\''+lot.key+'\',1)">+ 1 porção</button></div></div>';
}
function batchForDay(day){
 const types={8:['maminha',false],9:['maminha',true],14:['acem',false],15:['acem',true],16:['acem',true],20:['costela',false],21:['costela',true]};
 const type=d=>types[chosen(d)];
 const current=type(day);if(!current)return null;
 const [key,leftover]=current;let first=day;
 if(leftover){
  while(first>0&&type(first-1)?.[0]===key&&type(first)?.[1])first--;
  if(type(first)?.[1])return {key,days:[day],grams:mealAt(day).items[key]||0,unlinked:true};
 }
 const days=[first];
 for(let d=first+1;d<30&&type(d)?.[0]===key&&type(d)?.[1];d++)days.push(d);
 return {key,days,grams:days.reduce((n,d)=>n+(mealAt(d).items[key]||0),0),unlinked:false};
}
function changeBatch(k,d){state.batch[k]=Math.max(0,(state.batch[k]||0)+d);save();render2()}
function simpleCook(i){let m=mealAt(i),arr=practicalSteps(m),n=Math.max(0,Math.min(arr.length-1,state.cookStep[i]||0));return '<button class="quiet" onclick="routeDay('+i+')">‹ Receita</button><div class="eyebrow" style="margin-top:18px">MODO COZINHAR · '+state.equipment.toUpperCase()+'</div><h2>'+esc(m.name)+'</h2><p class="notice" data-cook-plan>Modo Cozinhar: quantidades das porções guardadas no plano. A escala da ficha é apenas de consulta. Ingredientes: '+Object.entries(m.items).map(([key,quantity])=>esc(products[key][0])+': '+quantity+(key==='ovos'?' un.':' g')).join(' · ')+'</p><p>Passo '+(n+1)+' de '+arr.length+'</p><div class="meter"><div style="width:'+((n+1)/arr.length*100)+'%"></div></div><div class="two cp-cook-controls" role="group" aria-label="Navegar nos passos"><button class="quiet" onclick="cookMove('+i+',-1)">← Anterior</button><button class="primary" onclick="cookMove('+i+',1)">'+(n===arr.length-1?'Concluir ✓':'Próximo →')+'</button></div><div class="stepbox">'+esc(arr[n])+'</div><div class="card"><h3>⏱ Temporizador rápido</h3><div class="two"><button class="quiet" onclick="quickTimer(3)">3 min</button><button class="quiet" onclick="quickTimer(5)">5 min</button><button class="quiet" onclick="quickTimer(15)">15 min</button><button class="quiet" onclick="quickTimer(30)">30 min</button></div><p id="timerstatus" class="timer-display">—</p><button class="quiet" onclick="cancelTimer()">Parar</button><p class="small">O aviso funciona enquanto a aplicação estiver aberta; para assados longos usa também o alarme do telemóvel.</p></div>'}
let timerId=null,timerEnd=0;function quickTimer(min){cancelTimer();timerEnd=Date.now()+min*60000;function tick(){let sec=Math.max(0,Math.ceil((timerEnd-Date.now())/1000)),e=document.getElementById('timerstatus');if(e)e.textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');if(sec===0){cancelTimer();alert('Temporizador concluído!')}}tick();timerId=setInterval(tick,1000)}
function cancelTimer(){if(timerId)clearInterval(timerId);timerId=null;let e=document.getElementById('timerstatus');if(e)e.textContent='—'}
const renderOld=render2;render2=function(){renderOld();if(state.currentTab==='recipe')document.getElementById('root').innerHTML=practicalRecipe(state.day);if(state.currentTab==='cook')document.getElementById('root').innerHTML=simpleCook(state.day);document.querySelector('header small').textContent='O teu jantar, sem complicações · v2.1'}
render2();

/* v2.2: cooking pots and stovetop slow cooking */
equipments.push('panela');
const previousEquipbar=equipbar;
equipbar=function(){
 const recommended=recommendedEquipment(mealAt(state.day)), selected=methodForDay(state.day);
 const labels={grelhador:'🔥 Grelhador','air fryer':'♨️ Air fryer',frigideira:'🍳 Frigideira',forno:'🥘 Forno',panela:'🍲 Panela'};
 return '<div class="equip-info"><div>⭐ Recomendado: <b>'+equipmentName(recommended)+'</b></div><div>✓ Escolhido: <b>'+equipmentName(selected)+'</b></div></div><div class="cp-method-grid" style="display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px;width:100%;overflow:visible">'+Object.entries(labels).map(([key,label])=>'<button type="button" data-method="'+key+'" class="'+(selected===key?'active':'')+'" style="min-width:0;width:100%;min-height:60px;white-space:normal;font-size:12px;padding:8px 3px" onclick="setEquipment(this.dataset.method)">'+label+'</button>').join('')+'</div>';
};
const oldPracticalSteps=practicalSteps;
practicalSteps=function(m){
 if(state.equipment!=='panela')return oldPracticalSteps(m);
 const k=Object.keys(m.items);
 if(m.method==='leftover')return ['Retira apenas a porção já cozinhada e guardada no frigorífico.','Coloca numa panela com um pouco de água ou do molho da carne e tapa. Aquece em lume baixo, mexendo ocasionalmente.','Quando estiver bem quente até ao centro (referência de segurança para sobras: 74 °C), serve com os ovos preparados à parte.'];
 if(isSlowMeal(m)||k.some(x=>['acem','chambao','costela','maminha'].includes(x)))return ['Tempera a peça com sal e doura-a numa panela de fundo grosso com um pouco de gordura animal.','Acrescenta água ou caldo animal puro até cerca de um terço da altura da carne. Tapa e deixa ferver muito suavemente em lume baixo.','Deixa cozinhar aproximadamente 2h30–4h, ou até a carne se desfazer facilmente com o garfo. Verifica o líquido de vez em quando; adiciona água quente se necessário.','Serve uma dose e guarda rapidamente as restantes em caixas individuais: frigorífico até 3–4 dias ou congelador.'];
 if(k.some(x=>['salmao','atum','cavala','sardinha'].includes(x)))return ['Põe água numa panela larga e aquece até levantar fervura suave. Tempera o peixe com sal.','Reduz o lume e cozinha o peixe com tampa, sem fervura forte, até ficar opaco e separar-se em lascas. Para lombos começa a verificar aos 7–10 minutos, dependendo da espessura.','Para camarão, cozinha até ficar opaco; prepara os ovos numa panela pequena à parte.'];
 if(k.includes('picada'))return ['Forma pequenas almôndegas só com carne picada e sal.','Coloca numa panela com um pouco de água ou caldo animal puro; tapa e deixa cozinhar em lume brando, virando ocasionalmente.','Cozinha completamente o interior da carne picada (referência de segurança: 71 °C). Serve com ovos e queijo, se previstos.'];
 return ['Corta a carne em pedaços semelhantes e tempera com sal.','Doura os pedaços numa panela de fundo espesso com um pouco de gordura animal.','Adiciona um pouco de água ou caldo animal puro, tapa e cozinha em lume brando até ficar tenra. Para cortes de estufar pode levar 1h30–3h; para cortes tenros usa menos tempo.','Prepara os ovos à parte e serve com o molho natural da carne.'];
};
render2();

/* v2.3 defaults for equipment, batch preparation and shopping precision */
state.equipmentByDay=state.equipmentByDay||{};
state.prep=state.prep||{};
const originalPractical=practicalSteps;
function recommendedEquipment(m){const a=Object.keys(m.items);if(m.method==='leftover'||m.method==='braise')return 'panela';if(m.method==='roast'||m.method==='fishoven')return 'forno';if(a.includes('lagartos'))return m.kind==='frigideira'?'frigideira':m.kind==='forno'?'forno':'grelhador';if(a.includes('frango'))return 'air fryer';if(a.includes('sardinha'))return 'grelhador';if(a.includes('salmao')||a.includes('cavala'))return 'air fryer';if(a.includes('picada'))return 'frigideira';if(a.some(x=>['entrecote','picanha','vazia','lombo','alcatra','secretos','plumas'].includes(x)))return 'grelhador';if(a.includes('atum')||a.includes('camarao'))return 'frigideira';return 'panela'}
function methodForDay(i){return state.equipmentByDay[i]||recommendedEquipment(mealAt(i))}
const prevRender=render2;
const previousPracticalRecipe=practicalRecipe;
practicalRecipe=function(i){const equipment=methodForDay(i);state.equipment=equipment;let html=previousPracticalRecipe(i);html=html.replace('A aplicação adapta os passos ao equipamento. Os assados lentos continuam a usar forno.','Escolhe um método; a recomendação deste prato é independente da tua escolha.');return html}
const prevSetEquipment=setEquipment;
setEquipment=function(k){state.equipmentByDay[state.day]=k;state.equipment=k;save();render2()}
const prevRender23=render2;
render2=function(){if(state.currentTab==='recipe'||state.currentTab==='cook')state.equipment=methodForDay(state.day);prevRender23();if(state.currentTab==='home'&&planPosition().status==='active'){const root=document.getElementById('root');const i=todayIndex();const m=mealAt(i);const item='<div class="tile"><strong>⭐ Método recomendado: '+methodForDay(i)+'</strong><small>'+((m.method==='braise'||m.method==='roast')?'Prepara esta receita com antecedência para o jantar às 19h.':'Abre a receita para consultar os passos e escolher outro equipamento.')+'</small></div>';root.insertAdjacentHTML('beforeend',item)}document.querySelector('header small').textContent='O teu jantar, sem complicações · v2.3'};
const originalShopping2=shopping2;
shopping2=function(){const w=state.week;let html=originalShopping2();const shop=oldShopping(w);let missing=Object.entries(shop).filter(([k,g])=>g>(state.stock[k]||0));const summary='<div class="card"><h3>🧺 Resumo do que falta comprar</h3><p class="subtle">Depois de descontar o que registaste no frigorífico e congelador:</p>'+missing.map(([k,g])=>'<div class="ingredient"><span>'+esc(products[k][0])+'</span><b>'+(k==='ovos'?(g-(state.stock[k]||0))+' un.':(g-(state.stock[k]||0))+' g')+'</b></div>').join('')+'<p class="small">Os valores são necessidades líquidas estimadas. Confirma os pesos das embalagens antes de comprar.</p></div>';return html+summary};
const oldCopyShop=copyShop;
copyShop=function(w){const list=Object.entries(oldShopping(w)).map(([k,g])=>{const q=Math.max(0,g-(state.stock[k]||0));return q>0?'☐ '+products[k][0]+': '+(k==='ovos'?q+' unidades':q+' g'):null}).filter(Boolean);const t='Carnivore Planner — compras semana '+(w+1)+'\n'+list.join('\n');if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>alert('Lista copiada')).catch(()=>downloadText('compras-semana-'+(w+1)+'.txt',t,'text/plain'));else downloadText('compras-semana-'+(w+1)+'.txt',t,'text/plain')};
const originalCalendar=calendarUI;
calendarUI=function(){return originalCalendar()+'<div class="card"><h3>🍲 Preparações para vários dias</h3><p class="subtle">Consulta o lote na ficha de cada preparação: as quantidades seguem os pratos selecionados em dias consecutivos. Trocar uma refeição pode interromper essa ligação. O calendário não confirma porções já cozinhadas.</p><button class="quiet" onclick="setTab(\'shop\')">Ver ingredientes necessários</button></div>'};
render2();

/* v3.0: dedicated practical preparation and reliable multi-day batch shopping */
const dishNotes={
0:['Entrecôte','Seca o bife, tempera com sal e deixa o grelhador aquecer bem.','Grelha cerca de 3–4 minutos por face para 2–3 cm; adapta à espessura e ao ponto pretendido.','Deixa repousar 4 minutos. Faz os ovos enquanto a carne repousa.'],
1:['Picanha','Corta bifes no sentido perpendicular às fibras, conservando a capa de gordura.','Começa por dourar a gordura e depois grelha os bifes, virando quando ganharem crosta.','Descansa antes de fatiar e faz a omelete com o queijo.'],
2:['Salmão e camarão','Seca o salmão e o camarão e tempera com sal.','Cozinha primeiro o salmão; junta o camarão apenas no final para não ficar borrachudo.','Retira quando o peixe estiver opaco e se separar em lascas. Faz os ovos à parte.'],
3:['Secretos','Abre os secretos na grelha quente sem sobrepor.','Grelha em calor médio-alto até ganharem cor, virando uma ou duas vezes.','Descansa brevemente e acompanha com ovos.'],
4:['Lombo','Doura os medalhões rapidamente dos dois lados numa frigideira bem quente.','Reduz o calor se forem muito altos; evita cozinhar excessivamente este corte tenro.','Deixa repousar e prepara ovos e queijo à parte.'],
8:['Maminha assada, dia 1','Compra e cozinha as duas doses de maminha juntas; tempera apenas com sal.','Assa tapado a 150 °C com um pouco de água, verificando a maciez após 2h30.','Serve uma dose; arrefece rapidamente a segunda e guarda em recipiente fechado no frigorífico.'],
9:['Maminha desfiada, dia 2','Retira do frigorífico a porção de maminha previamente assada.','Desfia e aquece numa panela com um pouco do caldo até ficar bem quente no centro.','Serve com ovos e queijo acabados de preparar.'],
14:['Acém lento, dia 1','Prepara de uma só vez as três porções de acém numa panela com tampa.','Doura com sal, junta um pouco de caldo animal e cozinha lentamente 3–4 horas, até desfiar com facilidade.','Divide logo em três porções; serve uma, refrigera a segunda e congela a terceira se não a consumires em 3–4 dias.'],
15:['Acém desfiado, dia 2','Desfia a porção de acém já cozinhada.','Aquece-a com um pouco do molho numa panela, mexendo de vez em quando.','Junta ovos preparados na hora.'],
16:['Acém gratinado, dia 3','Aquece completamente a porção de acém que reservaste.','Espalha o queijo sobre a carne e leva à air fryer por poucos minutos para gratinar.','Serve com ovos; não voltes a guardar a porção reaquecida.'],
20:['Costela lenta, dia 1','Coloca as duas doses de costela num recipiente com tampa com sal e um pouco de água.','Assa a 145–150 °C durante várias horas até ficar muito tenra.','Retira a primeira dose e guarda a segunda rapidamente no frigorífico.'],
21:['Costela desfiada, dia 2','Desfia a porção de costela já cozida.','Aquece numa panela com o molho até ficar bem quente; termina com queijo, se quiseres.','Serve com ovos acabados de preparar.']
};
function detailedSteps(i){const spec=dishNotes[chosen(i)];if(spec)return spec.slice(1);const m=mealAt(i),k=Object.keys(m.items),st=practicalSteps(m);if(k.includes('sardinha'))return ['Limpa e seca as sardinhas; tempera com sal.','Grelha em calor médio-alto, virando com cuidado para não desfazer.','Prepara a carne ou ovos que acompanham a refeição em separado.'];if(k.includes('figado'))return ['Prepara primeiro o hambúrguer de carne picada e cozinha-o completamente.','Corta o fígado em tiras finas e salteia rapidamente; evita deixá-lo seco.','Serve com ovos preparados no momento.'];return st}
const previousRecipe3=practicalRecipe;
practicalRecipe=function(i){let h=previousRecipe3(i),st=detailedSteps(i);let a=h.indexOf('<ol class="how">');let b=h.indexOf('</ol>',a);if(a>=0&&b>a)h=h.slice(0,a)+'<ol class="how">'+st.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>'+h.slice(b+5);return h};
const prevCook3=simpleCook;
simpleCook=function(i){
 let html=prevCook3(i),guide=detailedSteps(i);
 const n=Math.max(0,Math.min(guide.length-1,state.cookStep[i]||0));
 html=html.replace(/Passo \d+ de \d+/,'Passo '+(n+1)+' de '+guide.length);
 html=html.replace(/<div class="stepbox">[\s\S]*?<\/div>/,'<div class="stepbox">'+esc(guide[n])+'</div>');
 html=html.replace(/(<div class="meter"><div style="width:)[\d.]+(%")/,'$1'+((n+1)/guide.length*100)+'$2');
 html=html.replace(/(onclick="cookMove\(\d+,1\)"[^>]*>)(?:Concluir ✓|Próximo →)(<\/button>)/,'$1'+(n===guide.length-1?'Concluir ✓':'Próximo →')+'$2');
 return html;
};
const batchGroups=[{first:8,last:9,key:'maminha',name:'Maminha assada'},{first:14,last:16,key:'acem',name:'Acém lento'},{first:20,last:21,key:'costela',name:'Costela assada'}];
function batchGroup(i){return batchGroups.find(g=>i>=g.first&&i<=g.last)}
function batchQuantities(g){const q={};for(let i=g.first;i<=g.last;i++){const m=mealAt(i);const v=m.items[g.key]||0;q[g.key]=(q[g.key]||0)+v}return q}
const shoppingBase=oldShopping;
shopping2=function(){let w=state.week,base=shoppingBase(w),days=Array.from({length:Math.min(7,30-w*7)},(_,k)=>w*7+k),groups=batchGroups.filter(g=>days.includes(g.first));let html=originalShopping2();if(groups.length){let cards=groups.map(g=>'<div class="batchcard"><strong>'+g.name+'</strong><p>Compra a peça inteira: '+batchQuantities(g)[g.key]+' g para os dias '+(g.first+1)+'–'+(g.last+1)+'.</p><small>Divide em porções após cozinhar. As quantidades dos dias seguintes já estão contabilizadas no planeamento mensal.</small></div>').join('');html='<div class="card"><h3>Preparar uma vez, comer vários dias</h3>'+cards+'</div>'+html}return html};
const oldCookingMove=cookMove;
cookMove=function(i,d){const length=detailedSteps(i).length,next=(state.cookStep[i]||0)+d;if(next>=length){state.prepared['day-'+i]=true;state.currentTab='home';state.cookStep[i]=0}else state.cookStep[i]=Math.max(0,next);save();render2();if(state.currentTab==='cook'&&typeof document!=='undefined')document.querySelector('[onclick="cookMove('+i+','+d+')"]')?.focus({preventScroll:true})};
const oldRender3=render2;
render2=function(){oldRender3();document.querySelector('header small').textContent='30 jantares · manutenção · v8.10.4'};
render2();

/* v3.1 Android Back navigation via browser History API */
(function(){
 let stack=[];
 const current=()=>({tab:state.currentTab||'home',day:state.day||0});
 const same=(a,b)=>a.tab===b.tab&&a.day===b.day;
 const baseRender=render2;
 let restoring=false;
 function record(){
   if(restoring)return;
   const now=current(),previous=stack[stack.length-1];
   if(previous&&same(previous,now))return;
   stack.push({...now});
   history.pushState({carnivore:true,tab:now.tab,day:now.day},'',location.pathname+location.search+'#'+now.tab+(now.tab==='recipe'||now.tab==='cook'?'-'+now.day:''));
 }
 history.replaceState({carnivore:true,tab:'home',day:state.day||0},'',location.pathname+location.search+'#home');
 stack=[{tab:'home',day:state.day||0}];
 let lastExitPrompt=0;
 const toast=document.createElement('div');
 toast.setAttribute('role','status');
 toast.style.cssText='position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#32383f;color:white;padding:14px 20px;border-radius:14px;z-index:9999;font:600 14px system-ui;text-align:center;box-shadow:0 6px 22px #0008;max-width:88vw;display:none;pointer-events:none';
 toast.textContent='Prima Voltar novamente para sair';
 document.body.appendChild(toast);
 function showExitToast(){toast.style.display='block';clearTimeout(showExitToast.timer);showExitToast.timer=setTimeout(()=>{toast.style.display='none';lastExitPrompt=0},2000)}
 // Keep one extra history entry at the root to intercept the Android Back gesture.
 history.pushState({carnivore:true,guard:true},'',location.pathname+location.search+'#home');
 render2=function(){baseRender();record()};
 window.addEventListener('popstate',function(e){
   if(stack.length<=1){
     if(Date.now()-lastExitPrompt<2300){
       lastExitPrompt=0;
       toast.style.display='none';
       history.back();
       return;
     }
     lastExitPrompt=Date.now();
     showExitToast();
     history.pushState({carnivore:true,guard:true},'',location.pathname+location.search+'#home');
     return;
   }
   restoring=true;
   stack.pop();
   const target=stack[stack.length-1]||{tab:'home',day:todayIndex()};
   state.currentTab=target.tab;state.day=target.day;save();
   baseRender();restoring=false;
   window.scrollTo(0,0);
 });
})();

/* v3.2 favourites, meaningful swaps and shopping based on current plan */
state.favourites=state.favourites||{};
function toggleFavourite(i){const id=chosen(i);state.favourites[id]=!state.favourites[id];save();render2()}
function mealSelection(i){let current=chosen(i);let options=meals.map((m,j)=>({m,j})).filter(x=>x.j!==current).sort((a,b)=>Number(!!state.favourites[b.j])-Number(!!state.favourites[a.j]));return '<div class="card"><h3>Trocar refeição · dia '+(i+1)+'</h3><p class="subtle">A lista de compras é recalculada automaticamente. Escolhe entre os pratos disponíveis:</p>'+options.map(({m,j})=>'<div class="ingredient"><span>'+(state.favourites[j]?'★ ':'')+esc(m.name)+'<small style="display:block">'+money(calc(m))+'</small></span><button class="quiet" onclick="pickMeal('+i+','+j+')">Escolher</button></div>').join('')+'</div>'}
function pickMeal(i,j){if(chosen(i)!==j){state.prepared['day-'+i]=false;state.cookStep[i]=0;}state.manualMeals[i]=j;state.currentTab='recipe';save();render2()}
function showMealPicker(i){state.currentTab='pick';state.day=i;save();render2()}
function currentShopping(w){let out={};for(let i=w*7;i<Math.min(30,(w+1)*7);i++){let m=mealAt(i);for(let [k,g] of Object.entries(m.items))out[k]=(out[k]||0)+g}return out}
const firstShopping=oldShopping;
oldShopping=currentShopping;
const originalShopRef=shopping2;
shopping2=function(){const w=state.week;let html=originalShopRef();let data=currentShopping(w),cost=Object.entries(data).reduce((n,[k,g])=>n+(k==='ovos'?g*price(k):g*price(k)/1000),0);return '<div class="tile"><strong>Plano atualizado: '+money(cost)+'</strong><small>Os ingredientes necessários refletem as trocas de pratos. A lista abaixo desconta o stock registado.</small></div>'+html};
const priorRecipeUI=practicalRecipe;
practicalRecipe=function(i){let h=priorRecipeUI(i);const fav=state.favourites[chosen(i)];const controls='<div class="card"><div class="two"><button class="quiet" onclick="toggleFavourite('+i+')">'+(fav?'★ Remover favorito':'☆ Guardar favorito')+'</button><button class="quiet" onclick="showMealPicker('+i+')">⇄ Escolher outro prato</button></div></div>';return h+controls};
const oldRender32=render2;
render2=function(){oldRender32();if(state.currentTab==='pick')document.getElementById('root').innerHTML=mealSelection(state.day);document.querySelector('header small').textContent='30 jantares · manutenção · v3.2'};
render2();

/* v3.2 shopping reconciliation: use the currently selected meals everywhere */
shopping2=function(){
 const w=state.week,items=Object.entries(currentShopping(w)),cost=items.reduce((sum,[k,g])=>sum+(k==='ovos'?g*price(k):g*price(k)/1000),0);
 const done=items.filter(([k])=>state.checked[w+'-'+k]).length;
 return '<h2>Compras semanais</h2><p class="subtle">Sábado às 10h · Modelo e Madeira Cash</p><div class="swipe">'+[0,1,2,3,4].map(j=>'<button class="day-chip '+(j===w?'active':'')+'" onclick="state.week='+j+';save();render2()">'+(j===4?'Final':'Semana')+'<b>'+(j+1)+'</b></button>').join('')+'</div><div class="card"><h3>Faltam comprar</h3><p class="small">'+done+' de '+items.length+' itens marcados · ingredientes utilizados: '+money(cost)+'</p>'+items.map(([k,g])=>{let q=Math.max(0,g-(state.stock[k]||0));return '<label class="ingredient"><span><input type="checkbox" '+(state.checked[w+'-'+k]?'checked':'')+' onchange="state.checked[\''+w+'-'+k+'\']=this.checked;save();render2()"> '+esc(products[k][0])+'<small style="display:block;margin-left:25px">Plano: '+(k==='ovos'?g+' un.':g+' g')+' · em casa: '+(state.stock[k]||0)+'</small></span><b>'+(k==='ovos'?q+' un.':q+' g')+'</b></label>'}).join('')+'<p><label>Gasto real (€) <input type="number" min="0" step=".01" value="'+(state.spending[w]??'')+'" onchange="state.spending['+w+']=this.value===\'\'?null:+this.value;save();render2()"></label></p><button class="primary" onclick="copyShop('+w+')">Copiar lista em falta</button></div>'+stockUI()+'<p class="warning">A aplicação calcula quantidades de ingredientes consumidos, não preços de embalagens fechadas. Confirma os talões e o total de 400 €.</p>';
};
const originalCopy=copyShop;
copyShop=function(w){const t='Carnivore Planner — semana '+(w+1)+'\n'+Object.entries(currentShopping(w)).map(([k,g])=>{const q=Math.max(0,g-(state.stock[k]||0));return q?('☐ '+products[k][0]+': '+(k==='ovos'?q+' un.':q+' g')):null}).filter(Boolean).join('\n');if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>alert('Lista copiada')).catch(()=>downloadText('compras.txt',t,'text/plain'));else downloadText('compras.txt',t,'text/plain')};
render2();

/* v3.4 equipment selector: fixed recommendation, selected choice, no horizontal scroll */
const v34styles=document.createElement('style');
v34styles.textContent='.equip{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;overflow:visible!important;padding:10px 0}.equip button{white-space:normal!important;min-width:0!important;width:100%;min-height:61px;padding:10px 4px!important;line-height:1.25;font-size:12px!important;border-radius:13px}.equip button.active{background:#ebbf87!important;color:#23190e!important}.equip-info{font-size:13px;line-height:1.55;color:#c8cdd4;margin:6px 0 12px}.equip-info b{color:#f5cd9b}@media(max-width:350px){.equip{grid-template-columns:repeat(2,minmax(0,1fr))}}';
document.head.appendChild(v34styles);
function equipmentName(x){return ({grelhador:'Grelhador','air fryer':'Air fryer',frigideira:'Frigideira',forno:'Forno',panela:'Panela'})[x]||x}
equipbar=function(){
 const selected=methodForDay(state.day),recommended=recommendedEquipment(mealAt(state.day));
 const labels={grelhador:'🔥 Grelhador','air fryer':'♨️ Air fryer',frigideira:'🍳 Frigideira',forno:'🥘 Forno',panela:'🍲 Panela'};
 return '<div class="equip-info">⭐ Recomendado: <b>'+equipmentName(recommended)+'</b><div>✓ Escolhido: <b>'+equipmentName(selected)+'</b></div></div><div class="cp-method-grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%;max-width:100%;overflow:visible">'+Object.entries(labels).map(([k,label])=>{
 const chosen=k===selected,rec=k===recommended;
 const bg=chosen?'#edc087':'#303840',fg=chosen?'#251a10':'#f4f2ef',border=rec?'#69b8a5':chosen?'#edc087':'#454b53';
 return '<button type="button" data-method="'+k+'" class="'+(chosen?'active cp-selected ':'')+(rec?'cp-recommended':'')+'" style="box-sizing:border-box!important;min-width:0!important;width:100%!important;white-space:normal!important;font-size:12px!important;line-height:1.25!important;padding:9px 3px!important;min-height:68px!important;background:'+bg+'!important;color:'+fg+'!important;border:2px solid '+border+'!important;border-radius:14px!important" onclick="setEquipment(this.dataset.method)"><span style="display:block;font-weight:700">'+label+'</span>'+(rec?'<span style="display:block;font-size:10px;margin-top:4px;color:'+(chosen?'#245a50':'#9ce1cf')+'">★ Recomendado</span>':'')+'</button>';
 }).join('')+'</div>';
};
const v34PriorRecipe=practicalRecipe;
practicalRecipe=function(i){
 let h=v34PriorRecipe(i);
 h=h.replace(/<p class="small">Método recomendado:[\s\S]*?<\/p>/,'<p class="small">Escolhe o equipamento para adaptar os passos de preparação. Para cortes de cozedura lenta, o forno ou a panela costumam ser melhores.</p>');
 return h;
};
const v34Render=render2;
render2=function(){v34Render();const lbl=document.querySelector('header small');if(lbl)lbl.textContent='30 jantares · manutenção · v8.10.4'};
render2();

/* v3.5 persistent navigation and responsive equipment grid */
const stableEquipmentLabels={grelhador:'🔥 Grelhador','air fryer':'♨️ Air fryer',frigideira:'🍳 Frigideira',forno:'🥘 Forno',panela:'🍲 Panela'};
const stableStyle=document.createElement('style');stableStyle.textContent='#root .equip{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;overflow:visible!important;width:100%!important}#root .equip button{font-size:12px!important;line-height:1.25!important;white-space:normal!important;min-width:0!important;min-height:60px!important;padding:9px 4px!important;width:100%!important}#root .equip button.active{background:#eabb7d!important;color:#241a10!important}#root .equip-info{line-height:1.7;margin-bottom:10px;font-size:13px}#root .equip-info b{color:#f2c58d}@media(max-width:330px){#root .equip{grid-template-columns:repeat(2,minmax(0,1fr))!important}}';document.head.appendChild(stableStyle);
function installStableEquipment(){
 if(state.currentTab!=='recipe')return;
 const root=document.getElementById('root');
 const box=[...root.querySelectorAll('.card')].find(e=>e.querySelector('h3')?.textContent.trim()==='Como queres cozinhar?');
 if(!box)return;
 const recommended=recommendedEquipment(mealAt(state.day)),selected=methodForDay(state.day);
 const description=box.querySelector('p.small');if(description)description.textContent='Escolhe como preparar este prato. Os passos adaptam-se ao equipamento.';
 let info=box.querySelector('.equip-info');if(!info){info=document.createElement('div');info.className='equip-info';box.querySelector('h3').after(info)}
 info.innerHTML='⭐ Recomendado: <b>'+equipmentName(recommended)+'</b><div>✓ Escolhido: <b>'+equipmentName(selected)+'</b></div>';
 const grid=box.querySelector('.equip');if(!grid)return;
 grid.innerHTML=equipments.map(k=>'<button type="button" class="'+(selected===k?'active':'')+'" data-method="'+k+'">'+stableEquipmentLabels[k]+'</button>').join('');
 grid.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.equipmentByDay[state.day]=b.dataset.method;state.equipment=b.dataset.method;save();render2()}));
}
const stableRenderPrevious=render2;
render2=function(){stableRenderPrevious();installStableEquipment();const label=document.querySelector('header small');if(label)label.textContent='30 jantares · manutenção · v8.10.4'};
render2();

;

if('serviceWorker' in navigator){
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!reloading&&navigator.serviceWorker.controller){reloading=true;location.reload()}
  });
  window.addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./sw.js?v=95',{updateViaCache:'none'});
      await reg.update();
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)reg.update().catch(()=>{})});
    }catch(e){console.warn('Offline update:',e)}
  });
}

;

window.addEventListener('load',()=>{
 const label=document.querySelector('header small');
 if(label)label.textContent='30 jantares · manutenção · v8.10.4';
});

;

/* v3.7: stable UI post-render protection, independent of legacy render closures */
(function(){
 const VERSION='v8.10.4';
 let pending=false;
 function reconcile(){
   pending=false;
   const label=document.querySelector('header small');
   if(label && !label.textContent.includes(VERSION))label.textContent='30 jantares · manutenção · '+VERSION;
   const head=[...document.querySelectorAll('#root h3')].find(el=>el.textContent.trim()==='Como queres cozinhar?');
   if(!head)return;
   const box=head.closest('.card');
   if(!box)return;
   const eq=box.querySelector('.equip');
   if(eq){
      eq.style.setProperty('display','grid','important');
      eq.style.setProperty('grid-template-columns','repeat(3,minmax(0,1fr))','important');
      eq.style.setProperty('overflow','visible','important');
      eq.style.setProperty('width','100%','important');
   }
   if(typeof state==='undefined'||typeof recommendedEquipment!=='function')return;
   const recommended=recommendedEquipment(mealAt(state.day));
   const selected=methodForDay(state.day);
   let info=box.querySelector('.equip-info');
   if(!info){info=document.createElement('div');info.className='equip-info';head.after(info)}
   const desired='⭐ Recomendado: <b>'+equipmentName(recommended)+'</b><div>✓ Escolhido: <b>'+equipmentName(selected)+'</b></div>';
   if(info.innerHTML!==desired)info.innerHTML=desired;
   if(eq&&(!eq.dataset.stable||eq.dataset.selected!==selected)){
      eq.dataset.stable='1';eq.dataset.selected=selected;
      eq.innerHTML=equipments.map(k=>'<button type="button" class="'+(selected===k?'active':'')+'" data-equip="'+k+'">'+({grelhador:'🔥 Grelhador','air fryer':'♨️ Air fryer',frigideira:'🍳 Frigideira',forno:'🥘 Forno',panela:'🍲 Panela'}[k])+'</button>').join('');
      eq.querySelectorAll('button').forEach(b=>b.addEventListener('click',function(){state.equipmentByDay[state.day]=this.dataset.equip;state.equipment=this.dataset.equip;save();render2();schedule()}));
   }
   const old=box.querySelector('p.small');
   if(old && old.textContent.startsWith('Método recomendado:'))old.textContent='As instruções adaptam-se ao método que escolheste.';
 }
 function schedule(){if(pending)return;pending=true;requestAnimationFrame(reconcile)}
 const observer=new MutationObserver(schedule);
 observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 schedule();
})();

;

/* v3.8 — practical recipe quick view and batch preparation reminders */
(function(){
const VERSION='v8.10.4';
const styles=document.createElement('style');
styles.textContent='.quick-card{background:#242c32;border:1px solid #3d4549;border-radius:17px;padding:16px;margin:13px 0}.quick-card h3{color:#eec18b;margin:0 0 10px}.quick-card p{font-size:15px;line-height:1.5}.quick-card button{margin-top:6px}.batch-guide{background:#302b25;padding:13px;border-radius:12px;font-size:13px;line-height:1.5}';
document.head.appendChild(styles);
function quick(m,i){let method=typeof methodForDay==='function'?methodForDay(i):'grelhador';
if(m.method==='leftover')return ['Confirma primeiro que tens uma porção já cozinhada; o plano não comprova que existe','Aquece com um pouco do molho até estar bem quente no interior.','Prepara os ovos ou queijo à parte e serve.'];
const kind=Object.keys(m.items),fish=kind.some(k=>['salmao','sardinha','cavala','atum'].includes(k));
if(fish)return ['Seca e salga o peixe.','Cozinha na '+method+' até ficar opaco e separar-se em lascas, sem o secar.','Prepara os acompanhamentos animais à parte e serve.'];
if(kind.includes('frango'))return ['Tempera e seca a pele.','Cozinha na '+method+' até a carne ficar totalmente cozinhada (74 °C no centro é a referência segura).','Descansa alguns minutos e serve com os ovos.'];
return ['Seca e salga a carne.','Aquece o equipamento e cozinha, virando quando ganhar uma boa crosta; ajusta ao corte e à espessura.','Deixa repousar alguns minutos e prepara os ovos ou queijo à parte.'];
}
let queued=false;
function enhance(){
queued=false;
const label=document.querySelector('header small');if(label&& !label.textContent.includes(VERSION))label.textContent='30 jantares · manutenção · '+VERSION;
const root=document.querySelector('#root');if(!root||state.currentTab!=='recipe')return;
if(root.querySelector('[data-v38]'))return;
const i=state.day,m=mealAt(i),steps=quick(m,i);
const card=document.createElement('section');card.className='quick-card';card.dataset.v38='1';
card.innerHTML='<h3>⚡ Receita rápida</h3><ol>'+steps.map(x=>'<li>'+x.replaceAll('&','&amp;').replaceAll('<','&lt;')+'</li>').join('')+'</ol>'+'<p class="small">Para tempos mais específicos, consulta os passos completos abaixo. O tempo depende do tamanho da porção e do equipamento.</p>';
if(state.currentTab==='recipe'){
 const hero=root.querySelector('.hero');if(hero)hero.insertAdjacentElement('afterend',card);
}else{
 const step=root.querySelector('.stepbox');if(step)step.insertAdjacentElement('afterend',card);
}
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(enhance)}
new MutationObserver(schedule).observe(document.getElementById('root'),{childList:true,subtree:false});
new MutationObserver(schedule).observe(document.querySelector('header'),{childList:true,subtree:true,characterData:true});
schedule();
})();

;

/* v5.0 — workday meal prep and practical shopping ahead */
(function(){
 const VERSION='v8.10.4';
 let pending=false;
 function enhance(){
  pending=false;
  const head=document.querySelector('header small');if(head&&!head.textContent.includes(VERSION))head.textContent='30 jantares · manutenção · '+VERSION;
  const root=document.getElementById('root');if(!root)return;
  if(root.querySelector('[data-prep39]'))return;
  const i=state.currentTab==='home'?todayIndex():state.day,m=mealAt(i),slow=isSlowMeal(m),leftover=m.method==='leftover';
  if(!['home','recipe'].includes(state.currentTab))return;
  const div=document.createElement('section');div.className='tile';div.dataset.prep39='1';
  const note=null;
  const active=(slow||leftover)?(note?.early||(leftover?'Confirma que tens uma porção já cozinhada e bem conservada. O plano e o stock não confirmam essa disponibilidade.':'Reserva algumas horas para a cozedura; podes preparar a peça numa folga ou na véspera.')):'Não precisas de preparação longa. Confirma os ingredientes e descongela a carne no frigorífico, se necessário.';
  div.innerHTML='<div class="eyebrow">PLANEAMENTO PARA O TRABALHO</div><h3 style="margin:9px 0">'+(note?note.headline:slow?'Preparar com antecedência':leftover?'Aproveitar sobras':'Jantar sem complicações')+'</h3><p class="subtle">'+active+'</p>'+(note?'<p class="subtle"><b>À noite:</b> '+note.later+'</p>':'')+'<p class="small">OMAD prevista às '+state.hour+'. Não deixes carnes a descongelar na bancada.</p>';
  if(state.currentTab==='home'){const hero=root.querySelector('.hero');if(hero)hero.after(div)}else{const quick=root.querySelector('[data-v38]'),hero=root.querySelector('.hero');if(quick)quick.after(div);else if(hero)hero.after(div)}
 }
 function queue(){if(!pending){pending=true;requestAnimationFrame(enhance)}}
 new MutationObserver(queue).observe(document.getElementById('root'),{childList:true});
 new MutationObserver(queue).observe(document.querySelector('header'),{childList:true,subtree:true,characterData:true});
 queue();
})();

;window.CP_RELEASE='8.10.4';


/* v5.0 — cut-specific preparation notes in recipe and cooking screens */
const cp45Notes={
entrecote:['Entrecôte alto','Seca muito bem a superfície. Para peças grossas, sela primeiro em calor forte e termina em calor mais moderado. Deixa repousar antes de cortar.'],
picanha:['Picanha','Conserva a capa de gordura e começa por dourá-la. Corta contra a fibra para ficar mais tenra.'],
lombo:['Lombo de novilho','É um corte tenro: evita cozeduras excessivamente longas e deixa repousar uns minutos.'],
vazia:['Vazia','Faz uma crosta rápida numa superfície bem quente; deixa repousar e corta transversalmente à fibra.'],
alcatra:['Alcatra','Para bifes, usa frigideira ou grelhador quente; para gratinar, prepara a carne antes de juntar o queijo.'],
maminha:['Maminha','Confirma a quantidade prevista no plano e fatia contra a fibra. Reserva doses futuras apenas se as tiveres preparado.'],
acem:['Acém','É ideal para estufar lentamente com tampa e um pouco de líquido. Está pronto quando se desfaz facilmente com dois garfos.'],
costela:['Costela','Cozinha devagar, tapada, até ficar tenra. Destapa apenas no fim para dourar e reserva parte do molho para reaquecer.'],
chambao:['Chambão','Deixa cozinhar lentamente no caldo até o colagénio amaciar a carne. Mantém o caldo para servir.'],
salmao:['Salmão','Seca a pele e começa pelo lado da pele, se existir. Retira do calor assim que o peixe estiver cozinhado, evitando secá-lo.'],
sardinha:['Sardinha','Usa calor relativamente forte e manuseia o mínimo possível para não desfazer. Confirma que está bem cozinhada.'],
cavala:['Cavala','O peixe tem gordura natural; não precisa de muito óleo ou manteiga. Grelha ou assa sem o secar.'],
atum:['Atum','Adapta o tempo à espessura da posta. Se não for adequado a consumo cru, cozinha bem o centro.'],
camarao:['Camarão','Junta apenas nos minutos finais. Assim que ficar opaco e firme, retira para não ficar borrachudo.'],
duroc:['Cachaço de porco sem osso','Corta em bifes ou tiras largas e seca bem. Doura na frigideira, em pequenas quantidades, e cozinha até estar seguro no centro. Deixa repousar antes de servir.'],
lagartos:['Lagartos de porco preto','Corta em pedaços grandes, se preferires. Seca bem e doura rapidamente em frigideira ou grelhador quente. Retira assim que estiverem cozinhados, evitando secá-los. Para pedaços inteiros de porco, a referência segura é 63 °C no centro e 3 minutos de repouso.'],
secretos:['Secretos','Usa frigideira ou grelhador quente e vira frequentemente para dourar a gordura sem queimar.'],
plumas:['Plumas','Cozinha rapidamente, com o exterior bem dourado; evita tempos longos desnecessários.'],
barriga:['Barriga de porco','Prefere forno moderado e uma finalização mais quente para a pele ficar estaladiça.'],
frango:['Frango','Seca bem a pele. Garante que o interior chega a 74 °C; a cor exterior não basta.'],
picada:['Carne picada','Molda sem compactar demasiado e cozinha completamente; a referência segura é 71 °C no centro.'],
figado:['Fígado','Seca e salteia em porções pequenas. Evita manter muito tempo em lume forte para não endurecer.']
};
function cp45RecipeNote(i){
 const m=mealAt(i),keys=Object.keys(m.items).filter(k=>cp45Notes[k]&&k!=='picada');
 if(Object.hasOwn(m.items,'picada'))keys.unshift('picada');
 const selected=keys.slice(0,3);
 if(!selected.length)return '';
 return '<section class="card" data-cp45="yes"><h3>👨‍🍳 Dicas específicas deste prato</h3>'+selected.map(k=>'<div style="margin:12px 0"><b>'+cp45Notes[k][0]+'</b><p class="subtle" style="margin:5px 0">'+cp45Notes[k][1]+'</p></div>').join('')+'</section>';
}
const cp45Render=render2;
render2=function(){
 cp45Render();
 if(state.currentTab==='recipe'){
  const root=document.getElementById('root');
  if(root&&!root.querySelector('[data-cp45]')){
   const note=document.createElement('div');note.innerHTML=cp45RecipeNote(state.day);
   const target=root.querySelector('.hero')||root.querySelector('.stepbox');
   if(target&&note.firstElementChild)target.after(note.firstElementChild);
  }
 }
 const head=document.querySelector('header small');
 if(head)head.textContent='30 jantares · manutenção · v8.10.4';
};
render2();


/* v5.0 extra lagartos recipes; day count remains 30 */
const lagartosRecipes=[
 {name:'Lagartos de porco preto grelhados com ovos',method:'pan',items:{lagartos:625,ovos:3},kind:'grelhado'},
 {name:'Lagartos de porco preto em pedaços na frigideira',method:'pan',items:{lagartos:625,ovos:3,manteiga:10},kind:'frigideira'},
 {name:'Lagartos de porco preto no forno com queijo',method:'roast',items:{lagartos:625,queijo:50,ovos:2},kind:'forno'}
];
lagartosRecipes.forEach(x=>meals.push(x));
const baseLagartosSteps=practicalSteps;
practicalSteps=function(m){
 if(!m.kind)return baseLagartosSteps(m);
 if(m.kind==='grelhado')return ['Seca os lagartos com papel e tempera com sal. Aquece bem o grelhador.','Grelha os pedaços em calor médio-alto, virando para dourar de ambos os lados. Evita cozer em excesso para preservar os sucos.','Para peças inteiras de porco, utiliza como referência 63 °C no centro e 3 minutos de repouso. Faz os ovos à parte e serve.'];
 if(m.kind==='frigideira')return ['Corta os lagartos em pedaços grandes e seca-os. Aquece uma frigideira larga.','Doura em pequenas quantidades para não libertarem água. Junta a manteiga no final e envolve rapidamente.','Confirma a cozedura dos pedaços e deixa repousar. Prepara os ovos separadamente e serve logo.'];
 return ['Aquece o forno a 190 °C. Distribui os lagartos numa assadeira sem sobrepor.','Assa inicialmente 12–18 minutos, ajustando ao tamanho e espessura; verifica o interior, pois o tempo é apenas indicativo.','Quando a carne estiver cozinhada, adiciona o queijo para derreter brevemente. Serve com os ovos feitos na altura.'];
};
const priorLagartosNotes=cp45RecipeNote;
cp45RecipeNote=function(i){
 const m=mealAt(i);
 if(!m.kind)return priorLagartosNotes(i);
 return '<section class="card" data-cp45="yes"><h3>👨‍🍳 Técnica para esta variante</h3><p class="subtle">'+esc(practicalSteps(m)[1])+'</p></section>';
};


/* Library release — one complete searchable, filterable recipe workflow */
(function(){
 state.libraryFilters=state.libraryFilters||{query:'',category:'todos',method:'todos',onlyFav:false};
 state.libraryDay=Number.isInteger(state.libraryDay)?state.libraryDay:todayIndex();
 const styles=document.createElement('style');
 styles.textContent='.lib-controls{display:grid;gap:10px}.lib-search{width:100%;box-sizing:border-box;font-size:16px!important;padding:13px!important}.lib-filters{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lib-filters select{width:100%;min-width:0}.lib-meal{border:1px solid #404348;border-radius:14px;padding:13px;margin:10px 0;background:#23272b}.lib-meal h3{font-size:16px;margin:0 0 6px}.lib-row{display:flex;justify-content:space-between;gap:10px;align-items:center}.lib-row button{min-width:unset}.lib-empty{text-align:center;padding:30px 10px;opacity:.8}.lib-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.lib-actions button{flex:1;min-width:105px}.lib-count{margin:10px 0;font-size:13px;color:#aeb4bb}';
 document.head.appendChild(styles);
 const canonical=render2;
 function mealCategory(m){const keys=Object.keys(m.items);if(keys.some(x=>['salmao','atum','sardinha','cavala','camarao'].includes(x)))return 'peixe';if(keys.includes('frango'))return 'aves';if(keys.some(x=>['lagartos','duroc','secretos','plumas','barriga'].includes(x)))return 'porco';return 'novilho'}
 function methodGroup(m){if(m.method==='leftover')return 'sobras';if(['roast','fishoven','braise'].includes(m.method))return 'lento';return 'rapido'}
 function libCard(m,j){
   const fav=!!state.favourites[j];
   return '<article class="lib-meal" data-lib-card data-title="'+esc((m.name+' '+Object.keys(m.items).map(k=>products[k]?.[0]||k).join(' ')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT'))+'" data-category="'+mealCategory(m)+'" data-method="'+methodGroup(m)+'" data-fav="'+(fav?'1':'0')+'"><div class="lib-row"><div><h3>'+category(m)+' '+esc(m.name)+'</h3><small>'+money(calc(m))+' · '+(methodGroup(m)==='lento'?'Cozedura demorada':methodGroup(m)==='sobras'?'Aproveitar sobras':'Preparação rápida')+'</small></div><button class="quiet" aria-label="'+(fav?'Remover dos':'Adicionar aos')+' favoritos" onclick="libFavorite('+j+')">'+(fav?'★':'☆')+'</button></div><div class="lib-actions"><button class="quiet" onclick="libPreview('+j+')">Ver receita</button><button class="primary" onclick="libAssign('+j+')">Usar no dia escolhido</button></div></article>';
 }
 function libUI(){
  const f=state.libraryFilters;
  return '<div class="flex"><div><h2>Biblioteca de receitas</h2><p class="subtle">'+meals.length+' pratos disponíveis · escolhe e personaliza o plano</p></div></div><section class="card lib-controls"><label>Dia que queres alterar<select id="lib-day" onchange="state.libraryDay=+this.value;save()">'+Array.from({length:30},(_,i)=>'<option value="'+i+'" '+(i===state.libraryDay?'selected':'')+'>Dia '+(i+1)+' · '+esc(datefmt(date(i)))+'</option>').join('')+'</select></label><label>Pesquisar receita<input id="lib-search" class="lib-search" type="search" placeholder="Ex.: lagartos, salmão, acém..." value="'+esc(f.query)+'" oninput="libFilter()" autocomplete="off"></label><div class="lib-filters"><label>Ingrediente<select id="lib-category" onchange="libFilter()">'+[['todos','Todos'],['novilho','Novilho'],['porco','Porco'],['peixe','Peixe e marisco'],['aves','Aves']].map(([k,v])=>'<option value="'+k+'" '+(k===f.category?'selected':'')+'>'+v+'</option>').join('')+'</select></label><label>Preparação<select id="lib-method" onchange="libFilter()">'+[['todos','Todas'],['rapido','Rápida'],['lento','Lenta'],['sobras','Sobras']].map(([k,v])=>'<option value="'+k+'" '+(k===f.method?'selected':'')+'>'+v+'</option>').join('')+'</select></label></div><label><input type="checkbox" id="lib-favs" '+(f.onlyFav?'checked':'')+' onchange="libFilter()"> Apenas os meus favoritos</label><button class="quiet" onclick="libReset()">Limpar filtros</button></section><p id="lib-count" class="lib-count"></p><div id="lib-results">'+meals.map(libCard).join('')+'</div><div id="lib-empty" class="lib-empty" hidden>Nenhum prato corresponde à pesquisa. Experimenta retirar um filtro.</div>';
 }
 window.libFilter=function(){
  const q=(document.getElementById('lib-search')?.value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT').trim(),c=document.getElementById('lib-category')?.value||'todos',m=document.getElementById('lib-method')?.value||'todos',fav=!!document.getElementById('lib-favs')?.checked;
  state.libraryFilters={query:q,category:c,method:m,onlyFav:fav};save();
  let shown=0;
  document.querySelectorAll('[data-lib-card]').forEach(x=>{let ok=x.dataset.title.includes(q)&&(c==='todos'||x.dataset.category===c)&&(m==='todos'||x.dataset.method===m)&&(!fav||x.dataset.fav==='1');x.hidden=!ok;if(ok)shown++});
  const count=document.getElementById('lib-count'),empty=document.getElementById('lib-empty');
  if(count)count.textContent=shown+' de '+meals.length+' receitas';
  if(empty)empty.hidden=shown!==0;
 };
 window.libReset=function(){state.libraryFilters={query:'',category:'todos',method:'todos',onlyFav:false};save();render2()};
 window.libFavorite=function(j){state.favourites[j]=!state.favourites[j];save();render2()};
 window.libAssign=function(j){const day=state.libraryDay;state.manualMeals[day]=j;state.day=day;state.currentTab='recipe';save();render2();window.scrollTo(0,0)};
 window.libPreview=function(j){const day=state.libraryDay;state.libraryPreview=j;state.libraryPrevious=state.manualMeals[day];state.manualMeals[day]=j;state.day=day;state.currentTab='recipe';state.previewMode=true;save();render2();window.scrollTo(0,0)};
 window.libCancelPreview=function(){if(state.previewMode){const d=state.day;if(state.libraryPrevious==null)delete state.manualMeals[d];else state.manualMeals[d]=state.libraryPrevious;state.previewMode=false;save()}state.currentTab='library';render2()};
 window.libConfirmPreview=function(){state.previewMode=false;save();render2()};
 const formerPicker=showMealPicker;
 showMealPicker=function(i){state.libraryDay=i;state.currentTab='library';state.previewMode=false;save();render2()};
 // Standalone recipe-library.js owns this tab; the legacy list cannot block app startup.
 window.cpRenderLibrary=function(){
   if(typeof window.cpOpenLibrary==='function')return window.cpOpenLibrary();
   const target=document.getElementById('root');
   if(target)target.innerHTML='<section class="card"><h2>Biblioteca de receitas</h2><p>A carregar receitas...</p></section>';
 };
 const previous=render2;
 render2=function(){
   if(state.currentTab==='library'){
     const target=document.getElementById('root');
     if(target&&!target.querySelector('#cp73-library')){
       target.innerHTML='<section class="card"><h2>Biblioteca de receitas</h2><p>A carregar receitas...</p></section>';
     }
   }
  else{previous();const nav=document.querySelector('nav .navinner');if(nav&&!nav.querySelector('[onclick*="library"]')){const btn=document.createElement('button');btn.innerHTML='<i>▤</i>Receitas';btn.setAttribute('onclick',"setTab('library')");const shop=[...nav.children].find(el=>el.getAttribute('onclick')?.includes("'shop'"));nav.insertBefore(btn,shop||null)}
   if(state.previewMode && state.currentTab==='recipe'){const root=document.getElementById('root'),panel=document.createElement('section');panel.className='card';panel.innerHTML='<h3>Pré-visualização</h3><p>Esta troca ainda não foi confirmada.</p><div class="two"><button class="quiet" onclick="libCancelPreview()">Cancelar</button><button class="primary" onclick="libConfirmPreview()">Usar neste dia</button></div>';root.prepend(panel)}
  }
  const label=document.querySelector('header small');if(label)label.textContent='30 jantares · manutenção · v8.10.4';
 };
 render2();
})();


/* v8.10.4: ensure library tab survives every legacy nav re-render */
(function(){
 const css=document.createElement('style');
 css.textContent='nav .navinner{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:2px!important}nav .navinner button{min-width:0!important;padding-left:2px!important;padding-right:2px!important;font-size:11px!important}nav .navinner button i{font-size:22px!important}';
 document.head.appendChild(css);
 let scheduled=false;
 function ensure(){
  scheduled=false;
  const nav=document.querySelector('nav .navinner');
  if(nav&&!Array.from(nav.querySelectorAll('button')).some(b=>b.getAttribute('onclick')?.includes("'library'"))){
   const btn=document.createElement('button');
   btn.innerHTML='<i>▤</i>Receitas';btn.setAttribute('onclick',"setTab('library')");
   const shop=Array.from(nav.children).find(el=>el.getAttribute('onclick')?.includes("'shop'"));
   nav.insertBefore(btn,shop||null);
  }
  if(nav){for(const b of nav.querySelectorAll('button')){if(b.getAttribute('onclick')?.includes("'library'"))b.classList.toggle('active',state.currentTab==='library')}}
  const label=document.querySelector('header small');
  if(label&&label.textContent.indexOf('v8.10.4')<0)label.textContent='30 jantares · manutenção · v8.10.4';
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(ensure)}
 new MutationObserver(schedule).observe(document.querySelector('nav'),{childList:true,subtree:true});
 new MutationObserver(schedule).observe(document.querySelector('header'),{childList:true,subtree:true,characterData:true});
 schedule();
})();


/* v8.10.4 — navigation safety, honest recipe preview, guided cook consistency */
(function(){
 function restorePreview(){
  if(!state.previewMode)return;
  const day=state.day;
  if(state.libraryPrevious==null)delete state.manualMeals[day];
  else state.manualMeals[day]=state.libraryPrevious;
  state.previewMode=false;
  delete state.libraryPrevious;
  delete state.libraryPreview;
  save();
 }
 const oldSetTab=setTab;
 setTab=function(tab){
  if(state.previewMode&&tab!=='recipe')restorePreview();
  oldSetTab(tab);
 };
 const oldRouteDay=routeDay;
 routeDay=function(day){
  if(state.previewMode)restorePreview();
  oldRouteDay(day);
 };
 const oldPicker=showMealPicker;
 showMealPicker=function(day){
  if(state.previewMode)restorePreview();
  oldPicker(day);
 };
 const oldPreview=window.libPreview;
 window.libPreview=function(recipeId){
  if(state.previewMode)restorePreview();
  oldPreview(recipeId);
 };
 const oldAssign=window.libAssign;
 window.libAssign=function(recipeId){
  if(state.previewMode)restorePreview();
  oldAssign(recipeId);
 };
 const originalCancel=window.libCancelPreview;
 window.libCancelPreview=function(){
  restorePreview();
  state.currentTab='library';
  save();render2();
 };
 const originalConfirm=window.libConfirmPreview;
 window.libConfirmPreview=function(){
  state.previewMode=false;
  delete state.libraryPrevious;
  delete state.libraryPreview;
  save();render2();
 };
 // A session interrupted during preview must not leave a silent swap in the plan.
 if(state.previewMode){restorePreview();state.currentTab='library';save();}
 const style=document.createElement('style');
 style.textContent='nav .navinner{grid-template-columns:repeat(5,minmax(0,1fr))!important}nav .navinner button{font-size:11px!important;padding:7px 1px!important}nav .navinner i{font-size:22px!important}#lib-results [hidden]{display:none!important}';
 document.head.appendChild(style);
 const baseRender=render2;
 render2=function(){
   baseRender();
   const label=document.querySelector('header small');
   if(label)label.textContent='30 jantares · manutenção · v8.10.4';
 };
 render2();
})();

/* Stable equipment selector: repair the actual recipe render */
(function(){
 const css=document.createElement('style');
 css.textContent='.equip{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;width:100%!important;max-width:100%!important;overflow:visible!important;box-sizing:border-box}.equip button{min-width:0!important;width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;font-size:12px!important;line-height:1.3!important;min-height:59px!important;padding:8px 3px!important} .equip-info{font-size:14px;line-height:1.65;margin:8px 0 12px}.equip-info b{color:#efbf83}@media(max-width:350px){.equip{grid-template-columns:repeat(2,minmax(0,1fr))!important}}';
 document.head.appendChild(css);
 function apply(){
   if(state.currentTab!=='recipe')return;
   const card=[...document.querySelectorAll('#root .card')].find(x=>x.querySelector('h3')?.textContent.trim()==='Como queres cozinhar?');
   if(!card)return;
   const recommended=recommendedEquipment(mealAt(state.day)),selected=methodForDay(state.day);
   let info=card.querySelector('.equip-info');
   if(!info){info=document.createElement('div');info.className='equip-info';card.querySelector('h3').after(info)}
   info.innerHTML='⭐ Recomendado: <b>'+equipmentName(recommended)+'</b><div>✓ Escolhido: <b>'+equipmentName(selected)+'</b></div>';
   card.querySelectorAll('p.small').forEach(p=>{if(p.textContent.includes('Método recomendado:')||p.textContent.includes('A aplicação adapta'))p.textContent='As instruções adaptam-se ao equipamento escolhido.'});
   const grid=card.querySelector('.equip');if(!grid)return;
   grid.innerHTML=['grelhador','air fryer','frigideira','forno','panela'].map(k=>'<button type="button" class="'+(selected===k?'active':'')+'" data-cp-method="'+k+'">'+({'grelhador':'🔥 Grelhador','air fryer':'♨️ Air fryer','frigideira':'🍳 Frigideira','forno':'🥘 Forno','panela':'🍲 Panela'}[k])+'</button>').join('');
   grid.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>setEquipment(button.dataset.cpMethod)));
 }
 const base=render2;
 render2=function(){base();apply();const l=document.querySelector('header small');if(l)l.textContent='30 jantares · manutenção · v8.10.4'};
 render2();
})();


/* v8.10.4: single definitive selector — replaces the two competing late render patches */
(function(){
 const css=document.createElement('style');
 css.textContent=`
 #root .cp-method-grid {display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important;overflow:visible!important;width:100%!important}
 #root .cp-method-grid > button {box-sizing:border-box!important;min-width:0!important;width:100%!important;min-height:70px!important;padding:8px 3px!important;white-space:normal!important;border-radius:14px!important;line-height:1.2!important;font-size:12px!important;background:#303840!important;color:#f4f2ef!important;border:2px solid #454b53!important}
 #root .cp-method-grid > button[data-cp-selected="yes"] {background:#edc087!important;color:#251a10!important;border-color:#edc087!important}
 #root .cp-method-grid > button[data-cp-recommended="yes"] {border-color:#69b8a5!important}
 #root .cp-method-grid > button[data-cp-selected="yes"][data-cp-recommended="yes"] {background:#edc087!important;color:#251a10!important;border-color:#69b8a5!important}
 #root .cp-method-grid .cp-badge {display:block;font-size:10px!important;margin-top:5px;font-weight:700;color:#9ce1cf!important}
 #root .cp-method-grid > button[data-cp-selected="yes"] .cp-badge {color:#245a50!important}
 @media(max-width:340px){#root .cp-method-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
 `;
 document.head.appendChild(css);
 const labels=[['grelhador','🔥 Grelhador'],['air fryer','♨️ Air fryer'],['frigideira','🍳 Frigideira'],['forno','🥘 Forno'],['panela','🍲 Panela']];
 function rebuild(){
   if(state.currentTab!=='recipe')return;
   const heading=Array.from(document.querySelectorAll('#root h3')).find(x=>x.textContent.trim()==='Como queres cozinhar?');
   const card=heading?.closest('.card');if(!card)return;
   const rec=recommendedEquipment(mealAt(state.day));
   const chosen=methodForDay(state.day);
   card.querySelectorAll('.equip,.cp-method-grid,.equip-info').forEach(x=>x.remove());
   const info=document.createElement('div');info.className='equip-info';
   info.innerHTML='⭐ Recomendado: <b>'+equipmentName(rec)+'</b><div>✓ Escolhido: <b>'+equipmentName(chosen)+'</b></div>';
   const grid=document.createElement('div');grid.className='cp-method-grid';
   labels.forEach(([method,label])=>{
     const btn=document.createElement('button');btn.type='button';
     btn.dataset.cpSelected=method===chosen?'yes':'no';
     btn.dataset.cpRecommended=method===rec?'yes':'no';
     btn.setAttribute('aria-pressed',String(method===chosen));
     const name=document.createElement('span');name.textContent=label;name.style.fontWeight='700';btn.appendChild(name);
     if(method===rec){const star=document.createElement('span');star.className='cp-badge';star.textContent='★ Recomendado';btn.appendChild(star)}
     btn.addEventListener('click',()=>setEquipment(method));grid.appendChild(btn);
   });
   heading.after(info,grid);
   card.querySelectorAll('p.small').forEach(p=>{if(p.textContent.includes('recomendação')||p.textContent.includes('Método recomendado'))p.textContent='Dourado: escolhido · Verde: recomendado.'});
 }
 const prior=render2;
 render2=function(){prior();rebuild();const header=document.querySelector('header small');if(header)header.textContent='30 jantares · manutenção · v8.10.4'};
 render2();
})();
