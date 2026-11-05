# KHIPUAI public website

This repository is the production source for [khipuai.co](https://khipuai.co). GitHub Pages publishes the root of `main`.

## Structure

The current site went live on 2026-10-26 (it was built as the trial under `concepts/basic/`).

- `index.html`, `es/index.html`: the homepages, built in the browser by `basic.js` from `shared/content.js` / `shared/content.es.js`, with `labels.js` (page labels), `tone.js` (approved wording) and `projects.js` (portfolio cards)
- `about/`, `solution-design/`, `contact/`, `security/`, `privacy/`, and their `es/` pages: content pages (`page.css`, paged by `pager.js`; Privacy scrolls)
- `self-assessment/`: the 15-question assessment, its email form (posts to `C.leads`) and the PDF download
- `thank-you/`, `404.html`: utility pages (noindex)
- `portal/`, `es/portal/`: Build your portal, held back (noindex, not linked, and left out of the Pages deploy because its pricing is a draft)
- `demos/support/`: the Khipu Support miniature. Client miniatures and screenshots wait for each client's permission (see `demos/README.md`)
- `shared/`: content, fonts, images and the Meta Pixel consent script
- `audit/`, `es/audit/`, `work/`, `es/work/`, `blog/`, `privacy.html`, `self_assessment.html`, `thank-you.html`: forwarding pages for the old addresses
- `index.md` and the other `.md` files, `llms.txt`: plain copies for AI agents; update them with the pages

## Development

Serve the repository root over HTTP. Do not open the HTML files directly because the pages use JavaScript modules.

Run locally from the repository root with either command, then open <http://localhost:8000>:

```bash
python -m http.server 8000
npx --yes serve -l 8000 .
```

No `.env` settings are needed. The site has no build step, no server code, and no environment variables.

The site is intentionally buildless. Before publishing, follow `AGENTS.md`, validate local routes and assets, exercise both quote languages, test responsive layouts, and confirm production pages do not contain `noindex`.

Meta Pixel uses dataset `1112143148017821` through `shared/meta-pixel.js`. It loads only after a visitor allows Meta measurement, honors Global Privacy Control, and sends `PageView`. The self-assessment sends `AssessmentScoreViewed` after all 15 questions are answered and the result is viewed. Booking links open a Calendly popup with a direct-link fallback. The Pixel sends `Lead` only after Calendly confirms that a call was scheduled. Answers and scores are not sent to Meta; opening booking from the assessment shares the score, result band, and top areas with Calendly.

## Deployment

Production deploys automatically from `main` through GitHub Pages. Do not push unreviewed work directly to `main`. The custom domain is configured by `CNAME`.

The Pages workflow runs `node --test tests/*.test.mjs` first; if any test fails, nothing is deployed. The same tests run on every pull request (`.github/workflows/tests.yml`). `tests/security.test.mjs` blocks client names anywhere in the repository (listed as hashes in `tests/confidential.mjs`), links to local files in anything that ships, and non-https links in published PDFs.

## Security upkeep

- **Content Security Policy.** Every page carries a `Content-Security-Policy` meta tag on the line after `<meta charset="utf-8">`. It lists the only places the page may load scripts, frames and connections from, and allows each inline `<script>` by its SHA-256 hash. If you edit an inline script, `node --test tests/csp.test.mjs` fails and prints the new hash to put in that page's policy. If you add a third-party tool, add its hosts to the policy of each page that uses it. Never add `'unsafe-inline'` or `'unsafe-eval'` to `script-src`.
- **security.txt.** `.well-known/security.txt` names the address for security reports. Renew its `Expires` date before it passes (less than a year ahead); once it expires, the tests fail and nothing deploys.
- **Dependabot** opens pull requests for new versions of the workflow actions. Review them like any other change.
- **The leads script** in `edge/leads/Code.gs` is a copy. Changes take effect only after it is pasted into the Apps Script editor and redeployed (`edge/leads/README.md`).
