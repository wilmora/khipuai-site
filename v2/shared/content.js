// One source of truth for every fact the concepts show.
//
// All of it is taken from the live site, Wil's Edition 02 preview, or the
// outreach playbook. Nothing here is invented: these are design concepts, and
// a concept that quietly changes a price or a result is not comparable to the
// others. Client anonymization is a hard rule, so no client is ever named.
export const C = {
  brand: { name: 'KHIPUAI', founder: 'Wil Mora', email: 'wil@khipuai.co', domain: 'khipuai.co' },
  booking: 'https://calendly.com/wmorapal/30min',

  hero: {
    eyebrow: 'Applied AI for back-office teams',
    headline: 'Know exactly what',
    headlineEm: 'your team should automate.',
    sub: 'The AI Automation Audit: priced to your situation, about two weeks. I map the manual work, put the hours and dollars on each item, and hand you a clear first move.',
    cta: 'Book a free 30-minute call',
    ctaAlt: 'Take the 5-minute self-assessment',
  },

  trust: [
    ['15 years', 'running real operations'],
    ['E&O insured', 'professional liability'],
    ['Read-only access', 'nothing changes during the audit'],
    ['US & Canada', 'remote, Ontario studio'],
  ],

  stats: [
    ['up to 80%', 'faster spec review'],
    ['~$150K', 'saved per year'],
    ['95%', 'match to manual close'],
  ],

  problem: {
    title: 'Your team is losing dozens of hours a month, and nobody has counted them.',
    lead: 'Somewhere in your business, right now, a capable person is:',
    items: [
      'Retyping data from PDFs and emails into your systems',
      'Chasing approvals across inboxes and spreadsheets',
      'Rebuilding the same report every week by hand',
      'Copying the same customer data into three different tools',
      'Reconciling numbers line by line because the systems do not talk',
    ],
    close: 'It is not a budget problem. It is a clarity problem.',
  },

  steps: [
    ['Discovery call', 'Free, 20 to 30 minutes. We confirm there is a fit and pick the areas worth looking at.'],
    ['Walkthrough', 'About one week. Working sessions to see the real workflows: the systems, the handoffs, the manual steps.'],
    ['Roadmap and readout', 'Week two. The written roadmap, and a live call through the top opportunities and the first move.'],
  ],

  deliverables: [
    ['A prioritized opportunity map', 'The top 5 to 10 things worth automating, ranked.'],
    ['The numbers', 'Hours saved per month, dollar value per year, effort to build.'],
    ['One or two quick wins', 'Things you can act on right away, no project required.'],
    ['A recommended sequence', 'What to do first, second, third, with rough investment.'],
    ['A live readout call', 'A plain-language walkthrough with you and your team.'],
    ['A document you own', 'The roadmap is yours. Build it with KHIPUAI, your team, or anyone else.'],
  ],

  pricing: {
    note: 'Priced to your situation, not an hourly meter. The estimator gives you a range; we confirm the number on the discovery call, before any work starts.',
    credit: 'The full fee credits toward your build if you hire KHIPUAI to implement within 30 days.',
    tiers: [
      { name: 'Standard', amount: '$2,500', unit: 'USD, fixed', for: 'Most small and mid-size firms; one or two departments.', featured: true },
      { name: 'Plus', amount: '$5,000', unit: 'USD, fixed', for: 'Larger or multi-department firms; several workflows.' },
    ],
  },

  // Every figure below already appears in the live site's own copy.
  work: [
    { t: 'AI-assisted spec review', big: '~$150K / yr', lab: 'saved, with technical spec review up to 80% faster',
      d: 'An AI-assisted system to review technical specifications at a North American building-materials enterprise. The contract workflow was rebuilt around it.' },
    { t: 'Documents in, ERP records out', big: '0', lab: 'records posted without a person approving them',
      d: 'For a North American back-office services firm, a pipeline that reads vendor-invoice PDFs and posts ready-to-approve draft records into their own ERP, source attached.' },
    { t: 'Finance-grade QA', big: '6 figures', lab: 'of recurring leakage surfaced, at ~95% match to the manual close',
      d: 'A GREEN/YELLOW/RED confidence grader over machine-generated accounting records, plus a contracts-vs-actuals engine.' },
    { t: 'Logistics and dispatch', big: '~15%', lab: 'lower distribution costs, across 20 plants and 280-plus trucks',
      d: 'Scheduling and routing for a ready-mix concrete producer moving over a million cubic meters a year.' },
    { t: 'Executive analytics', big: '~95%', lab: 'data accuracy on the KPIs leadership actually used',
      d: 'An executive sales dashboard on SQL, Qlik Sense and AWS Redshift, replacing slow manual reporting.' },
    { t: 'Sales-process redesign', big: '~$1M', lab: 'in added sales, with 20% more projects reviewed',
      d: 'A sales and quality-control process rebuilt with clear steps and digital tools at a building-materials company.' },
  ],

  founder: {
    name: 'Wil Mora',
    role: 'Founder, KHIPUAI',
    quote: 'I built this offer because I kept seeing the same thing in every business I worked in: good people stuck doing work a computer should do.',
    bio: '15 years on the operating side of real businesses in Peru, the US and Canada, with a finance degree behind it. Supervised high-volume production plants, then led logistics and customer service across 20 plants and 280-plus trucks.',
  },

  faq: [
    ['What do you need from us?', 'A couple of hours of your team’s time across a week, and a look at the workflows involved. Access is read-only. Nothing is automated or changed during the audit.'],
    ['Is our data safe?', 'Access is read-only and nothing is changed during the audit. Automations are designed to run inside your existing security controls and create drafts a person approves.'],
    ['Will AI make changes on its own?', 'No. Everything is built draft-first: the machine prepares the work, a person approves every entry that matters.'],
    ['What if you do not find much?', 'The audit says so. That honesty is the product. If there is not much worth automating, you have spent a small, agreed fee to find out instead of a year.'],
    ['Do we have to build with you?', 'No. The roadmap is yours to act on with anyone, including your own team.'],
  ],

  disclaimer: 'Results described are one firm’s outcome and are not a typical or guaranteed result.',
  legal: 'KHIPUAI is an Ontario, Canada studio serving clients across the United States and Canada, and carries professional-liability (E&O) insurance.',
};
