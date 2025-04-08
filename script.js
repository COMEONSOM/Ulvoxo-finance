document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.card').forEach(card => {
      // Change cursor for clarity
      card.style.cursor = 'pointer';
  
      // Clicking anywhere on the card opens the URL
      card.addEventListener('click', () => {
        const url = card.dataset.url;
        window.open(url, '_blank');
      });
  
      // If you only want the image to be clickable, use this instead:
      /*
      if (img) {
        img.style.cursor = 'pointer';
        img.addEventListener('click', e => {
          e.stopPropagation();
          window.open(card.dataset.url, '_blank');
        });
      }
      */
    });
  });
  