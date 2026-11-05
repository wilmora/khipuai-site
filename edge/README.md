# Edge worker: security headers and Markdown for AI agents

GitHub Pages serves files as they are. It cannot send custom HTTP headers and
it ignores the `Accept` header, so on its own it cannot:

- send HTTP security headers, such as `Strict-Transport-Security` (HSTS) or a
  `Content-Security-Policy` with `frame-ancestors`,
- refuse an address once a file is published at it,
- return Markdown when an agent sends `Accept: text/markdown`, return a
  Markdown 404 body for missing pages, or send `Vary: Accept`.

`worker.js` is a Cloudflare Worker that sits in front of Pages and does those
things. Browsers get the same pages; only the headers change.

## Status

Written and unit-tested (`node --test tests/worker.test.mjs`). **Not deployed.**

Until it is deployed, khipuai.co has only the headers GitHub Pages chooses to
send, and the site cannot add any of its own. Each page carries a Content
Security Policy in a `<meta>` tag, which limits what the page may load and
run, but a `<meta>` tag cannot:

- turn on HSTS (browsers accept it only as a header),
- stop other sites from showing the pages in a frame (`frame-ancestors` and
  `X-Frame-Options` work only as headers), or
- set `X-Content-Type-Options` or `Permissions-Policy`.

While the site is hosted on GitHub Pages, putting Cloudflare in front of it
(this worker, or the zone settings in "Workers Free plan: the daily request
limit" below) is the only way to get real HTTP security headers, including
HSTS and `frame-ancestors`, on khipuai.co.

## What it does

### Blocks internal files

These addresses get a 404, even if such a file ever reaches the origin:

- `README.md` and `AGENTS.md`, in any folder;
- the `docs`, `edge`, `tools` and `tests` folders, in any folder;
- `logos/SOURCES.md`;
- every file or folder whose name starts with a dot (`.git`, `.github`,
  `.gitignore`, `.nojekyll`, `.env` and so on), except a top-level
  `/.well-known/`, which stays public for `security.txt` and for the checks
  that renew the site's HTTPS certificate.

The Pages workflow already leaves these files out of the published site. The
worker is a second line of defence, and a test checks that the two agree.

Before checking, the worker reads the address the way a lenient web server
might, so a disguised address gets the same 404 as the plain one:

- percent-encoding is undone until nothing changes, so `/%64ocs/` and the
  double-encoded `/%2564ocs/` both become `/docs/`;
- look-alike characters become plain ones (a fullwidth `／` is a `/`);
- backslashes become slashes, repeated slashes count as one, and `.` and `..`
  segments are resolved (`/tests/../docs/` is `/docs/`);
- letter case is ignored, and trailing dots and spaces are cut from each
  segment (`/docs./` is `/docs/`).

Addresses that cannot be read safely also get a 404: broken encoding (such as
`%E0%A4%A`, or `%C0%AE`, an old trick for writing a dot), more than four
layers of encoding, control or invisible characters, any of
`? # ; : * < > | "` once decoded, and segments made only of dots and spaces.
No page on the site uses any of these.

The Markdown lookup is protected too. It never asks another host for a file
(an address such as `//example.com/x.html` cannot make the worker fetch from
example.com), it does not follow redirects, and it never answers a page
address with an internal file (`/README.html` is not answered with
`/README.md`).

### Adds security headers

On every response:

| Header | Value | What it does |
| --- | --- | --- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Browsers that have seen it use only HTTPS for khipuai.co and every subdomain, for one year. |
| `X-Content-Type-Options` | `nosniff` | Browsers trust the declared file type and never guess. |
| `X-Frame-Options` | `SAMEORIGIN` | Older browsers do not let other sites frame the pages. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Other sites see only `https://khipuai.co`, not the full address. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()` | Turns off browser features the site never uses, including the Topics advertising API. |

The worker always sets its own HSTS value, replacing any value from the origin.

On HTML responses it also sends a `Content-Security-Policy` (the full policy
is in `worker.js`). Its main additions to the pages' own `<meta>` policies:

- `frame-ancestors 'self'`: no other site can show the pages in a frame,
  which protects visitors against clickjacking.
- `upgrade-insecure-requests`: any `http://` address a page uses is fetched
  over HTTPS.

It allows the same outside services the pages use: Google Analytics 4, the
Meta Pixel, Calendly, Cloudflare Turnstile and the Google Apps Script endpoint
behind the self-assessment form.

Its `script-src` keeps `'unsafe-inline'` on purpose. Each page's `<meta>`
policy allows its inline scripts only by their exact hashes, and the browser
enforces both policies, so an inline script runs only if the page's own policy
lists its hash. A header is the same for every page and cannot list each
page's hashes; without `'unsafe-inline'` it would block every inline script.
A test checks that the header allows everything each page's own policy
allows, so deploying the worker cannot break a page. When a page's policy
gains a new outside service, add that service to the header policy too.

### Markdown for AI agents

- `Accept: text/markdown` and the page has a Markdown twin (`index.md` beside
  `index.html`): the Markdown, with `Content-Type: text/markdown` and
  `Vary: Accept`.
- `Accept: text/markdown` and the page does not exist: a 404 with the body of
  `404.md`, also as `text/markdown`.
- Everything else passes through, with `Vary: Accept` on HTML so shared caches
  never hand Markdown to a browser or HTML to an agent.

The Markdown files it serves (`index.md`, `about/index.md`, `es/index.md`,
`contact/index.md`, `404.md`) are static files in this repository, so they
are also reachable directly at their own addresses without the worker.

## Before deploying: check every subdomain

`includeSubDomains` tells browsers to use HTTPS for every subdomain of
khipuai.co, and they remember it for a year. Before the first deploy, list
every DNS record for khipuai.co and confirm that each subdomain that answers
web requests works over HTTPS with a valid certificate: `www`, and any other
web address such as a link-tracking subdomain an email service adds. If one
cannot, change `HSTS` in `worker.js` to `max-age=31536000` without
`includeSubDomains` (and update the HSTS tests) until it can.

Email delivery (MX, SPF, DKIM, DMARC) is not affected by HSTS.

## Workers Free plan: the daily request limit

On the Workers Free plan a worker can handle 100,000 requests a day; the
count resets at midnight UTC. The route in `wrangler.toml` (`khipuai.co/*`)
sends every request for the site through the worker, pages, images and fonts
alike, so heavy traffic or a deliberate flood of requests can use up the day's
quota. What happens next depends on the route's request limit failure mode
(in the Cloudflare dashboard, on the worker's routes):

- Fail closed: visitors get a Cloudflare error page (error 1027) instead of
  the site until the quota resets.
- Fail open: requests skip the worker and go straight to GitHub Pages. The
  site stays up, but responses lose the worker's security headers and its
  blocking of internal paths (the Pages workflow already leaves those files
  out), and agents get HTML instead of Markdown.

Once the zone is on Cloudflare, put the security headers where no quota
applies:

1. SSL/TLS > Edge Certificates: turn on HSTS (the same values as `HSTS` in
   `worker.js`, after "Before deploying: check every subdomain" above) and
   Always Use HTTPS.
2. Rules > Transform Rules > Modify Response Header: one rule for khipuai.co
   that sets `Content-Security-Policy` (the value in `worker.js`, which
   includes `frame-ancestors 'self'`), `X-Frame-Options`,
   `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`, with
   the values in the table above. Use "Set", not "Add", so each header appears
   once. Afterwards, check that `self-assessment.pdf` still opens in the
   browser; if it does not, leave paths that contain `.pdf` out of the rule.

Neither needs a worker. Then keep the worker only for Markdown negotiation,
with its route set to fail open, so running out of quota costs agents their
Markdown and nothing else; or, to keep everything the worker does, run it on
Workers Paid, which has no daily request limit. After either change, run the
`curl` checks in step 8 below.

## To deploy (needs approval and Cloudflare access)

1. If DNSSEC is on for khipuai.co at Porkbun, turn it off first and wait for
   the change to spread; otherwise the domain stops resolving when the
   nameservers change. It can be turned on again later with Cloudflare's
   record.
2. Add `khipuai.co` to a Cloudflare account (free plan is enough) and copy
   every existing Porkbun DNS record, including the GitHub Pages A/AAAA
   records, the `www` CNAME, every mail record (MX, SPF, DKIM, DMARC) and any
   other TXT records. Mail records stay DNS only (not proxied).
3. Switch the domain's nameservers at Porkbun to the two Cloudflare ones.
4. Set the GitHub Pages records to Proxied and SSL mode to Full. Never use
   Flexible: it reaches GitHub over plain HTTP, which loops with GitHub's
   Enforce HTTPS. Turn on Always Use HTTPS. Keep Enforce HTTPS on in the
   GitHub Pages settings.
5. Leave off Cloudflare features that add scripts to pages or rewrite them:
   Rocket Loader, Zaraz, automatic Web Analytics and JavaScript detections.
   The pages' policies allow inline scripts only by their exact hashes and
   scripts only from listed hosts, so these would be blocked (Rocket Loader
   would also stop the site's own scripts from running).
6. Complete "Before deploying: check every subdomain" above.
7. From this folder: `npx wrangler deploy` (log in with `npx wrangler login`;
   never commit a Cloudflare API token).
8. Verify:

```
# Markdown negotiation
curl -sS -L -i -H 'Accept: text/markdown' https://khipuai.co/
curl -sS -L -i -H 'Accept: text/html' https://khipuai.co/
curl -sS -L -i -H 'Accept: text/markdown' https://khipuai.co/some-path-that-does-not-exist

# Security headers
curl -sS -I https://khipuai.co/

# Internal files, plain and disguised (curl tidies ../ unless --path-as-is)
for p in /AGENTS.md /docs/GO_LIVE_CHECKLIST.md /%64ocs/GO_LIVE_CHECKLIST.md \
         /%2564ocs/GO_LIVE_CHECKLIST.md /docs./GO_LIVE_CHECKLIST.md /.git/config /.gitignore; do
  curl -sS -o /dev/null -w "%{http_code} $p\n" "https://khipuai.co$p"
done
curl -sS --path-as-is -o /dev/null -w '%{http_code}\n' 'https://khipuai.co/tests/../docs/GO_LIVE_CHECKLIST.md'

# Public files are still served
curl -sS -o /dev/null -w '%{http_code}\n' https://khipuai.co/.well-known/security.txt
```

Expected: Markdown with `Vary: Accept`; HTML; a 404 with
`Content-Type: text/markdown` and a body that links to llms.txt. The `-I`
response lists `Strict-Transport-Security`, `Content-Security-Policy` (with
`frame-ancestors 'self'`), `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy` and `Permissions-Policy`. Every internal file gives 404;
`security.txt` gives 200 once it is published.

9. In a browser, open the English and Spanish home pages and the
   self-assessment with the developer console open. Expect no Content
   Security Policy errors, a working Calendly booking popup, a working
   self-assessment email form, and the visit in Google Analytics Realtime.

Rollback: `npx wrangler delete` (or remove the route). Pages keeps serving.
Browsers that already saw the HSTS header keep using HTTPS for up to a year
after a rollback, which is harmless while khipuai.co and its subdomains keep
serving HTTPS. To withdraw HSTS, first deploy with `max-age=0` and keep it
long enough for returning visitors to pick it up.

## HSTS preload (later, optional)

Preloading puts khipuai.co on a list built into browsers, so even a first
visit uses HTTPS. It is hard to undo: removal takes months to reach visitors'
browsers. Add it only when all of this is true:

- the worker has sent the current header for several weeks with no HTTPS
  problems on khipuai.co or any subdomain;
- every subdomain, now and in future, will serve HTTPS;
- `http://khipuai.co` redirects to `https://khipuai.co` on the same host
  before going anywhere else.

Then change `HSTS` in `worker.js` to
`max-age=63072000; includeSubDomains; preload` (two years; the list requires
at least one), update the HSTS tests in `tests/worker.test.mjs`, deploy, and
submit the domain at https://hstspreload.org/.
