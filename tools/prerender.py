"""Write a no-JavaScript copy of the Kinetic pages into their HTML, plus a
Markdown twin next to each page.

Why: the Kinetic pages build their content in the browser, so a crawler or AI
agent that does not run JavaScript sees an empty <main>. This renders each page
in headless Chromium, reads the text the visitor actually sees, and writes it
back as plain semantic HTML between the prerender markers. buildKinetic()
replaces the whole track on load, so visitors still get the designed page; the
copy only exists for readers that never run the script.

The same text is written as Markdown (index.md beside each page). Those files
are what the edge worker returns for `Accept: text/markdown`.

Run from the repository root after any content change:

    python tools/prerender.py          # rewrite pages and .md files
    python tools/prerender.py --check  # exit 1 if anything is out of date

Requires Python Playwright with Chromium (`pip install playwright`,
`playwright install chromium`). Uses a throwaway local server on a free port.
"""

import argparse
import functools
import html
import http.server
import pathlib
import re
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
START = '<!-- prerender:start -->'
END = '<!-- prerender:end -->'
SITE = 'https://khipuai.co'

# Pages whose content only exists after JavaScript runs.
PAGES = [
    {'path': '/', 'file': 'index.html', 'lang': 'en'},
    {'path': '/es/', 'file': 'es/index.html', 'lang': 'es'},
    {'path': '/about/', 'file': 'about/index.html', 'lang': 'en'},
]

FOOTER = {
    'en': [
        ('Contact', '/contact/'),
        ('About', '/about/'),
        ('Privacy', '/privacy.html'),
        ('Guide for AI agents (llms.txt)', '/llms.txt'),
    ],
    'es': [
        ('Contacto', '/contact/'),
        ('Nosotros', '/es/about/'),
        ('Privacidad', '/privacy.html'),
        ('Guía para agentes de IA (llms.txt, en inglés)', '/llms.txt'),
    ],
}

# Walks the rendered track and returns ordered text blocks. Decorative and
# interactive pieces (icons, the ticker, the live estimator, swipe hints) are
# skipped; they carry no content an agent can use.
EXTRACT = r"""
() => {
  const SKIP = '.p-fee,svg,canvas,img,script,style,.mq,.swipe-note,.hero-node-labels,#quote,[aria-hidden="true"]';
  // textContent, not innerText: innerText applies CSS (uppercase kickers,
  // closed FAQ answers come back empty). A space goes between child elements
  // so "headline<em>tail</em>" does not run together.
  const text = el => { const c = el.cloneNode(true); c.querySelectorAll('*').forEach(e => e.before(' ')); return c.textContent; };
  const clean = s => s.replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
  const out = [];
  const walk = el => {
    for (const n of el.children) {
      if (n.matches(SKIP)) continue;
      const tag = n.tagName;
      if (/^H[1-6]$/.test(tag)) { out.push({t: tag.toLowerCase(), x: clean(text(n))}); continue; }
      if (tag === 'DETAILS') {
        const s = n.querySelector('summary');
        const a = [...n.children].filter(c => c.tagName !== 'SUMMARY').map(c => clean(text(c))).join(' ');
        out.push({t: 'q', x: clean(s ? text(s) : ''), a});
        continue;
      }
      if (tag === 'LI') { out.push({t: 'li', x: clean(text(n))}); continue; }
      if (tag === 'P' || n.classList.contains('kick') || n.classList.contains('cap')) {
        const strong = n.querySelector(':scope > strong');
        const x = clean(text(n));
        if (strong && n.children.length === 2) {
          const head = clean(text(strong));
          out.push({t: 'p', x: head + ': ' + clean(x.slice(head.length))});
        } else if (x) out.push({t: 'p', x});
        continue;
      }
      if (tag === 'A' && n.classList.contains('btn')) { out.push({t: 'a', x: clean(text(n)), h: n.getAttribute('href')}); continue; }
      if (tag === 'B' || tag === 'BUTTON') continue;
      walk(n);
    }
  };
  walk(document.getElementById('track'));
  return {title: document.title, blocks: out.filter(b => b.x)};
}
"""


def absolute(href):
    if href.startswith(('http://', 'https://', 'mailto:')):
        return href
    return SITE + '/' + href.lstrip('./')


def to_html(blocks, lang):
    parts = ['<div class="prerender">']
    in_list = False
    for b in blocks:
        if b['t'] == 'li':
            if not in_list:
                parts.append('<ul>')
                in_list = True
            parts.append(f'<li>{html.escape(b["x"], quote=False)}</li>')
            continue
        if in_list:
            parts.append('</ul>')
            in_list = False
        x = html.escape(b['x'], quote=False)
        if b['t'] in ('h1', 'h2', 'h3', 'h4'):
            parts.append(f'<{b["t"]}>{x}</{b["t"]}>')
        elif b['t'] == 'q':
            parts.append(f'<h3>{x}</h3>')
            parts.append(f'<p>{html.escape(b["a"], quote=False)}</p>')
        elif b['t'] == 'a':
            parts.append(f'<p><a href="{html.escape(absolute(b["h"]))}">{x}</a></p>')
        else:
            parts.append(f'<p>{x}</p>')
    if in_list:
        parts.append('</ul>')
    links = ' | '.join(f'<a href="{h}">{html.escape(t)}</a>' for t, h in FOOTER[lang])
    parts.append(f'<p>{links}</p>')
    parts.append('</div>')
    return '\n'.join(parts)


def to_markdown(blocks, lang, path):
    lines = []
    prev = None
    for b in blocks:
        if b['t'] == 'li':
            if prev != 'li':
                lines.append('')
            lines.append(f'- {b["x"]}')
        elif b['t'] in ('h1', 'h2', 'h3', 'h4'):
            lines += ['', '#' * int(b['t'][1]) + ' ' + b['x']]
        elif b['t'] == 'q':
            lines += ['', f'### {b["x"]}', '', b['a']]
        elif b['t'] == 'a':
            lines += ['', f'[{b["x"]}]({absolute(b["h"])})']
        else:
            lines += ['', b['x']]
        prev = b['t']
    lines += ['', '---', '']
    lines.append('Canonical page: ' + SITE + path)
    lines.append(' | '.join(f'[{t}]({SITE}{h})' for t, h in FOOTER[lang]))
    return '\n'.join(lines).strip() + '\n'


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Quiet, directory=str(ROOT))
    httpd = socketserver.TCPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='report stale files, write nothing')
    args = ap.parse_args()

    httpd = serve()
    base = f'http://127.0.0.1:{httpd.server_address[1]}'
    stale = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        # Keep analytics and the pixel out of the render.
        page.route(re.compile(r'^https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
        for spec in PAGES:
            page.goto(base + spec['path'], wait_until='load')
            page.wait_for_selector('#track .panel')
            data = page.evaluate(EXTRACT)
            block = to_html(data['blocks'], spec['lang'])
            md = to_markdown(data['blocks'], spec['lang'], spec['path'])

            src = ROOT / spec['file']
            text = src.read_text(encoding='utf-8')
            if START not in text or END not in text:
                sys.exit(f'{spec["file"]}: prerender markers missing')
            head, rest = text.split(START, 1)
            _, tail = rest.split(END, 1)
            new = f'{head}{START}\n{block}\n{END}{tail}'
            md_file = src.with_suffix('.md')

            for target, content in ((src, new), (md_file, md)):
                current = target.read_text(encoding='utf-8') if target.exists() else None
                if current != content:
                    stale.append(str(target.relative_to(ROOT)))
                    if not args.check:
                        target.write_text(content, encoding='utf-8', newline='\n')
        browser.close()
    httpd.shutdown()

    if args.check and stale:
        print('Out of date, run python tools/prerender.py:\n  ' + '\n  '.join(stale))
        sys.exit(1)
    print(('Up to date' if args.check else 'Updated: ' + (', '.join(stale) or 'nothing')))


if __name__ == '__main__':
    main()
