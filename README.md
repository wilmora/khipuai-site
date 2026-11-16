# KHIPUAI public website

This repository is the production source for [khipuai.co](https://khipuai.co). The Pages workflow publishes `main`, without its internal files (see Deployment).

## Structure

The current site went live on 2026-10-26 (it was built as the trial under `concepts/basic/`).

- `index.html`, `es/index.html`: the homepages, built in the browser by `basic.js` from `shared/content.js` / `shared/content.es.js`, with `labels.js` (page labels), `tone.js` (approved wording) and `projects.js` (portfolio cards)
- `about/`, `solution-design/`, `contact/`, `security/`, `privacy/`, and their `es/` pages: content pages (`page.css`, paged by `pager.js`; Privacy scrolls)
- `self-assessment/`: the 15-question assessment, its email form (posts to `C.leads`) and the PDF download
- `thank-you/`, `404.html`: utility pages (noindex)
- `portal/`, `es/portal/`: Build your portal, held back (noindex, not linked, and left out of the Pages deploy because its pricing is a draft)
- `demos/support/`: the Khipu Support miniature. Client miniatures and screenshots wait for each client's permission (see `demos/README.md`)
- `shared/`: content, fonts, images and the Meta Pixel consent script. `shared/quote.js`, the quote engine, is used by no page and is left out of the deploy (see Security upkeep)
- `audit/`, `es/audit/`, `work/`, `es/work/`, `blog/`, `privacy.html`, `self_assessment.html`, `thank-you.html`: forwarding pages for the old addresses
- `index.md` and the other `.md` files, `llms.txt`: plain copies for AI agents; update them with the pages

## Development

Serve the repository root over HTTP. Do not open the HTML files directly because the pages use JavaScript modules.

Run locally from the repository root with either command, then open <http://localhost:8000>:

```bash
python -m http.server 8000
npx --yes serve -l 8000 .
```

No `.env` settings are needed. The site has no build step, no server code, and no environment variables. The tests read one optional variable, `CONFIDENTIAL_TERMS` (see Security upkeep).

The site is intentionally buildless. Before publishing, follow `AGENTS.md`, validate local routes and assets, exercise both quote languages, test responsive layouts, and confirm production pages do not contain `noindex`.

Meta Pixel uses dataset `1112143148017821` through `shared/meta-pixel.js`. It loads only after a visitor allows Meta measurement, and it honors Global Privacy Control. Automatic collection (`autoConfig`) is turned off before the Pixel starts, so it never sends button clicks or page details on its own, only the events below. It sends `PageView`. The self-assessment sends `AssessmentScoreViewed` after all 15 questions are answered and the result is viewed. Booking links open a Calendly popup with a direct-link fallback. The Pixel sends `Lead` only after Calendly confirms that a call was booked, not when a booking link is clicked. Answers and scores are not sent to Meta. The assessment result (score, result band and top areas) is not in the booking link's address: it is added to the Calendly address only when the visitor opens booking, so it goes to Calendly and tools that record link addresses never see it.

## Deployment

Production deploys automatically from `main` through the Pages workflow (`.github/workflows/pages.yml`). Do not push unreviewed work directly to `main`.

The workflow runs `node --test tests/*.test.mjs` first; if any test fails, nothing is deployed. The same tests run on every pull request (`.github/workflows/tests.yml`). It then publishes a copy of the repository without `AGENTS.md`, the `README.md` files, `docs/`, `edge/`, `tools/`, `tests/`, `.github/`, the held portal (`portal/`, `es/portal/`) and `shared/quote.js`, and a check in the workflow stops the deploy if one of them still reaches the published files.

`tests/security.test.mjs` blocks client names anywhere in the repository (the list comes from the `CONFIDENTIAL_TERMS` secret, see Security upkeep), links to local files in anything that ships, non-https links in published PDFs, top-level paths that are not on the approved list, and risky files in what ships.

Custom domain:

- The site deploys through a workflow, so the custom domain is set in the repository's Settings > Pages > Custom domain. GitHub ignores the `CNAME` file for workflow deploys. The file stays in the repository as a record of the domain; changing it changes nothing on the live site.
- Keep Enforce HTTPS on (Settings > Pages).
- Verify khipuai.co at <https://github.com/settings/pages> (for an organization, in the organization's Settings > Pages): add the domain and the TXT record GitHub gives you at the DNS host. A verified domain cannot be claimed by anyone else's GitHub Pages site, even if Pages is ever switched off here or the custom domain is removed.

## Security upkeep

- **Content Security Policy.** Every page carries a `Content-Security-Policy` meta tag on the line after `<meta charset="utf-8">`. It lists the only places the page may load scripts, frames and connections from, and allows each inline `<script>` by its SHA-256 hash. If you edit an inline script, `node --test tests/csp.test.mjs` fails and prints the new hash to put in that page's policy. If you add a third-party tool, add its hosts to the policy of each page that uses it. Never add `'unsafe-inline'` or `'unsafe-eval'` to `script-src`.
- **security.txt.** `.well-known/security.txt` names the address for security reports. Renew its `Expires` date before it passes (less than a year ahead); once it expires, the tests fail and nothing deploys.
- **Dependabot** opens pull requests for new versions of the workflow actions. Review them like any other change.
- **Client-name check (`CONFIDENTIAL_TERMS`).** The list of client names, people at clients and client billing codes that must never appear in this public repository is not kept in it, in any form (a list of hashes was removed because short names and 4-digit codes can be recovered from hashes in minutes). In GitHub Actions the list comes from the repository secret `CONFIDENTIAL_TERMS`: Settings > Secrets and variables > Actions > New repository secret. The workflows pass it to the test step only.
  - Format: one term per line (`|` also separates terms on a line). Blank lines and lines that start with `#` are ignored. Write a billing code as `code:1234`; codes are checked only in `demos/`. Every other term is a name or a two-word phrase. Case and accents do not matter. Prefer one term per line: GitHub then hides each term if it ever appears in a log.
  - For local runs, put the same list in `tests/.confidential-terms`. `.gitignore` keeps it out of git. Never commit it, and never put a term in an issue, a pull request, a commit message or a test.
  - What is checked: every text file, every file and folder name, and the text, links and document details of PDFs. A failure shows only the file and line numbers, and hides a file or folder name that holds a term. The rules are in `tests/confidential.mjs`.
  - When the secret is missing (and locally, when the file is missing), the name checks are skipped and the other tests still run. In GitHub Actions the run shows the warning "The CONFIDENTIAL_TERMS secret is not set, so the client-name check was skipped." Pull requests from forks and runs started by Dependabot get no Actions secrets, so they always skip it; to check Dependabot's pull requests too, add the same secret under Settings > Secrets and variables > Dependabot.
- **The quote engine stays off the site.** `shared/quote.js` is used by no page (`shared/kinetic.js` only names it in a comment) and holds placeholder prices, regional discounts the owner has not approved, and internal notes. The Pages workflow leaves it out (`--exclude='shared/quote.js'` and the artifact check), and `tests/security.test.mjs` fails if it would be published or if a published page starts to load it. To publish it, first get the owner's approval for its prices and regional rules, then remove it from both places in `pages.yml` and from `LEFT_OUT` and `UNPUBLISHED` in the test.
- **Approved top-level paths.** `APPROVED_TOP_LEVEL` in `tests/security.test.mjs` lists every file and folder at the repository root that is published. A new top-level path fails the tests until you add it to that list on purpose, or leave it out of the deploy in `pages.yml` (and in `LEFT_OUT` and `UNPUBLISHED`). Files that should never be public fail the tests anywhere in what ships: `.env` files, `.dev.vars`, keys and certificates (`.pem`, `.key`, `.p12`, `.pfx`), logs, databases, CSV, TSV and Excel files, Word documents, archives, backups, editor swap files, browser HAR captures, `.DS_Store`, `Thumbs.db` and `settings.local.json`. `.gitignore` keeps the common ones out of git.
- **The leads script** in `edge/leads/Code.gs` is a copy. Changes take effect only after it is pasted into the Apps Script editor and redeployed (`edge/leads/README.md`).
