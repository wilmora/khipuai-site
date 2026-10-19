// Made-up data for the Certified Payroll miniature. Every company, person,
// address, contract and determination number here is invented for the demo.
// Names carry "(DEMO)" and identifiers a "DEMO-" prefix, as in the app's own
// team demo. FEINs are from the never-issued 00 prefix and shown masked.

export const TODAY = '2026-10-19';
export const TODAY_LABEL = 'Monday, October 19';

const rate = (classification, base_rate, fringe_rate) => ({ classification, base_rate, fringe_rate });

export const CLIENTS = [
  {
    key: 'copperleaf', name: 'Copperleaf Electric (DEMO)', legal_name: 'Copperleaf Electric Company (DEMO)',
    address: '412 Foundry Lane, Linden Falls, IL 62990', fein: '00-***0000',
    designated: 'Nadia Brennick, nadia@copperleaf-demo.example', backup: '',
    certifying: 'Nadia Brennick, Office Manager', week_start: 'saturday', pay_offset: 7,
    paycor: 'spreadsheet only', confirmed: 'Nadia Brennick, 2026-09-21 (DEMO-CONF-0412)',
    details_confirmed: true, missing: [], paycorConnected: false,
    workers: [
      { first: 'Owen', middle: 'K', last: 'Haverly', trade: 'Electrician', rate: '45.20', last4: '0101' },
      { first: 'Lina', middle: 'B', last: 'Sorvik', trade: 'Electrician', rate: '45.20', last4: '0102' },
      { first: 'Dario', middle: 'T', last: 'Mettler', trade: 'Laborer', rate: '27.85', last4: '0103' },
    ],
    projects: [
      {
        key: 'library', name: 'Linden Falls Branch Library - Rewire', location: '155 Commons Square, Linden Falls, IL 62990',
        contract: 'DEMO-LFL-2026-009', wd: 'DEMO-IL20260027', state: 'IL', funding: 'Federal', confirmed: true, missing: [],
        federal: 'Yes', stateForm: 'IL', next: 4,
        rates: [rate('Electrician', 39.00, 5.80), rate('Laborer', 22.00, 5.40)],
        reports: [
          { n: 3, week: '2026-10-09', at: '2026-10-19' },
          { n: 2, week: '2026-10-02', at: '2026-10-12' },
          { n: 1, week: '2026-09-25', at: '2026-10-05' },
        ],
      },
    ],
  },
  {
    key: 'stonebrook', name: 'Stonebrook Mechanical (DEMO)', legal_name: 'Stonebrook Mechanical Contractors, LLC (DEMO)',
    address: '88 Millrace Road, Harlow Springs, MO 63990', fein: '00-***0001',
    designated: 'Tessa Varga, tessa@stonebrook-demo.example', backup: 'Glen Ostrander, glen@stonebrook-demo.example',
    certifying: 'Tessa Varga, Controller', week_start: 'saturday', pay_offset: 6,
    paycor: 'DEMO-LE-1042', confirmed: 'Tessa Varga, 2026-09-14 (DEMO-CONF-0388)',
    details_confirmed: true, missing: [], paycorConnected: true,
    workers: [
      { first: 'Abel', middle: 'R', last: 'Quintero', trade: 'Plumber', rate: '41.75', last4: '0201' },
      { first: 'Marta', middle: 'M', last: 'Lindqvist', trade: 'Plumber', rate: '41.75', last4: '0202' },
      { first: 'Sol', middle: 'J', last: 'Achterberg', trade: 'Pipefitter', rate: '44.10', last4: '0203' },
      { first: 'Ines', middle: 'A', last: 'Corrado', trade: 'Laborer', rate: '26.40', last4: '0204' },
      { first: 'Rafe', middle: 'P', last: 'Dunmore', trade: 'Plumber Apprentice', rate: '25.05', last4: '0205' },
    ],
    projects: [
      {
        key: 'wtp', name: 'Lakeview Water Treatment Plant - Phase 2', location: '2900 Quarry Point Drive, Harlow Springs, MO 63991',
        contract: 'DEMO-LWT-2026-118', wd: 'DEMO-MO20260114', state: 'MO', funding: 'Federal', confirmed: true, missing: [],
        federal: 'Yes', stateForm: 'MO', next: 5, awo: 'DEMO-AWO-32',
        rates: [rate('Plumber', 35.50, 5.75), rate('Pipefitter', 37.50, 6.10), rate('Laborer', 21.50, 4.50), rate('Plumber Apprentice', 21.00, 3.45)],
        reports: [
          { n: 4, week: '2026-10-09', at: '2026-10-19' },
          { n: 3, week: '2026-10-02', at: '2026-10-19', noWork: true },
          { n: 2, week: '2026-09-25', at: '2026-10-19' },
          { n: 1, week: '2026-09-18', at: '2026-10-19' },
        ],
      },
      {
        key: 'annex', name: 'Fairview Fairground Annex - Mechanical', location: '700 Exposition Road, Harlow Springs, MO 63992',
        contract: 'DEMO-FFA-2026-044', wd: '', wdNotNeeded: true, state: 'MO', funding: 'State', confirmed: true, missing: [],
        federal: 'No', stateForm: 'MO', next: 1, awo: 'DEMO-AWO-32',
        rates: [rate('Plumber', 35.50, 5.75), rate('Pipefitter', 37.50, 6.10), rate('Laborer', 21.50, 4.50)],
        reports: [],
      },
    ],
  },
  {
    key: 'pellman', name: 'Pellman Grading (DEMO)', legal_name: '',
    address: '', fein: '', designated: 'Corin Pellman, corin@pellman-demo.example', backup: '', certifying: '',
    week_start: '', pay_offset: null, paycor: '', confirmed: '', details_confirmed: false,
    missing: ['Legal name', 'Certifying official'], paycorConnected: false, workers: [], projects: [],
  },
];

export const WD_ALERTS = [
  { client: 'copperleaf', headline: 'Linden Falls Branch Library - Rewire: 1 rate on this job no longer matches DEMO-IL20260027',
    reasons: ['The rate recorded on the job for Laborer is $27.40; DEMO-IL20260027 now lists $27.65.'], review: ['Laborer'],
    to: ['nadia@copperleaf-demo.example'], subject: 'A wage rate on Linden Falls Branch Library - Rewire has changed',
    body: ['Hello Nadia,', 'The daily check found that one prevailing wage rate on Linden Falls Branch Library - Rewire no longer matches the published determination DEMO-IL20260027.', 'Laborer: recorded total $27.40, published total $27.65.', 'Please confirm which rate your contract names before the next report is signed. Nothing has been changed on the job.'] },
  { client: 'stonebrook', headline: 'Lakeview Water Treatment Plant - Phase 2: SAM.gov has published modification 4 of DEMO-MO20260114',
    reasons: ['A newer modification does not apply automatically; the contract names the determination that governs.'], review: [],
    to: ['tessa@stonebrook-demo.example', 'glen@stonebrook-demo.example'], subject: 'Modification 4 of DEMO-MO20260114 has been published',
    body: ['Hello Tessa,', 'SAM.gov has published modification 4 of DEMO-MO20260114, the determination recorded on Lakeview Water Treatment Plant - Phase 2.', 'Please check with the contracting agency whether the modification applies to your contract. Until then the rates on the job stay as they are.'] },
];

export const WEEKS_TO_CONFIRM = [
  { client: 'Copperleaf Electric (DEMO)', job: 'Linden Falls Branch Library - Rewire', week: '2026-10-16' },
];

export const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'],
  ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'],
  ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'],
  ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'],
  ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
  ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
  ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

const COUNTIES = {
  IL: ['Cook', 'DuPage', 'Madison', 'Monroe', 'Sangamon', 'St. Clair'],
  MO: ['Franklin', 'Jefferson', 'Lincoln', 'St. Charles', 'St. Louis', 'Warren'],
};
export const countiesFor = st => COUNTIES[st] || ['Adams', 'Clark', 'Franklin', 'Jackson', 'Lincoln', 'Washington'];

export const CONSTRUCTION_TYPES = ['Building', 'Heavy', 'Highway', 'Residential'];

// Invented rate sets, one per construction type: [trade, classification, base, fringe].
const RATESETS = {
  Building: [
    ['Electrician', 'Electrician', 39.00, 5.80], ['Electrician', 'Low voltage wiring', 31.25, 4.10],
    ['Carpenter', 'Carpenter', 36.40, 12.85], ['Carpenter', 'Drywall hanger', 33.10, 12.85],
    ['Laborer', 'Laborer: Common', 22.00, 5.40], ['Laborer', 'Laborer: Mason tender', 23.10, 5.40],
    ['Plumber', 'Plumber', 35.50, 5.75], ['Plumber', 'Pipefitter', 37.50, 6.10],
    ['Power equipment operator', 'Operator: Group 1', 38.20, 14.05],
  ],
  Heavy: [
    ['Power equipment operator', 'Operator: Bulldozer', 38.20, 14.05], ['Power equipment operator', 'Operator: Backhoe', 37.10, 14.05],
    ['Power equipment operator', 'Operator: Crane', 40.15, 14.05],
    ['Laborer', 'Laborer: Common', 21.50, 4.50], ['Laborer', 'Laborer: Pipelayer', 23.00, 4.50],
    ['Truck driver', 'Truck driver: Dump truck', 27.40, 9.20],
  ],
  Highway: [
    ['Power equipment operator', 'Operator: Paver', 36.80, 13.40], ['Power equipment operator', 'Operator: Roller', 34.10, 13.40],
    ['Laborer', 'Laborer: Flagger', 18.75, 4.50], ['Laborer', 'Laborer: Common', 21.50, 4.50],
    ['Cement mason', 'Cement mason', 31.60, 10.25],
  ],
  Residential: [
    ['Carpenter', 'Carpenter', 28.40, 6.10], ['Electrician', 'Electrician', 30.15, 4.90],
    ['Laborer', 'Laborer: Common', 17.90, 2.15], ['Painter', 'Painter: Brush and roller', 24.10, 7.35],
    ['Roofer', 'Roofer', 26.50, 5.15],
  ],
};

const NUMS = { Building: ['0027', 3, '2026-10-09'], Heavy: ['0114', 4, '2026-10-02'], Highway: ['0141', 2, '2026-09-25'], Residential: ['0188', 1, '2026-08-28'] };

// What the lookup "finds": one invented determination per construction type.
export function lookup(st, county, ctype) {
  const bump = (st.charCodeAt(0) + st.charCodeAt(1)) % 5 * 0.25;
  return CONSTRUCTION_TYPES.filter(t => !ctype || t === ctype).map(t => ({
    wd: `DEMO-${st}2026${NUMS[t][0]}`, mod: NUMS[t][1], published: NUMS[t][2], type: t, state: st, county,
    rates: RATESETS[t].map(([trade, classification, base, fringe]) => ({ trade, classification, base: base + bump, fringe })),
  }));
}
