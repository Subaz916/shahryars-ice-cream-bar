/* ══════════════════════════════════════════════════
   POPUP — announcement modals on website open
   Shows active popups every time a page is opened.
   Multiple popups rotate every 3 seconds.
   ══════════════════════════════════════════════════ */

(function () {
  const $ = (s) => document.querySelector(s);

  const ROTATE_MS = 3000;
  const ENTER_DELAY = 1200; // let the preloader finish first

  function init() {
    const overlay = $('#popupOverlay');
    if (!overlay || !window.DB) return;

    window.DB.getPopups()
      .catch(() => [])
      .then((popups) => {
        const list = (popups || []).filter(p => p.enabled && p.image_url);
        if (!list.length) return;

        startCarousel(overlay, list);
      });
  }

  function startCarousel(overlay, popups) {
    const modal = $('#popupModal');
    const img = $('#popupImg');
    const title = $('#popupTitle');
    const link = $('#popupLink');
    const close = $('#popupClose');
    const dotsWrap = $('#popupDots');

    let index = 0;
    let timer = null;

    function renderDots() {
      dotsWrap.innerHTML = popups.map((_, i) =>
        `<span class="popup-dot${i === index ? ' active' : ''}" data-idx="${i}"></span>`).join('');
      dotsWrap.querySelectorAll('.popup-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          clearInterval(timer);
          goTo(parseInt(dot.dataset.idx, 10));
          timer = setInterval(next, ROTATE_MS);
        });
      });
    }

    function show(idx) {
      const p = popups[idx];
      img.src = p.image_url;
      img.alt = p.caption || 'Announcement';
      title.textContent = p.caption || '';
      title.style.display = p.caption ? '' : 'none';
      if (p.link) {
        link.href = p.link;
        link.hidden = false;
      } else {
        link.removeAttribute('href');
        link.hidden = true;
      }
      const active = dotsWrap.querySelectorAll('.popup-dot');
      active.forEach((d, i) => d.classList.toggle('active', i === idx));
    }

    function goTo(idx) {
      modal.classList.add('fading');
      setTimeout(() => {
        index = idx;
        show(index);
        modal.classList.remove('fading');
        modal.classList.remove('entering');
        void modal.offsetWidth;
        modal.classList.add('entering');
      }, 300);
    }

    function next() {
      if (index < popups.length - 1) {
        goTo(index + 1);
      } else {
        finish();
      }
    }

    function finish() {
      closePopup();
    }

    function closePopup() {
      overlay.classList.add('closing');
      setTimeout(() => {
        overlay.hidden = true;
        document.body.style.overflow = '';
      }, 350);
    }

    renderDots();
    show(0);

    setTimeout(() => {
      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      // force reflow so the entrance animation plays
      requestAnimationFrame(() => overlay.classList.add('visible'));
      if (popups.length > 1) timer = setInterval(next, ROTATE_MS);
    }, ENTER_DELAY);

    close.addEventListener('click', () => {
      clearInterval(timer);
      closePopup();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        clearInterval(timer);
        closePopup();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.hidden) {
        clearInterval(timer);
        closePopup();
      }
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();