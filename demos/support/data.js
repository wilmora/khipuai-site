// Made-up data for the Support miniature: an invented company, invented team
// and invented customers (example.com addresses). Times are minutes before
// the page was opened, so "waiting 3h" stays true whenever it is viewed.
// Nothing here comes from a real ticket.

export const TENANT = { name: 'Bluefin Services', prefix: 'BOS' };

export const APPS = [
  { key: 'webhub', name: 'Web Hub' },
  { key: 'payroll', name: 'Payroll' },
  { key: 'timeclock', name: 'Time Clock' },
];

export const TEAM = [
  { id: 'u1', name: 'Dana Ortiz', email: 'dana@example.com', role: 'admin' },
  { id: 'u2', name: 'Sam Whitlock', email: 'sam@example.com', role: 'agent' },
  { id: 'u3', name: 'Priya Raman', email: 'priya@example.com', role: 'agent' },
  { id: 'u4', name: 'Leo Brandt', email: 'leo@example.com', role: 'agent' },
  { id: 'u5', name: 'Mara Quill', email: 'mara@example.com', role: 'viewer' },
];
export const ME = 'u1';

// Who the AI suggests for each product area (the routing the demo shows).
export const ROUTES = [
  { area: 'pay runs', owner: 'u3', note: 'Payroll questions and pay run problems' },
  { area: 'login', owner: 'u2', note: 'Sign in, passwords and access' },
  { area: 'billing', owner: 'u4', note: 'Invoices, receipts and plan changes' },
  { area: 'time clock', owner: 'u2', note: 'Clock-ins, tablets and schedules' },
  { area: 'reports', owner: 'u1', note: 'Reports, exports and how-to questions' },
];

export const TEMPLATES = [
  { id: 't1', title: 'Password reset', body: 'You can reset your password from the sign-in page with "Forgot password". The link in the email works for one hour.' },
  { id: 't2', title: 'Looking into it', body: 'Thanks for the details. We are looking into this now and will write back today with what we find.' },
  { id: 't3', title: 'Solved, please confirm', body: 'This should be fixed now. Could you try again and let us know if anything still looks wrong?' },
];

const c = (name, email, extra = {}) => ({ name, email, phone: null, since: 400, apps: [], tickets: 1, open: 1, ...extra });

// created / updated / waiting / first: minutes ago. waiting = the customer wrote last.
export const TICKETS = [
  { ref: 'BOS-1042', subject: 'Overtime missing from this week’s pay run', status: 'new', priority: 'P1', type: 'bug', area: 'pay runs',
    channel: 'portal', app: 'payroll', assignee: null, created: 185, updated: 180, waiting: 185, first: null, tags: [],
    customer: c('Rosa Delgado', 'rosa.delgado@example.com', { apps: ['payroll'], tickets: 3, open: 1, since: 90000 }),
    messages: [
      { dir: 'in', at: 185, body: 'Hi, two of our drivers worked 46 hours last week but the pay run preview only shows 40 hours for both of them. The extra 6 hours are in the time sheets. Can you check before we approve the run on Friday?' },
    ],
    triage: { priority: 'P1', type: 'bug', area: 'pay runs', confidence: 0.91, applied: true, code: true, owner: 'u3',
      reply: 'Thanks Rosa. We see the overtime hours in the time sheets and are checking why the preview leaves them out. We will update you well before Friday’s approval.' },
  },
  { ref: 'BOS-1041', subject: 'How do I add a second manager to a client?', status: 'new', priority: 'P3', type: 'how_to', area: 'reports',
    channel: 'portal', app: 'webhub', assignee: null, created: 42, updated: 40, waiting: 42, first: null, tags: [],
    customer: c('Ken Abara', 'ken.abara@example.com', { apps: ['webhub'] }),
    messages: [
      { dir: 'in', at: 42, body: 'We hired a second office manager. How do I give her access to the same client list I have?' },
    ],
    triage: { priority: 'P3', type: 'how_to', area: 'reports', confidence: 0.88, applied: true, code: false, owner: 'u1',
      reply: 'Hi Ken. Open the client, choose Team, then Add manager and type her email. She gets an invitation right away.' },
  },
  { ref: 'BOS-1040', subject: 'Invoice shows the wrong service month', status: 'new', priority: null, type: null, area: null,
    channel: 'email', app: null, assignee: null, created: 130, updated: 128, waiting: 130, first: null, tags: ['needs-review'],
    customer: c('Thea Monroe', 'thea.monroe@example.com', { tickets: 2, open: 1, since: 60000 }),
    messages: [
      { dir: 'in', at: 130, body: 'Our latest invoice says "Service period: August" but it covers September. Not urgent, but our accountant asked for a corrected copy.', files: [['invoice-copy.pdf', 84]] },
    ],
    triage: { priority: 'P2', type: 'account_billing', area: 'billing', confidence: 0.62, applied: false, code: false, owner: 'u4',
      reply: 'Hi Thea, thanks for catching this. We will send a corrected copy with the right service month shortly.' },
  },
  { ref: 'BOS-1039', subject: 'Clock-in button greyed out on tablets', status: 'open', priority: 'P0', type: 'bug', area: 'time clock',
    channel: 'portal', app: 'timeclock', assignee: 'u2', created: 1600, updated: 95, waiting: 1560, first: 1580, tags: ['tablets'],
    customer: c('Omar Feld', 'omar.feld@example.com', { apps: ['timeclock'], tickets: 4, open: 2, since: 120000 }),
    messages: [
      { dir: 'in', at: 1600, body: 'Since this morning the Clock in button is grey on both shop tablets. Phones still work. The crew is writing times on paper.' },
      { dir: 'out', at: 1580, author: 'Sam Whitlock', body: 'Thanks Omar, we can reproduce it on tablets and are on it. Paper times are fine for now; we will help enter them.' },
      { dir: 'in', at: 1560, body: 'Still grey this morning. Any update?' },
    ],
    notes: [{ at: 1570, author: 'Sam Whitlock', body: 'Only on screens wider than 800px. Started after Monday’s update.' }],
    triage: { priority: 'P0', type: 'bug', area: 'time clock', confidence: 0.94, applied: true, code: true, owner: 'u2', reply: null },
    fix: { summary: 'Keep the Clock in button active on wide screens', root_cause: 'A layout rule for wide screens also set the button to disabled.', confidence: 0.83,
      repo: 'timeclock-app', branch: 'fix/bos-1039-clock-in', files: ['src/clock/ClockButton.tsx', 'src/clock/clock.css'], pr: 214 },
  },
  { ref: 'BOS-1038', subject: 'Export to spreadsheet would help', status: 'pending', priority: 'P3', type: 'feature', area: 'reports',
    channel: 'portal', app: 'webhub', assignee: 'u1', created: 2900, updated: 1500, waiting: null, first: 2800, tags: [],
    customer: c('Ines Varga', 'ines.varga@example.com', { apps: ['webhub'], tickets: 2, open: 1 }),
    messages: [
      { dir: 'in', at: 2900, body: 'Could the client list be exported to a spreadsheet? We copy it by hand every month.' },
      { dir: 'out', at: 2800, author: 'Dana Ortiz', body: 'Good idea, thank you. Which columns would you need most?' },
    ],
    triage: { priority: 'P3', type: 'feature', area: 'reports', confidence: 0.9, applied: true, code: false, owner: 'u1', reply: null },
  },
  { ref: 'BOS-1037', subject: 'Voicemail: cannot reset my password', status: 'open', priority: 'P2', type: 'account_billing', area: 'login',
    channel: 'phone', app: null, assignee: 'u2', created: 330, updated: 300, waiting: 330, first: null, tags: [],
    customer: c('Jules Hart', null, { phone: '(555) 010-0147', since: 330 }),
    messages: [
      { dir: 'in', at: 330, phone: true, body: 'Transcribed voicemail: Hi, this is Jules. The password reset email never arrives. I checked spam. Please call me back.' },
    ],
    triage: { priority: 'P2', type: 'account_billing', area: 'login', confidence: 0.86, applied: true, code: false, owner: 'u2', reply: null },
  },
  { ref: 'BOS-1036', subject: 'Direct deposit change for a new hire', status: 'on_hold', priority: 'P2', type: 'how_to', area: 'pay runs',
    channel: 'portal', app: 'payroll', assignee: 'u3', created: 4300, updated: 2000, waiting: null, first: 4200, tags: [],
    customer: c('Rosa Delgado', 'rosa.delgado@example.com', { apps: ['payroll'], tickets: 3, open: 1, since: 90000 }),
    messages: [
      { dir: 'in', at: 4300, body: 'A new hire gave us a new bank account after the first pay run. Where do we change it?' },
      { dir: 'out', at: 4200, author: 'Priya Raman', body: 'Under Employees, open her profile and choose Pay. We will hold this until her form arrives.' },
    ],
    triage: { priority: 'P2', type: 'how_to', area: 'pay runs', confidence: 0.87, applied: true, code: false, owner: 'u3', reply: null },
  },
  { ref: 'BOS-1035', subject: 'Receipt for last month', status: 'solved', priority: 'P3', type: 'account_billing', area: 'billing',
    channel: 'email', app: null, assignee: 'u4', created: 5800, updated: 5500, waiting: null, first: 5600, tags: [],
    customer: c('Thea Monroe', 'thea.monroe@example.com', { tickets: 2, open: 1, since: 60000 }),
    messages: [
      { dir: 'in', at: 5800, body: 'Could you send the receipt for last month’s payment?' },
      { dir: 'out', at: 5600, author: 'Leo Brandt', body: 'Here it is. You can also download receipts under Billing at any time.' },
    ],
    triage: { priority: 'P3', type: 'account_billing', area: 'billing', confidence: 0.93, applied: true, code: false, owner: 'u4', reply: null },
  },
  { ref: 'BOS-1034', subject: 'Report page loads slowly in the afternoon', status: 'open', priority: 'P2', type: 'bug', area: 'reports',
    channel: 'portal', app: 'webhub', assignee: 'u1', created: 1900, updated: 310, waiting: 310, first: 1850, tags: [],
    customer: c('Ken Abara', 'ken.abara@example.com', { apps: ['webhub'], tickets: 2, open: 2 }),
    messages: [
      { dir: 'in', at: 1900, body: 'The monthly report takes almost a minute to open after 2 pm. Mornings are fine.' },
      { dir: 'out', at: 1850, author: 'Dana Ortiz', body: 'Thanks Ken. Is it every report, or only the monthly one?' },
      { dir: 'in', at: 310, body: 'Only the monthly one, and only when the whole team is online.' },
    ],
    triage: { priority: 'P2', type: 'bug', area: 'reports', confidence: 0.84, applied: true, code: true, owner: 'u1', reply: null },
  },
  { ref: 'BOS-1033', subject: 'Running late, clock me in at 9?', status: 'new', priority: null, type: null, area: null,
    channel: 'sms', app: null, assignee: null, created: 18, updated: 18, waiting: 18, first: null, tags: ['needs-review'],
    customer: c('Nell Pryor', null, { phone: '(555) 010-0188', since: 18 }),
    messages: [
      { dir: 'in', at: 18, sms: true, body: 'Running late, bus broke down. Can someone clock me in at 9?' },
    ],
    triage: { priority: 'P2', type: 'how_to', area: 'time clock', confidence: 0.55, applied: false, code: false, owner: 'u2',
      reply: 'Hi Nell, we cannot clock in for you, but your manager can fix the time once you arrive. Safe travels.' },
  },
  { ref: 'BOS-1032', subject: 'Add a break reminder', status: 'new', priority: 'P3', type: 'feature', area: 'time clock',
    channel: 'portal', app: 'timeclock', assignee: null, created: 760, updated: 760, waiting: 760, first: null, tags: [],
    customer: c('Omar Feld', 'omar.feld@example.com', { apps: ['timeclock'], tickets: 4, open: 2, since: 120000 }),
    messages: [
      { dir: 'in', at: 760, body: 'Could the tablet remind people to take their break after 5 hours?' },
    ],
    triage: { priority: 'P3', type: 'feature', area: 'time clock', confidence: 0.89, applied: true, code: false, owner: 'u2', reply: null },
  },
  { ref: 'BOS-1031', subject: 'Tax form copy for an employee', status: 'solved', priority: 'P3', type: 'how_to', area: 'pay runs',
    channel: 'portal', app: 'payroll', assignee: 'u3', created: 7200, updated: 7000, waiting: null, first: 7100, tags: [],
    customer: c('Rosa Delgado', 'rosa.delgado@example.com', { apps: ['payroll'], tickets: 3, open: 1, since: 90000 }),
    messages: [
      { dir: 'in', at: 7200, body: 'An employee lost her year-end tax form. Can we print another?' },
      { dir: 'out', at: 7100, author: 'Priya Raman', body: 'Yes: Employees, her profile, Documents, then Print.' },
    ],
    triage: { priority: 'P3', type: 'how_to', area: 'pay runs', confidence: 0.92, applied: true, code: false, owner: 'u3', reply: null },
  },
  { ref: 'BOS-1030', subject: 'You have won a gift card', status: 'closed', priority: 'P3', type: 'spam', area: 'other',
    channel: 'email', app: null, assignee: null, created: 9000, updated: 8990, waiting: null, first: null, tags: [],
    customer: c(null, 'promo@example.net'),
    messages: [{ dir: 'in', at: 9000, body: 'Click to claim your prize today.' }],
    triage: { priority: 'P3', type: 'spam', area: 'other', confidence: 0.98, applied: true, code: false, owner: null, reply: null },
  },
];

export const SUMMARY = { first_reply_min: 42, solved_7: 18 };

export const USAGE = {
  months: ['2099-03', '2099-04', '2099-05'],
  rows: [['Tickets', [212, 240, 231]], ['AI triage runs', [220, 251, 238]], ['AI fix attempts', [6, 9, 7]], ['Emails sent', [540, 602, 588]], ['Texts sent', [41, 38, 52]]],
};

export const HISTORY = [
  ['Dana Ortiz', 'changed the workspace settings', 95],
  ['Dana Ortiz', 'invited someone', 1440, 'mara@example.com'],
  ['Leo Brandt', 'changed their password', 4320],
  ['Dana Ortiz', 'changed who is notified', 8640],
  ['Dana Ortiz', 'created the workspace', 43200],
];
