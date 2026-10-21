# Go-live checklist: trial site to live site

Launch plan for moving the trial site (`concepts/basic/`, English and
Spanish) onto the live site at khipuai.co (`main`). Written for ORD-20261020-18,
2026-10-20. Do the steps in order. Nothing here is done automatically.

`main` is the live site. It changes only with Wil's yes.

---

## 1. Decisions needed first (Alex and Wil)

Each of these blocks launch or changes what launches. Every one is a short
yes, no or "use this wording".

| # | Decision | Who | What happens until then |
|---|---|---|---|
| D1 | **Integrations row and logo permissions.** The row is renamed "Integrations" and now lists WhatsApp, GitHub and 3D modelling software too, but it is switched off on the site until Alex and Wil decide (2026-10-21; `SHOW_INTEGRATIONS` in `concepts/basic/basic.js`). Before it is switched on: logo permissions for Zendesk, monday.com, Google, Meta and Anthropic (see `concepts/basic/logos/SOURCES.md`). | Alex and Wil | The row stays hidden. |
| D2 | **"It is never entered into a public AI chatbot."** This is the security wording on the trial pages, and it needs Wil's OK. | Wil | Use the live wording ("Not in a public chatbot.") instead. |
| D3 | **Code ownership wording.** "A product you own" and "The product is yours." State what the client owns and when. | Wil | Remove the ownership section. |
| D4 | **"Three steps" vs "A product you own".** Settled by ORD-20261020-23: the steps are now four (Discovery call, Walkthrough, Solution design, Build) under "From first call to a product you own." | Done | None |
| D5 | **Build your portal.** Held back (2026-10-21): the page and its code stay, but nothing links to it (`SHOW_PORTAL` in `concepts/basic/basic.js`). Before it is shown: the draft pricing ($100 per month for the portal, hosting a separate monthly fee to be confirmed, Enterprise above 100 users or 10 locations, the same $100 in USD and CAD; `concepts/basic/portal/plans.js`). | Alex and Wil | The page stays unlinked. |
| D6 | **Support Tickets card claim.** "Routes it to the right person." Is that what the product does today? | Wil | Change it to "suggests who should handle it". |
| D7 | **Material Lists demo art.** The cabin and ridge pictures in the demo: permission or replace. | Alex | Replace them with plain shapes. |
| D8 | **Older figures still on the live pages.** These were deliberately left off the trial: es/about 80%, $150K, $1M and flagship 95%, E&O insurance, Net 15, the audit "finance degree" and "one firm's outcome", and the thank-you "fixed fee" line. Confirm they stay off, or provide the evidence and permission to keep them. | Wil | They stay off. |
| D9 | **Analytics at launch.** The live site runs Google Analytics, and the Meta Pixel when visitors allow it. The trial pages run nothing. Choose what the new site runs (see section 5). The privacy policy must then describe exactly that. | Alex and Wil | Launch with no analytics, and update the privacy policy to say so. |
| D10 | **Terms of use page.** None exists on either site. Add one, or confirm it isn't needed. | Wil (legal) | No terms page. |
| D11 | **Spanish privacy policy.** A new translation of the English policy, with the same facts (`concepts/basic/es/privacy/`). It needs Wil's review before it is published. | Wil | Spanish pages link to it marked as a translation, or link to the English policy. |
| D12 | **Pages with no Spanish version.** The self-assessment, its thank-you page and the blog are English only. Translate them, or keep them in English and label the link "(en inglés)". The Spanish contact page already does this. | Alex and Wil | English only, labelled. |
| D13 | **The blog.** The live site has three blog posts and a blog index. The trial has no blog. Restyle them into the new look, or keep them in the old look. | Alex | Keep the old look, still linked. |
| D15 | **Contact address.** Settled 2026-10-21 at Alex's word: the site shows alexp@khipuai.co everywhere (this replaced the hello@khipuai.co plan, so no new mailbox is needed). | Done | None |
| D16 | **Confirm the new name.** "Audit" is gone from the trial pages. The service is now "AI automation solutions", the paid first engagement is "Solution Design" ("Diseño de la solución"), and the buttons say "Book a free discovery call". The founder should confirm the name before launch. The live pages still say "AI Automation Audit" until the switch. | Alex (with Wil) | The trial keeps the new name; the live site keeps the old one. |
| D17 | **Held portfolio pieces.** The billing agent card is hidden, and each working miniature shows only its Home screen with its sidebar visible but not clickable ("Coming soon"; `HOLD` in `concepts/basic/demos/mini.js`). Decide when each opens up. | Alex and Wil | Cards show Home only. |
| D18 | **Pages instead of scrolling.** Every page except Privacy turns pages (Back, Next, dots, wheel, swipe, keys) instead of scrolling (`concepts/basic/pager.js`). A Terms page, if one is added (D10), should scroll like Privacy (`class="doc scroll"`). | Alex | None |
| D14 | **Self-assessment email form.** It is switched off on the trial. Turning it back on sends the visitor's details to the Google form endpoint, as the live site does. | Alex and Wil | It stays off. Visitors download the PDF and book a call. |

---

## 2. Before the switch (on `alex-work`)

1. [ ] Apply the answers to D1 to D16, one commit per decision. Send a test email to alexp@khipuai.co from the contact page link and confirm it arrives.
2. [ ] Run every check, and get each one green:
   - `node --test tests/*.test.mjs`
   - the gate (`node <agent-factory>/gate/pre-push.mjs --check .`)
   - the prerender check
   - the dead-click sweep in Chromium and WebKit
   - the overflow and contrast audit at 360, 390, 768, 1024, 1280 and 1440
3. [ ] Exercise the full quote and portal flow in English and Spanish: back, restart, lowest and highest scope, the region fallback, print and download.
4. [ ] Read every page once in English and once in Spanish, out loud if possible, for meaning and tone.
5. [ ] Wil reviews the trial at its preview address and says yes.

## 3. The switch (one pull request into `main`)

Do it all in one reviewed pull request, so it can be undone in one step.

1. [ ] **Move the pages to their live addresses.**

   | Trial address | Live address |
   |---|---|
   | `concepts/basic/` | `/` |
   | `concepts/basic/es/` | `/es/` |
   | `concepts/basic/about/` | `/about/` |
   | `concepts/basic/solution-design/` | `/solution-design/` (and redirect `/audit/` and `/es/audit/` to it) |
   | `concepts/basic/contact/` | `/contact/` |
   | `concepts/basic/security/` | `/security/` |
   | `concepts/basic/privacy/` | `/privacy/` |
   | `concepts/basic/self-assessment/` | `/self-assessment/` |
   | `concepts/basic/thank-you/` | `/thank-you/` |
   | `concepts/basic/portal/` | `/portal/` |
   | the matching `es/` pages | `/es/...` |

   The demos, shots, logos, icons and og folders move with them.
2. [ ] **Fix the links.** Rewrite every `/concepts/basic/` link to the new address:
   - the footers;
   - the 404 page;
   - `aboutHref` and `securityHref` in `labels.js`;
   - the og:image addresses;
   - the icon links;
   - the `ASSET` paths in `basic.js`.

   Then search for `concepts/basic` and expect no hits outside `concepts/`.
3. [ ] **Turn on indexing.** Remove `<meta name="robots" content="noindex, nofollow">` from every public page. Keep `noindex` on the demos, the thank-you page and the 404.
4. [ ] **Add canonical and og:url** to every public page (`https://khipuai.co/...`), with `hreflang` alternates linking each English and Spanish pair.
5. [ ] **Remove the trial markers:**
   - the "Trial, not live. Current site" footer line;
   - the trial comments in each page's head;
   - "Trial" or "Prueba" in any visible text.
6. [ ] **Redirect the old addresses.** GitHub Pages has no server redirects, so leave a small redirect page (meta refresh plus a canonical link) at each old address:
   - `/work/` and `/es/work/` go to `/#work` and `/es/#work`;
   - `/privacy.html` goes to `/privacy/`;
   - `/self_assessment.html` goes to `/self-assessment/`;
   - `/thank-you.html` goes to `/thank-you/`.

   Never delete `CNAME`.
7. [ ] **404:** replace the root `404.html` with `concepts/basic/404.html`, links rewritten. Keep `404.md` for the edge worker.
8. [ ] **Update `sitemap.xml`** with the new addresses, the dates and the Spanish pages (contact, privacy, portal). Keep `robots.txt` pointing to it.
9. [ ] **Update the Markdown twins and `llms.txt`** (`index.md`, `es/index.md`, `about/index.md`, `contact/index.md`) so they say what the new pages say. Remove the personal email addresses and "remotely" from them, and from the structured data, the same as on the pages.
   Then search the whole repo for `@khipuai.co`: only alexp@khipuai.co should remain on the pages.
10. [ ] **Analytics,** if D9 says yes: add the chosen tag to every public page, behind consent for Meta. Leave it off the demos. Make the privacy policy match it.
11. [ ] **Structured data:** carry the live homepage's JSON-LD over and update it.
12. [ ] **Form endpoint,** if D14 says yes: switch the self-assessment form on, with the live endpoint, and test one real submission.
13. [ ] **Booking link:** confirm `https://calendly.com/wmorapal/30min` is the link to launch with.

## 4. Right after the switch

1. [ ] Open every address in the sitemap, plus each redirect, on a phone and a laptop.
2. [ ] Share the homepage link in LinkedIn's Post Inspector and check that the preview image and text are correct, in English and Spanish.
3. [ ] Submit the new sitemap in Google Search Console.
4. [ ] Run a test booking through Calendly from the site.
5. [ ] Check that analytics records the visit, if analytics was turned on.
6. [ ] **Rollback, if something is wrong:** revert the switch pull request on `main`. The old site is the commit before it.

## 5. Analytics plan (none is added today)

What launch would need, all of it Alex and Wil's call (D9):

- **Measure:** page views, the "Book a call" clicks (header, band, contact, portal), starts and completions of the self-assessment, portal summary downloads and prints, and the language used.
- **How:** one privacy-friendly analytics tool, or Google Analytics 4 as the live site has today. The Meta Pixel only after the visitor opts in, as on the live site.
- **Never send:** answers, scores, portal choices, names or emails.
- **Paperwork:** the privacy policy (English and Spanish) names each tool, and the "Change Meta measurement choice" control works on the new privacy page.

---

## Appendix: launch-readiness audit, 2026-10-20

These are the trial pages only. The live site was not changed.

| Page | Issue | Severity | Status |
|---|---|---|---|
| All pages | Every link checked; every local link returns 200, no broken links. | None | OK |
| All pages | No "lorem", "TBD", "TODO" or empty sections. | None | OK |
| Hub demo | Sidebar group "Coming Soon" and a panel titled "Agents right now". | Medium | Fixed: "Pilots", "Agent activity" |
| Homepage (Portfolio) | "We will tell you honestly if it is worth automating" (casual tone). | Low | Fixed: "give you a candid assessment of whether…" (EN and ES), same pattern as the approved ORD-29 changes |
| Homepage EN and ES | Title "Basic homepage trial" / "Prueba de inicio básica", no meta description. | High | Fixed: the live titles and descriptions |
| 7 demo pages | No meta description, no favicon, titles not matching the product names ("Ops Hub", "Billing agent", "Portal de ventas"). | Medium | Fixed: product-name titles, descriptions and icons |
| Privacy, Thank-you | No meta description. | Medium | Fixed |
| Duplicate titles | None found. A test now prevents them. | None | OK |
| All shareable pages | No Open Graph or social card tags. The live share image says "Stop paying your team to do robot work." in the old look. | High | Fixed: og and twitter tags on 18 pages, plus new English and Spanish 1200x630 share images in the new look (`concepts/basic/og/`) |
| All pages | SVG favicon only, no PNG fallback, no phone home-screen icon. | Medium | Fixed: `favicon-32.png` and `apple-touch-icon.png` (`concepts/basic/icons/`) |
| 404 | Only the old-look root 404. | Medium | Fixed: new-look English and Spanish `concepts/basic/404.html`, swapped in at go-live |
| Privacy | "Last updated: 2026." with no full date. | Medium | Fixed: October 2, 2026, the date the policy last changed |
| Privacy | Describes Google Analytics and the Meta Pixel, which the trial pages don't run. | High | Needs decision (D9) |
| Terms | No terms of use page. | Medium | Needs decision (D10) |
| Spanish | No Spanish contact or privacy page. The Spanish footers linked to English pages. | High | Fixed: `es/contact/` and `es/privacy/`, with the footers and language switches linked. The privacy translation needs review (D11). |
| Spanish | Self-assessment, thank-you and blog are English only. | Medium | Needs decision (D12) |
| Spanish | No English text on the Spanish pages; natural tú form throughout. | None | OK |
| Naming | KHIPUAI is spelled one way everywhere. Demo titles now match the card names. | None | OK |
| Claims | Logo permissions, "never entered into a public AI chatbot", code ownership, draft pricing, the Support routing claim, the older live figures. | High | Needs decision (D1 to D3, D5, D6, D8) |
| Accessibility | One H1 per page, no skipped heading levels, every image has alt text. | None | OK |
| Accessibility | Contrast, light and dark, Chromium and WebKit, 360 to 1440: nothing under 4.5 (3.0 for large text). | None | OK |
| Accessibility | Keyboard: every Tab stop visible with a focus outline; the skip link is the first stop on every page load. No animation runs with reduced motion. Every button is at least 44px tall on phones. | None | OK |
| ES Privacy, 360 and 390 | The long "Cambiar la elección…" button pushed the page sideways (403px wide on a 360px screen). | High | Fixed: long buttons wrap on content pages |
| ES homepage, Fit and Questions, 1024 and up | The long "Agenda una llamada de encaje de 30 minutos" button spilled out of its column over the checklist. | High | Fixed: buttons wrap inside their column; the one-screen fit is unchanged |
| Speed | Card pictures lazy-loaded, 21 to 104 KB each. Logos and portraits are small. The Material demo hero is 1400px wide inside the demo only. | Low | OK |
| Contact paths | Calendly link, mailto wil@khipuai.co, and the contact pages in both languages work. | None | OK |
| Analytics | None on the trial pages. | None | Plan in section 5, decision D9 |
