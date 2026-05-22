(function () {
  const searchInput = document.getElementById('site-search');
  const hubCards = Array.from(document.querySelectorAll('.resource-card'));
  const repCards = Array.from(document.querySelectorAll('.rep-card'));
  const filterButtons = Array.from(document.querySelectorAll('.filter-buttons button'));
  let activeFilter = 'all';

  function applyFilters() {
    const term = (searchInput?.value || '').trim().toLowerCase();

    hubCards.forEach((card) => {
      const txt = (card.dataset.search + ' ' + card.textContent).toLowerCase();
      card.hidden = term && !txt.includes(term);
    });

    repCards.forEach((card) => {
      const group = (card.dataset.group || '').toLowerCase();
      const txt = (group + ' ' + card.textContent).toLowerCase();
      const matchesFilter = activeFilter === 'all' || group.includes(activeFilter);
      const matchesTerm = !term || txt.includes(term);
      card.hidden = !(matchesFilter && matchesTerm);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((btn) => {
        const selected = btn === button;
        btn.classList.toggle('is-active', selected);
        btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });
      applyFilters();
    });
  });

  searchInput?.addEventListener('input', applyFilters);
  // TODO: Integrate with backend/full-site search when available.
  applyFilters();
})();
