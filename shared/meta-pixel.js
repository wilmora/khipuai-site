const PIXEL_ID = '1112143148017821';
const CONSENT_KEY = 'khipuai-meta-measurement';

let scoreViewed = false;
let bookingConfirmed = false;
let calendlyLoading;
let pixelStarted = false;

function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function saveConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    return;
  }
}

function startPixel() {
  if (pixelStarted || navigator.globalPrivacyControl === true) return;

  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window,document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');

  // Off before init, or the Pixel sends button clicks and page data on its own (on the self-assessment, the answers).
  window.fbq('set', 'autoConfig', false, PIXEL_ID);
  window.fbq('init', PIXEL_ID);
  pixelStarted = true;
  window.fbq('track', 'PageView');
  if (scoreViewed) window.fbq('trackCustom', 'AssessmentScoreViewed');
  if (bookingConfirmed) window.fbq('track', 'Lead');
}

function loadCalendly() {
  if (window.Calendly) return Promise.resolve();
  if (calendlyLoading) return calendlyLoading;

  calendlyLoading = new Promise((resolve, reject) => {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.append(stylesheet);

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  }).catch(error => {
    calendlyLoading = null;
    throw error;
  });

  return calendlyLoading;
}

function showConsent() {
  if (document.querySelector('.meta-consent')) return;

  const banner = document.createElement('section');
  banner.className = 'meta-consent';
  if (document.documentElement.lang.startsWith('es')) {
    banner.setAttribute('aria-label', 'Preferencia de medición de Meta');
    banner.innerHTML = `<p>¿Permite que KHIPUAI use Meta Pixel para medir visitas, vistas de la autoevaluación y llamadas agendadas? No enviamos sus respuestas ni su puntuación a Meta. Si abre la reserva desde la autoevaluación, Calendly recibe un resumen de su resultado. <a href="/es/privacy/">Detalles de privacidad</a></p><div class="meta-consent-actions"><button type="button" data-meta-choice="denied">No, gracias</button><button type="button" data-meta-choice="allowed">Permitir medición</button></div>`;
  } else {
    banner.setAttribute('aria-label', 'Meta measurement choice');
    banner.innerHTML = `<p>May KHIPUAI use Meta Pixel to measure visits, assessment views, and booked calls? We do not send your answers or score to Meta. If you open booking from the assessment, Calendly receives a summary of your result. <a href="/privacy/">Privacy details</a></p><div class="meta-consent-actions"><button type="button" data-meta-choice="denied">No thanks</button><button type="button" data-meta-choice="allowed">Allow measurement</button></div>`;
  }
  banner.addEventListener('click', event => {
    const choice = event.target.closest('[data-meta-choice]')?.dataset.metaChoice;
    if (!choice) return;
    saveConsent(choice);
    banner.remove();
    if (choice === 'allowed') startPixel();
  });
  document.body.append(banner);
}

window.KHIPUAIMeta = {
  scoreViewed() {
    if (scoreViewed) return;
    scoreViewed = true;
    if (pixelStarted) window.fbq('trackCustom', 'AssessmentScoreViewed');
  },
};

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    // Clicks left to the browser here (modifier keys, middle click, target=_blank)
    // open the plain href, without the self-assessment result below. That is fine.
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const url = new URL(link.href);
    if (url.origin !== 'https://calendly.com' || url.pathname !== '/wmorapal/30min') return;

    // The self-assessment keeps the visitor's result in data-utm-content and
    // data-a1, not in the href, where tools that record link addresses could
    // read it. It joins the address only here, for Calendly, as the privacy
    // policy says. URLSearchParams encodes the values.
    const { utmContent, a1 } = link.dataset;
    if (utmContent) url.searchParams.set('utm_content', utmContent);
    if (a1) url.searchParams.set('a1', a1);

    event.preventDefault();
    loadCalendly()
      .then(() => window.Calendly.initPopupWidget({ url: url.href }))
      .catch(() => { location.href = url.href; });
  });

  window.addEventListener('message', event => {
    if (event.origin !== 'https://calendly.com' || event.data?.event !== 'calendly.event_scheduled' || bookingConfirmed) return;
    bookingConfirmed = true;
    if (pixelStarted) window.fbq('track', 'Lead');
  });

  document.getElementById('meta-consent-settings')?.addEventListener('click', () => {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch {
      return;
    }
    location.reload();
  });

  if (navigator.globalPrivacyControl === true) return;
  if (readConsent() === 'allowed') startPixel();
  else if (readConsent() !== 'denied') showConsent();
});
