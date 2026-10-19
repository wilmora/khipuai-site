/* Shared helpers for the portfolio miniatures (concepts/basic/demos/<app>/).

   Each miniature is a static copy of one real app's screens, redrawn in that
   app's own look with made-up data. Nothing here talks to a server: no fetch,
   no form posts, no outside links. A control that would create, send, upload,
   export or call AI in the real product carries data-real="<sentence>", and
   clicking it shows that sentence in a small note instead.

   Use: import { mini } from '../mini.js';
        mini({ label: 'Demo, made-up data', ok: 'OK' });   // once, on load
        mini.note('In the real product this would...');     // from code */

let box, opts = { label: 'Demo, made-up data', ok: 'OK' };

function note(text, from) {
  if (!box) {
    box = document.createElement('div');
    box.className = 'mini-note';
    box.setAttribute('role', 'status');
    document.body.append(box);
  }
  box.innerHTML = '';
  const p = document.createElement('p'); p.textContent = text;
  const b = document.createElement('button'); b.type = 'button'; b.textContent = opts.ok;
  b.addEventListener('click', () => { box.classList.remove('on'); from?.focus?.(); });
  box.append(p, b);
  box.classList.add('on');
  b.focus({ preventScroll: true });
  document.documentElement.dataset.demoNote = String(Date.now());
}

export function mini(o = {}) {
  Object.assign(opts, o);
  // Opened full size (not inside the site's dialog): show the demo label.
  if (window.top === window) {
    const tag = document.createElement('div');
    tag.className = 'mini-tag'; tag.textContent = opts.label;
    document.body.append(tag);
  }
  document.addEventListener('click', e => {
    const r = e.target.closest('[data-real]');
    if (r) { e.preventDefault(); note(r.dataset.real, r); return; }
    // Links never leave the demo: in-app links use "#screen" addresses.
    const a = e.target.closest('a[href]');
    if (a && !a.getAttribute('href').startsWith('#')) e.preventDefault();
  });
  document.addEventListener('submit', e => e.preventDefault());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box?.classList.contains('on')) box.classList.remove('on'); });
}
mini.note = note;

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Lucide icon nodes (ISC licence) to an inline SVG string.
export const svg = (nodes, { size = 16, stroke = 2, cls = '', label = '' } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" class="${cls}"${label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"'}>${
    nodes.map(([tag, at]) => `<${tag} ${Object.entries(at).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('')}</svg>`;
