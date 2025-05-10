document.addEventListener('DOMContentLoaded', () => {
  /* ───────────── Shared Sleep Helper ───────────── */
  const wait = ms => new Promise(res => setTimeout(res, ms));

  /* ───────────── Typewriter on Header & Footer ───────────── */
  function attachTypewriter(el) {
    const fullText = el.textContent.trim();

    async function runTypewriter() {
      // 1) Type in
      el.textContent = '';
      for (let ch of fullText) {
        el.textContent += ch;
        await wait(75);
      }

      // 2) Pause
      await wait(500);

      // 3) Delete
      while (el.textContent.length > 0) {
        el.textContent = el.textContent.slice(0, -1);
        await wait(80);
      }

      // 4) Wait then loop
      await wait(7500);
      runTypewriter();
    }

    runTypewriter();
  }

  // target both header-text and footer-slogan
  document
    .querySelectorAll('.header-text, .footer-slogan')
    .forEach(el => attachTypewriter(el));


  /* ───────────── Card‑Star Logic (unchanged) ───────────── */
  const maxStars   = 5;
  const storageKey = 'starredCards';
  let starredIds   = JSON.parse(localStorage.getItem(storageKey)) || [];
  const cardSegmentMap = new Map();

  document.querySelectorAll('.segment').forEach(segment => {
    segment.querySelectorAll('.card').forEach((card, idx) => {
      card.dataset.origIndex = idx;
      cardSegmentMap.set(card.dataset.id, segment);
    });
  });

  starredIds.forEach(id => {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) card.querySelector('.star-btn').classList.add('starred');
  });

  document.querySelectorAll('.segment').forEach(reorderSegment);

  document.querySelectorAll('.card').forEach(card => {
    const id      = card.dataset.id;
    const starBtn = card.querySelector('.star-btn');

    // open on card click
    card.addEventListener('click', e => {
      if (!e.target.classList.contains('star-btn')) {
        const url = card.dataset.url?.trim();
        if (url) window.open(url, '_blank');
      }
    });

    // star/unstar
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

  function reorderSegment(segment) {
    const cards = Array.from(segment.querySelectorAll('.card'));
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
      const firstUnstar = cards.find(c => !starredIds.includes(c.dataset.id));
      if (firstUnstar) segment.insertBefore(card, firstUnstar);
      else             segment.appendChild(card);
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
      if (beforeNode) segment.insertBefore(card, beforeNode);
      else            segment.appendChild(card);
    }
  }
  /* ───────────── Navbar Load & Sticky ───────────── */
  fetch('navbar.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('navbar-container').innerHTML = html;
      window.addEventListener('scroll', () => {
        const nav = document.querySelector('.site-navbar');
        nav && nav.classList.toggle('sticky', window.scrollY > 10);
      });
    })
    .catch(err => console.error('Navbar load error:', err));

  /* ───────────── Feedback Button ───────────── */
  const fb = document.getElementById('feedback-btn');
  if (fb) {
    fb.addEventListener('click', () => {
      window.open('https://docs.google.com/forms/d/e/1FAIpQLSeWE8WgYihcfL5IQLv_qKCfGrwO5QQJMOua2QIvD4XFzBM4hQ/viewform?usp=header', '_blank');
    });
  }
});
