# v2: the candidate next website

This is the "Kinetic" design: a landing page that runs sideways. One screen per
section, free scrolling that settles onto a section, and a light in the khipu
cord that follows the pointer.

The intention is that this eventually **replaces** the current site. It is not
an experiment to be thrown away, which is why it does not live in a folder
called `concepts` any more.

## Where it is up to

Four pages now, across two languages. The site it would replace is **15 pages**:

| | v2 (here) | The live site |
|---|---|---|
| Pages | 4 | 15 |
| Languages | English + Spanish (landing only) | English + Spanish |
| SEO metadata | on every page here | on every page |
| Analytics | **none** | GA4 on every page |

Here: `kinetic/` (landing, EN), `es/` (landing, ES), `about/`,
`self-assessment/`.

Still to port: `audit`, `work`, `blog` plus three posts, `privacy`,
`thank-you`, and the Spanish mirror of `about`, `work` and `audit`. `audit`
and `work` also have to absorb the homepage copy that moved off the landing
page.

So switching is still a build project, not a swap.

## Known gaps

- **There is no navigation between these pages.** `about/` and
  `self-assessment/` are reachable only by typing the URL or, for the
  assessment, the hero button on the landing page. The shell's nav is
  within-page section links; nothing yet is a site menu. This is the biggest
  single hole.
- **No analytics.** Every live page carries GA4 (`G-8M0ENQ1NBS`); no v2 page
  does. Left off deliberately while these pages are `noindex` staging -
  adding it now would fill the real property with development traffic - but it
  has to go on at the switch or the new site reports nothing.
- **The PDF request form has never been wired to a provider.** It is carried
  over from the live page in the same state, with the same safety net that
  disables it rather than letting it POST into nowhere and lose leads silently.
  Setting a real `action` switches that block off by itself.
- **Spanish has no self-assessment.** The live Spanish site links to the
  English one; this does the same. A Spanish version needs translated questions
  from Wil, not machine-translated ones - the wording is the scoring
  instrument, and a reworded question does not score the same.

## Switch-day checklist

Everything that is correct *because* this is staging, and wrong the moment it
is not:

- [ ] **Delete `<meta name="robots" content="noindex">`** from every page in
      `v2/`. Ship with it and the new site is invisible to search.
- [ ] **Redirect `/self_assessment.html` to `/self-assessment/`.** The path
      was renamed to a hyphen and a directory, matching every other URL on the
      site. The old one is in the shipped PDF, in LinkedIn posts and in
      anything already shared, so without a redirect those all 404.
- [ ] **Make the hero self-assessment links absolute.** Both `kinetic/` and
      `es/` use `../self-assessment/`, which is right while this sits under
      `/v2/` and wrong once it is the root.
- [ ] **Add GA4** to every page.
- [ ] **Set the quote regions.** Everything outside North America is a
      placeholder multiplier - see `README-quote.md`.
- [ ] **Wil approves the Team section**, which now has a second person on it.

## The rule while it is here

**Do not merge this branch wholesale into `main`.** `main` is production:
GitHub Pages publishes it to khipuai.co with no build step and no review gate,
so anything that lands there is public immediately. When the time comes, the
switch should be a deliberate, reviewed change, with Wil's sign-off, not a
branch merge that happens to carry this folder with it.

## Viewing it

Pages only publishes `main`, so this is not reachable at a URL. Run the site
locally on this branch and open `/v2/kinetic/`, `/v2/es/`, `/v2/about/` or
`/v2/self-assessment/`.

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
