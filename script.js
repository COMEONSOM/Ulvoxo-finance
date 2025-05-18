// ─────────────────────────────────────────────────────────────────
// script.js
// ─────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  /* ───────────── Shared Sleep Helper ───────────── */
  const wait = ms => new Promise(res => setTimeout(res, ms));

  /* ───────────── Typewriter on Header & Footer ───────────── */
  function attachTypewriter(el) {
    const fullText = el.textContent.trim();
    async function runTypewriter() {
      el.textContent = '';
      for (let ch of fullText) {
        el.textContent += ch;
        await wait(75);
      }
      await wait(500);
      while (el.textContent.length) {
        el.textContent = el.textContent.slice(0, -1);
        await wait(80);
      }
      await wait(30000);
      runTypewriter();
    }
    runTypewriter();
  }
  document
    .querySelectorAll('.header-text, .footer-slogan')
    .forEach(el => attachTypewriter(el));

  /* ───────────── Card-Star Logic ───────────── */
  // Only run on pages that have at least one .segment
  if (document.querySelector('.segment')) {
    const maxStars     = 5;
    const storageKey   = 'starredCards';
    let starredIds     = JSON.parse(localStorage.getItem(storageKey)) || [];
    const cardSegmentMap = new Map();

    // Define helpers BEFORE using them
    function reorderSegment(segment) {
      const cards     = Array.from(segment.querySelectorAll('.card'));
      const starred   = cards
        .filter(c => starredIds.includes(c.dataset.id))
        .sort((a, b) => starredIds.indexOf(a.dataset.id) - starredIds.indexOf(b.dataset.id));
      const unstarred = cards
        .filter(c => !starredIds.includes(c.dataset.id))
        .sort((a, b) => Number(a.dataset.origIndex) - Number(b.dataset.origIndex));
      [...starred, ...unstarred].forEach(c => segment.appendChild(c));
    }

    function repositionCard(card) {
      const segment = cardSegmentMap.get(card.dataset.id);
      if (!segment) return;
      const isStarred = starredIds.includes(card.dataset.id);
      const cards     = Array.from(segment.children).filter(el => el.matches('.card'));

      if (isStarred) {
        const firstUn = cards.find(c => !starredIds.includes(c.dataset.id));
        firstUn ? segment.insertBefore(card, firstUn) : segment.appendChild(card);
      } else {
        const origIdx = Number(card.dataset.origIndex);
        const start   = cards.findIndex(c => !starredIds.includes(c.dataset.id));
        let beforeNode = null;
        for (let i = start; i < cards.length; i++) {
          if (Number(cards[i].dataset.origIndex) > origIdx) {
            beforeNode = cards[i];
            break;
          }
        }
        beforeNode ? segment.insertBefore(card, beforeNode) : segment.appendChild(card);
      }
    }

    // Initialize positions & data
    document.querySelectorAll('.segment').forEach(segment => {
      segment.querySelectorAll('.card').forEach((card, idx) => {
        card.dataset.origIndex = idx;
        cardSegmentMap.set(card.dataset.id, segment);
      });
    });

    // Restore starred state
    starredIds.forEach(id => {
      const card = document.querySelector(`.card[data-id="${id}"]`);
      card?.querySelector('.star-btn')?.classList.add('starred');
    });

    // Initial ordering
    document.querySelectorAll('.segment').forEach(reorderSegment);

    // Wire up events
    document.querySelectorAll('.card').forEach(card => {
      const id      = card.dataset.id;
      const starBtn = card.querySelector('.star-btn');
      if (!starBtn) return;  // skip cards without star buttons

      card.addEventListener('click', e => {
        if (!e.target.classList.contains('star-btn')) {
          const url = card.dataset.url?.trim();
          if (url) window.open(url, '_blank');
        }
      });

      starBtn.addEventListener('click', e => {
        e.stopPropagation();
        const idx = starredIds.indexOf(id);

        if (idx === -1) {
          if (starredIds.length < maxStars) {
            starredIds.push(id);
            starBtn.classList.add('starred');
          } else {
            alert(`You can only star up to ${maxStars} cards.`);
            return;
          }
        } else {
          starredIds.splice(idx, 1);
          starBtn.classList.remove('starred');
        }

        localStorage.setItem(storageKey, JSON.stringify(starredIds));
        repositionCard(card);
      });
    });
  }

 /* ───────────── Navbar Load & Sticky ───────────── */
const navContainer = document.getElementById('navbar-container');
if (navContainer) {
  fetch('/navbar.html')
    .then(r => r.text())
    .then(html => {
      navContainer.innerHTML = html;
      window.renderAuthLinks?.();
    })
    .catch(console.error);
}

  /* ───────────── Feedback Button ───────────── */
  const fb = document.getElementById('feedback-btn');
  fb?.addEventListener('click', () => {
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLSeWE8WgYihcfL5IQLv_qKCfGrwO5QQJMOua2QIvD4XFzBM4hQ/viewform?usp=header',
      '_blank'
    );
  });
}); // DOMContentLoaded
