# The quote estimator

Five multiple-choice questions, then a recommended starting engagement, a
relevant build pattern, and an audit price range for that situation and region.
Replaces the old fixed two-tier pricing.

## Why not a chat bot

A free-text conversational version was built and tried, then reverted:
answering open questions by typing turned out to be more work for the visitor
than picking from four options. Picking is two seconds; describing your own
operation in prose is not.

The chat, its keyword brain and a complete, deployable Cloudflare Worker are
all in git at commit `d12b8ad` if it is ever wanted again:

```
git show d12b8ad -- v2/shared/quote-bot.js
git show d12b8ad -- v2/worker/quote-worker.js
```

That Worker is worth keeping in mind regardless: it holds the design rule that
the model never picks a price, it only classifies. Any future AI on this site
should work the same way.

The middle option was never tried: a thread with tappable suggested replies as
well as a text box. It keeps the conversational feel without making anyone
compose a paragraph.

## What this needs to go live

The Pricing section is gone. In its place, `/v2/kinetic/#fee` (and `/v2/es/#fee`)
asks five questions and returns a recommended starting point plus a price range
for that situation and region.

## What works today

Everything except the conversation. The questions, the regional rate table, both
languages, the estimate, the fallbacks: all of it runs in the page with no
backend and no cost.

## What the conversational AI needs, and why I could not just build it

An LLM needs an API key. **A key cannot go in this page.** Everything here is
static and public: a key in the JavaScript is readable from view-source the
moment the site ships, and anyone who finds it can spend against Wil's account
until it is revoked. There is no way to hide it client-side. Not in a variable,
not obfuscated, not in a separate .js file.

So the AI needs somewhere server-side to run. Three options, cheapest first:

| | Cost | Notes |
|---|---|---|
| **Cloudflare Workers** | free tier covers this easily | No account here yet. Simplest fit for a static site. |
| **Azure Functions** | pay per call | You already use Azure for GLH and Certified Payroll, so billing and access exist. |
| **Vercel / Netlify functions** | free tier | Means moving hosting off GitHub Pages, which is a bigger change. |

Whichever it is, someone has to create the account and hold the API key. That is
Wil's spend and Wil's account, so it is his call, not mine.

### When it exists

Set `QUOTE_API` in `shared/quote.js` to the endpoint. Nothing else changes. The
endpoint receives:

```json
{ "answers": { "scope": "few", "systems": "some", "rigour": "yes", "region": "na" },
  "lang": "en" }
```

and must return `{ "low": 4250, "high": 5400 }`, optionally with `note`.

### Guardrails already in place

- **A returned price is sanity-checked against the table.** If the model comes
  back below 40% or above 250% of the local figure, the local number is used
  instead and the result is marked `local-fallback`. An LLM asked for a price
  will eventually produce a wrong one; on a public page that is a number someone
  screenshots.
- **Timeout and catch-all fallback.** If the endpoint is slow, down, or the
  visitor is offline, the table answers. A visitor never sees an error where a
  price should be.
- **It says "estimate, not a binding quote"** in both languages, every time.

### Guardrails still needed before it goes live

- **Rate limiting** on the endpoint. Without it, one script can run up a bill.
- **Prompt-injection hardening.** People will try to talk it into quoting $1,
  and screenshot it when it works. The endpoint should return only a number from
  a constrained range, never free text it was talked into.
- **Logging** of what was quoted to whom, so a disputed number can be checked.

## The prices are placeholders

North America is set to the $2,500 the site has been charging. **Every other
region is a multiplier Wil has to set**, in `REGIONS` in `shared/quote.js`. They
are flagged in the UI as not final so nobody treats them as real yet.

Current spread, North America:

| Situation | Range |
|---|---|
| One workflow, one or two systems, internal use | $2,250 – $2,900 |
| Several departments, 5+ systems, audit-grade | $5,700 – $7,300 |

## The legal note

Regional pricing is normal, but the **EU Geo-blocking Regulation (2018/302)**
restricts differing terms based on a customer's nationality or residence for
certain services. Charging an EU buyer differently from a US one is generally
fine; refusing to serve them, or varying price *between* EU member states, is
where it bites. Worth a lawyer's eye before Europe goes live rather than after.

## What changed elsewhere

"One fixed fee, no meter" was the site's positioning and appeared throughout.
Every instance inside `v2` has been reworded: the hero sub, the meta and og
descriptions, the FAQ answer, the pricing note, in both languages. **The live
site still says it in 21 places**, which is correct while it is still the live
site, and goes away when v2 replaces it.
