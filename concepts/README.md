# Concepts — NOT part of the website

Everything in this folder is exploration. It is **not** the KHIPUAI site and it
must never be served from khipuai.co.

## The one rule

**This folder must never reach `main`.**

`main` is production: GitHub Pages publishes it to khipuai.co with no build step
and no review gate, so every file on `main` is public the moment it lands. That
is why concepts were kept in a separate folder outside this repo for as long as
they were. They live here now for convenience, on `sandbox` only.

When promoting work from `sandbox` to `main`, promote the specific site files.
Never merge the whole branch, or this folder goes with it.

## What is here

- `kinetic/` — the "Kinetic" redesign concept: a landing page that runs
  sideways. One screen per section, free scrolling that settles onto a section,
  and a light in the khipu cord that follows the pointer.
- `kinetic/knot-wire-routes.json` — strand routes traced through the knot
  photograph by a brightness ridge follower, kept from an effect that was built
  and then removed. Saved so the tracing does not have to be redone.
- `shared/` — only the assets `kinetic/` actually needs: the three OFL fonts
  (with their licences), the knot photograph, the founder photo, the logo mark,
  and `content.js`, which is the single source of truth for every fact the
  concepts show.

The other three concepts (Console, Atlas, Brief), the comparison page and the
screenshots are **not** here. They stay in `C:\Users\alexp\repos\khipuai-concepts`,
which is where `/site-concepts` runs them from.

## Viewing it

GitHub Pages only publishes `main`, so nothing here is reachable at a URL — by
design. To see it, run the site locally on this branch and open
`/concepts/kinetic/`.

Asset paths are relative (`../shared/...`), so the folder works wherever it is
mounted rather than only at a server root.
