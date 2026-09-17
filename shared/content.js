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
    eyebrow: 'AI automation for recurring-service operations',
    headline: 'Find the manual work costing',
    headlineEm: 'your team the most.',
    sub: 'In about two weeks, the AI Automation Audit maps the workflows behind your operation, quantifies the bottlenecks, and gives your operations, finance, and IT leaders a defensible first move.',
    cta: 'Book a 30-minute fit call',
    ctaAlt: 'Take the 5-minute self-assessment',
  },

  heroProof: [
    ['15 years', 'improving operations'],
    ['Human-approved', 'actions, not black boxes'],
    ['Built for', 'real operators'],
  ],
  heroLabels: ['People', 'Processes', 'Data', 'Insights', 'Automation', 'Impact'],
  heroAside: ['Ancient wisdom.', 'Modern intelligence.', 'Real impact.'],

  trust: [
    ['Operator-led', '15 years improving real operations'],
    ['Human-approved', 'important actions stay under your control'],
    ['Read-only audit', 'nothing changes while we diagnose'],
    ['Existing systems', 'work with the tools your team already uses'],
  ],

  stats: [
    ['20 to 300 people', 'the primary client profile'],
    ['About two weeks', 'from walkthrough to roadmap'],
    ['One clear sequence', 'what to do first, second, and third'],
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
    close: 'Before you buy another tool, find the work that is actually worth changing.',
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

  // Capability patterns only. Named projects and measured outcomes are added
  // after evidence and publication permission have been reviewed.
  work: [
    { t: 'Finance and operations', big: '01', lab: 'Reconcile, draft, approve, report',
      d: 'Connect recurring operational and financial work across the systems your team already uses, with exceptions routed to the right person.' },
    { t: 'Document-heavy decisions', big: '02', lab: 'Read, structure, calculate, review',
      d: 'Turn PDFs, drawings, specifications, emails, and spreadsheets into structured outputs with source evidence and uncertainty clearly flagged.' },
    { t: 'Customer conversations', big: '03', lab: 'Answer, qualify, quote, hand off',
      d: 'Give customers faster answers while keeping pricing rules, sensitive decisions, and human takeover under your control.' },
    { t: 'Internal operations hubs', big: '04', lab: 'One role-aware place to work',
      d: 'Bring workflows, documents, dashboards, approvals, and audit history into an interface built around how each team actually works.' },
  ],

  /* Brought over from the live landing page, where it qualified leads. The
     "probably not for you" half is the point: a page that says who it is not
     for is read as honest, and it keeps unfit enquiries off the calendar. */
  fit: {
    forTitle: 'This is built for you if',
    notTitle: 'It is probably not for you if',
    forYou: [
      'You lead a 20 to 300-person recurring-service business with complex back-office work.',
      'Your team moves documents, customer data, billing information, or approvals between several systems.',
      'A repetitive workflow consumes meaningful staff time or creates financial, service, or compliance risk.',
      'You need a practical plan and do not have a dedicated internal automation team.',
    ],
    notForYou: [
      'You are a pure-product software company with clean self-serve operations.',
      'You are a very small shop with little process.',
      'You have no repetitive back-office work to remove.',
    ],
  },

  /* The objection handling from the live "offer" section. Folded into
     Deliverables rather than given a screen of its own. */
  noLines: ['No big software commitment.', 'No new platform forced on you.', 'No open-ended consulting meter.'],

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
    ['What happens after the audit?', 'If the first opportunity is worth building, KHIPUAI can scope a fixed implementation and stay on for managed improvement. You decide after seeing the roadmap.'],
  ],

  disclaimer: 'Specific client stories and measured outcomes will be added after evidence and publication permission are reviewed.',
  legal: 'KHIPUAI is an Ontario, Canada studio serving clients remotely across the United States and Canada.',
};
