/* Carnivore Planner 7.3 - independent recipe library
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
 const filters={search:'',category:'all',method:'all',fav:false};
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
  if(['roast','braise','fishoven'].includes(meal.method))return 'slow';
  return 'fast';
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
  intro.append(create('small','cp73-eyebrow','A TUA COZINHA, À TUA MANEIRA'),create('h2','','Biblioteca de receitas'),create('p','','Pesquisa os pratos, guarda os favoritos e escolhe uma refeição para qualquer dia.'));
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
  const dayOptions=Array.from({length:30},(_,i)=>{
    let dateText='';
    try{dateText=typeof datefmt==='function'&&typeof date==='function'?' · '+datefmt(date(i)):''}catch(e){}
    return [String(i),'Dia '+(i+1)+dateText];
  });
  const day=makeSelect('cp73-day','Dia do plano que queres alterar',dayOptions,String(getDay()));
  panel.append(searchLabel,cols,favLabel,day);
  const shortcut=create('div','cp73-shortcuts');
  shortcut.append(
    button('★ Favoritos','',()=>{favInput.checked=true;filters.fav=true;update()}),
    button('🍖 Lagartos','',()=>{search.value='lagartos';filters.search='lagartos';update()}),
    button('⚡ Rápidas','',()=>{cook.querySelector('select').value='fast';filters.method='fast';update()})
  );
  const resultHead=create('div','cp73-results-head');
  const count=create('strong','cp73-count');
  resultHead.append(count,button('Limpar filtros','cp73-reset',()=>{
    Object.assign(filters,{search:'',category:'all',method:'all',fav:false});
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
   actions.append(button('Ver detalhes','cp73-secondary',()=>showDetails(i)),
                  button('Usar neste dia','cp73-primary',()=>choose(i)));
   item.append(heading,actions);cards.appendChild(item);
  });

  search.addEventListener('input',()=>{filters.search=search.value;update()});
  cat.querySelector('select').addEventListener('change',e=>{filters.category=e.target.value;update()});
  cook.querySelector('select').addEventListener('change',e=>{filters.method=e.target.value;update()});
  favInput.addEventListener('change',()=>{filters.fav=favInput.checked;update()});
  day.querySelector('select').addEventListener('change',e=>{state.libraryDay=Number(e.target.value);save()});
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
  const count=root.querySelector('.cp73-count');
  if(count)count.textContent=n+' de '+getMeals().length+' receitas';
  const empty=root.querySelector('.cp73-empty');if(empty)empty.hidden=n>0;
 }
 function showDetails(i,scroll=true){
  const meal=getMeals()[i],slot=root.querySelector('#cp73-preview');
  if(!meal||!slot)return;
  currentPreview=i;
  const pane=create('section','cp73-detail');
  pane.append(create('h3','',meal.name),create('p','','Ingredientes da receita'));
  const list=create('ul');
  Object.entries(meal.items||{}).forEach(([key,qty])=>{
   const label=typeof products!=='undefined'&&products[key]?products[key][0]:key;
   list.appendChild(create('li','',label+': '+qty+(key==='ovos'?' un.':' g')));
  });
  const actions=create('div','cp73-actions');
  actions.append(button('Fechar','cp73-secondary',()=>{currentPreview=-1;slot.replaceChildren()}),
                 button('Escolher este prato','cp73-primary',()=>choose(i)));
  pane.append(list,actions);
  slot.replaceChildren(pane);
  if(scroll)pane.scrollIntoView({block:'start',behavior:'smooth'});
 }
 function choose(index){
  const meal=getMeals()[index];if(!meal)return;
  const day=getDay();
  if(!state.manualMeals||typeof state.manualMeals!=='object')state.manualMeals={};
  state.manualMeals[day]=index;state.day=day;state.currentTab='recipe';
  state.previewMode=false;
  currentPreview=-1;
  save();
  try{render2();window.scrollTo(0,0)}
  catch(error){
   console.error('Abrir receita:',error);
   state.currentTab='library';save();render();
   const p=create('p','cp73-error','Não consegui abrir os detalhes. O prato foi guardado para o dia '+(day+1)+'.');
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