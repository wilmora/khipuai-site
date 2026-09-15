# v2 — the candidate next website

This is the "Kinetic" design: a landing page that runs sideways. One screen per
section, free scrolling that settles onto a section, and a light in the khipu
cord that follows the pointer.

The intention is that this eventually **replaces** the current site. It is not
an experiment to be thrown away, which is why it does not live in a folder
called `concepts` any more.

## Where it is up to

It is **one page, in English.** The site it would replace is **15 pages across
two languages**:

| | v2 (here) | The live site |
|---|---|---|
| Pages | 1 | 15 |
| Languages | English | English + Spanish |
| SEO metadata | none | on every page |

The live site's pages are `index`, `about`, `work`, `audit`, `blog` plus three
posts, `privacy`, `self_assessment`, `thank-you`, and the Spanish mirror
`es/index`, `es/about`, `es/work`, `es/audit`.

So switching is a build project, not a swap. Until the rest exists, this cannot
replace anything.

## What has to change before it could go live

- **`<meta name="robots" content="noindex">` must come out.** It is in the page
  right now, correctly, because a concept must not be indexed. Ship it as-is and
  the new site is invisible to search.
- **The SEO head is missing entirely**: no description, no canonical, no
  Open Graph tags, no JSON-LD, no hreflang. The current pages carry all of it,
  and it is a large part of why the site ranks. Losing it is not a cosmetic
  regression.
- **`shared/content.js`** is the single source of truth for every fact this page
  shows. The live site has its copy written into each page instead. One of those
  two approaches has to win.
- **The Spanish mirror has no equivalent here.** The live site's Spanish pages
  drift from the English ones silently; a replacement needs a story for that.

## The rule while it is here

**Do not merge this branch wholesale into `main`.** `main` is production:
GitHub Pages publishes it to khipuai.co with no build step and no review gate,
so anything that lands there is public immediately. When the time comes, the
switch should be a deliberate, reviewed change, with Wil's sign-off — not a
branch merge that happens to carry this folder with it.

## Viewing it

Pages only publishes `main`, so this is not reachable at a URL. Run the site
locally on this branch and open `/v2/kinetic/`.

Asset paths are relative (`../shared/...`), so the folder works wherever it is
mounted rather than only at a server root.

## Not here

The other three concepts (Console, Atlas, Brief), the comparison page and the
screenshots stay in `C:\Users\alexp\repos\khipuai-concepts`, which is what
`/site-concepts` runs. Only Kinetic was brought across, because only Kinetic is
a candidate.

`kinetic/knot-wire-routes.json` holds strand routes traced through the knot
photograph by a brightness ridge follower, kept from an effect that was built
and then removed, so the tracing does not have to be redone.
