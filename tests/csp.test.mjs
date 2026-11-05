// Content Security Policy on every page (security review, 2026-11-04).
// GitHub Pages cannot send HTTP headers, so each page carries its policy in a
// <meta http-equiv="Content-Security-Policy"> tag on the line right after
// <meta charset="utf-8">. Inline scripts are allowed by their SHA-256 hash
// only: after editing an inline script, put its new hash in that page's
// script-src (a failing check below prints it) and remove the old one.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { C } from '../shared/content.js';

const ROOT = new URL('../', import.meta.url);
const SITE = 'https://khipuai.co/';
const read = f => readFileSync(new URL(f, ROOT), 'utf8');

// Every page that ships: .html files outside the folders the Pages workflow
// leaves out, except Google's ownership token (a bare text file, not a page).
const SKIP = new Set(['.git', 'node_modules', '_site']);
const UNPUBLISHED = /^(docs|edge|tools|tests|\.github)\/$/;
const walk = (dir = '') => readdirSync(new URL(dir, ROOT), { withFileTypes: true }).flatMap(e => {
  if (!e.isDirectory()) return [`${dir}${e.name}`];
  const sub = `${dir}${e.name}/`;
  return SKIP.has(e.name) || UNPUBLISHED.test(sub) ? [] : walk(sub);
});
const PAGES = walk().filter(f => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f)).sort();

// ---- reading a page: its tags in order, with attributes ---------------------
// Script, style and similar bodies are kept as raw text, as the browser reads them.
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title', 'xmp', 'iframe', 'noembed', 'noframes']);
const ATTR = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", colon: ':', tab: '\t', newline: '\n', sol: '/' };
const decode = s => s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);?/gi, (m, e) => e[0] !== '#' ? NAMED[e.toLowerCase()] ?? m
  : String.fromCodePoint(/^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)));

function parse(html) {
  const tags = [];
  let i = 0, noscript = 0, line = 1, counted = 0;
  const lineAt = pos => { for (; counted < pos; counted++) if (html.charCodeAt(counted) === 10) line++; return line; };
  while ((i = html.indexOf('<', i)) >= 0) {
    if (html.startsWith('<!--', i)) { const e = html.indexOf('-->', i + 4); i = e < 0 ? html.length : e + 3; continue; }
    const close = /^<\/([a-z][a-z0-9-]*)/i.exec(html.slice(i, i + 40));
    if (close) { if (close[1].toLowerCase() === 'noscript') noscript = Math.max(0, noscript - 1); i += close[0].length; continue; }
    const open = /^<([a-z][a-z0-9-]*)/i.exec(html.slice(i, i + 40));
    if (!open) { i++; continue; }
    // The tag ends at the first > outside a quoted attribute value.
    let j = i + open[0].length, q = '';
    for (; j < html.length; j++) {
      const c = html[j];
      if (q) { if (c === q) q = ''; } else if (c === '>') break;
      else if ((c === '"' || c === "'") && /=\s*$/.test(html.slice(i, j))) q = c;
    }
    const name = open[1].toLowerCase(), attrs = new Map();
    for (const m of html.slice(i + open[0].length, j).matchAll(ATTR)) {
      const k = m[1].toLowerCase();
      if (!attrs.has(k)) attrs.set(k, decode(m[2] ?? m[3] ?? m[4] ?? ''));   // the first one wins, as in the browser
    }
    const tag = { name, attrs, at: i, end: j + 1, line: lineAt(i), inNoscript: noscript > 0 };
    tags.push(tag);
    i = j + 1;
    if (name === 'noscript') noscript++;
    if (RAW_TEXT.has(name)) {
      const end = new RegExp(`</${name}[\\s/>]`, 'i').exec(html.slice(i));
      tag.text = html.slice(i, end ? i + end.index : html.length);
      i += tag.text.length;
    }
  }
  return tags;
}

// Inline scripts the browser runs, and so the policy governs: no src, and a
// type that is empty, a JavaScript MIME type, module, importmap or
// speculationrules. JSON-LD and other data blocks are not run.
const JS_MIME = new Set(['application/ecmascript', 'application/javascript', 'application/x-ecmascript', 'application/x-javascript',
  'text/ecmascript', 'text/javascript', 'text/javascript1.0', 'text/javascript1.1', 'text/javascript1.2', 'text/javascript1.3',
  'text/javascript1.4', 'text/javascript1.5', 'text/jscript', 'text/livescript', 'text/x-ecmascript', 'text/x-javascript']);
const runs = t => {
  const type = (t.attrs.get('type') ?? '').trim().toLowerCase();
  return type === '' || ['module', 'importmap', 'speculationrules'].includes(type) || JS_MIME.has(type.split(';')[0].trim());
};
const inlineScripts = tags => tags.filter(t => t.name === 'script' && !t.attrs.has('src') && !t.inNoscript && runs(t));
// The browser hashes the script text with line endings normalized to LF.
const digest = (alg, text) => `'${alg}-${createHash(alg).update(text.replace(/\r\n?/g, '\n'), 'utf8').digest('base64')}'`;

// ---- the policy --------------------------------------------------------------
const cspMetas = tags => tags.filter(t => t.name === 'meta' && (t.attrs.get('http-equiv') ?? '').trim().toLowerCase() === 'content-security-policy');
function policy(content) {
  const dirs = new Map(), dup = [];
  for (const part of content.split(';')) {
    const [name, ...values] = part.trim().split(/\s+/).filter(Boolean);
    if (!name) continue;
    if (dirs.has(name.toLowerCase())) dup.push(name.toLowerCase()); else dirs.set(name.toLowerCase(), values);
  }
  return { dirs, dup };
}
const KNOWN = new Set(['default-src', 'script-src', 'script-src-elem', 'script-src-attr', 'style-src', 'style-src-elem', 'style-src-attr',
  'img-src', 'font-src', 'connect-src', 'media-src', 'object-src', 'frame-src', 'child-src', 'worker-src', 'manifest-src', 'fenced-frame-src',
  'base-uri', 'form-action', 'upgrade-insecure-requests', 'block-all-mixed-content', 'require-trusted-types-for', 'trusted-types']);
const IGNORED_IN_META = new Set(['frame-ancestors', 'report-uri', 'sandbox']);
// What a script directive may list: the site itself, hashes, and https hosts
// (a leading *. covers subdomains). Never 'unsafe-inline', 'unsafe-eval',
// 'unsafe-hashes', nonces (useless in a static page), *, or a scheme such as
// https:, http:, data: or blob:.
const SCRIPT_SOURCE = /^('self'|'none'|'strict-dynamic'|'report-sample'|'sha(256|384|512)-[A-Za-z0-9+/_-]+={0,2}'|https:\/\/(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s;,']*)?)$/i;
const FALLBACK = {
  script: ['script-src-elem', 'script-src', 'default-src'], style: ['style-src-elem', 'style-src', 'default-src'],
  img: ['img-src', 'default-src'], font: ['font-src', 'default-src'], connect: ['connect-src', 'default-src'],
  frame: ['frame-src', 'child-src', 'default-src'],
};
const sources = (dirs, kind) => dirs.get(FALLBACK[kind].find(d => dirs.has(d))) ?? [];

const DEFAULT_PORT = { 'https:': '443', 'http:': '80' };
const decodePath = p => { try { return decodeURIComponent(p); } catch { return p; } };
// Whether a source list lets the page at `page` load `url` (CSP host-source
// matching: scheme, host with an optional leading *., default ports, and a
// path, which unlike the rest is case-sensitive).
function allows(list, url, page) {
  return list.some(s => {
    const t = s.toLowerCase();
    if (t === "'self'") return url.origin === page.origin;
    if (t.startsWith("'")) return false;
    if (/^[a-z][a-z0-9+.-]*:$/.test(t)) return url.protocol === t;
    const m = /^(?:([a-z][a-z0-9+.-]*):\/\/)?(\*|(?:\*\.)?[^/:]+)(?::(\d+|\*))?(\/.*)?$/i.exec(s);
    if (!m) return false;
    const scheme = m[1]?.toLowerCase(), host = m[2].toLowerCase(), port = m[3], path = m[4];
    const want = scheme ? `${scheme}:` : page.protocol;
    if (url.protocol !== want && !(want === 'http:' && url.protocol === 'https:')) return false;
    const h = url.hostname.toLowerCase();
    if (host !== '*' && (host.startsWith('*.') ? !h.endsWith(host.slice(1)) : h !== host)) return false;
    // No port in the source means the default one (URL.port is '' for a default port).
    const urlPort = url.port || DEFAULT_PORT[url.protocol];
    if (port !== '*' && urlPort !== (port ?? DEFAULT_PORT[url.protocol])) return false;
    if (!path) return true;
    const prefix = decodePath(path), p = decodePath(url.pathname);
    return prefix.endsWith('/') ? p.startsWith(prefix) : p === prefix;
  });
}

// Each page with its address on the site, tags and policy.
const pageUrl = f => new URL(f.replace(/(^|\/)index\.html$/, '$1'), SITE);
const PARSED = PAGES.map(f => {
  const html = read(f), tags = parse(html), metas = cspMetas(tags);
  return { f, html, url: pageUrl(f), tags, metas, ...policy(metas[0]?.attrs.get('content') ?? '') };
});
const loads = (p, src) => p.tags.some(t => t.name === 'script' && t.attrs.has('src') && new URL(t.attrs.get('src'), p.url).href === new URL(src, p.url).href);
const need = (problems, p, kind, url, why) => {
  if (!allows(sources(p.dirs, kind), new URL(url), p.url)) problems.push(`${p.f}: ${FALLBACK[kind].find(d => p.dirs.has(d)) ?? `${kind}-src`} must allow ${url} (${why})`);
};

// ---- checks ------------------------------------------------------------------
test('the check reads every page that ships', () => {
  for (const f of ['index.html', 'es/index.html', '404.html', 'self-assessment/index.html', 'portal/index.html', 'demos/support/index.html', 'privacy.html'])
    assert.ok(PAGES.includes(f), f);
  assert.ok(!PAGES.some(f => /^google[0-9a-f]+\.html$|^(docs|edge|tools|tests)\//.test(f)));
});

test('every page has one CSP meta tag, in the head, before anything loads', () => {
  const problems = [];
  for (const p of PARSED) {
    if (p.metas.length !== 1) { problems.push(`${p.f}: ${p.metas.length} CSP meta tags (needs exactly one)`); continue; }
    const meta = p.metas[0];
    if (!(meta.attrs.get('content') ?? '').trim()) problems.push(`${p.f}: the CSP meta tag is empty`);
    const first = p.tags.find(t => ['script', 'link', 'style', 'base'].includes(t.name));
    if (first && first.at < meta.at) problems.push(`${p.f}: <${first.name}> on line ${first.line} comes before the CSP meta tag on line ${meta.line}; the CSP line goes right after <meta charset="utf-8">`);
    const body = p.tags.find(t => t.name === 'body');
    if ((body && body.at < meta.at) || meta.inNoscript) problems.push(`${p.f}: the CSP meta tag must be in the head`);
    // The charset stays first, inside the first 1024 bytes the browser checks.
    const charset = p.tags.find(t => t.name === 'meta' && t.attrs.has('charset'));
    if (!charset || charset.at > meta.at || Buffer.byteLength(p.html.slice(0, charset.end)) > 1024)
      problems.push(`${p.f}: <meta charset="utf-8"> must come first, before the CSP meta tag`);
  }
  assert.deepEqual(problems, []);
});

test('every inline script is allowed by its hash, and no listed hash is stale', () => {
  const problems = [];
  for (const p of PARSED.filter(p => p.metas.length === 1)) {
    const listed = sources(p.dirs, 'script').filter(s => /^'sha(256|384|512)-/i.test(s));
    const used = new Set();
    for (const t of inlineScripts(p.tags)) {
      const forms = ['sha256', 'sha384', 'sha512'].map(a => digest(a, t.text));
      const hit = listed.find(s => forms.includes(s));
      if (hit) used.add(hit);
      else problems.push(`${p.f}: the inline script on line ${t.line} is not allowed. Add ${forms[0]} to script-src (and remove the hash of the script's old text)`);
    }
    for (const s of listed) if (!used.has(s)) problems.push(`${p.f}: script-src lists ${s}, which matches no inline script on the page. Remove it`);
  }
  assert.deepEqual(problems, []);
});

test('script sources are strict; object-src, base-uri and form-action are locked down', () => {
  const problems = [];
  for (const p of PARSED.filter(p => p.metas.length === 1)) {
    for (const d of p.dup) problems.push(`${p.f}: ${d} appears twice (the browser ignores the second)`);
    for (const d of p.dirs.keys()) {
      if (IGNORED_IN_META.has(d)) problems.push(`${p.f}: ${d} has no effect in a meta tag`);
      else if (!KNOWN.has(d)) problems.push(`${p.f}: unknown directive ${d}`);
    }
    if (!p.dirs.has('script-src')) problems.push(`${p.f}: no script-src`);
    for (const d of ['script-src', 'script-src-elem', 'script-src-attr'])
      for (const s of p.dirs.get(d) ?? []) if (!SCRIPT_SOURCE.test(s)) problems.push(`${p.f}: ${d} must not allow ${s}`);
    // A page that has no scripts allows none.
    if (!p.tags.some(t => t.name === 'script' && (t.attrs.has('src') || runs(t))) && (p.dirs.get('script-src') ?? []).join(' ') !== "'none'")
      problems.push(`${p.f}: the page has no scripts, so script-src should be 'none'`);
    if ((p.dirs.get('object-src') ?? []).join(' ') !== "'none'") problems.push(`${p.f}: object-src must be 'none'`);
    const base = p.dirs.get('base-uri') ?? [];
    if (!base.length || base.some(s => !["'self'", "'none'"].includes(s))) problems.push(`${p.f}: base-uri must be 'self' or 'none'`);
    const form = p.dirs.get('form-action') ?? [];
    if (!form.length || form.some(s => !/^('self'|'none'|https:\/\/[a-z0-9.-]+\.[a-z]+(\/\S*)?)$/i.test(s))) problems.push(`${p.f}: form-action must be 'self', 'none' or https addresses`);
  }
  assert.deepEqual(problems, []);
});

test('every script a page loads is allowed by its script-src', () => {
  const problems = [];
  for (const p of PARSED.filter(p => p.metas.length === 1)) {
    for (const t of p.tags.filter(t => t.name === 'script' && t.attrs.has('src'))) {
      const url = new URL(t.attrs.get('src'), p.url);
      if (!allows(sources(p.dirs, 'script'), url, p.url)) problems.push(`${p.f}: line ${t.line} loads ${url.href}, which script-src does not allow`);
    }
  }
  assert.deepEqual(problems, []);
});

test('pages with the Meta Pixel consent script allow what it loads and opens', () => {
  const problems = [];
  // The URLs shared/meta-pixel.js writes into the page: the Pixel, and Calendly's widget script and stylesheet.
  const pixel = [...read('shared/meta-pixel.js').matchAll(/'(https:\/\/[^']+\.(js|css))'/g)];
  assert.ok(pixel.length >= 3, 'meta-pixel.js names the Pixel and Calendly files');
  const pages = PARSED.filter(p => loads(p, '/shared/meta-pixel.js'));
  assert.ok(pages.length > 0, 'pages load meta-pixel.js');
  for (const p of pages) {
    need(problems, p, 'script', 'https://connect.facebook.net/en_US/fbevents.js', 'the Meta Pixel, after consent');
    need(problems, p, 'script', 'https://assets.calendly.com/assets/external/widget.js', 'the Calendly popup');
    need(problems, p, 'frame', 'https://calendly.com/wmorapal/30min', 'the Calendly popup');
    need(problems, p, 'img', 'https://www.facebook.com/tr/', 'Meta Pixel events');
    for (const [, url, ext] of pixel) need(problems, p, ext === 'css' ? 'style' : 'script', url, 'named in meta-pixel.js');
  }
  assert.deepEqual(problems, []);
});

// Where gtag.js sends its data, from Google's CSP guidance for Google Analytics 4.
test('pages with Google Analytics allow its collection endpoints', () => {
  const problems = [];
  const pages = PARSED.filter(p => p.tags.some(t => /^https:\/\/www\.googletagmanager\.com\/gtag\/js/.test(t.attrs.get('src') ?? '')));
  assert.ok(pages.length > 0, 'pages load gtag.js');
  for (const p of pages) {
    for (const u of ['https://region1.google-analytics.com/g/collect', 'https://region1.analytics.google.com/g/collect', 'https://www.googletagmanager.com/td'])
      need(problems, p, 'connect', u, 'Google Analytics');
    for (const u of ['https://www.google-analytics.com/collect', 'https://www.googletagmanager.com/td']) need(problems, p, 'img', u, 'Google Analytics');
  }
  assert.deepEqual(problems, []);
});

test('only the self-assessment can reach the email endpoint and the optional bot check', () => {
  const problems = [];
  const quiz = read('self-assessment/quiz.js');
  const turnstile = [...quiz.matchAll(/'(https:\/\/challenges\.cloudflare\.com\/[^']+)'/g)].map(m => m[1]);
  const usesQuiz = p => inlineScripts(p.tags).some(t => /['"][^'"]*\bquiz\.js['"]/.test(t.text));
  assert.ok(PARSED.some(usesQuiz), 'the self-assessment page loads quiz.js');
  for (const p of PARSED.filter(p => p.metas.length === 1)) {
    if (usesQuiz(p)) {
      if (C.leads) need(problems, p, 'connect', C.leads, 'the email form, C.leads');
      // Apps Script answers with a redirect to script.googleusercontent.com.
      if (C.leads && new URL(C.leads).hostname === 'script.google.com')
        need(problems, p, 'connect', 'https://script.googleusercontent.com/macros/echo', 'the reply of the email form\'s Apps Script');
      for (const u of turnstile) need(problems, p, 'script', u, 'Cloudflare Turnstile, named in quiz.js');
      if (turnstile.length) need(problems, p, 'frame', 'https://challenges.cloudflare.com/cdn-cgi/challenge-platform/', 'the Turnstile widget');
    } else {
      if (C.leads && allows(sources(p.dirs, 'connect'), new URL(C.leads), p.url)) problems.push(`${p.f}: only the self-assessment should allow the email endpoint`);
      if (allows(sources(p.dirs, 'script'), new URL('https://challenges.cloudflare.com/turnstile/v0/api.js'), p.url)) problems.push(`${p.f}: only the self-assessment should allow Turnstile`);
    }
  }
  assert.deepEqual(problems, []);
});

test('the demo miniatures cannot reach any server', () => {
  const demos = PARSED.filter(p => p.f.startsWith('demos/'));
  assert.ok(demos.length >= 1);
  for (const p of demos) {
    for (const d of ['connect-src', 'frame-src', 'form-action']) assert.deepEqual(p.dirs.get(d), ["'none'"], `${p.f}: ${d}`);
    assert.ok((p.dirs.get('script-src') ?? []).every(s => /^'(self|sha(256|384|512)-[^']+)'$/.test(s)), `${p.f}: scripts come only from the site`);
  }
});

test('no page uses inline event handlers or javascript: URLs', () => {
  const found = [];
  for (const p of PARSED) for (const t of p.tags) for (const [k, v] of t.attrs) {
    if (/^on[a-z]+$/.test(k)) found.push(`${p.f}: line ${t.line}, <${t.name} ${k}>`);
    if (/javascript:/i.test(v.replace(/[\u0000- \u007f]/g, ''))) found.push(`${p.f}: line ${t.line}, <${t.name} ${k}="${v.slice(0, 40)}">`);
  }
  // The policy blocks both: put the code in a script file and use addEventListener.
  assert.deepEqual(found, []);
});
