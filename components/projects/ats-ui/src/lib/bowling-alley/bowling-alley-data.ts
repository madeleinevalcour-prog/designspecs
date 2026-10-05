import { ListItemField } from '../list-item/list-item';

/* Sample content for the overlays, taken from the Figma frames under 157:511. */

export interface FastFindResult {
  entity: string;
  title: string;
  fields: ListItemField[];
  body?: string;
}

const RESULT_FIELDS: ListItemField[] = [
  { icon: 'company', text: 'Company Name', color: 'var(--color-entity-company)' },
  { icon: 'user', text: 'Owner Name' },
  { icon: 'phone', text: '(784) 432 - 5293' },
  { icon: 'email', text: 'Email' },
  { icon: 'location', text: 'Location' },
];
const RESULT_BODY = 'Tyler is Pre‑Registered and available starting June 23, 2026, seeking entry‑level cloud/infrastructure...';

/** fast-find-results (1323:67009): the "Recently Viewed" list. */
export const BOWLING_ALLEY_FAST_FIND_RESULTS: FastFindResult[] = [
  { entity: 'candidate', title: '2034 | Tyler Brooks', fields: RESULT_FIELDS, body: RESULT_BODY },
  { entity: 'company', title: '54 | Nexus Dynamics', fields: RESULT_FIELDS, body: RESULT_BODY },
  { entity: 'contact', title: '291 | Marcus Lehmann', fields: RESULT_FIELDS, body: RESULT_BODY },
  { entity: 'job', title: '425 | Project Manager', fields: RESULT_FIELDS, body: RESULT_BODY },
];

export interface MenuItem {
  /** Chip color: --color-entity-<color>. */
  color: string;
  glyph: string;
  label: string;
}

const mi = (color: string, glyph: string, label: string): MenuItem => ({ color, glyph, label });
const CANDIDATES = mi('candidate', 'candidate', 'Candidates');
const JOBS = mi('job', 'job', 'Jobs');
const OPPORTUNITIES = mi('opportunity', 'opportunity', 'Opportunities');
const PAY_BILL = mi('note', 'file', 'Pay & Bill');
const LEADS = mi('lead', 'lead', 'Leads');
const CONTACTS = mi('contact', 'contact', 'Contacts');

export interface MenuSection {
  label: string;
  rows: MenuItem[][];
}

/** Menu (novo-drag-container 1323:68245): rows of three menu-items per section. */
export const BOWLING_ALLEY_MENU_SECTIONS: MenuSection[] = [
  { label: 'Recently used', rows: [[CANDIDATES, JOBS, OPPORTUNITIES], [PAY_BILL, LEADS, CONTACTS]] },
  {
    label: 'My Applications',
    rows: [
      [CANDIDATES, JOBS, OPPORTUNITIES],
      [CONTACTS, PAY_BILL, LEADS],
      [CANDIDATES, JOBS, OPPORTUNITIES],
      [LEADS, CONTACTS, PAY_BILL],
    ],
  },
];

export interface AddItem {
  color: string;
  glyph: string;
  label: string;
}

/** fast-add-menu (4711:109319). */
export const BOWLING_ALLEY_ADD_ITEMS: AddItem[] = [
  { color: 'company', glyph: 'company', label: 'Company' },
  { color: 'contact', glyph: 'contact', label: 'Contact' },
  { color: 'lead', glyph: 'lead', label: 'Lead' },
  { color: 'candidate', glyph: 'candidate', label: 'Candidate' },
  { color: 'opportunity', glyph: 'opportunity', label: 'Opportunity' },
  { color: 'job', glyph: 'job', label: 'Job' },
  { color: 'placement', glyph: 'placement', label: 'Placement' },
  { color: 'note', glyph: 'note', label: 'Note' },
  { color: 'note', glyph: 'check-outline', label: 'Task' },
  { color: 'note', glyph: 'users', label: 'Distribution List' },
];

/** Case-insensitive "text contains" filter. */
export const matches = (text: string, q: string) => text.toLowerCase().includes(q.trim().toLowerCase());
export const resultText = (r: FastFindResult) => [r.title, ...r.fields.map((f) => f.text), r.body ?? ''].join(' ');
