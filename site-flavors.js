/* ══════════════════════════════════════════════════
   FLAVORS PAGE — rendered from Supabase
   ══════════════════════════════════════════════════ */

(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = window.db ? window.db.esc : ((x) => String(x == null ? '' : x));

  async function init() {
    try {
      const [settings, flavors] = await Promise.all([
        window.DB.getSettings().catch(() => null),
        window.DB.getFlavors().catch(() => [])
      ]);

      if (settings) applySettings(settings);
      if (flavors.length) renderFlavors(flavors);
    } catch (e) {
      console.error('[flavors] failed to load:', e);
    }
  }

  function applySettings(s) {
    setLogo(s);
    setFavicon(s);
  }

  function setLogo(s) {
    const url = s.logo_url;
    if (!url) return;
    $$('.brand-icon').forEach(img => img.src = url);
    const pre = $('#preloader img');
    if (pre) pre.src = url;
  }

  function setFavicon(s) {
    const url = s.favicon_url;
    if (!url) return;
    let link = $('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = url;
  }

  function renderFlavors(flavors) {
    const grid = $('#flavorsGrid');
    if (!grid || !flavors.length) return;

    const sorted = flavors.slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    grid.innerHTML = sorted.map((f, i) =>
      `<div class="flavor-card" style="transition-delay:${i * 60}ms">
         <div class="flavor-top">
           <img class="flavor-scoop" src="${esc(f.image_url)}" alt="${esc(f.name)} ice cream" loading="lazy">
         </div>
         <div class="flavor-info">
           <h4>${esc(f.name)}</h4>
           <span class="flavor-tag">${esc(f.tag)}</span>
         </div>
       </div>`
    ).join('');

    $$('.flavor-card', grid).forEach(el => el.classList.add('revealed'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();