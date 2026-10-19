# Portfolio miniatures (trial page only)

Each folder is a static, clickable copy of one real app's main screens, redrawn in that app's own look and
filled with made-up data. The trial page's Learn more dialog shows it in an iframe, drawn at 1280x800 and
scaled to fit. Nothing here talks to a server, saves anything or sends anything; controls that would do so in
the real product show an "In the real product this would..." note (mini.js).

Rules for every folder: no client names, logos, brands, codes, invoice numbers or real people; noindex; no
outside URLs or fonts. tests/demos.test.mjs checks these.

Third-party pieces:
- Icons: Lucide (lucide.dev), ISC licence. Only the icons used are copied, into each folder's icons.js.
- Compiled CSS: built with Tailwind CSS (MIT licence; its notice is kept at the top of each app.css), using
  each app's own theme settings.
