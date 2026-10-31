/* Carnivore Planner — independent, resilient equipment selector */
(function () {
  'use strict';
  const BUILD = '6.3';
  const METHODS = [
    ['grelhador', '🔥 Grelhador'],
    ['air fryer', '♨️ Air fryer'],
    ['frigideira', '🍳 Frigideira'],
    ['forno', '🥘 Forno'],
    ['panela', '🍲 Panela']
  ];
  let scheduled = false;

  function setImportant(element, prop, value) {
    element.style.setProperty(prop, value, 'important');
  }

  function buttonFor(method, text, selected, recommended) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.methodChoice = method;
    button.dataset.selected = String(selected);
    button.dataset.recommended = String(recommended);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', text + (recommended ? ', recomendado' : '') + (selected ? ', selecionado' : ''));
    const label = document.createElement('span');
    label.textContent = text;
    label.style.fontWeight = '700';
    button.appendChild(label);
    if (recommended) {
      const note = document.createElement('span');
      note.textContent = '★ Recomendado';
      note.style.cssText = 'display:block;font-size:10px;font-weight:700;margin-top:5px;';
      note.style.color = selected ? '#245a50' : '#9ce1cf';
      button.appendChild(note);
    }
    setImportant(button, 'appearance', 'none');
    setImportant(button, 'display', 'flex');
    setImportant(button, 'flex-direction', 'column');
    setImportant(button, 'align-items', 'center');
    setImportant(button, 'justify-content', 'center');
    setImportant(button, 'box-sizing', 'border-box');
    setImportant(button, 'width', '100%');
    setImportant(button, 'min-width', '0');
    setImportant(button, 'min-height', '70px');
    setImportant(button, 'padding', '9px 3px');
    setImportant(button, 'border-radius', '14px');
    setImportant(button, 'font-size', '12px');
    setImportant(button, 'line-height', '1.25');
    setImportant(button, 'white-space', 'normal');
    setImportant(button, 'box-shadow', 'none');
    setImportant(button, 'background', selected ? '#edc087' : '#303840');
    setImportant(button, 'color', selected ? '#251a10' : '#f4f2ef');
    setImportant(button, 'border', '2px solid ' + (recommended ? '#69b8a5' : selected ? '#edc087' : '#454b53'));
    button.addEventListener('click', () => {
      if (typeof setEquipment === 'function') setEquipment(method);
      queueUpdate();
    });
    return button;
  }

  function apply() {
    try {
      const root = document.getElementById('root');
      if (!root) return;
      const heading = [...root.querySelectorAll('h3')]
        .find(el => el.textContent.trim() === 'Como queres cozinhar?');
      if (!heading) return;
      const card = heading.closest('.card');
      if (!card || typeof state === 'undefined' ||
          typeof recommendedEquipment !== 'function' || typeof mealAt !== 'function' ||
          typeof methodForDay !== 'function') return;

      const recommended = recommendedEquipment(mealAt(state.day));
      const selected = methodForDay(state.day);
      const existing = card.querySelector('[data-equipment-selector="6.3"]');
      if (existing && existing.dataset.selected === selected &&
          existing.dataset.recommended === recommended &&
          existing.querySelectorAll('[data-method-choice]').length === 5) return;

      // Remove all legacy selectors. Keep the recipe and the other controls intact.
      card.querySelectorAll('.equip, .equip-info, .cp-method-grid, [data-equipment-selector]')
        .forEach(node => node.remove());
      const container = document.createElement('div');
      container.dataset.equipmentSelector = BUILD;
      container.dataset.selected = selected;
      container.dataset.recommended = recommended;

      const info = document.createElement('div');
      info.style.cssText = 'font-size:14px;line-height:1.5;margin:14px 0 10px;';
      info.innerHTML = '⭐ Recomendado: <b></b><div>✓ Escolhido: <b></b></div>';
      info.querySelectorAll('b')[0].textContent = typeof equipmentName === 'function' ? equipmentName(recommended) : recommended;
      info.querySelectorAll('b')[1].textContent = typeof equipmentName === 'function' ? equipmentName(selected) : selected;

      const grid = document.createElement('div');
      grid.setAttribute('role','group');
      grid.setAttribute('aria-label', 'Escolher método de confeção');
      setImportant(grid, 'display', 'grid');
      setImportant(grid, 'grid-template-columns', 'repeat(3, minmax(0, 1fr))');
      setImportant(grid, 'gap', '9px');
      setImportant(grid, 'width', '100%');
      setImportant(grid, 'overflow', 'visible');
      METHODS.forEach(([method, text]) => {
        grid.appendChild(buttonFor(method, text, method === selected, method === recommended));
      });
      container.append(info, grid);
      heading.insertAdjacentElement('afterend', container);
      card.querySelectorAll('p.small').forEach(p => {
        if (p.textContent.includes('recomendação deste prato') ||
            p.textContent.includes('Método recomendado')) {
          p.textContent = 'Dourado: escolhido. Contorno verde: recomendado.';
        }
      });
    } catch (error) {
      console.error('Não foi possível apresentar os métodos de confeção:', error);
    }
  }

  function queueUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; apply(); });
  }
  function start() {
    const root = document.getElementById('root');
    if (!root) return;
    new MutationObserver(queueUpdate).observe(root, {childList:true, subtree:true});
    queueUpdate();
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, {once:true});
})();