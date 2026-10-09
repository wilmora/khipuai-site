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
    banner.innerHTML = `<p>¿Permites que KHIPUAI use Meta Pixel para medir visitas, vistas de la autoevaluación y llamadas agendadas? No enviamos tus respuestas ni puntuación a Meta. Si abres la reserva desde la autoevaluación, Calendly recibe un resumen de tu resultado. <a href="/privacy.html">Detalles de privacidad</a></p><div class="meta-consent-actions"><button type="button" data-meta-choice="denied">No, gracias</button><button type="button" data-meta-choice="allowed">Permitir medición</button></div>`;
  } else {
    banner.setAttribute('aria-label', 'Meta measurement choice');
    banner.innerHTML = `<p>May KHIPUAI use Meta Pixel to measure visits, assessment views, and booked calls? We do not send your answers or score to Meta. If you open booking from the assessment, Calendly receives a summary of your result. <a href="/privacy.html">Privacy details</a></p><div class="meta-consent-actions"><button type="button" data-meta-choice="denied">No thanks</button><button type="button" data-meta-choice="allowed">Allow measurement</button></div>`;
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
  /* The visitor asked for their result by email. Counted as a Lead, like a booking. */
  lead() {
    if (pixelStarted) window.fbq('track', 'Lead');
  },
};

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const url = new URL(link.href);
    if (url.origin !== 'https://calendly.com' || url.pathname !== '/wmorapal/30min') return;

    event.preventDefault();
    loadCalendly()
      .then(() => window.Calendly.initPopupWidget({ url: link.href }))
      .catch(() => { location.href = link.href; });
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
