import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, numberAttribute, signal } from '@angular/core';
import {
  Checkbox, ItemAvatar, ItemComment, ItemContent, ItemData, ItemField, ItemFieldType, ItemHeader, NovoList,
  NovoListEntity, NovoListField, NovoListItem, NovoListItemDefault, NovoListItemFastFind, NovoListItemJob,
  NovoListItemNote, NovoListItemState, NovoListItemSuggestedAction, NovoListItemTask, RelevancyDots,
} from 'ats-ui';

type View =
  | 'list' | 'default' | 'fast-find' | 'task' | 'job' | 'note' | 'suggested-action' | 'states' | 'click' | 'composed'
  | 'item-avatar' | 'item-header' | 'item-field' | 'item-data' | 'comment' | 'item-content' | 'relevancy-dots';

interface Sample { title: string; entity?: NovoListEntity; fields?: NovoListField[]; comment?: string; }

const BODY = 'Tyler is Pre‑Registered and available starting June 23, 2026, seeking entry‑level cloud/infrastructure...';

/**
 * /novo-list — full reference of the Figma novo-list family (Component Migration 46:3355).
 *
 * Embed mode: pass `view` to render one piece for a docs page, e.g.
 *   /examples/novo-list?view=task&count=1
 * Params:
 *   view    = list | default | fast-find | task | job | note | suggested-action  (a list of that preset)
 *           | states  (default + forced hover + forced focus rows)
 *           | click   (a live list that reports the last activated row)
 *           | composed (a NovoListItem built from parts: candidate-list header + item-content)
 *           | item-avatar | item-header | item-field | item-data | comment | item-content | relevancy-dots
 *   count   = how many sample items for list views (default: all samples)
 *   entity  = candidate | contact | company | lead | opportunity | job | submission | placement | note | task
 *             (default / fast-find first item; item-avatar shows all entities when unset)
 *   title   = overrides the first item's title (list views, item-header)
 *   comment = overrides the first item's comment (default / task); `none` removes it
 *   state   = hover | focus — forces that state on the first item of a list view
 *   theme   = standard | candidate-list (item-header; default: both)
 *   type    = vertical-list | horizontal-list (item-content; default: both)
 *   indicator = label of the header's indicator chip (a NovoChip), e.g. "10 New Results":
 *             on the first item of default / fast-find lists, and on item-header
 */
@Component({
  imports: [
    NovoList, NovoListItem, NovoListItemDefault, NovoListItemFastFind, NovoListItemTask, NovoListItemJob,
    NovoListItemNote, NovoListItemSuggestedAction, ItemAvatar, ItemHeader, ItemField, ItemData, ItemComment,
    ItemContent, RelevancyDots, Checkbox, NgTemplateOutlet,
  ],
  selector: 'app-novo-list-page',
  styleUrl: './novo-list-page.css',
  templateUrl: './novo-list-page.html',
})
export class NovoListPage {
  // Bound from query params; absent params arrive as `undefined`.
  readonly view = input<View>();
  readonly count = input(undefined, { transform: (v: unknown) => (v == null ? undefined : numberAttribute(v)) });
  readonly entity = input<NovoListEntity>();
  readonly title = input<string>();
  readonly comment = input<string>();
  readonly state = input<NovoListItemState>();
  readonly theme = input<'standard' | 'candidate-list'>();
  readonly type = input<'vertical-list' | 'horizontal-list'>();
  readonly indicator = input<string>();

  protected readonly embed = computed(() => !!this.view());
  protected readonly body = BODY;

  protected readonly entities: NovoListEntity[] = [
    'candidate', 'contact', 'company', 'lead', 'opportunity', 'job', 'submission', 'placement', 'note', 'task',
  ];
  protected readonly fieldTypes: ItemFieldType[] = [
    'caption', 'status', 'company', 'email', 'phone', 'location', 'date', 'contact', 'owner', 'note-action', 'candidate',
  ];
  protected readonly fieldText: Record<string, string> = {
    caption: 'Pre-Registered', status: 'Status', company: 'Company Name', email: 'Email', phone: '(784) 432 - 5293',
    location: 'Location', date: 'May 23, 2024', contact: 'Contact Name', owner: 'Owner Name',
    'note-action': 'Note Action', candidate: 'Candidate Name',
  };

  protected readonly defaults: Sample[] = [
    { title: '2034 | Tyler Brooks', comment: BODY },
    { title: '1897 | Dana Whitfield', comment: 'Dana has two offers pending and prefers hybrid roles in Austin.' },
    { title: '5521 | Senior React Developer', entity: 'job', fields: [
      { type: 'company', text: 'Nexus Dynamics' }, { type: 'location', text: 'Remote — US' }, { type: 'status', text: 'Accepting candidates' } ] },
    { title: '311 | Nexus Dynamics', entity: 'company', fields: [
      { type: 'phone', text: '(617) 555 - 0142' }, { type: 'location', text: 'Boston, MA' } ] },
  ];
  protected readonly fastFind: Sample[] = [
    { title: '2034 | Tyler Brooks' },
    { title: '88 | Priya Anand', entity: 'contact' },
    { title: '702 | Orbit Systems', entity: 'lead' },
  ];
  protected readonly tasks: Sample[] = [
    { title: 'Call Tyler Brooks' },
    { title: 'Send offer to Dana Whitfield', comment: 'Confirm start date before sending.', fields: [
      { type: 'date', text: 'Jul 22, 2026' }, { type: 'status', text: 'Offer' }, { type: 'owner', text: 'Marcus Lee' } ] },
  ];
  protected readonly jobs = [
    { title: '425 | Software Engineer' },
    { title: '5480 | Cloud Infrastructure Engineer', company: 'Orbit Systems', date: 'Jul 22, 2026', status: 'Interviewing' },
  ];
  protected readonly notes = [
    { date: 'May 23, 2024', time: '12:00 PM', user: 'Owner Name', phone: '(784) 432 - 5293', action: 'Note Action', body: BODY },
    { date: 'Jul 14, 2026', time: '9:30 AM', user: 'Marcus Lee', action: 'Call', body: 'Left a voicemail about the React opening; will follow up Thursday.' },
  ];
  protected readonly dataFields: NovoListField[] = [
    { type: 'company', text: 'Company Name' }, { type: 'owner', text: 'Owner Name' }, { type: 'phone', text: '(784) 432 - 5293' },
    { type: 'email', text: 'Email' }, { type: 'location', text: 'Location' }, { type: 'status', text: 'Status' },
  ];
  protected readonly noteFields: NovoListField[] = [
    { type: 'owner', text: 'Owner Name' }, { type: 'phone', text: '(784) 432 - 5293' }, { type: 'note-action', text: 'Note Action' },
  ];

  /** Slice to `count`, then apply the title/comment overrides to the first item. */
  protected pick<T extends { title?: string; comment?: string }>(items: T[]): T[] {
    const out = items.slice(0, this.count() ?? items.length).map((i) => ({ ...i }));
    if (out[0]) {
      if (this.title()) out[0].title = this.title();
      if (this.comment() != null) out[0].comment = this.comment() === 'none' ? undefined : this.comment();
    }
    return out;
  }
  private withEntity(items: Sample[]): Sample[] {
    return this.pick(items).map((c, i) => (i === 0 && this.entity() ? { ...c, entity: this.entity() } : c));
  }

  protected readonly embedDefaults = computed(() => this.withEntity(this.defaults));
  protected readonly embedFastFind = computed(() => this.withEntity(this.fastFind));
  protected readonly embedTasks = computed(() => this.pick(this.tasks));
  protected readonly embedJobs = computed(() => this.pick(this.jobs));
  protected readonly embedNotes = computed(() => this.notes.slice(0, this.count() ?? this.notes.length));
  protected readonly embedEntities = computed(() => (this.entity() ? [this.entity()!] : this.entities));
  protected readonly embedHeaderTitle = computed(() => this.title() ?? '2034 | Tyler Brooks');
  protected readonly showTheme = (t: string) => !this.theme() || this.theme() === t;
  protected readonly showType = (t: string) => !this.type() || this.type() === t;
  /** Forced state for item `i` of a list view (first item only). */
  protected stateAt(i: number): NovoListItemState | undefined { return i === 0 ? this.state() : undefined; }
  /** Indicator chip label for item `i` of a list view (first item only). */
  protected indicatorAt(i: number): string | undefined { return i === 0 ? this.indicator() : undefined; }

  // ---- click demo ----
  protected readonly lastClick = signal<string | null>(null);
  protected onItem(name: string, e: MouseEvent): void {
    // Keyboard activation of a button fires a click with detail 0.
    this.lastClick.set(`${name} (${e.detail === 0 ? 'keyboard' : 'pointer'})`);
  }
}
