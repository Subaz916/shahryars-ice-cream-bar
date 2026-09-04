/* ══════════════════════════════════════════════════
   MENU PAGE — Premium smooth animated card system
   Lerp tilt, cursor glow, staggered reveals
   ══════════════════════════════════════════════════ */

(async function buildMenu() {
  const container = document.getElementById('menuBlocks');
  if (!container) return;

  let categories = [];
  let items = [];

  try {
    [categories, items] = await Promise.all([window.DB.getCategories(), window.DB.getMenuItems()]);
  } catch (e) {
    console.error('[menu] failed to load:', e);
    return;
  }

  if (!categories.length) return;

  const esc = window.db
    ? window.db.esc
    : (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const itemByCat = {};
  items.forEach(it => {
    (itemByCat[it.category_id] = itemByCat[it.category_id] || []).push(it);
  });

  container.innerHTML = '';

  /* ── Build cards ── */
  categories.forEach((cat, catIdx) => {
    const catItems = (itemByCat[cat.id] || [])
      .slice()
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const card = document.createElement('section');
    card.className = 'menu-card';
    card.id = 'block-' + cat.slug;
    card.style.transitionDelay = (catIdx * 0.1) + 's';

    card.innerHTML = `
      <h2>
        <span class="cat-icon">${esc(cat.icon || '🍨')}</span>
        <span class="cat-label">${esc(cat.name)}</span>
        <span class="cat-count">${catItems.length}</span>
      </h2>
      ${cat.subtitle ? `<div class="card-sub">${esc(cat.subtitle)}</div>` : ''}
      <div class="card-items">
        ${catItems.map((item, i) => {
          const t = (item.tags || '').split(/[,|]/).map(s => s.trim()).filter(Boolean);
          const tags = t.length
            ? t.map(tg => `<span class="item-tag ${tg}">${esc(tg)}</span>`).join('')
            : '';
          return `
            <div class="item" style="transition-delay: ${i * 0.04}s">
              <b>${esc(item.name)}</b>
              ${tags ? `<span class="item-tags">${tags}</span>` : ''}
              <span>${item.is_ask_price ? 'Ask in-store' : esc(item.price_label || '')}</span>
            </div>`;
        }).join('')}
      </div>
      <div class="shine"></div>
    `;

    container.appendChild(card);
  });

  /* ── 1. Staggered card entrance ── */
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('card-visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

  container.querySelectorAll('.menu-card').forEach(card => cardObserver.observe(card));

  /* ── 2. Staggered item reveal ── */
  const itemObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.item');
        items.forEach((item, i) => {
          setTimeout(() => item.classList.add('item-visible'), i * 50);
        });
        itemObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  container.querySelectorAll('.menu-card').forEach(card => itemObserver.observe(card));

  /* ── 3. Smooth magnetic tilt with lerp ── */
  if (!window.matchMedia('(hover: none)').matches) {
    const LERP = 0.08;
    const MAX_TILT = 4;
    const cards = [];

    class CardTilt {
      constructor(el) {
        this.el = el;
        this.shine = el.querySelector('.shine');
        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.currentShineX = 50;
        this.targetShineX = 50;
        this.animating = false;
        this.hovering = false;
      }

      onMove(x, y) {
        const rect = this.el.getBoundingClientRect();
        const px = (x - rect.left) / rect.width;
        const py = (y - rect.top) / rect.height;
        this.targetX = (py - 0.5) * -MAX_TILT;
        this.targetY = (px - 0.5) * MAX_TILT;
        this.targetShineX = px * 100;
        if (!this.animating) this.animate();
      }

      onEnter() {
        this.hovering = true;
        if (this.shine) this.shine.style.opacity = '1';
        this.el.style.willChange = 'transform';
      }

      onLeave() {
        this.hovering = false;
        this.targetX = 0;
        this.targetY = 0;
        this.targetShineX = 50;
        if (!this.animating) this.animate();
      }

      animate() {
        this.animating = true;
        const tick = () => {
          const dx = this.targetX - this.currentX;
          const dy = this.targetY - this.currentY;
          const ds = this.targetShineX - this.currentShineX;

          this.currentX += dx * LERP;
          this.currentY += dy * LERP;
          this.currentShineX += ds * LERP;

          const nearRest = Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01;
          const nearTarget = Math.abs(ds) < 0.1;

          if (this.hovering || !nearRest) {
            const t = `perspective(900px) rotateX(${this.currentX}deg) rotateY(${this.currentY}deg) translateZ(10px)`;
            this.el.style.transform = t;
          }

          if (this.shine && (this.hovering || !nearTarget)) {
            this.shine.style.background =
              `radial-gradient(circle at ${this.currentShineX}% 45%, rgba(36,86,166,0.05) 0%, rgba(255,255,255,0.45) 28%, transparent 58%)`;
          }

          if (nearRest && nearTarget && !this.hovering) {
            this.animating = false;
            this.el.style.transform = '';
            if (this.shine) {
              this.shine.style.background = '';
              this.shine.style.opacity = '0';
            }
            return;
          }

          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }

    container.querySelectorAll('.menu-card').forEach(el => {
      const t = new CardTilt(el);
      cards.push(t);

      el.addEventListener('mouseenter', () => t.onEnter());
      el.addEventListener('mouseleave', () => t.onLeave());
      el.addEventListener('mousemove', (e) => t.onMove(e.clientX, e.clientY));
    });
  }
})();
