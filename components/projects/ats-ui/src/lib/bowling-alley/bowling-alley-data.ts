import { NovoListEntity, NovoListField } from '../novo-list/parts';

/* Sample content for the overlays, taken from the Figma frames under 157:511. */

export interface FastFindResult {
  entity: NovoListEntity;
  title: string;
  fields: NovoListField[];
  body?: string;
}

const RESULT_FIELDS: NovoListField[] = [
  { type: 'company', text: 'Company Name' },
  { type: 'owner', text: 'Owner Name' },
  { type: 'phone', text: '(784) 432 - 5293' },
  { type: 'email', text: 'Email' },
  { type: 'location', text: 'Location' },
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

/**
 * Menu (novo-drag-container 1323:68245): every app the user can open in the ATS,
 * in the product's order (per the designer's reference screenshot of the live product).
 * `color` is an entity token name, `amplify` (radial gradient), or `neutral` for
 * apps that aren't an entity.
 */
export const BOWLING_ALLEY_MENU_APPS: MenuItem[] = [
  mi('amplify', 'amplify', 'Amplify'),
  mi('candidate', 'candidate', 'Candidates'),
  mi('task', 'task', 'Tasks'),
  mi('neutral', 'dashboard', 'My Dashboard'),
  mi('lead', 'lead', 'Leads'),
  mi('contact', 'contact', 'Contacts'),
  mi('company', 'company', 'Companies'),
  mi('opportunity', 'opportunity', 'Opportunities'),
  mi('neutral', 'submission', 'Submissions'),
  mi('job', 'job', 'Jobs'),
  mi('placement', 'placement', 'Placements'),
  mi('neutral', 'automation', 'Automation'),
  mi('lead', 'analytics', 'Analytics'),
  mi('neutral', 'refresh', 'Change Requests'),
  mi('neutral', 'tearsheet', 'Tearsheets'),
  mi('neutral', 'users', 'Distribution Lists'),
  mi('neutral', 'archive', 'Admin'),
  mi('candidate', 'candidate-circle', 'Candidates'),
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
