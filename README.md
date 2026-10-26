# KHIPUAI public website

This repository is the production source for [khipuai.co](https://khipuai.co). GitHub Pages publishes the root of `main`.

## Structure

The current site went live on 2026-10-26 (it was built as the trial under `concepts/basic/`).

- `index.html`, `es/index.html`: the homepages, built in the browser by `basic.js` from `shared/content.js` / `shared/content.es.js`, with `labels.js` (page labels), `tone.js` (approved wording) and `projects.js` (portfolio cards)
- `about/`, `solution-design/`, `contact/`, `security/`, `privacy/`, and their `es/` pages: content pages (`page.css`, paged by `pager.js`; Privacy scrolls)
- `self-assessment/`: the 15-question assessment, its email form (posts to `C.leads`) and the PDF download
- `thank-you/`, `404.html`: utility pages (noindex)
- `portal/`, `es/portal/`: Build your portal, held back (noindex, not linked)
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
