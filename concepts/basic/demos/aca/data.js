// Made-up data for the ACA Filing miniature. Invented companies (each named
// "Demo"), invented people, SSNs always masked, emails at example.com. The
// demo's "today" is February 10, 2026, in the 2025 filing season.

export const YEAR = 2025;
export const TODAY = 'Feb 10, 2026';
export const NOW = 'Feb 10, 2026, 9:40 AM';
export const DEADLINE = 'Mar 31, 2026';
export const DAYS_LEFT = 49;
export const SSN = 'XXX-XX-XXXX';
export const VERSION = '7c1e09ab53d2f46e';

export const STAFF = { name: 'Dana Reviewer', email: 'dana.reviewer@example.com', initials: 'DR' };
export const CLIENT_USER = { first: 'Sam', name: 'Sam Owner', email: 'sam.owner@example.com' };

export const STEPS = [
  { key: 'not_started', label: 'Not started', who: 'staff' },
  { key: 'template_sent', label: 'Template sent', who: 'staff' },
  { key: 'data_received', label: 'Data received', who: 'staff' },
  { key: 'codes_generated', label: 'Codes generated', who: 'system' },
  { key: 'preview_sent', label: 'Preview sent to client', who: 'system' },
  { key: 'approved', label: 'Client approved', who: 'client' },
  { key: 'filed', label: 'Filed with the IRS', who: 'system' },
  { key: 'accepted', label: 'Accepted by the IRS', who: 'system' },
];

// Row statuses on the dashboard and the client list.
export const STATUS = {
  no_filing: { label: 'Not started', tone: 'neutral' },
  attention: { label: 'Needs attention', tone: 'warning' },
  waiting: { label: 'Waiting on data', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'info' },
  with_client: { label: 'With client', tone: 'violet' },
  ready: { label: 'Ready to file', tone: 'success' },
  filed: { label: 'Filed', tone: 'teal' },
  accepted: { label: 'Accepted', tone: 'success' },
};

// step: the 2025 filing's step (0 = no filing). The first client is the one
// with a full filing workspace and the client portal.
export const CLIENTS = [
  { key: 'bramblewood', name: 'Bramblewood Demo Services LLC', sector: 'Landscaping', step: 5, employees: 11, forms: 10,
    contacts: [{ name: 'Sam Owner', email: 'sam.owner@example.com', added: 'Jan 6, 2026, 2:05 PM' }], missing: [], updated: 'Feb 9, 2026', recent: false },
  { key: 'larkspur', name: 'Larkspur Demo Clinics LLC', sector: 'Physical therapy', step: 6, employees: 24, forms: 19,
    contacts: [{ name: 'Lee Partner', email: 'lee.partner@example.com', added: 'Dec 12, 2025, 9:30 AM' }], missing: [], updated: 'Feb 6, 2026', recent: false },
  { key: 'oakfern', name: 'Oakfern Demo Logistics Inc', sector: 'Freight', step: 4, employees: 38, forms: 31, blocking: 1,
    contacts: [{ name: 'Kim Dispatch', email: 'kim.dispatch@example.com', added: 'Jan 14, 2026, 11:10 AM' }, { name: 'Ray Ledger', email: 'ray.ledger@example.com', added: 'Jan 14, 2026, 11:12 AM' }], missing: [], updated: 'Feb 5, 2026', recent: false },
  { key: 'tidewater', name: 'Tidewater Demo Cleaning Co', sector: 'Commercial cleaning', step: 2,
    contacts: [{ name: 'Pat Mopwell', email: 'pat.mopwell@example.com', added: 'Jan 20, 2026, 4:40 PM' }], missing: [], updated: 'Jan 28, 2026', recent: true },
  { key: 'juniper', name: 'Juniper Row Demo Staffing Inc', sector: 'Staffing', step: 3,
    contacts: [], missing: [], updated: 'Feb 2, 2026', recent: false },
  { key: 'pinecrest', name: 'Pinecrest Demo Dental Group', sector: 'Dental', step: 7, employees: 16, forms: 12,
    contacts: [{ name: 'Robin Molar', email: 'robin.molar@example.com', added: 'Nov 3, 2025, 10:00 AM' }], missing: [], updated: 'Feb 3, 2026', recent: false },
  { key: 'quarrylane', name: 'Quarry Lane Demo Builders LLC', sector: 'Construction', step: 8, employees: 42, forms: 35,
    contacts: [{ name: 'Alex Beam', email: 'alex.beam@example.com', added: 'Oct 21, 2025, 3:15 PM' }], missing: [], updated: 'Jan 30, 2026', recent: false },
  { key: 'saltmarsh', name: 'Saltmarsh Demo Catering LLC', sector: 'Food service', step: 0,
    contacts: [{ name: 'Jo Platter', email: 'jo.platter@example.com', added: 'Jan 9, 2026, 1:00 PM' }], missing: ['plan year start', 'self-insured or insured', 'affordability safe harbor'], updated: 'Jan 9, 2026', recent: false },
  { key: 'oldmill', name: 'Old Mill Demo Bakery', sector: 'Retail bakery', step: 0, retired: true,
    contacts: [], missing: [], updated: 'Jun 2, 2025', recent: false },
];

export const ACTIVITY = [
  { at: '9:12 AM', when: 'Feb 10, 2026, 9:12 AM', client: 'larkspur', text: 'Signed in to the client portal', actor: 'lee.partner@example.com' },
  { at: 'Feb 9', when: 'Feb 9, 2026, 10:16 AM', client: 'bramblewood', text: 'Preview released to the client', actor: 'dana.reviewer@example.com' },
  { at: 'Feb 9', when: 'Feb 9, 2026, 10:02 AM', client: 'bramblewood', text: 'Codes generated, version 7c1e09ab', actor: 'dana.reviewer@example.com' },
  { at: 'Feb 9', when: 'Feb 9, 2026, 9:58 AM', client: 'bramblewood', text: 'Template uploaded, version 2', actor: 'dana.reviewer@example.com' },
  { at: 'Feb 6', when: 'Feb 6, 2026, 3:21 PM', client: 'larkspur', text: 'Client approved the forms', actor: 'lee.partner@example.com' },
  { at: 'Feb 5', when: 'Feb 5, 2026, 11:47 AM', client: 'oakfern', text: 'Codes generated with 1 blocking exception', actor: 'dana.reviewer@example.com' },
  { at: 'Feb 3', when: 'Feb 3, 2026, 2:30 PM', client: 'pinecrest', text: 'Filed with the IRS', actor: 'dana.reviewer@example.com' },
  { at: 'Jan 30', when: 'Jan 30, 2026, 8:55 AM', client: 'quarrylane', text: 'Accepted by the IRS', actor: 'dana.reviewer@example.com' },
  { at: 'Jan 28', when: 'Jan 28, 2026, 4:05 PM', client: 'tidewater', text: 'Template sent to the client', actor: 'dana.reviewer@example.com' },
  { at: 'Jan 21', when: 'Jan 21, 2026, 9:00 AM', client: 'bramblewood', text: 'Template uploaded, version 1', actor: 'sam.owner@example.com' },
];

/* ---------- the Bramblewood 2025 filing: the codes, month by month ---------- */

const run = (...p) => { const out = []; for (let i = 0; i < p.length; i += 2) for (let n = 0; n < p[i + 1]; n++) out.push(p[i]); return out; };
const L14 = { '1E': 'offer to the employee, spouse and dependents', '1H': 'no offer' };
const L16 = { '2A': 'not employed', '2B': 'not full-time, or left mid-month', '2C': 'enrolled all month', '2D': 'waiting period (LNAP)', '2H': 'rate of pay safe harbor', '': 'no code applies' };

function person(p) {
  const employed = p.employed ?? run('all', 12);
  const hours = employed.map((s, i) => s === 'none' ? 0 : s === 'part' ? 64 + (i % 3) * 7 : p.pt ? 82 + (i % 4) * 6 : 158 + ((i * 7) % 19));
  const ft = hours.map(h => h >= 130);
  const e = {
    ...p, ssn: SSN, employed, hours, ft,
    offered: p.l14.map(c => c !== '1H'), enrolled: p.l16.map(c => c === '2C'), lnap: p.l16.map(c => c === '2D'),
    l16_blank: p.l16.map((c, i) => (!c && employed[i] === 'all' && ft[i] ? 'correct' : '')),
    required: p.required ?? true, required_reason: p.required_reason ?? '',
  };
  const same = a => (a.every(v => v === a[0]) && a[0] ? a[0] : '');
  e.all12 = { l14: same(e.l14), l15: same(e.l15), l16: same(e.l16) };
  e.why = e.l14.map((c, i) => `${c} ${L14[c] || ''}${e.l16[i] ? `, ${e.l16[i]} ${L16[e.l16[i]]}` : ', Line 16 blank: no code applies'}.`);
  return e;
}

export const EMPLOYEES = [
  person({ first: 'Rowan', last: 'Allfiction', hired: '2019-04-01', terminated: '2025-08-15',
    employed: run('all', 7, 'part', 1, 'none', 4), l14: run('1E', 7, '1H', 5), l15: run('150.00', 7, '', 5), l16: run('2C', 7, '2B', 1, '2A', 4) }),
  person({ first: 'Jules', last: 'Bluffington', hired: '2018-02-12', terminated: '2025-04-30', rehired: '2025-09-08',
    employed: run('all', 4, 'none', 4, 'part', 1, 'all', 3), l14: run('1E', 4, '1H', 5, '1E', 3), l15: run('150.00', 4, '', 5, '150.00', 1, '158.00', 2), l16: run('2C', 4, '2A', 4, '2D', 1, '2C', 3) }),
  person({ first: 'Casey', last: 'Draftwell', hired: '2022-02-07', l14: run('1E', 12), l15: run('150.00', 10, '158.00', 2), l16: run('2H', 12) }),
  person({ first: 'Devon', last: 'Fauxley', hired: '2023-09-05', l14: run('1H', 12), l15: run('', 12), l16: run('', 12) }),
  person({ first: 'Harper', last: 'Imaginaro', hired: '2015-01-05', l14: run('1E', 12), l15: run('0.00', 12), l16: run('2C', 12) }),
  person({ first: 'Emery', last: 'Makebelieve', hired: '2025-03-17',
    employed: run('none', 2, 'part', 1, 'all', 9), l14: run('1H', 5, '1E', 7), l15: run('', 5, '150.00', 5, '158.00', 2), l16: run('2A', 2, '2D', 3, '2C', 7) }),
  person({ first: 'Logan', last: 'Notional', hired: '2025-01-06',
    employed: run('part', 1, 'all', 11), l14: run('1H', 3, '1E', 9), l15: run('', 3, '150.00', 7, '158.00', 2), l16: run('2D', 3, '2C', 9) }),
  person({ first: 'Blake', last: 'Pretendon', hired: '2021-06-14', l14: run('1E', 12), l15: run('150.00', 10, '158.00', 2), l16: run('2C', 12) }),
  person({ first: 'Morgan', last: 'Stubbsley', hired: '2017-10-02', l14: run('1E', 12), l15: run('0.00', 12), l16: run('2C', 12) }),
  person({ first: 'Quinn', last: 'Testalot', hired: '2024-05-20', pt: true, l14: run('1H', 12), l15: run('', 12), l16: run('2B', 12),
    required: false, required_reason: 'Not full-time in any month' }),
  person({ first: 'Sasha', last: 'Unreal', hired: '2020-11-09', l14: run('1E', 12), l15: run('150.00', 10, '158.00', 2), l16: run('2C', 12) }),
];

export const EXCEPTIONS = [
  { severity: 'warning', name: 'Devon Fauxley', month: 0, message: 'Full-time in every month with no offer of coverage, and no Line 16 code applies. Line 16 stays blank, which is the IRS answer; the months may count toward an employer payment.', cite: 'Line 16, 2025 Instructions for Forms 1094-C and 1095-C: leave blank when no code applies.' },
  { severity: 'warning', name: 'Jules Bluffington', month: 9, message: 'Rehired after a break of 13 weeks or more, so treated as a new employee: September is a waiting period (2D).', cite: 'Rehire: a break in service of 13 weeks or more.' },
  { severity: 'info', name: 'Quinn Testalot', month: 0, message: 'Under 130 hours of service in every month: no Form 1095-C is needed.', cite: 'Full-time employee: 130 hours of service in a month.' },
];

export const HOW_IT_DECIDES = [
  ['Hours across two months', "A paycheck's hours are spread evenly over the weekdays in its pay period on which the person was employed, and each month gets its share."],
  ['Full-time', "130 or more hours of service in the calendar month, from the hours column, never from the 'Full or Part Time' label."],
  ['First month of employment', 'Starting on a day other than the 1st makes that month a Limited Non-Assessment Period (code 2D) when the person is full-time in their first full month; otherwise the person is simply not full-time that month (2B).'],
  ['Waiting period', 'From the first full month a full-time employee is otherwise eligible, up to three months before the offer, is a Limited Non-Assessment Period (2D).'],
  ['Rehire', 'A rehire after a break of 13 weeks or more is a new employee (first-month and waiting-period rules apply again). A shorter break is a continuing employee.'],
  ['Line 15', "The employee share of the lowest-cost self-only plan from the profile's rate table, whatever tier the person chose; 0.00 when the coverage tier is 'Company Paid'."],
  ['Affordability', 'Rate of pay: hourly rate x 130 (or the monthly salary) x the percentage for the plan year. Federal poverty line: the prior-year single FPL x the percentage / 12.'],
  ['Contractors', 'Pay type 1099 is not an employee: no form, not in any count.'],
];

// What each code on these forms means, for the client's review.
export const MEANINGS = [
  ['1E', 'A plan with minimum value was offered to the employee, with coverage for the spouse and dependents.', 'Line 14 code 1E'],
  ['1H', 'No offer of health coverage for the month (this includes months the person was not an employee).', 'Line 14 code 1H'],
  ['2A', 'Not employed on any day of the month.', 'Line 16 code 2A'],
  ['2B', 'Not a full-time employee that month, or coverage ended early only because the employee left during the month.', 'Line 16 code 2B'],
  ['2C', 'Enrolled in the coverage offered for every day of the month.', 'Line 16 code 2C'],
  ['2D', 'In a waiting period the law allows (a Limited Non-Assessment Period), so no offer was due yet.', 'Line 16 code 2D'],
  ['2H', 'The employer used the rate of pay safe harbor to judge the offer affordable.', 'Line 16 code 2H'],
  ['Line 15', 'Line 15 is what the employee would pay each month for the cheapest self-only plan with minimum value. 0.00 means the employer paid all of it.', 'Line 15'],
];

export const UPLOADS = [
  { version: 2, at: 'Feb 9, 2026, 9:58 AM', by: 'dana.reviewer@example.com', note: 'Corrected end date for one employee' },
  { version: 1, at: 'Jan 21, 2026, 9:00 AM', by: 'sam.owner@example.com (client portal)', note: 'First upload' },
];
