# Edge worker: Markdown for AI agents

GitHub Pages ignores the `Accept` header, so on its own it cannot:

- return Markdown when an agent sends `Accept: text/markdown`, or
- return a Markdown 404 body for missing pages, or
- send `Vary: Accept`.

`worker.js` adds those three things and changes nothing a browser sees.
The Markdown files it serves (`index.md`, `about/index.md`, `es/index.md`,
`contact/index.md`, `404.md`) are static files in this repository, so they
are also reachable directly at their own URLs without the worker.

## Status

Written and unit-tested (`node --test tests/`). **Not deployed.**

## To deploy (needs approval and Cloudflare access)

1. Add `khipuai.co` to a Cloudflare account (free plan is enough) and copy
   the existing Porkbun DNS records, including the GitHub Pages A/AAAA
   records, the `www` CNAME and every mail record (MX, SPF, DKIM, DMARC).
2. Switch the domain's nameservers at Porkbun to the two Cloudflare ones.
3. Set the GitHub Pages records to Proxied and SSL mode to Full.
4. From this folder: `npx wrangler deploy`.
5. Verify:

```
curl -sS -L -i -H 'Accept: text/markdown' https://khipuai.co/
curl -sS -L -i -H 'Accept: text/html' https://khipuai.co/
curl -sS -L -i -H 'Accept: text/markdown' https://khipuai.co/some-path-that-does-not-exist
```

Expected: Markdown with `Vary: Accept`; HTML; a 404 with
`Content-Type: text/markdown` and a body that links to llms.txt.

Rollback: `npx wrangler delete` (or remove the route). Pages keeps serving.
