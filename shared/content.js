// One source of truth for every fact the concepts show.
//
// All of it is taken from the live site, Wil's Edition 02 preview, or the
// outreach playbook. Nothing here is invented: these are design concepts, and
// a concept that quietly changes a price or a result is not comparable to the
// others. Client anonymization is a hard rule, so no client is ever named.
export const C = {
  brand: { name: 'KHIPUAI', founder: 'Wil Mora', email: 'wil@khipuai.co', domain: 'khipuai.co' },
  booking: 'https://calendly.com/wmorapal/30min',
  // Google Apps Script web app that stores self-assessment leads and emails
  // the visitor their result (edge/leads/). Empty = the form stays hidden.
  leads: 'https://script.google.com/macros/s/AKfycbxNF3Rt-NzcxrTMmYtZtVBgGMxO-0fc8hTgLnASUK0UeVUNBHWQvDNCBMqnBWErRLvM/exec',

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
  },

  /* How the AI is used, said plainly for the person deciding to buy. AI
     writes and tests the code; the delivered code does the work. Only the
     customer-conversation and ticket-sorting projects call an AI model while
     they run (confirmed by KHIPUAI 2026-10-16). The human-approval line is the
     point of the screen, not a footnote. */
  ai: {
    kick: 'How we use AI',
    title: 'Your staff get more done.',
    titleEm: 'Your customers get better service.',
    lead: 'We use Claude, by Anthropic, and other large language models (LLMs) to write and test the software, not to handle your records. The code we deliver does the reading, sorting and first drafts the same way every time, inside your systems. Your people make the decisions.',
    points: [
      ['For your staff', 'The code reads the PDFs, emails and spreadsheets, fills in the fields, and drafts the report or the reply. Your team checks and approves instead of retyping.'],
      ['For your customers', 'Faster, consistent answers at any hour, using your own prices, rules and policies, with a clear handoff to a person when it matters.'],
      ['For you', 'A person approves every important action: anything that moves money, changes a record or commits you to a customer. Every approval is logged.'],
    ],
  },

  /* Projects we have built, with who approves the work in each. Per
     AGENTS.md: capability patterns only, no client names, no results, until
     each client has approved publication. The last card is the invitation,
     not a project. */
  portfolio: {
    kick: 'Portfolio',
    title: 'What we',
    titleEm: 'have built.',
    cols: ['Project', 'What it does', 'Who approves'],
    items: [
      { t: 'Payroll compliance reporting',
        d: 'Builds certified payroll reports from payroll data and checks each worker’s pay against the required wage rates.',
        who: 'Payroll staff review the flags and sign.' },
      { t: 'Material lists from drawings',
        d: 'Reads building plans and drafts the material list, each line traced to its drawing.',
        who: 'Product experts check it before quoting or ordering.' },
      { t: 'WhatsApp quoting assistant',
        d: 'Answers questions and prepares quotes on WhatsApp from the business’s own prices, at any hour.',
        who: 'Staff take over anything outside the rules.' },
      { t: 'Billing exceptions workbench',
        d: 'One queue for every billing exception, with customer details from several systems on one screen.',
        who: 'The billing team resolves each one.' },
      { t: 'Support tickets with AI triage',
        d: 'Reads each new ticket, tags its topic and urgency, and routes it to the right person.',
        who: 'Agents answer every ticket. The AI only sorts.' },
    ],
    next: 'Tell us the workflow costing your team the most, and we will tell you honestly if it is worth automating.',
    nextLink: 'Book a fit call',
    note: 'Client names and measured results stay private until each client approves publication.',
  },

  /* The systems we work in. Text, not logos: no logo assets to license, and
     a footnote so nobody reads the list as a partnership. */
  tools: {
    kick: 'Tools we work with',
    title: 'Built into the systems',
    titleEm: 'you already run.',
    items: [
      ['Business Central', 'Accounting and ERP, part of Microsoft Dynamics 365'],
      ['Outlook', 'Email, calendar and approvals in Microsoft 365'],
      ['Azure', 'Microsoft cloud hosting, identity and security'],
      ['Zendesk', 'Customer support tickets'],
      ['monday.com', 'Projects and team workflows'],
      ['Google Search Console', 'How your site appears in Google search'],
      ['Meta', 'WhatsApp, Facebook and Instagram for business'],
      ['Claude by Anthropic', 'The AI we use to write and test the code'],
    ],
    note: 'Not on the list? We confirm on the fit call whether your system can be connected. Product names are trademarks of their owners; listing them is not a claim of partnership or endorsement.',
  },

  /* Security and data governance. Every line here was confirmed as current
     practice by KHIPUAI on 2026-10-16, including that client data is never
     sent to an AI model while building and that only live customer-
     conversation and ticket-sorting systems call one. Do not add a practice, certification
     or standard without the same confirmation. The homepage shows the six a
     buyer asks about first; the full list, and the SOP note, are written out
     in security/index.html and es/security/index.html. Change both together. */
  security: {
    kick: 'Security and data governance',
    title: 'Your data stays yours.',
    titleEm: 'Not in a public chatbot.',
    points: [
      ['Built with test data', 'We use AI to write and test the code, with made-up or redacted data. Your records are never sent to an AI model while we build.'],
      ['Your systems, your data', 'Wherever possible we build inside your own environment, such as your Microsoft Azure, and we do not keep copies.'],
      ['Least-privilege access', 'Separate accounts with only the access the job needs, removed when the work ends.'],
      ['AI in live systems', 'Where a system uses AI while it runs, such as answering customer messages, it goes through Anthropic’s business API, and details like social security numbers are masked or left out.'],
      ['A full audit trail', 'Every action the system prepares is logged with who approved it and when.'],
      ['Returned or deleted', 'At the end of an engagement, your data is returned or deleted.'],
    ],
    link: 'Read the full security page',
  },

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
    bio: '15 years running operations in high-demand businesses across Canada and the US, where every day ran on deadlines and every delay cost money. I know what manual work really costs because I paid for it in overtime, errors and dropped handoffs. Now I build the automation I wished I had.',
  },

  faq: [
    ['What do you need from us?', 'A couple of hours of your team’s time across a week, and a look at the workflows involved. Access is read-only. Nothing is automated or changed during the audit.'],
    ['Is our data safe?', 'Yes. Access is read-only during the audit. We build and test with made-up or redacted data, so your records are never sent to an AI model while we build. What we deliver runs inside your own security controls, with least-privilege access and a person approving every important action. The security page sets out every practice.'],
    ['Will AI make changes on its own?', 'No. Everything is built draft-first: the machine prepares the work, a person approves every entry that matters.'],
    ['What if you do not find much?', 'The audit says so. That honesty is the product. If there is not much worth automating, you have spent a small, agreed fee to find out instead of a year.'],
    ['Do we have to build with you?', 'No. The roadmap is yours to act on with anyone, including your own team.'],
    ['What happens after the audit?', 'If the first opportunity is worth building, KHIPUAI can scope a fixed implementation and stay on for managed improvement. You decide after seeing the roadmap.'],
  ],

  legal: 'KHIPUAI is an Ontario, Canada studio serving clients remotely across the United States and Canada.',
};
