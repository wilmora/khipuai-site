# KHIPUAI public website

This repository is the production source for [khipuai.co](https://khipuai.co). GitHub Pages publishes the root of `main`.

## Structure

- `index.html`: English Kinetic homepage
- `es/index.html`: Spanish Kinetic homepage
- `about/`: English Kinetic about page
- `self-assessment/`: interactive assessment and direct PDF download
- `shared/`: shared content, behavior, quote rules, design system, fonts, and images
- `audit/`, `work/`, `blog/`, `es/about/`, `es/audit/`, `es/work/`: preserved supporting routes
- `self_assessment.html`: compatibility redirect to `/self-assessment/`

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
