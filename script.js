document.addEventListener('DOMContentLoaded', () => {
  const maxStars   = 5;
  const storageKey = 'starredCards';
  let starredIds   = JSON.parse(localStorage.getItem(storageKey)) || [];

  // 🚀 CACHES
  // Map<cardId, segmentElement>
  const cardSegmentMap = new Map();

  // 1) Record each card's original index and cache its segment
  document.querySelectorAll('.segment').forEach(segment => {
    segment.querySelectorAll('.card').forEach((card, idx) => {
      card.dataset.origIndex = idx;
      cardSegmentMap.set(card.dataset.id, segment);
    });
  });

  // 2) Initialize starred buttons
  starredIds.forEach(id => {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) card.querySelector('.star-btn').classList.add('starred');
  });

  // 3) One-time full reorder per segment on load
  document.querySelectorAll('.segment').forEach(segment => {
    reorderSegment(segment);
  });

  // 4) Wire up each card
  document.querySelectorAll('.card').forEach(card => {
    const id      = card.dataset.id;
    const starBtn = card.querySelector('.star-btn');

    // a) Open URL on card click (unless star clicked)
    card.addEventListener('click', e => {
      if (!e.target.classList.contains('star-btn')) {
        const url = card.dataset.url?.trim();
        if (url) window.open(url, '_blank');
      }
    });

    // b) Star/unstar toggle
    starBtn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = starredIds.indexOf(id);

      if (idx === -1) {
        // Star it
        if (starredIds.length < maxStars) {
          starredIds.push(id);
          starBtn.classList.add('starred');
        } else {
          return alert(`You can only star up to ${maxStars} cards.`);
        }
      } else {
        // Unstar it
        starredIds.splice(idx, 1);
        starBtn.classList.remove('starred');
      }

      // Persist & move only this card
      localStorage.setItem(storageKey, JSON.stringify(starredIds));
      repositionCard(card);
    });
  });

  // —— HELPERS —— //

  // Full segment reorder (used only on initial load)
  function reorderSegment(segment) {
    const cards = Array.from(segment.querySelectorAll('.card'));

    const starred   = cards
      .filter(c => starredIds.includes(c.dataset.id))
      .sort((a,b) => starredIds.indexOf(a.dataset.id)
                  - starredIds.indexOf(b.dataset.id));

    const unstarred = cards
      .filter(c => !starredIds.includes(c.dataset.id))
      .sort((a,b) => Number(a.dataset.origIndex)
                  - Number(b.dataset.origIndex));

    ;[...starred, ...unstarred].forEach(c => segment.appendChild(c));
  }

  // Move a single card into its new spot
  function repositionCard(card) {
    const segment = cardSegmentMap.get(card.dataset.id);
    if (!segment) return;

    const isStarred = starredIds.includes(card.dataset.id);
    const children  = Array.from(segment.children)
                           .filter(el => el.matches('.card'));

    if (isStarred) {
      // Move to just before the first unstarred
      const firstUnstarIdx = children.findIndex(c => !starredIds.includes(c.dataset.id));
      if (firstUnstarIdx !== -1) {
        segment.insertBefore(card, children[firstUnstarIdx]);
      } else {
        segment.appendChild(card);
      }
    } else {
      // Move back among unstarred in original order
      const origIdx = Number(card.dataset.origIndex);
      // Find first unstarred whose origIndex > this
      const start = children.findIndex(c => !starredIds.includes(c.dataset.id));
      let insertBeforeNode = null;

      for (let i = start; i < children.length; i++) {
        const c = children[i];
        if (Number(c.dataset.origIndex) > origIdx) {
          insertBeforeNode = c;
          break;
        }
      }

      if (insertBeforeNode) {
        segment.insertBefore(card, insertBeforeNode);
      } else {
        segment.appendChild(card);
      }
    }
  }
});
