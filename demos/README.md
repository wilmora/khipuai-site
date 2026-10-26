# Portfolio miniatures

Only KHIPUAI's own product (support) is published. The client miniatures
(payroll, aca, hub, review, materials, whatsapp) and their screenshots were
taken off the live site at go-live (2026-10-26) until each client gives
permission. Restore them from commit 9ee61cc (`concepts/basic/demos/` and
`concepts/basic/shots/`).

Each folder is a static, clickable copy of one real app's main screens, redrawn in that app's own look and
filled with made-up data. The homepage's Learn more dialog shows it in an iframe, drawn at 1280x800 and
scaled to fit. Nothing here talks to a server, saves anything or sends anything; controls that would do so in
the real product show an "In the real product this would..." note (mini.js).

Rules for every folder: no client names, logos, brands, codes, invoice numbers or real people; noindex; no
outside URLs or fonts. tests/demos.test.mjs checks these.

Third-party pieces:
- Icons: Lucide (lucide.dev), ISC licence. Only the icons used are copied, into each folder's icons.js.
- Compiled CSS: built with Tailwind CSS (MIT licence; its notice is kept at the top of each app.css), using
  each app's own theme settings.
