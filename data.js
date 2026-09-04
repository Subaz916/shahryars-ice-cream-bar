/* ══════════════════════════════════════════════════
   Shahryar's Ice Cream Bar — DATA LAYER
   All Supabase reads/writes for the public site live here.
   ══════════════════════════════════════════════════ */

window.DB = (function () {
  function sb() {
    if (!window.sb) throw new Error('Supabase not initialised');
    return window.sb;
  }

  const q = (table, order) => sb().from(table).select('*').order(order, { ascending: true });

  /* ── READ ── */
  async function getSettings() {
    const { data, error } = await sb().from('settings').select('*').limit(1).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function getCategories() {
    const { data, error } = await q('categories', 'sort_order');
    if (error) throw error;
    return data || [];
  }

  async function getMenuItems() {
    const { data, error } = await q('menu_items', 'sort_order');
    if (error) throw error;
    return data || [];
  }

  async function getFlavors() {
    const { data, error } = await q('flavors', 'sort_order');
    if (error) throw error;
    return data || [];
  }

  async function getGallery() {
    const { data, error } = await q('gallery', 'sort_order');
    if (error) throw error;
    return data || [];
  }

  async function getOpeningHours() {
    const { data, error } = await q('opening_hours', 'day');
    if (error) throw error;
    return data || [];
  }

  /* ── WRITE ── */
  async function insert(table, row) {
    const { data, error } = await sb().from(table).insert(row).select().single();
    if (error) throw error;
    return data;
  }

  async function update(table, id, patch) {
    const { data, error } = await sb().from(table).update(patch).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async function remove(table, id) {
    const { error } = await sb().from(table).delete().eq('id', id);
    if (error) throw error;
  }

  async function setSettings(patch) {
    const { data, error } = await sb().from('settings').update(patch).eq('id', 1).select().single();
    if (error) throw error;
    return data;
  }

  return {
    getSettings, getCategories, getMenuItems, getFlavors, getGallery, getOpeningHours,
    insert, update, remove, setSettings
  };
})();
