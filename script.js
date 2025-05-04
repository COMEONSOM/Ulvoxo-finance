document.addEventListener('DOMContentLoaded', () => {
  /* ───── Typewriter with Letter-by-Letter Deletion ───── */
  const headerEl = document.querySelector('.header-text');
  if (headerEl) {
    const fullText = headerEl.textContent.trim();

    // Simple sleep helper
    const wait = ms => new Promise(res => setTimeout(res, ms));

    async function runTypewriter() {
      // 1) Type in characters
      headerEl.textContent = '';
      for (let i = 0; i < fullText.length; i++) {
        headerEl.textContent += fullText[i];
        await wait(80);
      }

      // 2) Brief pause at full text
      await wait(500);

      // 3) Delete one character at a time
      while (headerEl.textContent.length > 0) {
        headerEl.textContent = headerEl.textContent.slice(0, -1);
        await wait(80);
      }

      // 4) Wait 30 seconds, then loop
      await wait(15000);
      runTypewriter();
    }

    runTypewriter();
  }

  /* ───── Card-Star Logic (Optimized) ───── */
  const maxStars   = 5;
  const storageKey = 'starredCards';
  let starredIds   = JSON.parse(localStorage.getItem(storageKey)) || [];

  // Cache map: cardId → its segment element
  const cardSegmentMap = new Map();

  // 1) Record original index & cache segment for each card
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

    // a) Click card to open URL (unless star clicked)
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
        if (starredIds.length < maxStars) {
          starredIds.push(id);
          starBtn.classList.add('starred');
        } else {
          return alert(`You can only star up to ${maxStars} cards.`);
        }
      } else {
        starredIds.splice(idx, 1);
        starBtn.classList.remove('starred');
      }

      localStorage.setItem(storageKey, JSON.stringify(starredIds));
      repositionCard(card);
    });
  });

  /* ───── Helpers ───── */

  // Full segment reorder (initial load)
  function reorderSegment(segment) {
    const cards = Array.from(segment.querySelectorAll('.card'));

    const starred   = cards
      .filter(c => starredIds.includes(c.dataset.id))
      .sort((a, b) => starredIds.indexOf(a.dataset.id) - starredIds.indexOf(b.dataset.id));

    const unstarred = cards
      .filter(c => !starredIds.includes(c.dataset.id))
      .sort((a, b) => Number(a.dataset.origIndex) - Number(b.dataset.origIndex));

    ;[...starred, ...unstarred].forEach(c => segment.appendChild(c));
  }

  // Move a single card to its new spot
  function repositionCard(card) {
    const segment   = cardSegmentMap.get(card.dataset.id);
    if (!segment) return;

    const isStarred = starredIds.includes(card.dataset.id);
    const cards     = Array.from(segment.children).filter(el => el.matches('.card'));

    if (isStarred) {
      // Insert before first unstarred
      const firstUnstar = cards.find(c => !starredIds.includes(c.dataset.id));
      if (firstUnstar) segment.insertBefore(card, firstUnstar);
      else             segment.appendChild(card);
    } else {
      // Return among unstarred in original order
      const origIdx = Number(card.dataset.origIndex);
      const start   = cards.findIndex(c => !starredIds.includes(c.dataset.id));
      let beforeNode = null;

      for (let i = start; i < cards.length; i++) {
        if (Number(cards[i].dataset.origIndex) > origIdx) {
          beforeNode = cards[i];
          break;
        }
      }

      if (beforeNode) segment.insertBefore(card, beforeNode);
      else            segment.appendChild(card);
    }
  }
});
