/* Build your portal: the plans, templates and price rules in ONE place
   (Wil and Alex's meeting notes, 2026-10-20). DRAFT PRICING: every amount
   and threshold here is a draft until the business owner approves it; the
   page labels each one "Draft pricing". Change a price here and both the
   English and Spanish pages follow.

   Deterministic rules only: the estimate is worked out from the visitor's
   choices by estimate() below, never chosen freely. A person confirms scope
   and price on a call. Wording lives in text.js. */

export const PRICING = {
  draft: true,
  // Option A, "Build it with us in one sitting": the portal itself, a
  // monthly fee (Alex, 2026-10-20). The same number, shown in each region's
  // own currency (no conversion, no multiplier).
  portalMonthly: 100,
  currency: { us: 'USD', ca: 'CAD' },
  // Hosting, a separate monthly fee because we run the server for the
  // client: not set yet (to be confirmed).
  hostingMonthly: null,
  // Above either limit the portal is an Enterprise conversation (draft limits).
  enterprise: { users: 100, locations: 10 },
  // Input bounds for the two counts.
  limits: { users: [1, 5000], locations: [1, 500] },
};

// Each starting template and its main features. on: switched on at the
// start. custom: work beyond the template, quoted separately.
export const TEMPLATES = [
  { key: 'hr', features: [['directory', 1], ['timeoff', 1], ['onboarding', 1], ['documents', 0], ['payroll', 0, 'custom']] },
  { key: 'sales', features: [['catalog', 1], ['orders', 1], ['quotes', 1], ['customers', 0], ['messaging', 0, 'custom']] },
  { key: 'billing', features: [['drafts', 1], ['checks', 1], ['exceptions', 1], ['reports', 0], ['accounting', 0, 'custom']] },
  { key: 'compliance', features: [['forms', 1], ['review', 1], ['deadlines', 1], ['history', 0], ['filing', 0, 'custom']] },
  { key: 'support', features: [['inbox', 1], ['tags', 1], ['replies', 1], ['summary', 0], ['helpdesk', 0, 'custom']] },
  { key: 'materials', features: [['uploads', 1], ['lists', 1], ['trace', 1], ['check', 0], ['suppliers', 0, 'custom']] },
].map(t => ({ key: t.key, features: t.features.map(([key, on, kind]) => ({ key, on: !!on, custom: kind === 'custom' })) }));

export const REGIONS = ['us', 'ca'];

// A whole number inside [lo, hi]; anything else falls back to lo.
export function clampCount(v, [lo, hi]) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
}

/* The plan and draft price for a set of choices:
   { template, features: [keys switched on], region, users, locations }.
   plan is 'a' (Option A), 'custom' (Option A plus custom work) or
   'enterprise' (contact us). Unknown inputs fall back to the first template
   and the first region. */
export function estimate(choice) {
  const t = TEMPLATES.find(x => x.key === choice.template) || TEMPLATES[0];
  const region = REGIONS.includes(choice.region) ? choice.region : REGIONS[0];
  const users = clampCount(choice.users, PRICING.limits.users);
  const locations = clampCount(choice.locations, PRICING.limits.locations);
  const on = t.features.filter(f => (choice.features || []).includes(f.key));
  const custom = on.filter(f => f.custom).map(f => f.key);
  const enterprise = users > PRICING.enterprise.users || locations > PRICING.enterprise.locations;
  return {
    template: t.key, region, users, locations,
    features: on.map(f => f.key), custom,
    plan: enterprise ? 'enterprise' : custom.length ? 'custom' : 'a',
    currency: PRICING.currency[region],
    portalMonthly: enterprise ? null : PRICING.portalMonthly,
    hostingMonthly: PRICING.hostingMonthly,
    draft: PRICING.draft,
  };
}
