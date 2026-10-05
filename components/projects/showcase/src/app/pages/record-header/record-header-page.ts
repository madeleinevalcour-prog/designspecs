import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { RecordHeader, RecordHeaderAction, RecordHeaderField, RecordHeaderTab } from 'ats-ui';

type Variant = 'company' | 'candidate';

/** Sample data, copied from the prototype repo's /components/record-header page. */
const PRESETS: Record<Variant, { title: string; entity: string; verified: boolean; social: string[]; fields: RecordHeaderField[]; tabs: RecordHeaderTab[] }> = {
  company: {
    title: 'Nexus Dynamics',
    entity: 'company',
    verified: true,
    social: ['linkedin', 'location'],
    fields: [
      { label: 'ID', value: '2034' },
      { label: 'Main Phone', value: '+1 (324) 839-4924', kind: 'link', href: '#' },
      { label: 'Status', value: 'Active Account', kind: 'select' },
      { label: 'Owner', value: 'Chloe Davis', kind: 'link', href: '#', dot: 'var(--color-entity-company)' },
      { label: 'Number of Employees', value: '55' },
    ],
    tabs: [
      { label: 'Overview', active: true },
      { label: 'Edit' },
      { label: 'Activity' },
      { label: 'Contacts' },
      { label: 'Locations' },
      { label: 'Prospect', icon: 'amplify' },
      { label: 'References', count: 2 },
      { label: 'Billing Profiles' },
    ],
  },
  candidate: {
    title: '2034 | Tyler Brooks',
    entity: 'candidate',
    verified: false,
    social: ['linkedin', 'location'],
    fields: [
      { label: 'ID', value: '2034' },
      { label: 'Full Name', value: 'Tyler Brooks' },
      { label: 'Status', value: 'Placed', kind: 'select' },
      { label: 'Primary Email', value: 'tyler.brooks@gmail.com', kind: 'link', href: '#', dot: 'var(--color-entity-candidate)' },
      { label: 'Category', value: 'Software Engineering' },
      { label: 'Job Title', value: 'Software Engineer' },
      { label: 'Risk Level', value: 'No Signal Data', kind: 'chip', icon: 'shield-outline' },
    ],
    tabs: [
      { label: 'Overview', active: true },
      { label: 'Edit' },
      { label: 'Activity' },
      { label: 'Submissions' },
      { label: 'Employment Histories', count: 2 },
      { label: 'Education' },
    ],
  },
};

/**
 * /record-header — the company and candidate headers (Figma 3040:88434), plus a
 * narrow frame that shows tabs overflowing into the More menu.
 *
 * Embed mode: pass `variant` to render one header, e.g.
 *   /examples/record-header?variant=company&width=760
 * Params: variant = company | candidate (sample data),
 *         width (frame width in px; narrow widths push tabs into More; default full width),
 *         title, entity (candidate | company | job | contact | note | task) to override the preset,
 *         verified (true | false; default from the preset),
 *         social (comma list of icon names, or `none`; default linkedin,location),
 *         tab (active tab index; default from the preset).
 */
@Component({
  imports: [RecordHeader],
  selector: 'app-record-header-page',
  styleUrl: './record-header-page.css',
  templateUrl: './record-header-page.html',
})
export class RecordHeaderPage {
  // Bound from query params. Absent params arrive as `undefined`, so defaults are
  // applied in the computeds below.
  readonly variant = input<Variant>();
  readonly width = input<string>();
  readonly title = input<string>();
  readonly entity = input<string>();
  readonly verified = input<boolean | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  readonly social = input<string>();
  readonly tab = input<string>();

  protected readonly presets = PRESETS;
  protected readonly embed = computed(() => !!this.variant());
  protected readonly preset = computed(() => PRESETS[this.variant() === 'candidate' ? 'candidate' : 'company']);
  protected readonly embedTitle = computed(() => this.title() ?? this.preset().title);
  protected readonly embedEntity = computed(() => this.entity() ?? this.preset().entity);
  protected readonly embedVerified = computed(() => this.verified() ?? this.preset().verified);
  protected readonly embedSocial = computed(() => {
    const s = this.social();
    if (s == null) return this.preset().social;
    return s === 'none' ? [] : s.split(',').map((n) => n.trim()).filter(Boolean);
  });
  protected readonly embedTab = computed(() => (this.tab() == null ? undefined : Number(this.tab())));
  protected readonly embedWidth = computed(() => (this.width() ? `${Number(this.width())}px` : null));

  /** Reference view: last event from the interactive headers. */
  protected readonly lastEvent = signal('—');
  protected onTab(i: number, tabs: RecordHeaderTab[]): void {
    this.lastEvent.set(`tabSelect: ${i} (${tabs[i].label})`);
  }
  protected onAction(a: RecordHeaderAction): void {
    this.lastEvent.set(`action: ${a}`);
  }
}
