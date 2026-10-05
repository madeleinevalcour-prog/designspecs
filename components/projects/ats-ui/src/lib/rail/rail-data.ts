import { ListItemField } from './list-item';

/** Sample content the overlays render (same as the prototype's controller). */
export interface FastFindResult {
  entity: string;
  title: string;
  fields: ListItemField[];
}

export const RAIL_FAST_FIND_RESULTS: FastFindResult[] = [
  { entity: 'candidate', title: '2034 | Tyler Brooks', fields: [{ icon: 'info', text: 'Software Engineer' }, { icon: 'user', text: 'Steve Smith' }, { icon: 'email', text: 'name@email.com' }, { icon: 'location', text: 'Boston, MA' }] },
  { entity: 'company', title: '54 | Nexus Dynamics', fields: [{ icon: 'info', text: 'Active' }, { icon: 'email', text: '(617) 543-5345' }, { icon: 'location', text: 'Boston, MA' }] },
  { entity: 'contact', title: '291 | Marcus Lehmann', fields: [{ icon: 'company', text: 'Orbit Analytics' }, { icon: 'email', text: 'm.lehmann@orbitdata.com' }, { icon: 'info', text: 'Head of Engineering' }] },
  { entity: 'job', title: '425 | Project Manager', fields: [{ icon: 'info', text: 'Open' }, { icon: 'user', text: 'Dan Kowalski' }, { icon: 'location', text: 'Chicago, IL' }] },
];

export interface MenuItem {
  glyph: string;
  label: string;
  /** Chip background (a color token, or the Amplify gradient). */
  bg: string;
}

const AMPLIFY_CHIP = 'linear-gradient(135deg,#3bf59a,#12b5c9,#125783)'; /* no token: Amplify chip gradient */
const m = (glyph: string, label: string, bg: string): MenuItem => ({ glyph, label, bg });

/** App launcher rows. Row 0 = "Recently used". */
export const RAIL_MENU_ROWS: MenuItem[][] = [
  [m('job', 'Jobs', 'var(--color-entity-job)'), m('candidate', 'Candidates', 'var(--color-entity-candidate)'), m('amplify', 'Amplify', AMPLIFY_CHIP)],
  [m('contact', 'Contacts', 'var(--color-entity-contact)'), m('opportunity', 'Opportunities', 'var(--color-entity-opportunity)'), m('company', 'Companies', 'var(--color-entity-company)')],
  [m('lead', 'Leads', 'var(--color-entity-lead)'), m('submission', 'Submissions', 'var(--color-entity-submission)'), m('automation', 'Automation', 'var(--color-green-automation-green)')],
  [m('note', 'Notes', 'var(--color-entity-note)'), m('task', 'Tasks', 'var(--color-entity-note)'), m('placement', 'Placements', 'var(--color-entity-placement)')],
];

export interface AddItem {
  color: string;
  glyph: string;
  label: string;
}

export const RAIL_ADD_ITEMS: AddItem[] = [
  { color: 'company', glyph: 'company', label: 'Company' },
  { color: 'contact', glyph: 'contact', label: 'Contact' },
  { color: 'lead', glyph: 'lead', label: 'Lead' },
  { color: 'candidate', glyph: 'candidate', label: 'Candidate' },
  { color: 'opportunity', glyph: 'opportunity', label: 'Opportunity' },
  { color: 'job', glyph: 'job', label: 'Job' },
  { color: 'placement', glyph: 'placement', label: 'Placement' },
  { color: 'note', glyph: 'note', label: 'Note' },
  { color: 'note', glyph: 'task', label: 'Task' },
  { color: 'note', glyph: 'note', label: 'Distribution List' },
];

/** Case-insensitive "text contains" filter, as the prototype's search wiring did. */
export const matches = (text: string, q: string) => text.toLowerCase().includes(q.trim().toLowerCase());
export const resultText = (r: FastFindResult) => [r.title, ...r.fields.map((f) => f.text)].join(' ');
