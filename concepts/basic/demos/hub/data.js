// Made-up data for the Web Hub miniature: an invented month (January 2099),
// invented clients, FEINs in the never-issued 555 range and neutral item codes.
// Nothing here comes from a real client.

export const MONTH = 'January 2099';

export const RECORD = {
  'BF-01': { desc: 'Base fee', price: 110 },
  'PE-02': { desc: 'Per employee fee', price: 7 },
  'OC-03': { desc: 'Off-cycle fee', price: 25 },
  'CR-04': { desc: 'Credit', price: -300 },
  'TM-05': { desc: 'Time and attendance', price: 4 },
  'NH-06': { desc: 'New hire setup', price: 15 },
};

const L = (item, qty, price = RECORD[item].price) => ({ item, desc: RECORD[item].desc, qty, price });

// The clients the agents handed to a person this month.
export const CLIENTS = [
  { id: 'aspen', name: 'Aspen Ridge Landscaping', fein: '555555554', status: 'open',
    why: ['The agents want a person'],
    asks: [{ q: 'Approve the $300 credit?', why: 'A $300 credit was asked for but not approved yet.',
      answers: [{ label: 'Approve the credit', effect: 'adds CR-04 credit, -$300.00', add: L('CR-04', 1) }, { label: 'Leave it off', effect: 'no change' }] }],
    invoices: [{ key: 'ASPEN-01', agents: [L('BF-01', 1), L('PE-02', 25)], console: [L('BF-01', 1), L('PE-02', 25)], last: [L('BF-01', 1), L('PE-02', 24)] }] },
  { id: 'harbor', name: 'Harbor Point Supply', fein: '555555556', status: 'open',
    why: ['The agents want a person', 'The agents and the console bill different totals'],
    asks: [{ q: 'Two off-cycle payrolls ran this month. Bill both off-cycle fees?', why: '',
      answers: [{ label: 'Bill both', effect: 'keeps 2 x OC-03' }, { label: 'Bill one', effect: 'OC-03 quantity 1', set: { item: 'OC-03', qty: 1 } }] }],
    invoices: [{ key: 'HARBOR-01', agents: [L('OC-03', 2), L('BF-01', 1, 130)], console: [L('OC-03', 1), L('BF-01', 1, 130)], last: [L('BF-01', 1, 130)] }] },
  { id: 'bluebird', name: 'Bluebird Physical Therapy', fein: '555555557', status: 'open',
    why: ['The agents want a person'],
    asks: [{ q: 'Two new hires this month. Bill the setup fee for both?', why: 'The fee was waived last quarter.',
      answers: [{ label: 'Bill both', effect: 'keeps 2 x NH-06' }, { label: 'Waive it', effect: 'removes NH-06', remove: 'NH-06' }] }],
    invoices: [{ key: 'BLUEBIRD-01', agents: [L('BF-01', 1), L('PE-02', 14), L('NH-06', 2)], console: [L('BF-01', 1), L('PE-02', 14), L('NH-06', 2)], last: [L('BF-01', 1), L('PE-02', 12)] }] },
  { id: 'kettle', name: 'Kettle & Co.', fein: '555555558', status: 'open',
    why: ['The agents and the console bill different totals'], asks: [],
    invoices: [
      { key: 'KETTLE-01', division: 'Downtown', agents: [L('BF-01', 1), L('PE-02', 18), L('TM-05', 18)], console: [L('BF-01', 1), L('PE-02', 18), L('TM-05', 11)], last: [L('BF-01', 1), L('PE-02', 17), L('TM-05', 17)] },
      { key: 'KETTLE-02', division: 'Airport', agents: [L('BF-01', 1), L('PE-02', 9)], console: [L('BF-01', 1), L('PE-02', 9)], last: [L('BF-01', 1), L('PE-02', 9)] }] },
  { id: 'maple', name: 'Maple Row Dental', fein: '555555552', status: 'decided', why: ['The agents want a person'], asks: [],
    invoices: [{ key: 'MAPLE-01', agents: [L('BF-01', 1), L('PE-02', 17)], console: [L('BF-01', 1), L('PE-02', 17)], last: [L('BF-01', 1), L('PE-02', 17)] }] },
  { id: 'copper', name: 'Copperline Logistics', fein: '555555553', status: 'decided', why: ['The agents and the console bill different totals'], asks: [],
    invoices: [{ key: 'COPPER-01', agents: [L('BF-01', 1, 120), L('PE-02', 39)], console: [L('BF-01', 1, 120), L('PE-02', 37)], last: [L('BF-01', 1, 120), L('PE-02', 37)] }] },
];

// The Billing Console's drafts for the same month.
export const DRAFTS = [
  ['Copperline Logistics', '555555553', 2, 1, 389.5, 'regular'],
  ['Aspen Ridge Landscaping', '555555554', 2, 1, 285, 'regular'],
  ['Maple Row Dental', '555555552', 2, 1, 228, 'regular'],
  ['Kettle & Co.', '555555558', 3, 1, 254, 'division'],
  ['Harbor Point Supply', '555555556', 2, 1, 155, 'regular'],
  ['Bluebird Physical Therapy', '555555557', 3, 1, 238, 'regular'],
  ['Granite Bay Builders', '555555559', 2, 1, 166, 'regular'],
  ['Orchard Lane Bakery', '555555560', 2, 1, 89, 'net-new'],
  ['Lakeview Auto Care', '555555561', 2, 1, 75, 'regular'],
].map(([name, fein, lines, cov, total, type]) => ({ name, fein, lines, cov, total, type, approved: false, edited: false }));

export const ACTIVITY = [
  ['Jan 3, 9:25 AM', 'Approved an edited invoice'],
  ['Jan 3, 9:10 AM', 'Approved the agents’ invoice'],
  ['Jan 2, 9:40 AM', 'Wrote and checked every invoice'],
  ['Jan 2, 9:05 AM', 'Sorted 9 invoices: 5 ready, 4 for a person'],
  ['Jan 2, 8:30 AM', 'Read the month’s payroll data'],
  ['Jan 1, 7:00 AM', 'Started the January close'],
];
