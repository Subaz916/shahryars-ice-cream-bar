SHAHRYAR'S ICE CREAM BAR - WEBSITE DOCUMENTATION
=================================================

A complete reference for the public website, the admin panel, and the Supabase backend.

====================================================================
/// 1. OVERVIEW
====================================================================

Shahryar's Ice Cream Bar is a restaurant/business website for an ice cream shop located at Mahdi Shah Bazar, Quaid-e-Azam Rd, Gojra, 56000, Pakistan. The site advertises scoops, specials (Tutti Fruity), family packs, shakes, falooda and hot beverages.

 - Slogan: "A Taste You'll Love"
 - Phone: +92 333 7254555
 - WhatsApp: 923337254555
 - Google rating displayed: 4.4 / 705 reviews
 - Open hours (default): Mon-Sun, 12:00 PM - 12:00 AM
 - Credited developer: Smexy Innovations

====================================================================
/// 2. TECH STACK
====================================================================

 - Plain HTML + CSS + Vanilla JavaScript (no build step, no framework)
 - Supabase (Postgres + Storage + REST) as the backend/database
     - Supabase JS v2 loaded from CDN: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
     - Project URL: https://lxrrpisqyetlqrjdvxkk.supabase.co
 - Google Analytics (gtag.js, ID G-812ZP787YZ) on every page
 - Google Fonts: DM Sans + Playfair Display (+ local Lobster font from Lobster/Lobster-Regular.ttf)
 - Google Maps embed (no API key required)
 - Hosted/deployed on Vercel (OG image URLs point to https://shahryars-icecream.vercel.app/logo.png)
 - Git repo: https://github.com/Subaz916/shahryars-ice-cream-bar.git

====================================================================
/// 3. FILE STRUCTURE
====================================================================

 - index.html ............. Homepage (all marketing sections)
 - menu.html .............. Menu & prices page (rendered from Supabase)
 - flavors.html ........... All flavors page (rendered from Supabase)
 - admin.html ............. Password-protected admin panel
 - styles.css ............. Main stylesheet (homepage + shared components)
 - menu.css ............... Menu page "premium smooth card" styles
 - admin.css .............. Admin panel liquid-glass dark theme
 - script.js .............. Shared front-end behaviour (preloader, navbar, animations, carousel)
 - site-home.js ........... Homepage data rendering from Supabase
 - site-menu.js ........... Menu page rendering + 3D tilt effects
 - site-flavors.js ........ Flavors page rendering from Supabase
 - site-popup.js .......... Announcement popup carousel on site open
 - supabase-config.js ..... Public Supabase URL + anon key
 - supabase-client.js ..... Client initializer + shared helpers (db.esc, db.parseTags, db.applyGalleryToggle)
 - data.js ................ Data layer - all database reads/writes (window.DB)
 - admin.js ............... Full admin CRUD + login logic
 - supabase-schema.sql .... Master schema + seed data (run first)
 - supabase-popups.sql .... Popups table (run after schema)
 - supabase-about-review-upgrade.sql ... About/Reviews columns, reviews table, storage bucket
 - supabase-about-tag3.sql ............. Adds about_tag3 column
 - supabase-gallery-toggle.sql ......... Adds gallery_enabled setting
 - logo.png ............... Default brand logo (navbar, preloader, OG image)
 - herologo.png ........... Default hero heading logo
 - favicon.png ............ Browser tab icon
 - googled24973b6b5f89f1f.html ... Google Search Console ownership verification
 - Lobster/ ............... Local Lobster font files
 - EXAMPLE MENU/ .......... Unrelated draft/reference template for "RANA FOODS Gojra" (not deployed/used)

====================================================================
/// 4. PAGES
====================================================================

//// 4.1 HOMEPAGE - index.html ////

Public URL: index.html. Single-page marketing site with anchor navigation.

 - #home ..... Preloader -> Hero with logo, tagline, description, "View Menu" / "Get Directions" buttons, animated stat counters (rating 4.4, 705+ reviews, 8+ flavors), hero photo with floating cards, orbiting emojis, falling sprinkles
 - #flavors .. "Our Flavors" - first 4 flavors from DB rendered as cards
 - #gallery .. Gallery grid (renderable from DB, toggleable)
 - #about .... About Us - editable heading/description, rating card, 3 tags, feature card
 - #reviews .. Customer reviews carousel (auto-advancing, dots, prev/next)
 - #hours .... Opening hours - day pills (today highlighted), regular days card + Friday (Jumu'ah) card
 - #contact .. Phone/address/open-for rows, Call Now / WhatsApp / Get Directions buttons, Google Maps iframe
 - Footer .... Brand, quick links, explore links, contact info
 - Floating .. Scroll-to-top button + floating WhatsApp / Call / toggle buttons
 - Popup ..... Announcement modal (from popups table)

//// 4.2 MENU - menu.html ////

 - Lists menu categories as styled cards.
 - Each card: header with icon, category name, item count, optional subtitle; rows of item name + price label (or "Ask in-store") + tags (e.g. special, Popular, winter).
 - Effects: staggered card entrance, staggered item reveal, magnetic 3D tilt with lerp + radial shine (disabled on touch devices, respects prefers-reduced-motion).

//// 4.3 FLAVORS - flavors.html ////

 - Hero banner + full grid of all flavors (name, tag, image) ordered by sort_order.

//// 4.4 ADMIN PANEL - admin.html ////

 - Password-protected CMS. See Section 6.

====================================================================
/// 5. FRONT-END SYSTEMS & BEHAVIOUR (script.js, site-*.js)
====================================================================

Shared behaviour (script.js), runs on all pages:

 - Preloader - logo + progress bar, hidden on window load (max 2.5 s).
 - Navbar - transparent -> "scrolled" style after 40 px; active link auto-highlighted on scroll.
 - Mobile menu - hamburger toggle, closes on link click.
 - Smooth scrolling - for anchor links (#...) with 80 px offset.
 - Scroll reveal - [data-reveal] and [data-stagger] fade/slide-in via IntersectionObserver, with per-child stagger delay.
 - Scroll-to-top - appears after 500 px.
 - Floating contact buttons (FAB) - WhatsApp + Call open-attached to a toggle button.
 - Hero blobs & photo parallax - blobs translate on scroll; photo has subtle parallax/scale.
 - Day pill highlighting - highlights today's #dayPills li using Asia/Karachi timezone.
 - Counters - animated stat numbers (data-count + data-suffix) with ease-out cubic animation.
 - Reviews carousel - responsive per-view (3/2/1), dots, prev/next, 4 s auto-advance, pause on hover/touch, loops back with fade. Exposes window.__reviewsReinit() to rebind after dynamic reload.
 - Menu card tilt - a simpler home/legacy tilt also exists in script.js.

Per-page data rendering (from Supabase via window.DB):

 - site-home.js - applies settings (logo, favicon, page title, hero pill/title/logo/description/image, tagline, phone/WhatsApp/address links, rating & review count, OG image, gallery visibility) and renders flavors (first 4), gallery, hours (regular + Friday cards), and reviews.
 - site-menu.js - builds category cards and items; gallery toggle applied from settings.
 - site-flavors.js - applies logo/favicon and renders the full flavor grid.
 - site-popup.js - fetches enabled popups with images and shows them in a modal carousel: shows immediately on open (after preloader, ~1.2 s), rotates every 3 seconds, closes on X / outside click / Escape.

====================================================================
/// 6. ADMIN PANEL - admin.html + admin.js
====================================================================

//// 6.1 LOGIN SYSTEM ////

 - Two-step overlay: Phone number -> 4-digit PIN.
 - Hardcoded phone: 03337254555 (digits only, entered with optional spaces/+).
 - PIN is read from settings.admin_pin (default 4555 if unset; written to DB on first load).
 - Session stored in sessionStorage['admin_authenticated'] = 'true' - cleared on every page open (must log in each time) and on Logout.
 - Connection status badge in header ("Connecting..." / "Connected" / error prompting to check SQL schema).

//// 6.2 TABS / PANELS ////

 - Menu Items ....... Add/Edit/Delete items, filter by category, multi-select delete, "Ask in-store" price toggle
 - Categories ....... Add/Edit/Delete categories (name, icon, slug, subtitle, sort order)
 - Flavors .......... Add/Edit/Delete, image upload, sort order
 - Gallery .......... Add/Edit/Delete images with caption, "tall card" flag, sort order
 - Popups ........... Add/Edit/Delete, enable/disable toggle, image upload, caption, optional link
 - Opening Hours .... Edit "Regular Days" (all non-Friday days share one time) and Friday separately via time inputs
 - Domains .......... Add/Edit/Delete domain records; auto expiry warnings (<90 days orange, <=30 or expired red); "Set to Renew" one-click status action
 - About ............ Edit the About section: overline/title/subtitle, heading, description, 3 tags, feature card title/text
 - Reviews .......... Edit section header (overline/title/subtitle), add/edit/delete review cards (author, stars 1-5, text, source, sort)
 - Site Settings .... Brand name, tagline, logo, favicon, hero pill/logo/image/description, gallery on/off toggle, phone, WhatsApp, address, admin PIN, Google rating & review count

//// 6.3 FILE UPLOADS ////

 - Files upload to the public Supabase Storage bucket "images" (the SQL script creates it; 5 MB limit, PNG/JPEG/WebP).
 - Filenames prefixed with folder name + timestamp; public URL is written into the input as a value.
 - Uploads are wired into every image field: hero logo, logo, favicon, hero image, flavors, gallery, popups.

//// 6.4 EXTRA UTILITIES ////

 - Toast notifications for all actions (success/error styling).
 - Domain expiry countdown computed from today's date vs expiration_date.
 - Site change requests: create/edit/delete requests (Website change / Add new page / Domain renewal / Other), set status (Pending / In progress / Done / Rejected), and a WhatsApp share button that opens a prefilled chat to 923221945787 with the request summary.

====================================================================
/// 7. BACKEND - SUPABASE
====================================================================

//// 7.1 CONFIGURATION ////

 - supabase-config.js - window.SB_CONFIG = project URL + anon key (safe to expose).
 - supabase-client.js - creates window.sb (Supabase client) and window.db helpers:
     - db.esc(str) - HTML-escape
     - db.parseTags(str) - split comma/pipe separated tags
     - db.applyGalleryToggle(settings) - hides #gallery links/section when gallery disabled
 - data.js - window.DB module with all DB operations:

 - getSettings() ....... Reads settings row (id=1)
 - getCategories() ..... All categories by sort_order
 - getMenuItems() ...... All menu items by sort_order
 - getFlavors() ........ All flavors by sort_order
 - getGallery() ........ All gallery rows by sort_order
 - getOpeningHours() ... All days by day (0=Sun..6=Sat)
 - getPopups() ......... Popups by sort_order
 - getReviews() ........ Reviews by sort_order
 - getDomains() ........ Domains by expiration_date
 - getSiteRequests() ... Requests by created_at desc
 - insert(table,row) ... Generic insert
 - update(table,id,patch) ... Generic update by id
 - remove(table,id) .... Generic delete by id
 - setSettings(patch) .. Update settings row id=1

//// 7.2 DATABASE TABLES (all with open RLS policies - public read/write) ////

 - settings .......... id (single row=1), brand_name, tagline, hero_title_1, hero_title_2, hero_pill, hero_desc, phone, whatsapp, address, rating, reviews, gallery_enabled, hero_image, og_image, logo_url, favicon_url, hero_logo_url, about_overline, about_title, about_subtitle, about_heading, about_desc, about_tag1, about_tag2, about_tag3, about_card_title, about_card_desc, reviews_overline, reviews_title, reviews_subtitle, admin_pin, updated_at
 - categories ........ id, name, slug (unique), icon, subtitle, sort_order
 - menu_items ........ id, category_id (FK cascade), name, description, icon, tags, price_label, is_ask_price, sort_order
 - flavors ........... id, name, tag, image_url, sort_order
 - gallery ........... id, image_url, caption, tall, sort_order
 - opening_hours ..... id, day, label, open, close, is_open
 - popups ............ id, image_url, caption, link, enabled, sort_order, created_at
 - reviews ........... id, stars, text, author_name, author_source, sort_order
 - domains ........... id, domain_name, status, expiration_date, auto_renewal, updated_at
 - site_requests ..... id, request_type, title, description, status, created_at, updated_at
 - Storage bucket "images" ... public bucket for all admin uploads

//// 7.3 SQL SETUP ORDER ////

 1. supabase-schema.sql ... core tables, RLS, seed data (settings, categories, menu items, flavors, gallery, hours, domain).
 2. supabase-popups.sql ... popups table + sample popup.
 3. supabase-about-review-upgrade.sql ... about/review settings columns, reviews table, image storage bucket + policies, seed reviews.
 4. supabase-about-tag3.sql ... adds about_tag3.
 5. supabase-gallery-toggle.sql ... adds gallery_enabled (already in schema; kept for existing DBs).

====================================================================
/// 8. KEY CONFIGURATION VALUES
====================================================================

 - Google Analytics ID: G-812ZP787YZ
 - Google Maps URL: https://maps.app.goo.gl/cbA45giLJu57Stsm6
 - WhatsApp (public site): https://wa.me/923337254555
 - WhatsApp (admin request channel, Smexy Innovations): 923221945787
 - Admin default PIN: 4555 (change in Site Settings)
 - Vercel URL: https://shahryars-icecream.vercel.app

====================================================================
/// 9. DEPLOYMENT & MAINTENANCE NOTES
====================================================================

 - Pure static site - deploy the folder root to Vercel (or any static host). No build step.
 - googled24973b6b5f89f1f.html must stay in root for Google Search Console verification.
 - All content (menu, flavors, gallery, popups, reviews, hours, about, branding) is managed live through the admin panel; no code changes needed for everyday updates.
 - Domain shahryaricecream.com is tracked in the admin Domains tab with expiry monitoring and renewal request flow.
 - Brand-name/OG-image references: recent commits set the SEO title and use logo.png as the Open Graph image for better Google previews.

====================================================================
/// 10. SECURITY NOTES / CAVEATS
====================================================================

 - RLS is intentionally open (for all using (true) with check (true)) so the anon key can read AND write all tables. Anyone with the anon key can modify data - protection relies on the admin-page login (phone + PIN) which is only a UI gate, not a server-side auth gate.
 - The admin PIN is stored in plain text in the settings table.
 - For production hardening, consider Supabase Auth + RLS policies restricting writes to authenticated users only.