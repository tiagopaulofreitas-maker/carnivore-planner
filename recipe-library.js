/* Carnivore Planner 7.6 - independent recipe library
   Does not call the old library renderer or mutate a recipe during preview. */
(function(){
 'use strict';
 const root=document.getElementById('root');
 const nav=document.querySelector('nav');
 if(!root||!nav)return;
 const CATEGORY={
   beef:{label:'Novilho',icon:'🥩'},
   pork:{label:'Porco',icon:'🍖'},
   fish:{label:'Peixe e marisco',icon:'🐟'},
   chicken:{label:'Aves',icon:'🍗'}
 };
 const METHODS={
   fast:'Preparação rápida',slow:'Cozedura lenta',leftover:'Sobras'
 };
 const removeAccents=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-PT').trim();
 const filters={search:'',category:'all',method:'all',fav:false,sort:'plan'};
 let currentPreview=-1;
 let observerQueued=false;

 function categoryFor(meal){
  const keys=Object.keys(meal.items||{});
  if(keys.some(k=>['salmao','atum','cavala','sardinha','camarao'].includes(k)))return 'fish';
  if(keys.includes('frango'))return 'chicken';
  if(keys.some(k=>['lagartos','duroc','secretos','plumas','barriga'].includes(k)))return 'pork';
  return 'beef';
 }
 function methodFor(meal){
  if(meal.method==='leftover')return 'leftover';
  if(['roast','braise'].includes(meal.method))return 'slow';
  return 'fast';
 }
 function timeInfo(meal,index){
  const minutes=typeof window.cpGuideTime==='function'?window.cpGuideTime(meal,index):null;
  if(Array.isArray(minutes)&&minutes.length===2){
    const format=m=>m>=60?Math.floor(m/60)+'h'+(m%60?String(m%60).padStart(2,'0'):''):String(m);
    return [format(minutes[0])+'–'+format(minutes[1])+(minutes[1]<60?' min':''),Math.round((minutes[0]+minutes[1])/2)];
  }
  const times={pan:['20–40 min',30],fish:['15–30 min',22],fishoven:['15–30 min',25],
               burger:['20–35 min',28],chicken:['30–50 min',40],
               roast:['2h30–4h',210],braise:['3–5h',240],leftover:['10–25 min',18]};
  return times[meal.method]||['20–45 min',32];
 }
 function recipeInstructions(meal,index){
  try{
   if(typeof window.cpGuideSteps==='function'){
     const rec=typeof recommendedEquipment==='function'?recommendedEquipment(meal):'frigideira';
     const details=window.cpGuideSteps(meal,index,rec);
     if(Array.isArray(details)&&details.length)return details;
   }
   if(typeof dishNotes!=='undefined'&&Array.isArray(dishNotes?.[index]))
     return dishNotes[index].slice(1).filter(x=>typeof x==='string');
   if(typeof practicalSteps==='function'){
     const arr=practicalSteps(meal);
     if(Array.isArray(arr)&&arr.length)return arr.filter(x=>typeof x==='string');
   }
  }catch(error){console.warn('Instruções alternativas:',error)}
  if(typeof steps!=='undefined'&&Array.isArray(steps[meal.method]))return steps[meal.method];
  return ['Confirma os ingredientes e tempera a gosto.','Segue a confeção adequada ao corte de carne ou peixe.','Serve os acompanhamentos acabados de preparar.'];
 }
 function recommendedMethod(meal){
  try{
   if(typeof recommendedEquipment==='function'){
    return typeof equipmentName==='function'?
      equipmentName(recommendedEquipment(meal)):recommendedEquipment(meal);
   }
  }catch(error){}
  return meal.method==='roast'?'Forno':meal.method==='braise'?'Panela':'Frigideira ou grelhador';
 }
 function create(tag,cls,label){
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(label!==undefined)el.textContent=label;
  return el;
 }
 function button(text,cls,handler){
  const b=create('button',cls,text);
  b.type='button';b.addEventListener('click',handler);
  return b;
 }
 function getMeals(){
  return typeof meals!=='undefined'&&Array.isArray(meals)?meals:[];
 }
 function favSet(){
  if(!state.favourites||typeof state.favourites!=='object')state.favourites={};
  return state.favourites;
 }
 function getDay(){
  const day=Number(state.libraryDay);
  return Number.isInteger(day)&&day>=0&&day<30?day:Math.max(0,Math.min(29,Number(state.day)||0));
 }
 function updateNav(){
  nav.querySelectorAll('button').forEach(b=>{
   const onclick=b.getAttribute('onclick')||'';
   const isLibrary=onclick.includes("'library'")||b.textContent.trim()==='Receitas';
   const active=!!isLibrary&&state.currentTab==='library';
   b.classList.toggle('active',active);
   if(active)b.setAttribute('aria-current','page');
   else b.removeAttribute('aria-current');
   if(['cook','recipe'].includes(state.currentTab))b.classList.remove('active');
  });
 }
 function makeSelect(id,label,options,value){
  const wrap=create('label','cp73-field');
  const caption=create('span','',label);
  const select=create('select');select.id=id;
  options.forEach(([val,name])=>{
   const option=create('option','',name);option.value=val;select.appendChild(option);
  });
  select.value=value;wrap.append(caption,select);return wrap;
 }
 function render(){
  const list=getMeals();
  state.currentTab='library';
  if(!state.libraryFilters||typeof state.libraryFilters!=='object')state.libraryFilters={};
  const content=create('section','cp73-library');
  content.id='cp73-library';
  const intro=create('div','cp73-head');
  intro.append(create('small','cp73-eyebrow','A TUA COZINHA, À TUA MANEIRA'),create('h2','','Biblioteca de receitas'),create('p','','Pesquisa livremente, guarda os favoritos e consulta as receitas. Adiciona um prato ao plano apenas quando quiseres.'));
  const panel=create('section','card cp73-controls');
  const searchLabel=create('label','cp73-field');
  searchLabel.appendChild(create('span','','Pesquisar por prato ou ingrediente'));
  const search=create('input');search.type='search';search.id='cp73-search';
  search.placeholder='Ex.: lagartos, salmão, entrecôte…';
  search.autocomplete='off';search.value=filters.search;
  search.setAttribute('aria-label','Pesquisar receitas');
  searchLabel.appendChild(search);
  const cols=create('div','cp73-cols');
  const cat=makeSelect('cp73-category','Tipo de carne / peixe',[
    ['all','Todos'],['beef','Novilho'],['pork','Porco'],['fish','Peixe e marisco'],['chicken','Aves']
  ],filters.category);
  const cook=makeSelect('cp73-method','Preparação',[
    ['all','Todas'],['fast','Rápida'],['slow','Lenta'],['leftover','Sobras']
  ],filters.method);
  cols.append(cat,cook);
  const favLabel=create('label','cp73-favfilter');
  const favInput=create('input');favInput.type='checkbox';favInput.id='cp73-favs';favInput.checked=filters.fav;
  favLabel.append(favInput,create('span','','Mostrar só os favoritos'));
  // Browse and search without having to choose any day.
  panel.append(searchLabel,cols,favLabel);
  const help=create('small','cp74-search-help','Escreve para filtrar imediatamente. Só escolhes o dia quando adicionares um prato ao plano.');
  panel.appendChild(help);
  const shortcut=create('div','cp73-shortcuts');
  shortcut.append(
    button('★ Favoritos','',()=>{favInput.checked=true;filters.fav=true;update()}),
    button('🍖 Lagartos','',()=>{search.value='lagartos';filters.search='lagartos';update()}),
    button('⚡ Rápidas','',()=>{cook.querySelector('select').value='fast';filters.method='fast';update()})
  );
  const resultHead=create('div','cp73-results-head');
  const count=create('strong','cp73-count');
  const sortLabel=makeSelect('cp75-sort','Ordenar por',[["plan","Ordem original"],["alpha","Nome A–Z"],["price","Mais barato"],["duration","Mais rápido"]],filters.sort);
  sortLabel.classList.add('cp75-sort');
  resultHead.append(count,sortLabel,button('Limpar filtros','cp73-reset',()=>{
    Object.assign(filters,{search:'',category:'all',method:'all',fav:false,sort:'plan'});
    currentPreview=-1;render();
  }));
  const preview=create('div');preview.id='cp73-preview';
  const cards=create('div','cp73-cards');cards.id='cp73-cards';
  const empty=create('p','cp73-empty','Nenhuma receita corresponde à pesquisa. Experimenta alterar os filtros.');
  empty.hidden=true;
  content.append(intro,panel,shortcut,preview,resultHead,cards,empty);
  root.replaceChildren(content);

  list.forEach((meal,i)=>{
   const category=categoryFor(meal);
   const method=methodFor(meal);
   const item=create('article','cp73-card');
   item.dataset.index=String(i);
   item.dataset.cost=String(Number(calc(meal))||0);
   item.dataset.minutes=String(timeInfo(meal,i)[1]);
   item.dataset.search=removeAccents(meal.name+' '+Object.keys(meal.items||{}).map(k=>products?.[k]?.[0]||k).join(' '));
   item.dataset.category=category;
   item.dataset.method=method;
   item.dataset.fav=String(!!favSet()[i]);
   const heading=create('div','cp73-card-head');
   const icon=create('div','cp73-icon',CATEGORY[category].icon);
   const title=create('div','cp73-card-name');
   title.appendChild(create('strong','',meal.name));
   let cost='';
   try{cost=money(calc(meal))}catch(e){cost='Preço não disponível'}
   title.appendChild(create('small','',METHODS[method]+' · '+cost));
   const star=button(favSet()[i]?'★':'☆','cp73-star',()=>{
     const fav=favSet();fav[i]=!fav[i];save();
     item.dataset.fav=String(!!fav[i]);star.textContent=fav[i]?'★':'☆';
     star.setAttribute('aria-label',fav[i]?'Remover favorito':'Guardar favorito');
     update();
   });
   star.setAttribute('aria-label',favSet()[i]?'Remover favorito':'Guardar favorito');
   heading.append(icon,title,star);
   const actions=create('div','cp73-actions');
   actions.append(button('Ver receita','cp73-secondary',()=>showDetails(i)),
                  button('Adicionar ao plano','cp73-primary',()=>askDay(i)));
   item.append(heading,actions);cards.appendChild(item);
  });

  search.addEventListener('input',()=>{filters.search=search.value;update()});
  cat.querySelector('select').addEventListener('change',e=>{filters.category=e.target.value;update()});
  cook.querySelector('select').addEventListener('change',e=>{filters.method=e.target.value;update()});
  favInput.addEventListener('change',()=>{filters.fav=favInput.checked;update()});
  sortLabel.querySelector('select').addEventListener('change',e=>{filters.sort=e.target.value;update()});
  if(currentPreview>=0)showDetails(currentPreview,false);
  update();
  updateNav();
 }
 function update(){
  let n=0;
  root.querySelectorAll('#cp73-cards .cp73-card').forEach(card=>{
   const ok=card.dataset.search.includes(removeAccents(filters.search))
    &&(filters.category==='all'||card.dataset.category===filters.category)
    &&(filters.method==='all'||card.dataset.method===filters.method)
    &&(!filters.fav||card.dataset.fav==='true');
   card.hidden=!ok;if(ok)n++;
  });
  const list=root.querySelector('#cp73-cards');
  if(list&&filters.sort!=='plan'){
    const items=[...list.querySelectorAll('.cp73-card')];
    items.sort((a,b)=>{
      if(filters.sort==='price')return Number(a.dataset.cost)-Number(b.dataset.cost);
      if(filters.sort==='duration')return Number(a.dataset.minutes)-Number(b.dataset.minutes);
      if(filters.sort==='alpha')return a.dataset.search.localeCompare(b.dataset.search,'pt-PT');
      return Number(a.dataset.index)-Number(b.dataset.index);
    });
    items.forEach(card=>list.appendChild(card));
  }else if(list){
    [...list.querySelectorAll('.cp73-card')]
      .sort((a,b)=>Number(a.dataset.index)-Number(b.dataset.index))
      .forEach(card=>list.appendChild(card));
  }
  const count=root.querySelector('.cp73-count');
  if(count)count.textContent=n+' de '+getMeals().length+' receitas';
  const empty=root.querySelector('.cp73-empty');if(empty)empty.hidden=n>0;
 }
 function showDetails(i,scroll=true){
  const meal=getMeals()[i],slot=root.querySelector('#cp73-preview');
  if(!meal||!slot)return;
  currentPreview=i;
  const pane=create('section','cp73-detail cp75-detail');
  pane.id='cp75-detail';
  const top=create('div','cp75-detail-top');
  const title=create('h3','',meal.name);
  const meta=create('div','cp75-meta');
  const chips=[
    '⏱ '+timeInfo(meal,i)[0]+' aprox.',
    '💶 '+money(calc(meal))+' estimados',
    '⭐ '+recommendedMethod(meal)+' recomendado'
  ];
  chips.forEach(txt=>meta.appendChild(create('span','cp75-meta-chip',txt)));
  top.append(title,meta);
  pane.appendChild(top);
  pane.appendChild(create('p','cp75-note','Consulta a receita à vontade. Nenhum dia do plano será alterado sem confirmação.'));
  const ingredientsTitle=create('h4','','Ingredientes');
  const list=create('ul','cp75-ingredients');
  Object.entries(meal.items||{}).forEach(([key,qty])=>{
   const label=typeof products!=='undefined'&&products[key]?products[key][0]:key;
   const row=create('li');
   row.append(create('span','',label),create('strong','',qty+(key==='ovos'?' un.':' g')));
   list.appendChild(row);
  });
  pane.append(ingredientsTitle,list);
  pane.appendChild(create('h4','','Preparação, passo a passo'));
  const stepsList=create('ol','cp75-steps');
  const instructions=recipeInstructions(meal,i);
  instructions.forEach(txt=>{
    const row=create('li');
    row.appendChild(create('p','',txt));
    stepsList.appendChild(row);
  });
  pane.appendChild(stepsList);
  const tipText=typeof window.cpGuideTip==='function'?window.cpGuideTip(meal,i):'';
  const tip=create('p','cp75-guidance',(tipText?tipText+' ':'')+'Os tempos são indicativos. Podes escolher outro equipamento na ficha do dia, depois de adicionares a refeição ao plano.');
  pane.appendChild(tip);
  const actions=create('div','cp73-actions cp75-actions');
  const fav=button(favSet()[i]?'★ Favorita':'☆ Guardar favorita','cp73-secondary',()=>{
    const v=favSet();v[i]=!v[i];save();
    fav.textContent=v[i]?'★ Favorita':'☆ Guardar favorita';
    const card=root.querySelector('.cp73-card[data-index="'+i+'"]');
    if(card){
      card.dataset.fav=String(!!v[i]);
      const star=card.querySelector('.cp73-star');
      if(star){star.textContent=v[i]?'★':'☆';star.setAttribute('aria-label',v[i]?'Remover favorito':'Guardar favorito')}
    }
    update();
  });
  actions.append(button('Fechar','cp73-secondary',()=>{currentPreview=-1;slot.replaceChildren()}),
                 fav,
                 button('Adicionar ao plano','cp73-primary',()=>askDay(i)));
  pane.appendChild(actions);
  slot.replaceChildren(pane);
  if(scroll)pane.scrollIntoView({block:'start',behavior:'smooth'});
 }
 function askDay(index){
  const meal=getMeals()[index];if(!meal)return;
  // The day selector exists only for the explicit Add to plan action.
  root.querySelectorAll('.cp74-dialog').forEach(el=>el.remove());
  const dialog=create('dialog','cp74-dialog');
  dialog.setAttribute('aria-label','Adicionar receita ao plano');
  const body=create('div','cp74-dialog-body');
  const heading=create('h3','','Adicionar ao plano');
  const description=create('p','cp74-dialog-description','Escolheste '+meal.name+'. Em que dia queres preparar esta refeição?');
  const options=Array.from({length:30},(_,i)=>{
    let label='Dia '+(i+1);
    try{label+=' · '+datefmt(date(i))}catch(e){}
    return [String(i),label];
  });
  const picker=makeSelect('cp74-day','Escolhe um dia do teu plano',options,String(getDay()));
  const current=create('p','cp74-current');
  const actions=create('div','cp74-actions');
  const cancel=button('Cancelar','cp73-secondary',()=>dialog.close());
  const confirm=button('Confirmar alteração','cp73-primary',()=>{
   const day=Number(picker.querySelector('select').value);
   if(!Number.isInteger(day)||day<0||day>=30)return;
   dialog.close();
   choose(index,day);
  });
  function describe(){
   const day=Number(picker.querySelector('select').value);
   try{
    const planned=mealAt(day);
    current.textContent='Neste momento, o dia '+(day+1)+' tem: '+planned.name+'. A troca só acontece quando confirmares.';
   }catch(e){current.textContent='A alteração só acontece quando confirmares.';}
  }
  picker.querySelector('select').addEventListener('change',describe);
  actions.append(cancel,confirm);
  body.append(heading,description,picker,current,actions);
  dialog.appendChild(body);
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});
  root.appendChild(dialog);
  describe();
  if(typeof dialog.showModal==='function')dialog.showModal();
  else {dialog.setAttribute('open','');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');}
  picker.querySelector('select').focus();
 }
 function choose(index,day){
  const meal=getMeals()[index];if(!meal)return;
  if(!Number.isInteger(day)||day<0||day>=30)return;
  if(!state.manualMeals||typeof state.manualMeals!=='object')state.manualMeals={};
  state.libraryDay=day;
  state.manualMeals[day]=index;
  state.day=day;
  state.currentTab='recipe';
  state.previewMode=false;
  currentPreview=-1;
  save();
  try{render2();window.scrollTo(0,0)}
  catch(error){
   console.error('Abrir receita:',error);
   state.currentTab='library';save();render();
   const p=create('p','cp73-error','A refeição foi guardada no dia '+(day+1)+', mas não consegui abrir os detalhes.');
   root.querySelector('.cp73-head')?.appendChild(p);
  }
 }
 function openLibrary(){
  if(typeof state==='undefined')return;
  state.currentTab='library';
  if(!Number.isInteger(state.libraryDay))state.libraryDay=Math.max(0,Math.min(29,Number(state.day)||0));
  save();
  render();window.scrollTo(0,0);
 }
 window.cpOpenLibrary=openLibrary;
 window.cpNavigateToLibrary=openLibrary;
 // Intercept all legacy ways of opening the library, including Trocar prato.
 const originalSetTab=typeof setTab==='function'?setTab:null;
 if(originalSetTab){
  setTab=function(tab){
   if(tab==='library')return openLibrary();
   return originalSetTab(tab);
  };
 }
 if(typeof showMealPicker==='function'){
  showMealPicker=function(day){
   state.libraryDay=Math.max(0,Math.min(29,Number(day)||0));
   return openLibrary();
  };
 }
 const originalRender=typeof render2==='function'?render2:null;
 if(originalRender){
  render2=function(){
   if(state.currentTab==='library')return openLibrary();
   return originalRender();
  };
 }
 // Capture before older inline onclick handlers can navigate back to the cooking view.
 document.addEventListener('click',event=>{
  const navButton=event.target.closest?.('nav button');
  if(navButton){
   const code=navButton.getAttribute('onclick')||'';
   if(code.includes("'library'")||navButton.textContent.trim()==='Receitas'){
    event.preventDefault();
    event.stopImmediatePropagation();
    openLibrary();
   }
   return;
  }
  const button=event.target.closest?.('#cp-direct-library, .cp-open-library');
  if(button){
   event.preventDefault();event.stopImmediatePropagation();openLibrary();
  }
 },true);

 let queued=false;
 function reconcile(){
  queued=false;
  if(typeof state==='undefined')return;
  if(state.currentTab==='library'){
   if(!root.querySelector('#cp73-library'))render();
  }else if(['recipe','cook'].includes(state.currentTab)){
   // Keep the shortcut distinct from the selected Receitas bottom tab.
   if(!root.querySelector('#cp-direct-library')){
    const b=button('⌕ Explorar todas as receitas','cp-open-library',openLibrary);
    b.id='cp-direct-library';
    if(state.currentTab==='recipe'&&root.querySelector('.hero'))
      root.querySelector('.hero').insertAdjacentElement('afterend',b);
    else root.insertBefore(b,root.firstChild);
   }
   updateNav();
  }else updateNav();
 }
 function schedule(){
  if(queued)return;queued=true;
  requestAnimationFrame(reconcile);
 }
 new MutationObserver(schedule).observe(root,{childList:true});
 new MutationObserver(schedule).observe(nav,{childList:true});
 window.addEventListener('pageshow',schedule);
 schedule();
})();