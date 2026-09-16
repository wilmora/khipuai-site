/* =========================================================================
   The Kinetic engine: builds the sideways track and everything that moves on
   it - the section panels, the header nav, the khipu cord and its pointer
   light, the ticker, the progress rail, the momentum scrolling and settle,
   and the reveal-once animation.

   Pages supply only their own sections. Import buildKinetic and call it with
   an array of { id, n, at, html }:
     id   - used for the element id and the hash link
     n    - the label in the header nav (one word)
     at   - 'at-top' | 'at-mid' | 'at-low', where the content sits vertically
     html - the section's markup
   ========================================================================= */
import { C as EN } from './content.js';

export const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

/* Warns when the Spanish content file has drifted from the English one.
 *
 * The live site's Spanish mirror drifts from its English pages silently,
 * because the two are separate HTML files that nobody diffs. Here the two are
 * data with the same shape, so the drift is checkable: same keys, same array
 * lengths, same tier and work-item counts. It only warns, and only on
 * localhost, so a mismatch shows up while building rather than in front of a
 * reader. */
export function checkContentParity(other, label = 'content'){
  if (!/^(localhost|127.0.0.1)$/.test(location.hostname)) return;
  const problems = [];
  const walk = (a, b, path) => {
    for (const k of Object.keys(a)) {
      const pa = path ? path + '.' + k : k;
      if (!(k in b)) { problems.push('missing: ' + pa); continue; }
      if (Array.isArray(a[k])) {
        if (!Array.isArray(b[k])) problems.push('not an array: ' + pa);
        else if (a[k].length !== b[k].length)
          problems.push(pa + ' has ' + b[k].length + ' items, English has ' + a[k].length);
      } else if (a[k] && typeof a[k] === 'object') {
        if (!b[k] || typeof b[k] !== 'object') problems.push('not an object: ' + pa);
        else walk(a[k], b[k], pa);
      }
    }
  };
  walk(EN, other, '');
  if (problems.length) console.warn('[' + label + '] drifted from English:\n  ' + problems.join('\n  '));
}

/* The content object is passed in rather than imported, so the same engine
   drives the English and Spanish pages. */
export function buildKinetic(P, content = EN){
  // The trust and stats pairs, formatted once for the ticker.
  const mq = [...content.trust, ...content.stats]
    .map(([a,b]) => `<b>${esc(a)}</b> ${esc(b)}`).join(' &nbsp;/&nbsp; ');
  const track = document.getElementById('track');
  const cord = document.getElementById('cord');
  track.innerHTML = ( P.map((p,i) =>
    `<section class="panel p-${p.id} ${p.at}" id="p-${p.id}" data-i="${i}" aria-label="${esc(p.n)}">
       ${p.html}</section>`).join(''));

  const panels = [...track.querySelectorAll('.panel')];

  /* The ticker is appended to the track rather than written into the opening
     section, so it can run the full length of the site. It is absolutely
     positioned, so it takes no part in the flex flow and does not widen it. */
  const mqEl = document.createElement('div');
  mqEl.className = 'mq';
  mqEl.setAttribute('aria-hidden', 'true');
  mqEl.innerHTML = '<div></div>';
  track.appendChild(mqEl);

  /* The strip animates to translateX(-50%), which is only seamless when it is
     exactly two identical halves. The old markup used THREE copies against that
     -50%, so the loop jumped a half-copy every pass. Copies are now computed
     from the real track width, always even, and only rebuilt when the count
     actually changes - rebuilding restarts the animation. */
  const mqUnit = mq + ' &nbsp;/&nbsp; ';
  const MQ_SPEED = 42;          // px per second - slow enough to actually read
  let mqCopies = 0;
  function fillTicker(){
    const W = track.scrollWidth;
    if (!W) return;
    mqEl.style.width = W + 'px';
    const inner = mqEl.firstElementChild;
    if (!mqCopies) { inner.innerHTML = mqUnit; mqCopies = 1; }
    // Measured live rather than cached: one copy's width moves when the webfonts
    // swap in, and a stale figure leaves a gap at the end of the band.
    const unitW = inner.getBoundingClientRect().width / mqCopies;
    if (!unitW) return;                       // display:none on the phone layout
    const want = Math.max(1, Math.ceil(W / unitW)) * 2;
    if (want !== mqCopies) {
      mqCopies = want;
      inner.innerHTML = mqUnit.repeat(want);
    }
    /* Speed is set here, not in the CSS, because the duration was fixed at 44s
       while the distance travelled is half the strip - which grows with the
       track. That made the band run at 262px/s on a 1440px screen, far too fast
       to read, and a different speed on every other screen size. Pinning px/sec
       instead makes it readable and consistent everywhere. */
    const half = (unitW * mqCopies) / 2;
    inner.style.animationDuration = (half / MQ_SPEED).toFixed(1) + 's';
  }

  const nav = document.getElementById('nav');
  nav.innerHTML = P.map(p => `<button data-to="${p.id}">${esc(p.n)}</button>`).join('');
  const railfill = document.getElementById('railfill');
  const hint = document.getElementById('hint');

  /* ---- the cord -----------------------------------------------------------
     One line across the whole site, knotting at each section. Drawn after
     layout because it has to know the real, uneven total width. */
  function drawCord(){
    if (!panels.length || track.scrollWidth <= track.clientWidth) return;
    const W = track.scrollWidth, H = track.clientHeight;
    cord.setAttribute('width', W);
    cord.setAttribute('height', H);
    cord.setAttribute('viewBox', `0 0 ${W} ${H}`);
    cord.style.width = W + 'px';
    // A slow wave that dips and rises across the whole length.
    let d = `M 0 ${H * 0.62}`;
    panels.forEach((p, i) => {
      const x = p.offsetLeft + p.offsetWidth / 2;
      const y = H * (i % 2 ? 0.40 : 0.68);
      d += ` S ${x - p.offsetWidth * 0.3} ${y} ${x} ${y}`;
    });
    d += ` S ${W - 200} ${H * 0.5} ${W} ${H * 0.55}`;
    const knots = panels.map((p, i) => {
      const x = p.offsetLeft + p.offsetWidth / 2;
      const y = H * (i % 2 ? 0.40 : 0.68);
      return `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#E39767" stroke-opacity=".30" stroke-width="2"/>
              <circle cx="${x}" cy="${y}" r="2.5" fill="#E39767" fill-opacity=".45"/>`;
    }).join('');
    /* The travelling light is drawn as its own short polyline rather than as a
       dash on the full path. A stroke-dasharray animation would have to repaint
       an 11,520px-wide path every frame; sampling ~16 points around the light's
       position and stroking just those costs the same whatever the site's length.
       The gradient gives it soft ends, and it is in userSpaceOnUse so its x1/x2
       can be moved to wherever the light currently is. */
    cord.innerHTML =
      `<defs>
         <linearGradient id="cordglow" gradientUnits="userSpaceOnUse">
           <stop offset="0"   stop-color="#FF7A3D" stop-opacity="0"/>
           <stop offset=".45" stop-color="#FFD2AC" stop-opacity=".95"/>
           <stop offset=".55" stop-color="#FFD2AC" stop-opacity=".95"/>
           <stop offset="1"   stop-color="#FF7A3D" stop-opacity="0"/>
         </linearGradient>
       </defs>
       <path id="cordbase" d="${d}" fill="none" stroke="#E39767" stroke-opacity=".17" stroke-width="2"/>
       <path d="${d}" fill="none" stroke="#E39767" stroke-opacity=".08" stroke-width="7"/>${knots}
       <polyline id="cordhalo"  fill="none" stroke="url(#cordglow)" stroke-opacity=".16"
                 stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
       <polyline id="cordbloom" fill="none" stroke="url(#cordglow)" stroke-opacity=".42"
                 stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
       <polyline id="cordlight" fill="none" stroke="url(#cordglow)"
                 stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    basePath = cord.querySelector('#cordbase');
    glowGrad = cord.querySelector('#cordglow');
    // Three stacked strokes: a wide faint halo, a mid bloom, and the hot core.
    // One stroke reads as a coloured dash; the stack reads as something glowing.
    lightEls = [cord.querySelector('#cordhalo'), cord.querySelector('#cordbloom'),
                cord.querySelector('#cordlight')];
    pathLen  = basePath.getTotalLength();
  }

  /* ---- the light in the cord ----------------------------------------------
     A charge that runs along the khipu cord for the whole length of the site.
     It follows the pointer: the cord is the one element that is continuous from
     the first section to the last, so giving it something that reacts turns it
     from a drawn decoration into the thing the page is strung on.

     The pointer sets a TARGET position and the light eases toward it, so it
     trails the cursor and overshoots slightly rather than being welded to it.
     When the pointer has been still for a while it goes back to drifting along
     on its own, so the cord is never dead on an untouched screen. */
  let basePath = null, glowGrad = null, lightEls = [], pathLen = 0;
  let lightAt = 0, lightTo = 0, lastPoint = 0, lightRaf = 0;
  const LIGHT_SPAN = 300;       // how long the glowing stretch is, in path units
  const LIGHT_EASE = 0.055;     // how lazily it follows
  const IDLE_AFTER = 2200;      // ms of stillness before it drifts by itself
  const DRIFT = 0.00022;        // fraction of the path per frame when drifting

  function drawLight(){
    if (!basePath || !pathLen) return;
    const centre = lightAt * pathLen;
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const at = centre - LIGHT_SPAN / 2 + (LIGHT_SPAN * i) / 16;
      if (at < 0 || at > pathLen) continue;
      const p = basePath.getPointAtLength(at);
      pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    }
    if (pts.length < 2) { lightEls.forEach(el => el && el.setAttribute('points', '')); return; }
    const a = basePath.getPointAtLength(Math.max(0, centre - LIGHT_SPAN / 2));
    const b = basePath.getPointAtLength(Math.min(pathLen, centre + LIGHT_SPAN / 2));
    glowGrad.setAttribute('x1', a.x); glowGrad.setAttribute('y1', a.y);
    glowGrad.setAttribute('x2', b.x); glowGrad.setAttribute('y2', b.y);
    const s = pts.join(' ');
    lightEls.forEach(el => el && el.setAttribute('points', s));
  }

  function lightTick(){
    lightRaf = 0;
    if (!pathLen) return;              // no cord on the stacked phone layout
    const now = performance.now();
    if (now - lastPoint > IDLE_AFTER) {
      lightTo += DRIFT;
      if (lightTo > 1.08) { lightTo = -0.08; lightAt = -0.08; }   // loop round
    }
    lightAt += (lightTo - lightAt) * LIGHT_EASE;
    drawLight();
    lightRaf = requestAnimationFrame(lightTick);
  }

  addEventListener('pointermove', e => {
    if (!pathLen || !horizontal()) return;
    /* Screen x to a position along the cord. The cord lives in a fixed layer that
       is translated by -scrollLeft * 0.58, so the pointer's x has to be put back
       into cord space before it means anything. */
    const cordX = e.clientX + track.scrollLeft * 0.58;
    lightTo = Math.max(0, Math.min(1, cordX / Math.max(1, track.scrollWidth)));
    lastPoint = performance.now();
  }, { passive: true });

  // Checked directly rather than via REDUCED: that const is declared further down
  // the file, and reading it here would be a temporal-dead-zone error at load.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lightRaf = requestAnimationFrame(lightTick);
  }

  /* ---- navigation ---------------------------------------------------------
     Sections are different widths now, so positions come from offsetLeft
     rather than index * innerWidth. The index stays explicit state: reading
     scroll position mid-animation returns a half-finished number. */
  let current = 0;
  const clamp = i => Math.max(0, Math.min(P.length - 1, i));
  const indexOf = id => Math.max(0, P.findIndex(p => p.id === id));
  const horizontal = () => track.scrollWidth > track.clientWidth + 1;
  // Align each section to its LEFT edge, clamped to the track.
  //
  // Centring was wrong twice over. Sections are often WIDER than the viewport,
  // and centring one of those scrolls right and crops both edges: the opening
  // headline was sitting 87px off the left of the screen. And for the narrower
  // sections, aligning left is the better behaviour anyway, because it lets the
  // edge of the next section show at the right, which is exactly the continuity
  // a deck never has.
  const leftFor = i => {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    return Math.max(0, Math.min(max, panels[i].offsetLeft));
  };
  const nearest = () => {
    const x = track.scrollLeft;
    let best = 0, bd = Infinity;
    panels.forEach((p, i) => { const d = Math.abs(leftFor(i) - x); if (d < bd) { bd = d; best = i; } });
    return best;
  };

  /* ---- motion: one loop chasing one target --------------------------------
     The previous version had two separate motions - a friction glide for the
     gesture and a timed eased animation for the settle - and handing over between
     them is a large part of what felt choppy: the glide decelerated to a stop,
     then a second animation started from scratch and moved it again.

     There is now ONE model. `target` is where the track wants to be; `pos` eases
     towards it every frame. A gesture pushes the target ahead, the snap sets the
     target to a stop, and in both cases the same easing carries it, so a flick
     that ends in a snap is a single continuous movement.

     Two details that matter more than the easing curve itself:

     - `pos` is kept as a float and ASSIGNED to scrollLeft, never accumulated
       into it. `scrollLeft += v` reads back a value the browser has already
       rounded, so the error compounds every frame and the motion grinds at low
       speed. That was the actual source of the stepping.
     - the approach rate is scaled by real frame time, so the feel is identical
       on a 60Hz and a 144Hz screen instead of being ~2.4x faster on the latter. */
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LERP = 0.095;          // fraction of the remaining distance per 60Hz frame
  let target = 0, pos = 0, raf = 0, lastFrame = 0;

  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const clampX = v => Math.max(0, Math.min(maxScroll(), v));

  function frame(now){
    const dt = lastFrame ? Math.min(64, now - lastFrame) : 16.67;
    lastFrame = now;
    const d = target - pos;
    if (Math.abs(d) < 0.35) {
      pos = target; track.scrollLeft = pos; raf = 0; lastFrame = 0;
      return;
    }
    // Frame-rate independent exponential approach.
    pos += d * (1 - Math.pow(1 - LERP, dt / 16.67));
    track.scrollLeft = pos;
    raf = requestAnimationFrame(frame);
  }
  function run(){ if (!raf) { lastFrame = 0; raf = requestAnimationFrame(frame); } }
  function jumpTo(x){
    cancelAnimationFrame(raf); raf = 0; lastFrame = 0;
    pos = target = clampX(x);
    track.scrollLeft = pos;
  }
  function setTarget(x){
    target = clampX(x);
    if (REDUCED) return jumpTo(target);
    run();
  }
  function stopMotion(){ jumpTo(track.scrollLeft); }

  function goTo(i, push = true){
    const from = current;
    current = clamp(i);
    clearTimeout(snapT);
    if (horizontal()) {
      // A jump across the whole site was about 1.5s of watching sections fly
      // past. Neighbours keep the travel, which is the charm; longer jumps land
      // immediately.
      if (Math.abs(current - from) > 2) jumpTo(leftFor(current));
      else setTarget(leftFor(current));
      gestureFrom = leftFor(current);
    } else panels[current].scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (push && location.hash.slice(1) !== P[current].id) {
      history.pushState({ i: current }, '', '#' + P[current].id);
    }
    paint();
  }

  function paint(){
    // The header nav is now the only place that says where you are. No counter,
    // no segments: those read as slide numbers however they are styled.
    nav.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-current', b.dataset.to === P[current].id ? 'true' : 'false'));
  }

  /* Reveal once, then stay revealed.
     This used to live in paint(): whichever section was "current" got .live and
     every other section lost it, so content animated in on arrival and blanked
     out again behind you. That is a slide build - it is the behaviour that made
     the page feel like a deck even more than the snapping did, because it meant
     only one section was ever really present. Sections now reveal as they come
     into view and simply stay there, which is what a page does. */
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('live');
      io.unobserve(en.target);
    }), { root: track, rootMargin: '0px 12% 0px 12%', threshold: 0.01 });
    panels.forEach(p => io.observe(p));
  } else panels.forEach(p => p.classList.add('live'));

  // Continuous reading progress, driven by actual scroll position rather than by
  // section index, so it moves smoothly as you drift instead of ticking over.
  function progress(){
    const max = maxScroll();
    railfill.style.transform = `scaleX(${max > 0 ? Math.min(1, track.scrollLeft / max) : 0})`;
  }

  function layout(){
    drawCord();
    fillTicker();
    progress();
    paint();
    // The light loop stops itself when there is no cord to light, which is the
    // case on the stacked phone layout. Restart it here so that widening the
    // window back past 900px brings the cord to life again.
    if (pathLen && !lightRaf && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lightRaf = requestAnimationFrame(lightTick);
    }
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-to]');
    if (!b) return;
    e.preventDefault();
    goTo(indexOf(b.dataset.to));
  });

  /* ---- momentum: free travel, then a magnetic settle ----------------------
     The old wheel handler jumped a whole section per gesture and locked input
     for 640ms afterwards. However the sections were styled, that is a slide
     remote: you could not move a little, could not see two sections at once,
     and could never reach the right-hand side of a section wider than the
     screen - the sixth Work column was literally unreachable.

     Wheel and drag now add VELOCITY, and a rAF loop spends it against friction,
     so the track keeps travelling after the gesture and decelerates. When it has
     nearly stopped, the settle pulls it onto the nearest section start - but
     only from within 40% of a screen. Beyond that it leaves you where you are,
     which is what makes a wide section readable and is the whole difference
     between a magnetic page and a carousel. */
  const WHEEL_GAIN = 3.4;       // one 100px mouse notch pushes the target ~340px
  const MAX_LEAD = 1.15;        // the target may never run more than this many
                                // screens ahead of where the track actually is,
                                // or a trackpad's stream of small deltas piles up
                                // into a target three sections away
  const SNAP_DELAY = 110;       // quiet time before it commits
  const GESTURE_GAP = 220;      // wheel events closer together than this are one gesture
  let drag = null, curT = 0, snapT = 0, gestureFrom = 0, lastInput = 0;

  /* The track comes to rest on a section, every time.
     "Stops wherever you stop" and "never show two sections at once" cannot both
     be true, and one section per screen is the requirement, so the settle is back.
     Two things make it different from the version that felt like a carousel:
     every section is now exactly one screen, so there is one obvious place to land
     and the correction is never more than half a screen; and the travel getting
     there is the same eased motion as the gesture itself, so it reads as the
     movement finishing rather than as the page yanking. */
  function markCurrent(){
    const i = nearest();
    if (i !== current) { current = i; paint(); }
  }

  /* Consecutive wheel events are one gesture until there is a real pause, so
     spinning the wheel four times is a single movement, not four. */
  function markGesture(){
    const now = performance.now();
    if (now - lastInput > GESTURE_GAP) gestureFrom = pos;
    lastInput = now;
  }

  function snapNow(){
    if (drag) { clearTimeout(snapT); snapT = setTimeout(snapNow, 90); return; }
    const pts = panels.map((p, i) => leftFor(i));
    const moved = target - gestureFrom;
    let pool = pts;
    /* A deliberate gesture always advances. Landing on the plain nearest section
       meant a short scroll rubber-banded back to where it started, which reads as
       the page refusing you - so once a gesture has covered more than a tenth of a
       screen, only sections PAST where it began are eligible, in the direction it
       was going. Anything smaller is a nudge and does return. */
    if (Math.abs(moved) > track.clientWidth * 0.1) {
      const fwd = moved > 0;
      const ahead = pts.filter(p => fwd ? p > gestureFrom + 1 : p < gestureFrom - 1);
      if (ahead.length) pool = ahead;
    }
    let best = pool[0], bd = Infinity;
    pool.forEach(pt => { const d = Math.abs(pt - target); if (d < bd) { bd = d; best = pt; } });
    setTarget(best);
    gestureFrom = best;
    markCurrent();
  }
  function scheduleSnap(){ clearTimeout(snapT); snapT = setTimeout(snapNow, SNAP_DELAY); }

  track.addEventListener('wheel', e => {
    if (!horizontal()) return;            // the stacked phone layout scrolls normally
    // Both axes handled here: passing one through to the browser gave a trackpad
    // and a mouse different behaviours. deltaMode is normalised because a mouse
    // can report lines or pages rather than pixels.
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? track.clientWidth : 1;
    const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
    if (!delta) return;
    e.preventDefault();
    markGesture();
    const lead = track.clientWidth * MAX_LEAD;
    setTarget(Math.max(pos - lead, Math.min(pos + lead, target + delta * WHEEL_GAIN)));
    scheduleSnap();
  }, { passive: false });

  /* ---- drag ---- */
  track.addEventListener('pointerdown', e => {
    if (!horizontal() || e.pointerType === 'touch') return;   // touch scrolls natively
    if (e.target.closest('a,button,summary,input')) return;
    clearTimeout(snapT);
    stopMotion();
    lastInput = 0; markGesture();          // a press always begins a fresh gesture
    drag = { x: e.clientX, left: track.scrollLeft, lastX: e.clientX, lastT: performance.now(), v: 0 };
    track.classList.add('dragging');
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', e => {
    if (!drag) return;
    // A drag tracks the cursor exactly - no easing, or the content lags the hand.
    jumpTo(drag.left - (e.clientX - drag.x));
    // Release velocity is measured from the last few milliseconds of the drag,
    // so letting go mid-flick carries on rather than stopping dead.
    const now = performance.now(), dt = now - drag.lastT;
    if (dt > 0) drag.v = ((drag.lastX - e.clientX) / dt) * 16;   // px per frame
    drag.lastX = e.clientX; drag.lastT = now;
  });
  function endDrag(e){
    if (!drag) return;
    const v = performance.now() - drag.lastT < 90 ? drag.v : 0;  // a pause means stop
    track.classList.remove('dragging');
    try { track.releasePointerCapture(e.pointerId); } catch {}
    drag = null;
    // Throw the target ahead by roughly the distance the flick would have
    // carried, and let friction do the rest.
    if (v) setTarget(target + v * 12);
    lastInput = performance.now();
    scheduleSnap();
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  addEventListener('keydown', e => {
    if (!horizontal() || e.target.closest('input,textarea')) return;
    if (e.key === 'Home') { e.preventDefault(); return goTo(0); }
    if (e.key === 'End')  { e.preventDefault(); return goTo(P.length - 1); }
    const d = { ArrowRight:1, ArrowLeft:-1, PageDown:1, PageUp:-1 }[e.key];
    if (!d) return;
    e.preventDefault();
    goTo(current + d);
  });

  /* ---- parallax: layers travel at their own rates ---- */
  const knotEl = document.getElementById('knot');
  track.addEventListener('scroll', () => {
    if (!horizontal()) return;
    const x = track.scrollLeft;
    progress();
    cord.style.transform = `translateX(${-x * 0.58}px)`;  // fixed layer: drifts at 0.58x
    if (knotEl) knotEl.style.transform = `translateX(${x * 0.1}px)`;
    // Scrolling this loop did not cause - a touch swipe, the scrollbar, a
    // find-in-page jump - has to be adopted, or the next gesture would spring
    // back to a stale target.
    if (!raf && !drag) {
      pos = target = x;
      if (performance.now() - lastInput > GESTURE_GAP) gestureFrom = x;
      scheduleSnap();
    }
    clearTimeout(curT);
    curT = setTimeout(markCurrent, 120);
  }, { passive: true });

  addEventListener('popstate', () => goTo(indexOf(location.hash.slice(1)), false));
  addEventListener('resize', () => { layout(); if (horizontal()) jumpTo(leftFor(current)); });

  let hinted = false;
  const dropHint = () => { if (!hinted) { hinted = true; hint.classList.add('gone'); } };
  ['wheel','pointerdown','keydown'].forEach(t => addEventListener(t, dropHint, { once:true, passive:true }));

  layout();
  goTo(location.hash ? indexOf(location.hash.slice(1)) : 0, false);

  // Section widths are content-driven, so they move as webfonts swap in and as
  // images decode. Redrawing only on fonts.ready left the cord measurably short
  // of the track, so watch the sections themselves and redraw when any of them
  // actually changes size.
  const relayout = () => { layout(); if (horizontal()) jumpTo(leftFor(current)); };
  if (window.ResizeObserver) {
    let pending;
    const ro = new ResizeObserver(() => { clearTimeout(pending); pending = setTimeout(relayout, 60); });
    panels.forEach(p => ro.observe(p));
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
}
