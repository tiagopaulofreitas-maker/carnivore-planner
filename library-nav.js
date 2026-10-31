/* Clear separation of library, recipe details and cooking views — v7.1 */
(function(){
 'use strict';
 const root=document.getElementById('root');
 const nav=document.querySelector('nav');
 if(!root || !nav)return;
 let scheduled=false;

 function navState(){
  if(typeof state==='undefined')return;
  for(const button of nav.querySelectorAll('button')){
   const code=button.getAttribute('onclick')||'';
   const recipeTab=code.includes("'library'");
   if(recipeTab){
    const active=state.currentTab==='library';
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
   }else if(state.currentTab==='cook'||state.currentTab==='recipe'){
    button.classList.remove('active');
    button.removeAttribute('aria-current');
   }
  }
 }
 function open(){
  if(typeof state==='undefined')return;
  try{
   if(typeof setTab==='function')setTab('library');
   else {state.currentTab='library';save();}
   state.currentTab='library';
   if(typeof window.cpRenderLibrary==='function')window.cpRenderLibrary();
   save();
   navState();
   window.scrollTo(0,0);
  }catch(e){
   console.error('Erro ao abrir a biblioteca:',e);
   const target=root;
   if(typeof window.cpRenderLibrary==='function'){
    state.currentTab='library';
    window.cpRenderLibrary();
    navState();
   }
  }
 }
 window.cpOpenLibrary=open;
 function ensure(){
  scheduled=false;
  if(typeof state==='undefined')return;
  if(state.currentTab==='library'){
   if(!root.querySelector('#lib-results')&&typeof window.cpRenderLibrary==='function'){
    window.cpRenderLibrary();
   }
  }else if((state.currentTab==='recipe'||state.currentTab==='cook')&&!root.querySelector('[data-cp-library-shortcut]')){
   const button=document.createElement('button');
   button.type='button';
   button.className='cp-open-library';
   button.dataset.cpLibraryShortcut='true';
   button.textContent='⌕ Explorar todas as receitas';
   button.addEventListener('click',open);
   const hero=root.querySelector('.hero');
   if(hero&&state.currentTab==='recipe')hero.insertAdjacentElement('afterend',button);
   else root.insertBefore(button,root.firstChild);
  }
  navState();
 }
 function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(ensure);
 }
 nav.addEventListener('click',function(event){
  const button=event.target.closest('button');
  if(!button||!nav.contains(button))return;
  const code=button.getAttribute('onclick')||'';
  if(code.includes("'library'")){
   event.preventDefault();
   event.stopImmediatePropagation();
   open();
  }
 },true);
 new MutationObserver(schedule).observe(root,{childList:true});
 new MutationObserver(schedule).observe(nav,{childList:true});
 window.addEventListener('pageshow',schedule);
 schedule();
})();