/* ══════════════════════════════════════════════════
   HOME PAGE — rendered/bound from Supabase
   Fills settings (logo, favicon, hero, contact), flavors,
   gallery and opening hours from the database.
   ══════════════════════════════════════════════════ */

(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = window.db ? window.db.esc : ((x) => String(x == null ? '' : x));

  function setLogo(settings) {
    const url = settings.logo_url;
    if (!url) return;
    $$('.brand-icon').forEach(img => img.src = url);
    const pre = $('#preloader img');
    if (pre) pre.src = url;
  }

  function setFavicon(settings) {
    const url = settings.favicon_url;
    if (!url) return;
    let link = $('link[rel="icon"]');
    const had = !!link;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = url;
    if (!had && $('link[rel="shortcut icon"]')) $('link[rel="shortcut icon"]').remove();
    document.title = `${settings.brand_name || 'Shahryar'}'s Ice Cream Bar`;
  }

  function applySettings(s) {
    setLogo(s);
    setFavicon(s);

    if (s.hero_pill) {
      const pill = $('.hero-pill');
      if (pill) {
        const dot = pill.querySelector('.pulse-dot');
        pill.innerHTML = dot ? dot.outerHTML + esc(s.hero_pill) : esc(s.hero_pill);
      }
    }
    const h1 = $('.hero-content h1');
    if (h1 && (s.hero_title_1 || s.hero_title_2)) {
      h1.innerHTML = `${esc(s.hero_title_1 || '')}<br><span class="highlight">${esc(s.hero_title_2 || '')}</span>`;
    }
    if (s.tagline) {
      const t = $('.hero-tagline'); if (t) t.textContent = s.tagline;
      const ft = $('#flavors'); // tagline used in footer too
      const fb = $('.footer-brand .fb-tagline'); if (fb) fb.textContent = s.tagline;
    }
    if (s.hero_desc) { const d = $('.hero-desc'); if (d) d.textContent = s.hero_desc; }
    if (s.hero_image) {
      const shot = $('.hero-shot img'); if (shot) { shot.src = s.hero_image; shot.setAttribute('srcset', ''); }
    }
    if (s.og_image) {
      let og = $('meta[property="og:image"]');
      if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:image'); document.head.appendChild(og); }
      og.setAttribute('content', s.og_image);
    }

    if (s.phone) {
      const tel = s.phone.replace(/[^+\d]/g, '');
      $$('a[href^="tel:"]').forEach(a => a.setAttribute('href', 'tel:' + tel));
      $('.contact-row h4') && $$('.cr-info h4').forEach((h, i) => { if (i === 0) { const p = h.parentElement.querySelector('p'); if (p) p.textContent = s.phone; } });
      const fc = $$('.footer-col h4'); // footer contact phone
      const fcols = $$('.footer-col');
      fcols.forEach(col => { const h = col.querySelector('h4'); if (h && h.textContent === 'Contact') { const a = col.querySelector('a[href^="tel:"]'); if (a) a.textContent = s.phone; } });
    }
    if (s.whatsapp) {
      const wa = s.whatsapp.replace(/\D/g, '');
      $$('a[href*="wa.me"]').forEach(a => a.setAttribute('href', 'https://wa.me/' + wa));
    }
    if (s.address) {
      const crAddress = $$('.cr-info p');
      crAddress.forEach(p => { if (p && p.textContent.includes('59200')) { /* noop */ } });
    }
    if (s.rating) {
      const num = parseFloat(s.rating);
      const scoreEls = $$('.stat-num[data-count="4"], .rc-score');
      scoreEls.forEach(el => { if (el.classList.contains('stat-num')) { el.dataset.count = String(num); } else { el.textContent = String(num); } });
      const hs = $('.hs-rating strong'); if (hs && !isNaN(num)) hs.textContent = String(num);
      const rs = $('.hs-rating');
      if (rs) {
        const rev = s.reviews || 705;
        rs.innerHTML = `<span>${stars(num)}</span> <strong>${num}</strong>/5 · ${rev} reviews`;
      }
    }
    if (s.reviews) {
      const revEls = $$('.stat-num[data-count="705"]');
      revEls.forEach(el => el.dataset.count = String(s.reviews));
      const rc = $('.rc-count'); if (rc) rc.textContent = `${s.reviews} reviews on Google`;
      const rh = $('#reviews strong'); if (rh) rh.textContent = `${s.rating||4.4}/5`;
    }
  }

  function stars(n) {
    const v = Math.round(parseFloat(n) || 0);
    return '★'.repeat(v) + '☆'.repeat(Math.max(0, 5 - v));
  }

  function renderFlavors(flavors) {
    const grid = $('#flavors [data-stagger], .flavors-grid');
    const parent = $('.flavors-grid');
    if (!parent || !flavors.length) return;
    const homeOnly = flavors.slice(0, 4);
    parent.setAttribute('data-stagger', '');
    parent.innerHTML = homeOnly.map((f, i) =>
      `<div class="flavor-card" style="transition-delay:${i*80}ms">
        <div class="flavor-top">
          <img class="flavor-scoop" src="${esc(f.image_url)}" alt="${esc(f.name)} ice cream" loading="lazy">
        </div>
        <div class="flavor-info">
          <h4>${esc(f.name)}</h4>
          <span class="flavor-tag">${esc(f.tag)}</span>
        </div>
      </div>`).join('');
    $$('.flavor-card', parent).forEach(el => el.classList.add('revealed'));
  }

  function renderGallery(gallery) {
    const gridEl = $('.gallery-grid');
    if (!gridEl || !gallery.length) return;
    gridEl.innerHTML = gallery.map(g =>
      `<div class="gallery-item ${g.tall ? 'gi-tall' : ''}">
        <img src="${esc(g.image_url)}" alt="${esc(g.caption || 'Gallery image')}" loading="lazy">
        ${g.caption ? `<div class="gallery-overlay"><span class="go-text">${esc(g.caption)}</span></div>` : ''}
      </div>`).join('');
  }

  function renderHours(hours) {
    const grid = $('.hours-grid');
    if (!grid || !hours.length) return;
    const regular = hours.filter(h => h.day !== 5).sort((a,b)=>a.day-b.day);
    const friday = hours.filter(h => h.day === 5);

    const regularCard = buildCard('🍦', 'Mon–Thu + Sat – Sun', '', regular, 'Regular Days', 'hours-weekday', 'left');
    const fridayCard = buildCard('🍨', 'Friday', '', friday, 'Jumu\'ah', 'hours-weekend', 'right');
    grid.setAttribute('data-stagger', '');
    grid.innerHTML = regularCard + fridayCard;
    wireReveal(grid);
  }

  function buildCard(icon, from, to, rows, badge, cls, dir) {
    const open = rows.find(r => r.is_open !== false);
    const o = open ? (open.open || '12:00 PM') : 'Closed';
    const c = open ? (open.close || '12:00 AM') : '—';
    const dayLabel = to ? `<span>${from}</span> – <span>${to}</span>` : `<span>${from}</span>`;
    return (
      `<div class="hours-card ${cls}" data-reveal="${dir}">
        <span class="hc-blob">${icon === '🍦' ? '🍦' : '🍨'}</span>
        <div class="hours-icon">${icon}</div>
        <div class="hours-days">${dayLabel}</div>
        <div class="hours-time">
          <span class="ht-1">${o.split(' ')[0]}</span><b>${o.split(' ')[1] || 'PM'}</b>
          <i>to</i>
          <span class="ht-2">${c.split(' ')[0]}</span><b>${c.split(' ')[1] || 'AM'}</b>
        </div>
        <span class="hours-badge">${badge}</span>
        <div class="hc-shine"></div>
      </div>`
    );
  }

  /* Re-wire scroll reveal for dynamically injected content */
  function wireReveal(root) {
    const els = root ? [].concat($$('[data-reveal]', root), $$('[data-stagger]', root))
                     : $$('[data-reveal]').concat($$('[data-stagger]'));
    if (!els.length || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const t = entry.target;
        if (t.hasAttribute('data-stagger')) {
          Array.from(t.children).forEach((c, i) => { c.style.transitionDelay = `${i * 80}ms`; c.classList.add('revealed'); });
        } else {
          t.classList.add('revealed');
        }
        obs.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  }

  async function init() {
    try {
      const [settings, flavors, gallery, hours] = await Promise.all([
        window.DB.getSettings().catch(() => null),
        window.DB.getFlavors().catch(() => []),
        window.DB.getGallery().catch(() => []),
        window.DB.getOpeningHours().catch(() => [])
      ]);
      if (settings) applySettings(settings);
      if (flavors.length) renderFlavors(flavors);
      if (gallery.length) renderGallery(gallery);
      if (hours.length) renderHours(hours);
    } catch (e) {
      console.error('[home] failed to load Supabase data:', e);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
