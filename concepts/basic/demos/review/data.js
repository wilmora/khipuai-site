// Made-up demo month for the Billing agent miniature. Every client, number,
// email address and price below is invented. Item codes are neutral.
export const CYCLE = '2026-10';

export const ITEMS = {
  'SV-110': ['Monthly base fee', 110],
  'SV-120': ['Payroll bundle, per employee', 12.5],
  'SV-130': ['Time tracking', 35],
  'SV-150': ['Managed payroll service', null],
};

const line = (item, qty, price) => ({ item, description: ITEMS[item][0], qty, unit_price: price ?? ITEMS[item][1] });
const std = (emp, time) => [line('SV-110', 1), line('SV-120', emp), ...(time ? [line('SV-130', 1)] : [])];

// One draft invoice per client. "last" is last month's total.
export const INVOICES = [
  { id: 'af', name: 'Alder & Finch', fein: '07-***4410', approved: true, last: 492.5,
    lines: [line('SV-110', 1), line('SV-120', 14), line('SV-130', 1, 60), line('SV-150', 1, 150)] },
  { id: 'bd', name: 'Birchwood Dental', fein: '07-***2281', approved: true, last: 405,
    lines: [line('SV-110', 1, 120), line('SV-120', 24)] },
  { id: 'ti', name: 'Tidewater Inn', fein: '08-***9036', approved: false, last: 257.5, lines: std(10, true) },
  { id: 'mb', name: 'Marlow Bakery', fein: '08-***1174', approved: true, last: 222.5, lines: std(9) },
  { id: 'qp', name: 'Quill Print Co.', fein: '09-***6620', approved: true, last: 272.5, lines: std(14) },
  { id: 'sk', name: 'Saffron Kitchen', fein: '09-***3057', approved: true, last: 360, lines: std(19) },
  { id: 'pc', name: 'Pebble Creek Vet', fein: '17-***8842', approved: true, last: 420, lines: std(22, true) },
  { id: 'lb', name: 'Lantern Books', fein: '17-***0519', approved: true, last: 185, lines: std(7) },
  { id: 'op', name: 'Orchard Physio', fein: '18-***7703', approved: true, last: 345, lines: std(16, true) },
  { id: 'fd', name: 'Fernhill Design', fein: '18-***2268', approved: true, last: null, lines: std(11) },
  { id: 'rs', name: 'Ridgeway Studio', fein: '19-***5531', approved: true, last: 457.5, lines: std(26, true) },
  { id: 'cr', name: 'Copperline Roofing', fein: '19-***4096', approved: true, last: 247.5, lines: std(10) },
].map((x, n) => ({ ...x, number: 'DEMO-2610-' + String(n + 1).padStart(2, '0') }));

// The clients the agents could not clear (Monthly close, step 3).
export const CARDS = [
  { id: 'af', client: 'Alder & Finch', agent: 345, type: 'Service not used', impact: -150,
    why: ['The agents and the console bill different totals'], consoleApproved: true,
    summary: 'The draft bills the managed payroll service, but the client moved to running payroll themselves on September 1 (service change ticket DEMO-T-302). The agents left that line off.',
    questions: ['Confirm the service change took effect for September services.'] },
  { id: 'bd', client: 'Birchwood Dental', agent: 410, type: 'Base fee above record', impact: -10,
    why: ['The agents want a person', 'The agents and the console bill different totals'], consoleApproved: true,
    summary: 'The base fee on the draft is $120.00. The price record says $110.00 since the July renewal. The agents billed the record price.',
    questions: ['Is the $120.00 base fee an approved increase that is missing from the price record?'] },
  { id: 'ti', client: 'Tidewater Inn', agent: 270, type: 'Employee count to confirm', impact: 0,
    why: ['The agents want a person'], consoleApproved: false,
    summary: 'Both invoices bill 10 employees. The payroll file shows 2 seasonal workers paid only once in September. The agents billed all 10 and ask a person to confirm.',
    questions: ['Do one-time seasonal workers count toward the per-employee bundle?'] },
];

export const EMAILS = [
  { id: 'e1', type: 'mistake', client: 'Birchwood Dental', from: 'office@birchwood-dental.example', invoice: 'DEMO-2610-02', at: '2026-10-10',
    subject: 'Our base fee is wrong', body: 'Hi, our contract says the base fee is $110 but invoice DEMO-****02 charged $120. Please fix it.',
    fix: 'Credit 10.00 on SV-110: billed 120.00, contract 110.00', named: 'SV-110 Monthly base fee', amount: 10, item: 'SV-110', source: 'mailbox' },
  { id: 'e2', type: 'payment', client: 'Ridgeway Studio', from: 'finance@ridgeway-studio.example', invoice: 'DEMO-2610-11', at: '2026-10-11',
    subject: 'Payment sent by ACH', body: 'Paid by ACH today, reference ******21.', fix: 'Route to accounts receivable to log the payment; no invoice change', source: 'mailbox' },
  { id: 'e3', type: 'question', client: 'Alder & Finch', from: 'ap@alderfinch.example', invoice: 'DEMO-2610-01', at: '2026-10-12',
    subject: 'Charged managed payroll but we run payroll ourselves', body: 'We moved to running payroll ourselves in September. Why is managed payroll still on the invoice?',
    fix: 'Reply: the service change is confirmed and a corrected invoice follows; the line is already held in Needs review', source: 'mailbox' },
  { id: 'e4', type: 'mistake', client: 'Tidewater Inn', from: 'admin@tidewater-inn.example', invoice: 'DEMO-2610-03', at: '2026-10-13',
    subject: 'Wrong employee count', body: 'We had 8 regular employees in September, not 10. Two seasonal workers were paid once.',
    fix: 'Credit 25.00 on SV-120: 2 employees at 12.50, if one-time workers do not count', named: 'SV-120 Payroll bundle, per employee', amount: 25, item: 'SV-120', source: 'tickets' },
  { id: 'e5', type: 'missing', client: 'Lantern Books', from: 'books@lantern-books.example', invoice: 'DEMO-2610-08', at: '2026-10-13',
    subject: 'Never received our invoice', body: 'We have not received an invoice for October yet.', fix: 'Resend DEMO-2610-08 from BC to the billing contact', source: 'mailbox' },
  { id: 'e6', type: 'missing', client: 'Marlow Bakery', from: 'hello@marlow-bakery.example', invoice: 'DEMO-2610-04', at: '2026-10-14',
    subject: 'Invoice please', body: 'Please send our latest invoice, the email bounced last time.', fix: 'Resend DEMO-2610-04 from BC after fixing the bounced address', source: 'tickets' },
  { id: 'e7', type: 'question', client: 'Quill Print Co.', from: 'office@quillprint.example', invoice: 'DEMO-2610-05', at: '2026-10-14',
    subject: 'What is the bundle line?', body: 'What does "Payroll bundle, per employee" cover on our invoice?',
    fix: 'Reply: what the SV-120 bundle includes (draft, not sent)', source: 'mailbox' },
];

export const SOURCES = [
  ['Payroll billing details', '1,206 rows · 12 client candidates', 'Quantities and event rows', 'layers'],
  ['Client price records', '12 pricing records checked', 'Elected services and contracted prices', 'people'],
  ['Payroll calendar', 'September 1-30, 2026', 'Activity, final payroll and cross-checks', 'clock'],
  ['Exceptions & requests', '3 approved · 0 waiting', 'Credits, waivers and service changes', 'inbox'],
  ['Help desk & billing replies', 'Full threads included in this demo', 'Commitments and cancellation evidence', 'file'],
  ['Terminations & BC history', 'Status, prior invoices and credit memos', 'Client lifecycle and prior corrections', 'book'],
];

export const RULES = [
  { id: 'R-101', cat: 'Pricing', title: 'Base fees follow the price record', text: 'Bill the base fee in the approved price record, even when last month’s invoice shows a different amount.' },
  { id: 'R-102', cat: 'Pricing', title: 'Per-employee bundle counts paid employees', text: 'Count each employee paid at least once in the service month. Ask a person when one-time workers are in the file.' },
  { id: 'R-103', cat: 'Fees', title: 'Late fees follow the payroll provider file', text: 'Bill a late fee only when the provider’s billing file shows it, and check for a waiver first.' },
  { id: 'R-104', cat: 'Off-cycle', title: 'Off-cycle runs follow the billing rows', text: 'One fee per off-cycle row. Calendar-only runs do not bill. More than two in a month needs a rule.' },
  { id: 'R-105', cat: 'Services', title: 'Unpriced services stay off', text: 'A service with no price on the record stays off the invoice and goes to a person.' },
  { id: 'R-106', cat: 'Services', title: 'Service changes take effect on their date', text: 'A confirmed service change removes the service from the first full month after its effective date.' },
  { id: 'R-107', cat: 'Credits & discounts', title: 'A credit is its own line', text: 'An approved credit is a negative line on the next invoice, never a lower price on another line.' },
  { id: 'R-108', cat: 'Terminations', title: 'Final payroll month, then no recurring fees', text: 'The final payroll month bills normally. After it, only requested year-end items and approved credits remain.' },
];

export const AUDIT = [
  ['2026-10-14T09:12:00', 'Inbox monitor', 'Sorted 7 client emails: 2 mistake claims, 2 missing invoices, 1 payment, 2 questions.'],
  ['2026-10-02T11:30:00', 'Investigator + verifier', 'Reviewed 12 candidates: 9 cleared with reasons, 3 handed to a person with evidence.'],
  ['2026-10-02T09:40:00', 'Rule check', 'Off-cycle runs checked: every client above the limit is covered by a rule.'],
  ['2026-10-02T06:00:00', 'Scheduler', 'Oct 2 automatic start: September billing data fetched from Snowflake; 12 candidate drafts prepared.'],
];
