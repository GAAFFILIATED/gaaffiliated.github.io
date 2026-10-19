(() => {
  const search = document.querySelector('#athlete-search');
  const event = document.querySelector('#event-filter');
  const cards = [...document.querySelectorAll('.athlete')];
  const count = document.querySelector('#athlete-count');
  const empty = document.querySelector('#no-results');
  if (!search || !event || !cards.length || !count || !empty) return;
  function filterRoster() {
    const q = search.value.trim().toLocaleLowerCase();
    const ev = event.value;
    let shown = 0;
    for (const card of cards) {
      const nameMatch = card.dataset.name.includes(q);
      const eventMatch = !ev || card.dataset.events.split('|').includes(ev);
      card.hidden = !(nameMatch && eventMatch);
      if (!card.hidden) shown++;
    }
    count.textContent = `${shown} of ${cards.length} athletes shown`;
    empty.style.display = shown === 0 ? 'block' : 'none';
  }
  search.addEventListener('input', filterRoster);
  event.addEventListener('change', filterRoster);
})();
