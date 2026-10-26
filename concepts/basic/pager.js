/* Pages instead of scrolling (Alex and Wil, 2026-10-21: "no scrolling on any
   pages besides the privacy and terms pages. The rest should have
   pagination").

   Everything between the header and the bottom of the window (the page's
   content, the closing band and the footer) is shown through a window the
   size of the screen. The content keeps its normal layout; it is cut into
   window-sized pages only at lines that pass through no heading, paragraph,
   list item, card or button, so nothing is ever split in half, even in two
   columns. A bar at the bottom moves between pages: Back, Next and one dot
   per page. The wheel, a swipe, Page Down / Page Up and Home / End do the
   same, and moving the keyboard focus to something on another page turns to
   that page. The pages are measured again whenever the window or the content
   changes size, so the cut always fits the screen in use, phones included.

   Use: const pager = mountPager({ labels, onEdge });
        pager.reset()        // after the content changes completely (page 1)
        pager.layout()       // measure again, keep the reader's place
        pager.unclip()       // show everything for measuring (zoom fit)
   onEdge(+1 | -1) is called when a gesture goes past the last or first page;
   it returns true if it handled the move. */

// What counts as one unbreakable piece. Pieces inside a piece are not looked at.
const ATOMS = 'h1,h2,h3,h4,h5,h6,p,li,dt,dd,img,svg,figcaption,blockquote,details,table,tr,label,input,select,textarea,iframe,hr,pre,'
  + '.btn,.pc,.member,.wl,.ctas,.cta-row,.qcard,.ba-arrow';

export function mountPager({ labels, onEdge = () => false }) {
  const root = document.documentElement;
  const hd = document.querySelector('.hd');
  const W = document.createElement('div'); W.id = 'pages';
  const inner = document.createElement('div'); inner.id = 'pages-in';
  W.append(inner); hd.after(W);
  for (const el of [document.getElementById('main'), document.querySelector('.band'), document.querySelector('.ft')]) if (el) inner.append(el);
  const bar = document.createElement('nav');
  bar.className = 'pager'; bar.setAttribute('aria-label', labels.pages); bar.hidden = true;
  bar.innerHTML = `<button type="button" class="pg-btn pg-prev"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>${labels.back}</button>
    <ol class="pg-dots"></ol><span class="pg-count" aria-live="polite"></span>
    <button type="button" class="pg-btn pg-next">${labels.next}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>`;
  W.after(bar);
  root.classList.add('paged');
  const prev = bar.querySelector('.pg-prev'), next = bar.querySelector('.pg-next'), dots = bar.querySelector('.pg-dots'), count = bar.querySelector('.pg-count');

  let pages = [[0, 0, 0]], cur = 0, total = 0, tailTop = 0, tailH = 0;

  // Nothing here may scroll: a browser that scrolls a clipped box to show a
  // focused or linked element is put back, and the pager turns the page.
  W.addEventListener('scroll', () => { W.scrollTop = 0; W.scrollLeft = 0; });
  addEventListener('scroll', () => { if (scrollY || scrollX) scrollTo(0, 0); });

  // The closing band and footer sit at the bottom of the window on the last
  // page, instead of floating under the content with blank space below
  // (Alex, 2026-10-26: "get the black bar at the bottom").
  const tail = [inner.querySelector('.band'), inner.querySelector('.ft')].filter(Boolean);
  const unclip = () => { inner.style.transform = ''; inner.style.clipPath = ''; tail.forEach(el => { el.style.transform = ''; }); };

  // Questions open one at a time, and each list keeps the height of its
  // tallest open answer, so opening a question never pushes the page onto a
  // new one (Alex, 2026-10-26).
  const accordions = [...new Set([...inner.querySelectorAll('details')].map(d => d.parentElement))]
    .map(box => ({ box, items: [...box.children].filter(c => c.tagName === 'DETAILS') }))
    .filter(g => g.items.length > 1);
  accordions.forEach(g => g.items.forEach(d => {
    // Close the others the moment a closed question is clicked open.
    d.querySelector('summary')?.addEventListener('click', () => { if (!d.open) g.items.forEach(x => { if (x !== d) x.open = false; }); });
  }));
  function reserveAccordions() {
    for (const g of accordions) {
      g.box.style.minHeight = '';
      const was = g.items.map(d => d.open);
      let max = 0;
      for (const d of g.items) { g.items.forEach(x => { x.open = x === d; }); max = Math.max(max, g.box.getBoundingClientRect().height); }
      g.items.forEach((x, i) => { x.open = was[i]; });
      g.box.style.minHeight = `${Math.ceil(max)}px`;
    }
  }

  function measure() {
    unclip();
    reserveAccordions();
    const H = W.clientHeight;
    root.style.setProperty('--pageh', `${H}px`);
    const ir = inner.getBoundingClientRect();
    const boxes = [];
    for (const el of inner.querySelectorAll(ATOMS)) {
      const up = el.parentElement && el.parentElement.closest(ATOMS);
      if (up && inner.contains(up)) continue;
      if (!el.getClientRects().length) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 1) continue;
      boxes.push([r.top - ir.top, r.bottom - ir.top]);
    }
    total = Math.max(inner.scrollHeight, ...boxes.map(b => b[1]));
    // Section starts are the best places to turn the page.
    const starts = [...inner.querySelectorAll('.sec, .doc-hero, .band, .ft, .faq, .flow, .team, .trust, .principles')]
      .filter(el => el.getClientRects().length).map(el => Math.floor(el.getBoundingClientRect().top - ir.top));
    const clear = y => boxes.every(([t, b]) => !(t < y - 0.5 && b > y + 0.5));
    // A page may start at the top of any piece where no other piece is cut.
    // The closing band and footer always share the last page with content:
    // the last page leaves room for them, and they sit at its bottom.
    tailTop = tail.length ? Math.min(...tail.map(el => el.getBoundingClientRect().top - ir.top)) : total;
    tailH = total - tailTop;
    // Where the content ends, not counting the blank gap above the band.
    const contentEnd = Math.max(0, ...boxes.filter(b => b[0] < tailTop - 1).map(b => b[1]));
    const tops = [...new Set(boxes.map(b => Math.floor(b[0])))].sort((a, b) => a - b).filter(clear).filter(t => t < tailTop - 1);
    const out = [];
    let y0 = 0;
    for (let guard = 0; guard < 200; guard++) {
      // A little room above a page's first piece, taken from the blank gap,
      // but never within 6px of the piece above (letters' tails such as g, y
      // and p draw a little past their box).
      const above = Math.max(0, ...boxes.filter(b => b[0] < y0).map(b => b[1]));
      const pad = y0 ? Math.min(20, Math.max(0, y0 - above - 6)) : 0;
      const room = H - pad;
      if (contentEnd - y0 <= room - tailH + 1 || (tailH >= room && contentEnd - y0 <= 1)) { out.push([y0, total, pad]); break; }
      const fits = tops.filter(c => c > y0 + 1 && c <= y0 + room);
      const roomy = fits.filter(c => c > y0 + room * 0.3);
      // Prefer a section start when the page is still at least 45% full.
      const atStart = starts.filter(c => c < tailTop - 1 && c > y0 + room * 0.45 && c <= y0 + room && clear(c)).pop();
      const end = Math.min(atStart ?? (roomy.length ? roomy : fits).pop() ?? y0 + room, tailTop);
      out.push([y0, end, pad]); y0 = end;
    }
    return out;
  }

  function drawBar() {
    const n = pages.length;
    prev.disabled = cur === 0; next.disabled = cur === n - 1;
    count.textContent = `${cur + 1} / ${n}`;
    if (dots.children.length !== n) {
      dots.innerHTML = Array.from({ length: n }, (_, i) => `<li><button type="button" data-i="${i}" aria-label="${labels.page} ${i + 1}"></button></li>`).join('');
    }
    dots.hidden = n > 8;
    count.classList.toggle('visually-hidden', n <= 8);
    dots.querySelectorAll('button').forEach((b, i) => { if (i === cur) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  }

  function show(i) {
    cur = Math.max(0, Math.min(pages.length - 1, i));
    const [a, b, pad] = pages[cur];
    const H = W.clientHeight;
    // On the last page the band's bottom meets the window's bottom.
    const last = cur === pages.length - 1 && tail.length > 0;
    const shift = last ? Math.round(a - pad + H - tailH - tailTop) : 0;
    tail.forEach(el => { el.style.transform = shift ? `translateY(${shift}px)` : ''; });
    inner.style.transform = pages.length > 1 ? `translateY(${pad - a}px)` : '';
    const clipBottom = last ? Math.round(total - (a - pad + H)) : Math.max(0, total - b);
    inner.style.clipPath = pages.length > 1 ? `inset(${Math.max(0, a - pad)}px 0 ${clipBottom}px 0)` : '';
    W.dataset.shown = String(Math.round(b - a + pad));   // visible height of this page (for checks)
    drawBar();
  }

  const pageOf = y => { const i = pages.findIndex(([a, b]) => y >= a - 1 && y < b - 1); return i < 0 ? pages.length - 1 : i; };
  const yOf = el => { const t = inner.style.transform, c = inner.style.clipPath, tt = tail.map(x => x.style.transform); unclip(); const y = el.getBoundingClientRect().top - inner.getBoundingClientRect().top; inner.style.transform = t; inner.style.clipPath = c; tail.forEach((x, i) => { x.style.transform = tt[i]; }); return y; };

  let busyLayout = false;
  function layout(keepY = pages[cur] ? pages[cur][0] : 0) {
    busyLayout = true;
    bar.hidden = true;
    pages = measure();
    if (pages.length > 1) { bar.hidden = false; pages = measure(); }
    show(pageOf(keepY));
    busyLayout = false;
  }
  const reset = () => layout(0);
  const go = i => { if (i >= 0 && i < pages.length && i !== cur) { show(i); return true; } return false; };
  const step = d => go(cur + d) || onEdge(d);

  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  dots.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) go(+b.dataset.i); });

  // Keyboard focus on another page turns to that page.
  // Focus on a whole section does not count: Safari moves focus to the
  // section (tabindex -1) when a button inside it is clicked, and turning to
  // the section's first page then would swallow the click.
  inner.addEventListener('focusin', e => {
    if (pages.length < 2 || busyLayout || e.target.matches('.panel, main, #pages-in')) return;
    const y = yOf(e.target), [a, b] = pages[cur];
    if (y < a - 1 || y >= b - 1) show(pageOf(y));
  });
  // In-page links (#main, #pricing) turn to the page that holds them.
  const toHash = () => {
    const id = decodeURIComponent(location.hash.slice(1)), el = id && document.getElementById(id);
    if (el && inner.contains(el) && !el.classList.contains('panel')) show(pageOf(yOf(el)));
  };
  addEventListener('hashchange', () => requestAnimationFrame(toHash));

  // Gestures. One wheel or trackpad scroll, one swipe or one key turns one
  // page; a trackpad swipe's long tail of small events counts once. Menus,
  // dialogs and form fields are left alone.
  const busy = t => document.querySelector('dialog[open]') || document.querySelector('#nav [aria-expanded="true"]')
    || (t && t.closest && t.closest('dialog, nav, input, textarea, select, [contenteditable], .tools-more'));
  let quietUntil = 0, sum = 0, last = 0;
  const act = d => { quietUntil = Date.now() + 700; sum = 0; step(d); };
  addEventListener('wheel', e => {
    const now = Date.now(), gap = now - last; last = now;
    if (now < quietUntil || (quietUntil && gap < 160)) { if (now >= quietUntil) quietUntil = now + 160; return; }
    quietUntil = 0;
    if (busy(e.target) || e.ctrlKey) return;
    sum = gap > 220 ? e.deltaY : sum + e.deltaY;
    if (Math.abs(sum) >= 40) act(Math.sign(sum));
  }, { passive: true });
  addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || busy(e.target)) return;
    const a = document.activeElement, plain = !a || a === document.body || a.classList.contains('panel') || a === W;
    let d = 0;
    if (e.key === 'PageDown' || (plain && (e.key === 'ArrowDown' || (e.key === ' ' && !e.shiftKey)))) d = 1;
    else if (e.key === 'PageUp' || (plain && (e.key === 'ArrowUp' || (e.key === ' ' && e.shiftKey)))) d = -1;
    else if (plain && e.key === 'Home') { e.preventDefault(); go(0); return; }
    else if (plain && e.key === 'End') { e.preventDefault(); go(pages.length - 1); return; }
    if (d) { e.preventDefault(); act(d); }
  });
  let y0 = null, x0 = 0;
  addEventListener('touchstart', e => { y0 = busy(e.target) || e.touches.length > 1 ? null : e.touches[0].clientY; x0 = e.touches[0]?.clientX || 0; }, { passive: true });
  addEventListener('touchend', e => {
    if (y0 === null) return;
    const t = e.changedTouches[0], dy = y0 - t.clientY, dx = x0 - t.clientX; y0 = null;
    if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx)) act(Math.sign(dy));
  }, { passive: true });

  // Measure again when the window or the content changes size.
  let raf = 0;
  const later = () => { if (busyLayout) return; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => layout()); };
  new ResizeObserver(later).observe(W);
  new ResizeObserver(later).observe(inner);
  document.fonts?.ready.then(later);
  addEventListener('load', later);

  layout(0);
  requestAnimationFrame(toHash);
  const prepare = () => { bar.hidden = true; unclip(); };
  return { layout, reset, unclip, prepare, get page() { return cur; }, get count() { return pages.length; }, window: W, inner };
}
