/* ══════════════════════════════════════════════════
   PAYMENT PENDING — locked-site red strip
   Shows a red strip on the top of every public page while
   the `payment_pending` setting is TRUE (website locked).
   Set payment_pending to FALSE in Supabase or the admin
   panel to hide it.
   Load AFTER data.js on every public page.
   ══════════════════════════════════════════════════ */

(function () {
  const strip = document.getElementById('lockStrip');
  if (!strip) return;

  function apply(pending) {
    if (pending === true) {
      strip.classList.add('show');
      document.body.classList.add('lock-strip-on');
      document.body.style.setProperty('--lock-strip-h', strip.offsetHeight + 'px');
    } else {
      strip.classList.remove('show');
      document.body.classList.remove('lock-strip-on');
      document.body.style.removeProperty('--lock-strip-h');
    }
  }

  function repositionNav() {
    if (document.body.classList.contains('lock-strip-on')) {
      document.body.style.setProperty('--lock-strip-h', strip.offsetHeight + 'px');
    }
  }

  async function init() {
    try {
      const s = (window.DB && window.DB.getSettings) ? await window.DB.getSettings() : null;
      apply(s ? s.payment_pending === true : false);
    } catch (e) {
      apply(false);
    }
  }

  window.addEventListener('resize', repositionNav);
  window.addEventListener('postload', repositionNav);

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else document.addEventListener('DOMContentLoaded', init);
})();