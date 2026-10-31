/* Carnivore Planner — editorial recipe photographs, thumbnails + hero (v7.9).
   Free-to-use Unsplash photographs; illustrative rather than exact plated recipes.
   Images load on demand, with the existing emoji as an offline fallback. */
(function(){
 'use strict';
 const SOURCES={
  steak:{photo:'photo-1432139509613-5c4255815697',who:'Alex Munsell',link:'https://unsplash.com/photos/auIbTAcSH6E'},
  roast:{photo:'photo-1767974911771-e49a477916a8',who:'tommao wang',link:'https://unsplash.com/photos/bDV1an6G6ds'},
  pork:{photo:'photo-1767974756540-a9b4ff92c58b',who:'tommao wang',link:'https://unsplash.com/photos/AS8eZ9iJYY4'},
  porkplate:{photo:'photo-1432139555190-58524dae6a55',who:'Alex Munsell',link:'https://unsplash.com/photos/Yr4n8O_3UPc'},
  salmon:{photo:'photo-1604909052868-dd2ef1e53daa',who:'Farhad Ibrahimzade',link:'https://unsplash.com/photos/isHUj3N0194'},
  fish:{photo:'photo-1566714637542-e4410b9edc48',who:'Yoav Hornung',link:'https://unsplash.com/photos/8-IpqsggI1s'},
  burger:{photo:'photo-1682473620458-8537c3f59227',who:'Cristian Guillen',link:'https://unsplash.com/photos/WEMPcnXWxKw'},
  shrimp:{photo:'photo-1604909052868-dd2ef1e53daa',who:'Farhad Ibrahimzade',link:'https://unsplash.com/photos/isHUj3N0194'},
  chicken:{photo:'photo-1638439430466-b2bb7fdc1d67',who:'Levi T.',link:'https://unsplash.com/photos/CuhsuC_4vNU'}
 };
 function select(meal){
  const keys=Object.keys(meal?.items||{});
  const name=String(meal?.name||'').toLowerCase();
  if(name.includes('lagartos')||keys.includes('lagartos'))return 'pork';
  if(keys.includes('frango'))return 'chicken';
  if(keys.includes('picada'))return 'burger';
  if(keys.includes('salmao'))return 'salmon';
  if(keys.includes('sardinha')||keys.includes('cavala')||keys.includes('atum'))return 'fish';
  if(keys.includes('camarao')&&!keys.some(k=>['entrecote','lombo','picanha','alcatra'].includes(k)))return 'shrimp';
  if(keys.includes('barriga')||keys.includes('secretos')||keys.includes('plumas')||keys.includes('duroc'))return 'pork';
  if(['roast','braise','leftover'].includes(meal?.method))return 'roast';
  if(keys.includes('costela')||keys.includes('acem')||keys.includes('chambao'))return 'roast';
  return 'steak';
 }
 function urlFor(meal,size='large'){
  const x=SOURCES[select(meal)];
  const w=size==='thumb'?220:840;
  return 'https://images.unsplash.com/'+x.photo+'?auto=format&fit=crop&w='+w+'&h='+(size==='thumb'?180:530)+'&q='+(size==='thumb'?58:75);
 }
 function make(meal,kind='thumb'){
  const wrap=document.createElement('div');
  wrap.className='cp-photo cp-photo-'+kind;
  const fallback=document.createElement('span');
  fallback.className='cp-photo-fallback';
  fallback.textContent=(()=>{const keys=Object.keys(meal?.items||{});return keys.includes('salmao')||keys.includes('sardinha')?'🐟':keys.includes('frango')?'🍗':keys.some(k=>['lagartos','secretos','duroc','plumas','barriga'].includes(k))?'🍖':'🥩'})();
  wrap.appendChild(fallback);
  const img=document.createElement('img');
  img.loading=kind==='thumb'?'lazy':'eager';
  img.decoding='async';
  img.width=kind==='thumb'?110:840;
  img.height=kind==='thumb'?90:530;
  img.alt='Fotografia ilustrativa: '+String(meal?.name||'prato');
  img.src=urlFor(meal,kind==='thumb'?'thumb':'large');
  img.addEventListener('load',()=>{
    if(img.naturalWidth>0)wrap.classList.add('cp-photo-loaded');
  },{once:true});
  img.addEventListener('error',()=>{img.remove();wrap.classList.add('cp-photo-unavailable')},{once:true});
  wrap.appendChild(img);
  return wrap;
 }
 function byIndex(index){try{return meals[index]}catch(e){return null}}
 function refresh(){
  const root=document.getElementById('root');
  if(!root||typeof state==='undefined')return;
  const view=state.currentTab;
  if(view==='library'){
    for(const card of root.querySelectorAll('.cp73-card')){
      if(card.querySelector('.cp-photo'))continue;
      const index=Number(card.dataset.index);
      const meal=byIndex(index);if(!meal)continue;
      const head=card.querySelector('.cp73-card-head');
      const ico=card.querySelector('.cp73-icon');
      if(!head)continue;
      if(ico)ico.replaceWith(make(meal,'thumb'));
      else head.insertBefore(make(meal,'thumb'),head.firstChild);
    }
    const preview=root.querySelector('.cp75-detail');
    if(preview&&!preview.querySelector('.cp-photo')){
      const title=preview.querySelector('h3')?.textContent||'';
      const match=Array.isArray(meals)?meals.find(m=>m.name===title):null;
      if(match){
       const image=make(match,'hero');
       preview.insertBefore(image,preview.firstChild);
       preview.appendChild(document.createTextNode(''));
      }
    }
  }
  if(view==='recipe'||view==='home'){
    const hero=root.querySelector('.hero');
    const day=view==='home'?typeof todayIndex==='function'?todayIndex():state.day:state.day;
    const meal=typeof mealAt==='function'?mealAt(day):null;
    if(hero&&meal&&!hero.querySelector('.cp-photo')){
      const img=make(meal,'hero');
      hero.insertBefore(img,hero.querySelector('.emoji')||hero.querySelector('h2'));
      hero.classList.add('cp-photo-hero-card');
    }
    if(view==='home'){
      const tomorrow=root.querySelector('h3.section+ .tile');
      const cards=root.querySelectorAll('.tile[onclick*="routeDay"]');
      const next=typeof mealAt==='function'?mealAt((day+1)%30):null;
      if(cards.length&&next&&!cards[0].querySelector('.cp-photo'))cards[0].insertBefore(make(next,'thumb'),cards[0].firstChild);
    }
  }
  if(view==='month'){
    const rows=[...root.querySelectorAll('.rowline[role="link"]')];
    rows.forEach((r,i)=>{
      if(r.querySelector('.cp-photo'))return;
      const meal=typeof mealAt==='function'?mealAt(i):null;
      if(meal)r.insertBefore(make(meal,'thumb'),r.firstChild);
    });
  }
 }
 let pending=false;
 function schedule(){
  if(pending)return;
  pending=true;
  requestAnimationFrame(()=>{pending=false;try{refresh()}catch(error){console.warn('Imagens:',error)}});
 }
 const root=document.getElementById('root');
 if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:false});
 document.addEventListener('click',e=>{
  if(e.target.closest?.('.cp73-card button'))schedule();
 },true);
 window.addEventListener('pageshow',schedule);
 window.CPRecipeMedia={make,urlFor,select,SOURCES,refresh:schedule};
 schedule();
})();