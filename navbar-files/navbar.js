// navbar.js
window.initNavbarToggle = function initNavbarToggle() {
  const menuBtn      = document.getElementById('menuBtn');
  const menuDropdown = document.getElementById('menuDropdown');
  if (!menuBtn || !menuDropdown) return;

  // remove any old handlers (in case this gets called twice)
  menuBtn.replaceWith(menuBtn.cloneNode(true));
  const freshBtn = document.getElementById('menuBtn');

  freshBtn.addEventListener('click', () => {
    const isOpen = freshBtn.getAttribute('aria-expanded') === 'true';
    freshBtn.setAttribute('aria-expanded', String(!isOpen));
    menuDropdown.setAttribute('aria-hidden', String(isOpen));
    menuDropdown.classList.toggle('open', !isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!freshBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
      freshBtn.setAttribute('aria-expanded', 'false');
      menuDropdown.setAttribute('aria-hidden', 'true');
      menuDropdown.classList.remove('open');
    }
  });
};
