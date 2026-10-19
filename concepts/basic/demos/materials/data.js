// Made-up data for the Material List miniature: one invented sample house,
// a few invented project names, generic lumber lines and generic rules.
// Nothing here comes from a real customer, a real plan or a real price list.

export const USER = { name: 'Demo', initial: 'D' };

export const FOLDERS = [
  { id: 'cur', name: 'Current builds' },
  { id: 'prac', name: 'Practice runs' },
];

// files: kind schedule | quote | pdf (role drawings | schedule-pdf)
export const PROJECTS = [
  { id: 'sample', name: 'Sample house', folder: 'cur', illo: 'house-cabin', pal: 'umber', owner: 'Demo',
    created: '2026-10-19 10:50', touched: '2026-10-19 11:32', template: 'V.07.26', built: true,
    files: [{ id: 'f1', kind: 'schedule', name: 'sample_schedule.xlsx', size: 6144, note: 'Read OK: 2 tabs, 14 framing members' }],
    activity: [
      { what: 'Material list built', detail: 'Template V.07.26, 18 sections', when: '2026-10-19 11:32', who: 'Demo' },
      { what: 'Project questions answered', detail: '11 of 11 answered', when: '2026-10-19 11:20', who: 'Demo' },
      { what: 'Document read', detail: 'sample_schedule.xlsx: 2 tabs, 14 framing members', when: '2026-10-19 10:54', who: 'Demo' },
      { what: 'Project created', when: '2026-10-19 10:50', who: 'Demo' },
    ] },
  { id: 'willow', name: 'Willow Creek cabin', folder: 'cur', illo: 'house-aframe', pal: 'moss', owner: 'Demo',
    created: '2026-10-18 15:05', touched: '2026-10-18 16:40', built: false,
    files: [
      { id: 'f2', kind: 'schedule', name: 'willow_schedule.xlsx', size: 9216, note: 'Read OK: 2 tabs, 22 framing members' },
      { id: 'f3', kind: 'quote', name: 'willow_quote.xlsx', size: 14336, note: 'Read OK: package and 3 custom lines' },
    ],
    activity: [
      { what: 'Document read', detail: 'willow_quote.xlsx: package and 3 custom lines', when: '2026-10-18 16:40', who: 'Demo' },
      { what: 'Document read', detail: 'willow_schedule.xlsx: 2 tabs, 22 framing members', when: '2026-10-18 15:12', who: 'Demo' },
      { what: 'Project created', when: '2026-10-18 15:05', who: 'Demo' },
    ] },
  { id: 'stone', name: 'Stone Hill ranch', folder: 'cur', illo: 'house-ranch', pal: 'slate', owner: 'Demo',
    created: '2026-10-17 09:12', touched: '2026-10-17 09:12', built: false, files: [], activity: [{ what: 'Project created', when: '2026-10-17 09:12', who: 'Demo' }] },
  { id: 'practice', name: 'Practice run: A-frame', folder: 'prac', illo: 'house-barn', pal: 'umber', owner: 'Demo',
    created: '2026-10-12 14:30', touched: '2026-10-12 14:30', built: false, files: [], activity: [{ what: 'Project created', when: '2026-10-12 14:30', who: 'Demo' }] },
];

// ---- Project questions: one standard set, answered per project. ----
// excl: [answer, [section codes]] - that answer takes those sections off the plan.
export const PQ_GROUPS = [
  { name: 'Foundation and structure', questions: [
    { id: 'found', text: 'What foundation does this house sit on?', options: ['Basement', 'Crawlspace', 'Slab'], source: 'quote',
      hint: 'A slab house is never asked about basement walls.' },
    { id: 'walkout', text: 'Is there a walk-out basement wall?', options: ['Yes', 'No'] },
    { id: 'second', text: 'Does the house have a second level floor?', options: ['Yes', 'No'], excl: ['No', ['2']] },
    { id: 'stairs', text: 'Are interior stairs part of this package?', options: ['Yes', 'No'], excl: ['No', ['5']] },
    { id: 'joist_oc', text: 'Floor joist spacing', options: ['12" on center', '16" on center', '24" on center'], source: 'quote' },
  ] },
  { name: 'Package options', questions: [
    { id: 'intdoors', text: 'Are interior doors part of this package?', options: ['Yes', 'No'], excl: ['No', ['12']] },
    { id: 'dormer', text: 'Does the roof have dormers?', options: ['Yes', 'No'], excl: ['No', ['9']] },
    { id: 'garage', text: 'Is there a carport or garage?', options: ['Yes', 'No'], excl: ['No', ['16']] },
    { id: 'sealant', text: 'Ship the log sealant with the first load?', options: ['Yes', 'No'], custom: true },
  ] },
  { name: 'Attached structures (porch, deck)', questions: [
    { id: 'porch', text: 'Is there a covered porch?', options: ['Yes', 'No'], excl: ['No', ['14']] },
    { id: 'deck', text: 'Is there a deck?', options: ['Yes', 'No'], excl: ['No', ['15']] },
  ] },
  { name: 'Measurements', questions: [
    { id: 'porch_ceiling', text: 'Porch ceiling height', type: 'number', unit: 'ft', optional: true,
      hint: 'Leave it blank and the height read off the drawings is used.' },
    { id: 'deck_height', text: 'Deck height above grade', type: 'number', unit: 'ft', optional: true },
  ] },
];

export const PQ_ANSWERS = {
  sample: { found: 'Crawlspace', walkout: 'No', second: 'No', stairs: 'No', joist_oc: '16" on center', intdoors: 'No',
    dormer: 'No', garage: 'No', sealant: 'Yes', porch: 'Yes', deck: 'Yes', deck_height: '3' },
  willow: { found: 'Basement', walkout: 'Yes', joist_oc: '16" on center', dormer: 'Yes', porch: 'Yes', deck: 'No', sealant: 'Yes', intdoors: 'Yes' },
  stone: {},
  practice: {},
};

// ---- The material list of the sample house. ----
// Row: [description, qty, width, depth, feet, inches, grade/species, unit, status, load#]
// status: f filled, g best guess, q question, m formula, n n/a
const SPF = 'SPF #2', PT = 'PT SYP #2', DF = 'DF #1', WRC = 'WRC', LVL = 'LVL 2.0E';
const Q = (desc, w, d, ft, spec, unit = 'PC', grp = '') => [desc, '', w, d, ft, '', spec, unit, 'q', grp];
const series = (desc, w, d, lengths, spec, grp) => lengths.map(ft => Q(`${desc} ${ft}'`, w, d, ft, spec, 'PC', grp));

export const SECTIONS = [
  { code: '1', title: 'FIRST LEVEL FLOOR SYSTEM', subs: [
    { code: '1.1', title: 'SILL PLATES', rows: [
      ['sill plates', 12, 2, 6, 16, '', PT, 'PC', 'f', '1'], ['sill seal 5-1/2"', 4, '', '', 50, '', 'Foam', 'RL', 'f', '1'],
      Q('sill plates garage', 2, 6, 16, PT, 'PC', '1'), Q('anchor bolt washers', '', '', '', 'Galv.', 'EA', '1')] },
    { code: '1.2', title: 'JOISTS (AT 16" ON CENTER)', rows: [
      ['floor joists', 34, 2, 10, 14, '', SPF, 'PC', 'f', '1'], ['rim joist', 8, 2, 10, 16, '', SPF, 'PC', 'f', '1'],
      Q('blocking', 2, 10, 16, SPF, 'PC', '1'), Q('joist hangers 2x10', '', '', '', 'Galv.', 'EA', '1'),
      Q('double joists under walls', 2, 10, 14, SPF, 'PC', '1')] },
    { code: '1.3', title: 'BEAMS AND POSTS', rows: [
      ['center beam 1-3/4 x 11-7/8', 3, 1.75, 11.875, 20, '', LVL, 'PC', 'g', '1', 'The beam length is read off the plan view, not the schedule. Check it against the framing sheet.'],
      ['beam posts', 4, 6, 6, 8, '', PT, 'PC', 'f', '1'], Q('post bases', '', '', '', 'Galv.', 'EA', '1'), Q('beam pocket shims', '', '', '', 'Steel', 'EA', '1')] },
    { code: '1.4', title: 'SUBFLOOR', rows: [
      ['3/4" T&G subfloor 4x8', 18, 48, 0.75, 8, '', 'OSB', 'SH', 'f', '2'], Q('subfloor adhesive', '', '', '', '28 oz', 'TB', '2'),
      Q('subfloor screws', '', '', '', '2-1/2"', 'BX', '2')] },
    { code: '1.5', title: 'MISCELLANEOUS FLOOR MATERIALS', rows: [
      Q('2x4 blocking under parallel walls', 2, 4, 8, SPF, 'PC', '2'), Q('crawlspace vapor barrier', '', '', '', '6 mil', 'RL', '2'),
      Q('access hatch framing', 2, 4, 8, SPF, 'PC', '2'), Q('rim insulation', '', '', '', 'R-19', 'BG', '2'),
      Q('termite shield', '', '', '', 'Alum.', 'RL', '2'), Q('floor truss strapping', '', '', '', 'Galv.', 'EA', '2')] },
  ] },
  { code: '2', title: 'SECOND LEVEL FLOOR SYSTEM', subs: [
    { code: '2.1', title: 'JOISTS', rows: [Q('second floor joists', 2, 10, 14, SPF), Q('second floor rim', 2, 10, 16, SPF), ['loft joists', '', 2, 8, 12, '', SPF, 'PC', 'n', '']] },
    { code: '2.2', title: 'SUBFLOOR', rows: [Q('second floor subfloor 4x8', 48, 0.75, 8, 'OSB', 'SH')] },
  ] },
  { code: '3', title: 'FRAME INTERIOR WALL SYSTEMS', subs: [
    { code: '3.1', title: 'PLATES', rows: [Q('bottom plates', 2, 4, 16, PT, 'PC', '3'), Q('top plates', 2, 4, 16, SPF, 'PC', '3'), Q('double top plates', 2, 4, 16, SPF, 'PC', '3')] },
    { code: '3.2', title: 'STUDS', rows: [Q('2x4 studs 92-5/8"', 2, 4, 8, SPF, 'PC', '3'), Q('2x6 studs at plumbing walls', 2, 6, 8, SPF, 'PC', '3'),
      Q('studs at slip joints', 2, 4, 10, SPF, 'PC', '3'), Q('corner studs', 2, 4, 8, SPF, 'PC', '3')] },
    { code: '3.3', title: 'HEADERS AND BLOCKING', rows: [Q('door headers 2x10', 2, 10, 8, SPF, 'PC', '3'), Q('header spacers', '', '', '', '1/2" OSB', 'SH', '3'),
      Q('cabinet blocking', 2, 6, 8, SPF, 'PC', '3'), Q('grab bar blocking', 2, 8, 8, SPF, 'PC', '3'), Q('fire blocking', 2, 4, 8, SPF, 'PC', '3')] },
    { code: '3.4', title: 'SLIP JOINT HARDWARE', rows: [Q('slip joint brackets', '', '', '', 'Galv.', 'EA', '3'), Q('slip joint screws', '', '', '', '3"', 'BX', '3'), Q('settling jacks', '', '', '', 'Steel', 'EA', '3')] },
  ] },
  { code: '4', title: 'EXTERIOR WALL SYSTEM', subs: [
    { code: '4.1', title: 'WALL LOGS', rows: [['wall log courses', '', 8, 6, '', '', 'Pine', 'LF', 'm', '4'], Q('log screws 10"', '', '', '', 'Steel', 'BX', '4')] },
  ] },
  { code: '5', title: 'STAIR SYSTEM', subs: [
    { code: '5.1', title: 'STRINGERS AND TREADS', rows: [Q('stair stringers', 2, 12, 14, DF), Q('treads', 2, 12, 4, 'Pine'), ['stair railing', '', '', '', 12, '', 'Pine', 'LF', 'n', '']] },
  ] },
  { code: '6', title: 'ROOF SYSTEM', subs: [
    { code: '6.1', title: 'RAFTERS', rows: [
      ['common rafters', 26, 2, 10, 18, '', DF, 'PC', 'f', '5'], ['gable rafters', 4, 2, 10, 18, '', DF, 'PC', 'f', '5'],
      ...series('valley rafters 2x12', 2, 12, [12, 14, 16, 18, 20], DF, '5'), ...series('jack rafters 2x10', 2, 10, [6, 8, 10, 12, 14], DF, '5')] },
    { code: '6.2', title: 'RIDGE AND PURLINS', rows: [
      ['ridge beam', 2, 3.5, 14, 24, '', LVL, 'PC', 'f', '5'], ['purlins', 6, 6, 8, 16, '', 'Pine', 'PC', 'f', '5'],
      Q('ridge post', 8, 8, 12, 'Pine', 'PC', '5'), Q('purlin brackets', '', '', '', 'Steel', 'EA', '5'), Q('ridge straps', '', '', '', 'Galv.', 'EA', '5')] },
    { code: '6.3', title: 'COLLAR TIES AND BLOCKING', rows: [
      ['collar ties', 13, 2, 6, 12, '', SPF, 'PC', 'f', '5'], ['frieze blocking', 12, 2, 10, 16, '', SPF, 'PC', 'f', '5'],
      ...series('rafter blocking 2x10', 2, 10, [8, 10, 12, 14, 16], SPF, '5'), Q('hurricane ties', '', '', '', 'Galv.', 'EA', '5'), Q('rafter hangers', '', '', '', 'Galv.', 'EA', '5')] },
    { code: '6.4', title: 'ROOF SHEATHING', rows: [
      ['roof sheathing 4x8 5/8"', 64, 48, 0.625, 8, '', 'OSB', 'SH', 'f', '6'], ['H-clips 5/8"', 6, '', '', '', '', 'Galv.', 'BX', 'f', '6'],
      ['sheathing nails', 3, '', '', '', '', '8d ring', 'BX', 'f', '6'], ['underlayment', 9, '', '', '', '', 'Synthetic', 'RL', 'f', '6'],
      ['ice and water shield', 4, '', '', '', '', '36"', 'RL', 'f', '6'], ['drip edge', 16, '', '', 10, '', 'Alum.', 'PC', 'f', '6'],
      Q('roof vents', '', '', '', 'Ridge', 'PC', '6'), Q('valley flashing', '', '', '', 'Galv.', 'RL', '6'), Q('chimney cricket framing', 2, 6, 8, SPF, 'PC', '6'),
      Q('skylight curb framing', 2, 6, 8, SPF, 'PC', '6')] },
    { code: '6.5', title: 'ROOF INSULATION', rows: [
      ['rigid insulation 2"', 42, 48, 2, 8, '', 'Polyiso', 'SH', 'f', '6'], ['nail base panels', 40, 48, 4.5, 8, '', 'Polyiso', 'SH', 'f', '6'],
      Q('insulation screws 6"', '', '', '', 'Steel', 'BX', '6'), Q('vent baffles', '', '', '', 'Foam', 'EA', '6'), Q('insulation tape', '', '', '', '3"', 'RL', '6'),
      Q('fascia vent strip', '', '', '', 'Alum.', 'PC', '6'), Q('vapor retarder', '', '', '', '6 mil', 'RL', '6'), Q('foam sealant', '', '', '', '12 oz', 'CN', '6')] },
  ] },
  { code: '7', title: 'ENCLOSURES (Soffit/Fascia)', subs: [
    { code: '7.1', title: 'FASCIA', rows: [['fascia board 1x8', 1, 1, 8, 12, '', WRC, 'PC', 'm', '7']] },
  ] },
  { code: '8', title: 'GABLES', subs: [
    { code: '8.1', title: 'GABLE FRAMING', rows: [['gable studs', 1.5, 2, 6, 20, '', SPF, 'PC', 'm', '7'],
      Q('gable top plate', 2, 6, 16, SPF, 'PC', '7'), Q('gable sheathing 4x8', 48, 0.5, 8, 'OSB', 'SH', '7'), Q('gable housewrap', '', '', '', '9 ft', 'RL', '7')] },
    { code: '8.2', title: 'GABLE SIDING', rows: [Q('gable siding 1x8', 1, 8, 12, WRC, 'PC', '7'), Q('gable trim 1x4', 1, 4, 12, WRC, 'PC', '7'),
      Q('siding nails', '', '', '', 'SS', 'BX', '7'), Q('gable louver vents', '', '', '', 'Cedar', 'EA', '7')] },
  ] },
  { code: '9', title: 'DORMERS', subs: [
    { code: '9.1', title: 'DORMER FRAMING', rows: [
      ['dormer header', 1, 1.75, 11.875, 12, '', LVL, 'PC', 'g', '8', 'Kept because the header also carries the roof opening on the plan.'],
      ['dormer cheek studs', '', 2, 6, 8, '', SPF, 'PC', 'n', '8'],
      Q('dormer rafters', 2, 8, 12, DF, 'PC', '8'), Q('dormer valley boards', 2, 10, 12, DF, 'PC', '8'), Q('dormer sheathing', 48, 0.625, 8, 'OSB', 'SH', '8')] },
  ] },
  { code: '10', title: 'DOORS', subs: [
    { code: '10.1', title: 'EXTERIOR DOORS', rows: [Q('front entry door 36"', '', '', '', 'Fir', 'EA', '9'), Q('rear door 32"', '', '', '', 'Fir', 'EA', '9'),
      Q('patio door 6\'', '', '', '', 'Clad', 'EA', '9'), Q('door bucks 2x8', 2, 8, 8, 'Pine', 'PC', '9')] },
    { code: '10.2', title: 'DOOR TRIM', rows: [Q('exterior casing 1x6', 1, 6, 8, 'Pine', 'PC', '9'), Q('thresholds', '', '', '', 'Oak', 'EA', '9'), Q('door flashing tape', '', '', '', '6"', 'RL', '9')] },
  ] },
  { code: '11', title: 'WINDOWS & SKYLIGHTS', subs: [
    { code: '11.1', title: 'WINDOWS', rows: [['window bucks 2x8', 5, 2, 8, 10, '', 'Pine', 'PC', 'm', '9'],
      Q('double hung 3040', '', '', '', 'Clad', 'EA', '9'), Q('picture window 6050', '', '', '', 'Clad', 'EA', '9'), Q('casement 2436', '', '', '', 'Clad', 'EA', '9'),
      Q('window flashing tape', '', '', '', '6"', 'RL', '9')] },
    { code: '11.2', title: 'SKYLIGHTS AND TRIM', rows: [Q('skylight 2246', '', '', '', 'Deck mount', 'EA', '9'), Q('skylight flashing kit', '', '', '', 'Alum.', 'EA', '9'),
      Q('window casing 1x6', 1, 6, 8, 'Pine', 'PC', '9'), Q('window sills 2x8', 2, 8, 8, 'Pine', 'PC', '9')] },
  ] },
  { code: '12', title: 'INTERIOR DOORS', subs: [
    { code: '12.1', title: 'PREHUNG DOORS', rows: [Q('prehung door 30"', '', '', '', 'Pine', 'EA'), Q('prehung door 28"', '', '', '', 'Pine', 'EA'), ['bifold doors', '', '', '', '', '', 'Pine', 'EA', 'n', '']] },
  ] },
  { code: '13', title: 'INTERIOR WALL COVERINGS', subs: [
    { code: '13.1', title: 'PANELING', rows: [Q('T&G paneling 1x6', 1, 6, 8, 'Pine', 'PC', '10'), Q('paneling nails', '', '', '', '6d finish', 'BX', '10'),
      Q('ceiling paneling 1x6', 1, 6, 12, 'Pine', 'PC', '10'), Q('inside corner trim', 1, 2, 8, 'Pine', 'PC', '10')] },
  ] },
  { code: '14', title: 'PORCH(ES)', subs: [
    { code: '14.1', title: 'PORCH FRAMING', rows: [
      ['porch beams', 4, 6, 10, 20, '', DF, 'PC', 'f', '11'], ['porch posts', 6, 8, 8, 10, '', 'Pine', 'PC', 'f', '11'],
      ['porch joists', 18, 2, 8, 12, '', PT, 'PC', 'f', '11'], ['porch ledger', 2, 2, 10, 16, '', PT, 'PC', 'f', '11'],
      Q('post bases', '', '', '', 'Galv.', 'EA', '11'), Q('porch rafters 2x8', 2, 8, 12, DF, 'PC', '11'), Q('joist hangers 2x8', '', '', '', 'Galv.', 'EA', '11')] },
    { code: '14.2', title: 'PORCH DECKING AND RAIL', rows: [
      ['porch decking 5/4x6', 6, 1.25, 6, 16, '', 'Cedar', 'PC', 'f', '11'], ['porch ceiling T&G', 4, 1, 6, 12, '', 'Pine', 'PC', 'f', '11'],
      Q('rail top cap', 2, 6, 12, 'Cedar', 'PC', '11'), Q('balusters 2x2', 2, 2, 3, 'Cedar', 'PC', '11'), Q('bottom rail', 2, 4, 12, 'Cedar', 'PC', '11'),
      Q('deck screws', '', '', '', 'SS', 'BX', '11'), Q('porch steps', 2, 12, 4, PT, 'PC', '11'), Q('step stringers', 2, 12, 6, PT, 'PC', '11')] },
  ] },
  { code: '15', title: 'DECK(S)', subs: [
    { code: '15.1', title: 'DECK FRAMING AND BOARDS', rows: [
      ['deck joists', 30, 2, 8, 12, '', PT, 'PC', 'f', '11'], ['deck boards 5/4x6', 60, 1.25, 6, 12, '', PT, 'PC', 'f', '11'],
      Q('deck beam', 2, 10, 16, PT, 'PC', '11'), Q('deck posts', 6, 6, 8, PT, 'PC', '11'), Q('hidden fasteners', '', '', '', 'Steel', 'BX', '11')] },
  ] },
  { code: '16', title: 'CARPORT/GARAGE', subs: [
    { code: '16.1', title: 'CARPORT FRAMING', rows: [
      ['carport posts', 4, 6, 6, 10, '', PT, 'PC', 'f', '12'], ['carport beams', 2, 6, 10, 20, '', DF, 'PC', 'f', '12'],
      ['carport rafters', 12, 2, 8, 14, '', DF, 'PC', 'f', '12'], ['carport sheathing', 14, 48, 0.625, 8, '', 'OSB', 'SH', 'f', '12'],
      ['garage door header', '', 6, 12, 18, '', LVL, 'PC', 'n', '12'], ['garage door trim', '', 1, 6, 8, '', 'Pine', 'PC', 'n', '12'],
      Q('carport post bases', '', '', '', 'Galv.', 'EA', '12'), Q('carport fascia', 1, 8, 12, WRC, 'PC', '12')] },
  ] },
  { code: '17', title: 'MISCELLANEOUS', subs: [
    { code: '17.1', title: 'FASTENERS AND SUPPLIES', rows: [['construction adhesive', 3, '', '', 33.3, '', '28 oz', 'TB', 'm', '12']] },
  ] },
  { code: '18', title: 'MILLED LOGS & SEALANTS', subs: [
    { code: '18.1', title: 'LOG STOCK', rows: [['log siding 2x8', 177, '', '', '', '', 'Pine', 'PC', 'm', '12'],
      Q('corner log ends', '', '', '', 'Pine', 'PC', '12'), Q('log trim 2x6', 2, 6, 12, 'Pine', 'PC', '12'), Q('starter strip', 1, 4, 12, 'Pine', 'PC', '12')] },
    { code: '18.2', title: 'SEALANTS AND FINISH', rows: [Q('log sealant', '', '', '', '5 gal', 'PL', '12'), Q('chinking', '', '', '', '5 gal', 'PL', '12'),
      Q('backer rod 1/2"', '', '', '', 'Foam', 'RL', '12'), Q('stain', '', '', '', '5 gal', 'PL', '12'), Q('borate treatment', '', '', '', '1 gal', 'GL', '12'),
      Q('caulk gun', '', '', '', 'Steel', 'EA', '12'), Q('end sealer', '', '', '', '1 gal', 'GL', '12')] },
  ] },
];

// What a question row asks for, grouped the way the Review results tab batches them.
export const ACTIONS = {
  fill: 'Supply the number or confirm this house needs none.',
  confirm: 'Confirm the size the drawings show.',
  none: 'Nothing to do: the line is priced on the quote.',
};
export const CONFIRM_ROWS = ['valley rafters 2x12 20\'', 'ridge post', 'deck beam', 'porch rafters 2x8', 'gable top plate'];
export const NONE_ROWS = ['caulk gun'];

// ---- Rules Book: generic framing rules, written for this demo. ----
export const RULES = [
  { name: 'Board stock', rules: [
    { id: 'r1', name: 'Dimensional stock lengths', formula: "2x dimensional lumber is ordered in market lengths 8' to 24', in 2' steps.", enforced: true,
      params: { 'Shortest length (ft)': '8', 'Longest length (ft)': '24', 'Step (ft)': '2' }, source: 'Your template, Material List tab', code: 'stock.lengths' },
    { id: 'r2', name: 'Per-use stock lengths', formula: "Rafters are bought long (18' to 22'); floor members cap at 16'.", enforced: true,
      params: { 'Rafter minimum (ft)': '18', 'Floor member cap (ft)': '16' }, source: 'Review call, finished lists', code: 'stock.per_use' },
    { id: 'r3', name: 'Cedar stock lengths', formula: "Cedar trim comes in 12' or 16' only.", enforced: false,
      params: { 'Lengths (ft)': '12, 16' }, source: 'Finished list, sample house', code: 'stock.cedar' },
    { id: 'r4', name: 'Laminated beam lengths', formula: "Laminated beams prefer 24' or less; longer only when the span needs it.", enforced: false,
      params: { 'Preferred maximum (ft)': '24' }, source: 'Your template, Beams tab', code: 'stock.lvl' },
  ] },
  { name: 'Floor framing', rules: [
    { id: 'r5', name: 'Joist count from spacing', formula: 'Joists = span length / spacing, plus one, plus one at each end.', enforced: true,
      params: { 'Spacing (in)': '16', 'Extra per end': '1' }, source: 'Your template, Floor tab', code: 'floor.joists' },
    { id: 'r6', name: 'Rim joist', formula: 'Rim joist runs the full perimeter of each floor, in the longest stock that fits.', enforced: true,
      source: 'Your template, Floor tab', code: 'floor.rim' },
    { id: 'r7', name: 'Subfloor sheets', formula: 'Sheets = floor area / 32 sq ft, plus waste.', enforced: true,
      params: { 'Waste (%)': '8' }, source: 'Finished lists', code: 'floor.subfloor' },
  ] },
  { name: 'Roof framing', rules: [
    { id: 'r8', name: 'Rafter count', formula: 'Rafters = ridge length / spacing, plus one, on each side of the ridge.', enforced: true,
      params: { 'Spacing (in)': '24' }, source: 'Your template, Roof tab', code: 'roof.rafters' },
    { id: 'r9', name: 'Roof sheathing', formula: 'Sheets = roof area / 32 sq ft, plus waste for hips and valleys.', enforced: true,
      params: { 'Waste (%)': '10', 'Extra per valley (%)': '3' }, source: 'Finished lists', code: 'roof.sheathing' },
    { id: 'r10', name: 'Collar ties', formula: 'One collar tie on every other rafter pair.', enforced: false,
      source: 'Review call', code: 'roof.collar' },
  ] },
  { name: 'Waste and spares', rules: [
    { id: 'r11', name: 'Fastener boxes', formula: 'Round every fastener count up to whole boxes.', enforced: true, source: 'Your template', code: 'waste.boxes' },
    { id: 'r12', name: 'Spare decking', formula: 'Add one spare deck board for every 20 ordered.', enforced: false,
      params: { 'One spare per': '20' }, source: 'Finished list, sample house', code: 'waste.decking' },
  ] },
];
