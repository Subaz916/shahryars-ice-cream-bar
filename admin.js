/* ══════════════════════════════════════════════════
   ADMIN PANEL — full CRUD via Supabase with PIN login
   ═══════════════════════════════════════════════════ */

(function () {
  const D = window.DB;
  const esc = window.db ? window.db.esc : ((x) => String(x == null ? '' : x));

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  let categories = [];
  let adminPin = '';

  const VALID_PHONE = '03337254555';
  const SESSION_KEY = 'admin_authenticated';

  /* ── Toast ── */
  let toastTimer;
  function toast(msg, type) {
    const el = $('#toast');
    el.textContent = msg;
    el.className = 'toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.className = 'toast', 2600);
  }

  /* ── Connection status ── */
  function setConn(ok, msg) {
    const el = $('#connStatus');
    if (ok) { el.className = 'conn-badge ok'; el.textContent = msg || 'Connected'; }
    else { el.className = 'conn-badge err'; el.textContent = msg || 'Error'; }
  }

  /* ── Login Flow ── */
  function checkSession() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }

  function setSession() {
    sessionStorage.setItem(SESSION_KEY, 'true');
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function showLoginOverlay() {
    console.log('[admin] showLoginOverlay called');
    $('#adminLoginOverlay').classList.remove('hidden');
    $('#loginPhone').value = '';
    $('#loginPin').value = '';
    $('#phoneError').textContent = '';
    $('#pinError').textContent = '';
    $('#loginStepPhone').classList.remove('hidden');
    $('#loginStepPin').classList.add('hidden');
    setTimeout(() => $('#loginPhone').focus(), 100);
  }

  function hideLoginOverlay() {
    $('#adminLoginOverlay').classList.add('hidden');
  }

  async function loadAdminPin() {
    try {
      const settings = await D.getSettings();
      console.log('[admin] Settings loaded:', settings);
      if (settings && settings.admin_pin) {
        adminPin = String(settings.admin_pin);
        console.log('[admin] PIN loaded from DB:', adminPin);
      } else {
        adminPin = '4555';
        console.log('[admin] No PIN in DB, using default:', adminPin);
        try { await D.setSettings({ admin_pin: adminPin }); } catch (_) {}
      }
    } catch (e) {
      console.error('[admin] Failed to load PIN:', e);
      adminPin = '4555';
    }
  }

  async function initLogin() {
    clearSession(); // require login on each open
    if (checkSession()) {
      hideLoginOverlay();
      initAdmin();
      return;
    }

    await loadAdminPin();
    showLoginOverlay();

    /* Phone step */
    $('#btnPhoneNext').addEventListener('click', () => {
      const phone = $('#loginPhone').value.trim().replace(/\D/g, '');
      console.log('[admin] Phone entered:', phone, 'Expected:', VALID_PHONE);
      $('#phoneError').textContent = '';
      if (phone === VALID_PHONE) {
        $('#loginStepPhone').classList.add('hidden');
        $('#loginStepPin').classList.remove('hidden');
        setTimeout(() => $('#loginPin').focus(), 100);
      } else {
        $('#phoneError').textContent = 'Invalid phone number';
        $('#loginPhone').focus();
      }
    });

    $('#loginPhone').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('#btnPhoneNext').click();
    });

    /* PIN step */
    $('#btnPinSubmit').addEventListener('click', () => {
      const pin = $('#loginPin').value.trim();
      console.log('[admin] PIN entered:', pin, 'Expected:', adminPin);
      $('#pinError').textContent = '';
      if (pin === adminPin) {
        setSession();
        hideLoginOverlay();
        initAdmin();
      } else {
        $('#pinError').textContent = 'Incorrect PIN';
        $('#loginPin').value = '';
        $('#loginPin').focus();
      }
    });

    $('#btnPinBack').addEventListener('click', () => {
      $('#loginStepPin').classList.add('hidden');
      $('#loginStepPhone').classList.remove('hidden');
      $('#loginPhone').focus();
    });

    $('#loginPin').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('#btnPinSubmit').click();
    });
  }

  /* ── Tabs ── */
  $$('#adminTabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#adminTabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $$('.admin-panel').forEach(p => p.classList.remove('active'));
      $('#panel-' + btn.dataset.tab).classList.add('active');
    });
  });

  /* ── Logout (event delegation) ── */
  document.addEventListener('click', (e) => {
    if (e.target.closest('#btnLogout')) {
      console.log('[admin] Logout clicked');
      clearSession();
      showLoginOverlay();
      console.log('[admin] Overlay shown:', !$('#adminLoginOverlay').classList.contains('hidden'));
    }
  });

  /* ══════════════ MENU ITEMS ══════════════ */
  async function loadMenu() {
    try {
      const [items, cats] = await Promise.all([D.getMenuItems(), D.getCategories()]);
      categories = cats;
      const list = $('#menuList');
      if (!items.length) { list.innerHTML = '<p class="empty">No items yet. Click "Add Item".</p>'; return; }
      const catName = (id) => { const c = cats.find(x => x.id === id); return c ? c.name : '—'; };
      const catSlug = (id) => { const c = cats.find(x => x.id === id); return c ? c.slug : ''; };
      list.innerHTML = items.map(it => {
        const badge = it.is_ask_price ? 'border:1px dashed var(--gray);padding:3px 9px;border-radius:6px;color:var(--gray);' : '';
        return `<div class="admin-card" data-id="${it.id}">
          <div class="g-info">
            <h4>${esc(it.icon ? it.icon + ' ' : (it.sort_order ? ('' + it.sort_order).padStart(2,'0') + ' ' : ''))}${esc(it.name)}</h4>
            <div class="sub">${esc(catName(it.category_id))}${it.description ? ' · ' + esc(it.description) : ''}</div>
            <div class="sub" style="margin-top:6px;">
              <span class="badge badge-blue">${catSlug(it.category_id)}</span>
              ${it.is_ask_price ? `<span class="badge badge-gray" style="${badge}">Ask in-store</span>` : `<span class="badge badge-gray">${esc(it.price_label || '')}</span>`}
            </div>
          </div>
          <div class="g-actions">
            <button class="a-btn a-btn-ghost" data-act="edit-menu" data-id="${it.id}">Edit</button>
            <button class="a-btn a-btn-danger" data-act="del-menu" data-id="${it.id}">Delete</button>
          </div>
        </div>`;
      }).join('');
    } catch (e) { $('#menuList').innerHTML = '<p class="empty">Failed to load menu.</p>'; toast('Failed to load menu', 'err'); }
  }

  function renderMenuForm(it) {
    const form = $('#menuForm');
    form.classList.remove('hidden');
    form.innerHTML = `<h3>${it ? 'Edit Item' : 'Add Menu Item'}</h3>
      <div class="grid-2">
        <div class="a-field"><label>Item Name *</label><input id="f-menu-name" value="${esc(it ? it.name : '')}" placeholder="e.g. Double Scoop Cup"></div>
        <div class="a-field"><label>Category</label><select id="f-menu-cat">${categories.map(c => `<option value="${c.id}" ${it && it.category_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      </div>
      <div class="a-field"><label>Description</label><input id="f-menu-desc" value="${esc(it ? it.description : '')}" placeholder="e.g. Creamy vanilla with real chips"></div>
      <div class="grid-3">
        <div class="a-field"><label>Icon (emoji, optional)</label><input id="f-menu-icon" value="${esc(it ? it.icon || '' : '')}" placeholder="🥤"></div>
        <div class="a-field"><label>Tags (comma separated)</label><input id="f-menu-tags" value="${esc(it ? it.tags || '' : '')}" placeholder="special,Popular"></div>
        <div class="a-field"><label>Price Label</label><input id="f-menu-price" value="${esc(it ? it.price_label || '' : '')}" placeholder="Rs. 140"></div>
      </div>
      <div class="grid-2">
        <div class="a-field"><label>Sort Order (number)</label><input id="f-menu-sort" type="number" value="${it ? (it.sort_order || 0) : 0}"></div>
        <div class="check-row"><input type="checkbox" id="f-menu-ask" ${it && it.is_ask_price ? 'checked' : ''}><label for="f-menu-ask">Show "Ask in-store" instead of price</label></div>
      </div>
      <div class="actions">
        <button class="a-btn a-btn-ghost" id="btn-cancel-menu">Cancel</button>
        <button class="a-btn a-btn-success" id="btn-save-menu">${it ? 'Save Changes' : 'Add Item'}</button>
      </div>`;

    $('#btn-cancel-menu').addEventListener('click', () => { form.classList.add('hidden'); form.innerHTML = ''; });
    $('#btn-save-menu').addEventListener('click', async () => {
      const payload = {
        category_id: $('#f-menu-cat').value,
        name: $('#f-menu-name').value.trim() || null,
        description: $('#f-menu-desc').value.trim(),
        icon: $('#f-menu-icon').value.trim(),
        tags: $('#f-menu-tags').value.trim(),
        price_label: $('#f-menu-price').value.trim(),
        is_ask_price: $('#f-menu-ask').checked,
        sort_order: parseInt($('#f-menu-sort').value, 10) || 0
      };
      if (!payload.name) { toast('Name is required', 'err'); return; }
      try {
        if (it) { await D.update('menu_items', it.id, payload); toast('Item updated', 'ok'); }
        else { await D.insert('menu_items', payload); toast('Item added', 'ok'); }
        form.classList.add('hidden'); form.innerHTML = '';
        loadMenu();
      } catch (e) { toast('Save failed: ' + (e.message || e), 'err'); }
    });
  }

  /* ══════════════ CATEGORIES ══════════════ */
  async function loadCats() {
    try {
      categories = await D.getCategories();
      const list = $('#catList');
      if (!categories.length) { list.innerHTML = '<p class="empty">No categories yet.</p>'; return; }
      list.innerHTML = categories.map(c => `<div class="admin-card">
        <span style="font-size:1.4rem">${esc(c.icon || '🍨')}</span>
        <div class="g-info"><h4>${esc(c.name)}</h4><div class="sub">${esc(c.slug)} · ${esc(c.subtitle || '')}</div></div>
        <div class="g-actions">
          <button class="a-btn a-btn-ghost" data-act="edit-cat" data-id="${c.id}">Edit</button>
          <button class="a-btn a-btn-danger" data-act="del-cat" data-id="${c.id}">Delete</button>
        </div>
      </div>`).join('');
    } catch (e) { $('#catList').innerHTML = '<p class="empty">Failed to load.</p>'; }
  }

  function renderCatForm(c) {
    const form = $('#catForm');
    form.classList.remove('hidden');
    form.innerHTML = `<h3>${c ? 'Edit Category' : 'Add Category'}</h3>
      <div class="grid-2">
        <div class="a-field"><label>Name *</label><input id="f-cat-name" value="${esc(c ? c.name : '')}" placeholder="e.g. Scoops"></div>
        <div class="a-field"><label>Icon</label><input id="f-cat-icon" value="${esc(c ? c.icon || '' : '')}" placeholder="🍨"></div>
      </div>
      <div class="grid-2">
        <div class="a-field"><label>Slug (unique, no spaces)</label><input id="f-cat-slug" value="${esc(c ? c.slug : '')}" placeholder="cat-scoops"></div>
        <div class="a-field"><label>Sort Order</label><input id="f-cat-sort" type="number" value="${c ? (c.sort_order || 0) : 0}"></div>
      </div>
      <div class="a-field"><label>Subtitle</label><input id="f-cat-sub" value="${esc(c ? c.subtitle || '' : '')}" placeholder="Single scoops to five scoops"></div>
      <div class="actions">
        <button class="a-btn a-btn-ghost" id="btn-cancel-cat">Cancel</button>
        <button class="a-btn a-btn-success" id="btn-save-cat">${c ? 'Save Changes' : 'Add Category'}</button>
      </div>`;
    $('#btn-cancel-cat').addEventListener('click', () => { form.classList.add('hidden'); form.innerHTML = ''; });
    $('#btn-save-cat').addEventListener('click', async () => {
      const payload = {
        name: $('#f-cat-name').value.trim(),
        icon: $('#f-cat-icon').value.trim(),
        slug: $('#f-cat-slug').value.trim(),
        subtitle: $('#f-cat-sub').value.trim(),
        sort_order: parseInt($('#f-cat-sort').value, 10) || 0
      };
      if (!payload.name || !payload.slug) { toast('Name and slug are required', 'err'); return; }
      try {
        if (c) { await D.update('categories', c.id, payload); toast('Category updated', 'ok'); }
        else { await D.insert('categories', payload); toast('Category added', 'ok'); }
        form.classList.add('hidden'); form.innerHTML = '';
        loadCats(); loadMenu();
      } catch (e) { toast('Save failed: ' + (e.message || e), 'err'); }
    });
  }

  /* ══════════════ FLAVORS ══════════════ */
  async function loadFlavors() {
    try {
      const flavors = await D.getFlavors();
      const list = $('#flavorList');
      if (!flavors.length) { list.innerHTML = '<p class="empty">No flavors yet.</p>'; return; }
      list.innerHTML = flavors.map(f => `<div class="admin-card">
        <img class="thumb" src="${esc(f.image_url)}" alt="${esc(f.name)}">
        <div class="g-info"><h4>${esc(f.name)}</h4><div class="sub">${esc(f.tag || '')}</div><a class="sub" href="${esc(f.image_url)}" target="_blank" rel="noopener">${esc(f.image_url && f.image_url.length > 45 ? f.image_url.slice(0, 45) + '…' : f.image_url)}</a></div>
        <div class="g-actions">
          <button class="a-btn a-btn-ghost" data-act="edit-flavor" data-id="${f.id}">Edit</button>
          <button class="a-btn a-btn-danger" data-act="del-flavor" data-id="${f.id}">Delete</button>
        </div>
      </div>`).join('');
    } catch (e) { $('#flavorList').innerHTML = '<p class="empty">Failed to load.</p>'; }
  }

  function renderFlavorForm(f) {
    const form = $('#flavorForm');
    form.classList.remove('hidden');
    form.innerHTML = `<h3>${f ? 'Edit Flavor' : 'Add Flavor'}</h3>
      <div class="grid-2">
        <div class="a-field"><label>Name *</label><input id="f-fl-name" value="${esc(f ? f.name : '')}" placeholder="e.g. Pista"></div>
        <div class="a-field"><label>Sort Order</label><input id="f-fl-sort" type="number" value="${f ? (f.sort_order || 0) : 0}"></div>
      </div>
      <div class="a-field"><label>Tag / Short description</label><input id="f-fl-tag" value="${esc(f ? f.tag || '' : '')}" placeholder="Rich & nutty green pistachio"></div>
      <div class="a-field"><label>Image URL *</label><input id="f-fl-img" value="${esc(f ? f.image_url || '' : '')}" placeholder="https://...jpg"><small style="color:var(--gray)">Paste a direct image URL.</small></div>
      <div class="actions">
        <button class="a-btn a-btn-ghost" id="btn-cancel-fl">Cancel</button>
        <button class="a-btn a-btn-success" id="btn-save-fl">${f ? 'Save Changes' : 'Add Flavor'}</button>
      </div>`;
    $('#btn-cancel-fl').addEventListener('click', () => { form.classList.add('hidden'); form.innerHTML = ''; });
    $('#btn-save-fl').addEventListener('click', async () => {
      const payload = {
        name: $('#f-fl-name').value.trim(),
        tag: $('#f-fl-tag').value.trim(),
        image_url: $('#f-fl-img').value.trim(),
        sort_order: parseInt($('#f-fl-sort').value, 10) || 0
      };
      if (!payload.name || !payload.image_url) { toast('Name and image URL are required', 'err'); return; }
      try {
        if (f) { await D.update('flavors', f.id, payload); toast('Flavor updated', 'ok'); }
        else { await D.insert('flavors', payload); toast('Flavor added', 'ok'); }
        form.classList.add('hidden'); form.innerHTML = '';
        loadFlavors();
      } catch (e) { toast('Save failed: ' + (e.message || e), 'err'); }
    });
  }

  /* ══════════════ GALLERY ══════════════ */
  async function loadGallery() {
    try {
      const gallery = await D.getGallery();
      const list = $('#galleryList');
      if (!gallery.length) { list.innerHTML = '<p class="empty">No gallery images yet.</p>'; return; }
      list.innerHTML = gallery.map(g => `<div class="admin-card gallery-card">
        <img class="thumb" src="${esc(g.image_url)}" alt="${esc(g.caption || 'Gallery')}">
        <div class="g-info"><h4>${esc(g.caption || 'Untitled')}</h4>${g.tall ? '<div class="sub">Tall card</div>' : ''}</div>
        <div class="g-actions">
          <button class="a-btn a-btn-ghost" data-act="edit-gallery" data-id="${g.id}">Edit</button>
          <button class="a-btn a-btn-danger" data-act="del-gallery" data-id="${g.id}">Delete</button>
        </div>
      </div>`).join('');
    } catch (e) { $('#galleryList').innerHTML = '<p class="empty">Failed to load.</p>'; }
  }

  function renderGalleryForm(g) {
    const form = $('#galleryForm');
    form.classList.remove('hidden');
    form.innerHTML = `<h3>${g ? 'Edit Gallery Image' : 'Add Gallery Image'}</h3>
      <div class="a-field"><label>Image URL *</label><input id="f-gal-img" value="${esc(g ? g.image_url || '' : '')}" placeholder="https://...jpg"><small style="color:var(--gray)">Paste a direct image URL.</small></div>
      <div class="grid-2">
        <div class="a-field"><label>Caption</label><input id="f-gal-cap" value="${esc(g ? g.caption || '' : '')}" placeholder="e.g. Flavor Display"></div>
        <div class="a-field"><label>Sort Order</label><input id="f-gal-sort" type="number" value="${g ? (g.sort_order || 0) : 0}"></div>
      </div>
      <div class="check-row"><input type="checkbox" id="f-gal-tall" ${g && g.tall ? 'checked' : ''}><label for="f-gal-tall">Make this a tall card (first large image)</label></div>
      <div class="actions">
        <button class="a-btn a-btn-ghost" id="btn-cancel-gal">Cancel</button>
        <button class="a-btn a-btn-success" id="btn-save-gal">${g ? 'Save Changes' : 'Add Image'}</button>
      </div>`;
    $('#btn-cancel-gal').addEventListener('click', () => { form.classList.add('hidden'); form.innerHTML = ''; });
    $('#btn-save-gal').addEventListener('click', async () => {
      const payload = {
        image_url: $('#f-gal-img').value.trim(),
        caption: $('#f-gal-cap').value.trim(),
        tall: $('#f-gal-tall').checked,
        sort_order: parseInt($('#f-gal-sort').value, 10) || 0
      };
      if (!payload.image_url) { toast('Image URL is required', 'err'); return; }
      try {
        if (g) { await D.update('gallery', g.id, payload); toast('Image updated', 'ok'); }
        else { await D.insert('gallery', payload); toast('Image added', 'ok'); }
        form.classList.add('hidden'); form.innerHTML = '';
        loadGallery();
      } catch (e) { toast('Save failed: ' + (e.message || e), 'err'); }
    });
  }

  /* ══════════════ OPENING HOURS ══════════════ */
  async function loadHours() {
    try {
      const hours = await D.getOpeningHours();
      const list = $('#hoursList');
      if (!hours.length) { list.innerHTML = '<p class="empty">No hours configured.</p>'; return; }
      const regular = hours.filter(h => h.day !== 5).sort((a,b) => a.day - b.day);
      const friday = hours.find(h => h.day === 5);
      const regRef = regular[0] || {};
      list.innerHTML = `
        <div class="hours-block">
          <div class="hours-block-header">
            <span class="hours-block-icon">🍦</span>
            <div>
              <h4>Regular Days</h4>
              <div class="sub">Monday – Thursday, Saturday – Sunday</div>
            </div>
          </div>
          <div class="hours-row" data-block="regular" data-ids="${regular.map(h=>h.id).join(',')}">
            <input type="time" class="hr-open" value="${toTimeInput(regRef.open)}">
            <span>to</span>
            <input type="time" class="hr-close" value="${toTimeInput(regRef.close)}">
            <div class="actions">
              <button class="a-btn a-btn-success" data-act="save-hours-block">Save</button>
            </div>
          </div>
        </div>
        <div class="hours-block">
          <div class="hours-block-header">
            <span class="hours-block-icon">🍨</span>
            <div>
              <h4>Friday (Jumu'ah)</h4>
              <div class="sub">Separate timing for Friday</div>
            </div>
          </div>
          <div class="hours-row" data-block="friday" data-id="${friday ? friday.id : ''}">
            <input type="time" class="hr-open" value="${toTimeInput(friday ? friday.open : '12:00 PM')}">
            <span>to</span>
            <input type="time" class="hr-close" value="${toTimeInput(friday ? friday.close : '12:00 AM')}">
            <div class="actions">
              <button class="a-btn a-btn-success" data-act="save-hours-block">Save</button>
            </div>
          </div>
        </div>`;
    } catch (e) { $('#hoursList').innerHTML = '<p class="empty">Failed to load.</p>'; }
  }

  function toTimeInput(t) {
    if (!t) return '12:00';
    const m = String(t).match(/(\d{1,2}):(\d{2})\s*([AP]M)?/i);
    if (!m) return '12:00';
    let h = parseInt(m[1], 10); const min = m[2];
    if (m[3] && /PM/i.test(m[3]) && h < 12) h += 12;
    if (m[3] && /AM/i.test(m[3]) && h === 12) h = 0;
    return String(h).padStart(2, '0') + ':' + min;
  }

  function format12(v) {
    if (!v) return '12:00 AM';
    const [hh, mm] = v.split(':');
    let h = parseInt(hh, 10); let ap = 'AM';
    if (h >= 12) ap = 'PM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${mm} ${ap}`;
  }

  /* ══════════════ SETTINGS ══════════════ */
  async function loadSettings() {
    try {
      let s = await D.getSettings();
      if (!s) { toast('No settings row found — run the SQL schema.', 'err'); $('#settingsForm').innerHTML = '<p class="empty">Settings row missing. Run supabase-schema.sql first.</p>'; return; }
      const form = $('#settingsForm');
      const num = (v, d) => (v == null ? d : v);
      form.innerHTML = `
        <h3>Branding & Identity</h3>
        <div class="grid-2">
          <div class="a-field"><label>Brand Name</label><input id="s-brand" value="${esc(num(s.brand_name, ''))}"></div>
          <div class="a-field"><label>Tagline</label><input id="s-tagline" value="${esc(num(s.tagline, ''))}"></div>
        </div>
        <div class="grid-2">
          <div class="a-field"><label>Logo URL (navbar & preloader)</label><input id="s-logo" value="${esc(num(s.logo_url, ''))}"><small style="color:var(--gray)">Leave empty to use the local logo.png.</small></div>
          <div class="a-field"><label>Favicon URL (browser tab icon)</label><input id="s-favicon" value="${esc(num(s.favicon_url, ''))}"><small style="color:var(--gray)">Leave empty to use local favicon.png.</small></div>
        </div>
        <h3>Hero</h3>
        <div class="grid-2">
          <div class="a-field"><label>Hero Pill Text</label><input id="s-pill" value="${esc(num(s.hero_pill, ''))}"></div>
          <div class="a-field"><label>Hero Image URL</label><input id="s-heroimg" value="${esc(num(s.hero_image, ''))}"></div>
        </div>
        <div class="grid-2">
          <div class="a-field"><label>Title Line 1</label><input id="s-t1" value="${esc(num(s.hero_title_1, ''))}"></div>
          <div class="a-field"><label>Title Line 2 (highlight)</label><input id="s-t2" value="${esc(num(s.hero_title_2, ''))}"></div>
        </div>
        <div class="a-field"><label>Hero Description</label><textarea id="s-herodesc" rows="2">${esc(num(s.hero_desc, ''))}</textarea></div>
        <h3>Contact</h3>
        <div class="grid-2">
          <div class="a-field"><label>Phone</label><input id="s-phone" value="${esc(num(s.phone, ''))}"></div>
          <div class="a-field"><label>WhatsApp number (digits only)</label><input id="s-wa" value="${esc(num(s.whatsapp, ''))}"><small style="color:var(--gray)">e.g. 923337254555</small></div>
        </div>
        <div class="a-field"><label>Address</label><input id="s-address" value="${esc(num(s.address, ''))}"></div>
        <h3>Security</h3>
        <div class="a-field"><label>Admin PIN (4 digits)</label><input id="s-adminpin" type="password" value="${esc(num(s.admin_pin, '1234'))}" maxlength="4" placeholder="****" inputmode="numeric"><small style="color:var(--gray)">Change the 4-digit PIN for admin access.</small></div>
        <h3>Rating</h3>
        <div class="grid-2">
          <div class="a-field"><label>Google Rating</label><input id="s-rating" type="number" step="0.1" value="${esc(num(s.rating, 4.4))}"></div>
          <div class="a-field"><label>Review Count</label><input id="s-reviews" type="number" value="${esc(num(s.reviews, 705))}"></div>
        </div>`;
    } catch (e) { $('#settingsForm').innerHTML = '<p class="empty">Failed to load settings.</p>'; }
  }

  async function saveSettings() {
    try {
      const val = (id) => $('#' + id).value.trim();
      const patch = {
        brand_name: val('s-brand'),
        tagline: val('s-tagline'),
        logo_url: val('s-logo'),
        favicon_url: val('s-favicon'),
        hero_pill: val('s-pill'),
        hero_image: val('s-heroimg'),
        hero_title_1: val('s-t1'),
        hero_title_2: val('s-t2'),
        hero_desc: val('s-herodesc'),
        phone: val('s-phone'),
        whatsapp: val('s-wa'),
        address: val('s-address'),
        admin_pin: val('s-adminpin') || '1234',
        rating: parseFloat($('#s-rating').value) || 4.4,
        reviews: parseInt($('#s-reviews').value, 10) || 705
      };
      await D.setSettings(patch);
      toast('Settings saved', 'ok');
    } catch (e) { toast('Save failed: ' + (e.message || e), 'err'); }
  }

  /* ══════════════ EVENT DELEGATION (list actions) ══════════════ */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const id = btn.dataset.id;

    /* MENU */
    if (act === 'edit-menu') {
      const items = await D.getMenuItems();
      renderMenuForm(items.find(i => i.id === id));
    }
    if (act === 'del-menu') {
      if (confirm('Delete this menu item?')) { await D.remove('menu_items', id); toast('Item deleted', 'ok'); loadMenu(); }
    }
    /* CATEGORIES */
    if (act === 'edit-cat') {
      const cats = await D.getCategories();
      renderCatForm(cats.find(c => c.id === id));
    }
    if (act === 'del-cat') {
      if (confirm('Delete this category? Its menu items will be removed too.')) { await D.remove('categories', id); toast('Category deleted', 'ok'); loadCats(); loadMenu(); }
    }
    /* FLAVORS */
    if (act === 'edit-flavor') {
      const flavors = await D.getFlavors();
      renderFlavorForm(flavors.find(f => f.id === id));
    }
    if (act === 'del-flavor') {
      if (confirm('Delete this flavor?')) { await D.remove('flavors', id); toast('Flavor deleted', 'ok'); loadFlavors(); }
    }
    /* GALLERY */
    if (act === 'edit-gallery') {
      const gallery = await D.getGallery();
      renderGalleryForm(gallery.find(g => g.id === id));
    }
    if (act === 'del-gallery') {
      if (confirm('Delete this gallery image?')) { await D.remove('gallery', id); toast('Image deleted', 'ok'); loadGallery(); }
    }
    /* HOURS */
    if (act === 'save-hours-block') {
      const row = btn.closest('.hours-row');
      const open = format12(row.querySelector('.hr-open').value);
      const close = format12(row.querySelector('.hr-close').value);
      const block = row.dataset.block;
      try {
        if (block === 'regular') {
          const ids = (row.dataset.ids || '').split(',').filter(Boolean);
          await Promise.all(ids.map(id => D.update('opening_hours', id, { open, close })));
        } else {
          const id = row.dataset.id;
          await D.update('opening_hours', id, { open, close });
        }
        toast('Hours saved', 'ok');
      } catch (err) { toast('Save failed: ' + (err.message || err), 'err'); }
    }
  });

  /* ── Add buttons ── */
  $('#btnAddMenu').addEventListener('click', () => { loadMenu(); renderMenuForm(null); $('#menuForm').scrollIntoView({ behavior: 'smooth' }); });
  $('#btnAddCat').addEventListener('click', () => { renderCatForm(null); $('#catForm').scrollIntoView({ behavior: 'smooth' }); });
  $('#btnAddFlavor').addEventListener('click', () => { renderFlavorForm(null); $('#flavorForm').scrollIntoView({ behavior: 'smooth' }); });
  $('#btnAddGallery').addEventListener('click', () => { renderGalleryForm(null); $('#galleryForm').scrollIntoView({ behavior: 'smooth' }); });
  $('#btnSaveSettings').addEventListener('click', saveSettings);

  function initAdmin() {
    (async function () {
      try {
        await D.getSettings();
        setConn(true);
      } catch (e) {
        setConn(false, 'Check SQL schema');
      }
      loadMenu(); loadCats(); loadFlavors(); loadGallery(); loadHours(); loadSettings();
    })();
  }

  /* ── Start ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogin);
  } else {
    initLogin();
  }
})();
