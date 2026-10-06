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

/** One app in the Menu, rendered as a MenuItem. */
export interface BowlingAlleyMenuApp {
  /** Stable id (labels repeat: there are two "Candidates" apps). */
  id: string;
  /** Icon-container color: an entity name (--color-entity-<color>), `amplify`, or `neutral`. */
  color: string;
  glyph: string;
  label: string;
}

const mi = (color: string, glyph: string, label: string, id = label.toLowerCase().replace(/\s+/g, '-')): BowlingAlleyMenuApp => ({ id, color, glyph, label });

/**
 * Menu (novo-drag-container 1323:68245): every app the user can open in the ATS,
 * in the product's order (per the designer's reference screenshot of the live product).
 * `color` is an entity token name, `amplify` (radial gradient), or `neutral` for
 * apps that aren't an entity.
 */
export const BOWLING_ALLEY_MENU_APPS: BowlingAlleyMenuApp[] = [
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
  mi('candidate', 'candidate-circle', 'Candidates', 'candidates-2'),
];

/** One folder of the Edit Menu (Figma menu-edit 1217:58486 → content → folder). */
export interface BowlingAlleyMenuFolder {
  id: string;
  /** folder-title text. */
  title: string;
  /** Apps in the folder (ids into BOWLING_ALLEY_MENU_APPS), in Figma's check-list order. */
  apps: string[];
  /** The folder-title's "Grouped" switch, as Figma draws it. */
  grouped: boolean;
}

/**
 * Edit Menu folders (Figma menu-edit 1217:58486). Figma's check-lists name 15 apps in
 * "Primary" and fill the rest with "checked" placeholders; "Pay & Bill" repeats the
 * first four Primary labels as placeholder copy. Mapped onto the 18-app Menu:
 *  - Primary: the Figma-named apps that are in the Menu, in Figma's order (Placements,
 *    Internal Submissions = Submissions, Candidates, Opportunities, Companies, Contacts,
 *    My Dashboard, Jobs, Analytics, Change Requests), then the remaining Menu apps in
 *    the placeholder slots. Figma-only labels with no Menu app (Scheduler, Bullhorn Apps,
 *    Canvas, Compliance Manager, Back Office) are left out.
 *  - Pay & Bill: Figma's four labels (Placements, Internal Submissions, Candidates,
 *    Opportunities). An app can sit in both folders; its check is shared.
 * Both folders start with Grouped off so the default Menu is the single app grid of the
 * live product (Figma draws Pay & Bill switched on).
 */
export const BOWLING_ALLEY_MENU_FOLDERS: BowlingAlleyMenuFolder[] = [
  {
    id: 'primary',
    title: 'Primary',
    grouped: false,
    apps: [
      'placements', 'submissions', 'candidates', 'opportunities', 'companies', 'contacts', 'my-dashboard', 'jobs',
      'analytics', 'change-requests', 'amplify', 'tasks', 'leads', 'automation', 'tearsheets', 'distribution-lists',
      'admin', 'candidates-2',
    ],
  },
  { id: 'pay-bill', title: 'Pay & Bill', grouped: false, apps: ['placements', 'submissions', 'candidates', 'opportunities'] },
];

/** One row of the Add menu, rendered as a MenuOption (type entity). */
export interface AddItem {
  /** Icon-container color: an entity name, or `note` (neutral). */
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
