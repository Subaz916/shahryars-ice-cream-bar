/* ══════════════════════════════════════════════════
   Supabase client initializer
   Load AFTER supabase-config.js and the Supabase CDN script.
   Exposes window.sb (the client) and window.db (helpers).
   ══════════════════════════════════════════════════ */

(function () {
  const cfg = window.SB_CONFIG;
  if (!cfg || !cfg.url || !cfg.anonKey) {
    console.error('[supabase] Missing SB_CONFIG');
    window.sb = null;
    window.db = null;
    return;
  }
  if (!window.supabase) {
    console.error('[supabase] supabase-js not loaded');
    window.sb = null;
    window.db = null;
    return;
  }

  const sb = window.supabase.createClient(cfg.url, cfg.anonKey);
  window.sb = sb;

  /* ── Tag parsing (comma separated) ── */
  function parseTags(str) {
    if (!str) return [];
    return String(str).split(/[,|]/).map(s => s.trim()).filter(Boolean);
  }

  /* ── SAFE HTML escape ── */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ── Hide "Gallery" nav/footer links when the gallery section is disabled ── */
  function applyGalleryToggle(s) {
    if (!s) return;
    const hidden = (s.gallery_enabled === false);
    document.querySelectorAll('a[href$="#gallery"]').forEach(a => {
      const target = a.closest('li') || a;
      target.style.display = hidden ? 'none' : '';
    });
    const gallerySection = document.getElementById('gallery');
    if (gallerySection) gallerySection.style.display = hidden ? 'none' : '';
  }

  window.db = { parseTags, esc, applyGalleryToggle };

  console.log('[supabase] client ready');
})();
