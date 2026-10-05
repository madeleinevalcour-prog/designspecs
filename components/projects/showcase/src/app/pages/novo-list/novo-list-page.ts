import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, numberAttribute } from '@angular/core';
import {
  DateTime, EntityIcon, Field, ItemContent, ItemHeader, NovoList, NovoListEntity, NovoListField,
  NovoListItemDefault, NovoListItemNote, NovoListItemSubmission, NovoListItemTask,
} from 'ats-ui';

type View =
  | 'list' | 'default' | 'task' | 'note' | 'submission'
  | 'entity-icon' | 'field' | 'date-time' | 'item-header' | 'item-content';

interface DefaultSample { title: string; entity?: NovoListEntity; fields?: NovoListField[]; comment?: string; }

/**
 * /novo-list — full reference (mirrors the prototype repo's /components/novo-list,
 * plus the submission preset).
 *
 * Embed mode: pass `view` to render one piece for a docs page, e.g.
 *   /examples/novo-list?view=task&count=1
 * Params:
 *   view    = list | default | task | note | submission (a list of that item preset)
 *           | entity-icon | field | date-time | item-header | item-content (building blocks)
 *   count   = how many sample items to show for list views (default: all samples)
 *   entity  = candidate | job | note | company | contact — for default, entity-icon,
 *             item-header (entity-icon with no entity shows all five)
 *   title   = overrides the first item's title (list views, item-header)
 *   comment = overrides the first item's comment (default / task / item-content);
 *             `none` removes it
 */
@Component({
  imports: [
    NovoList, NovoListItemDefault, NovoListItemTask, NovoListItemNote, NovoListItemSubmission,
    ItemHeader, ItemContent, EntityIcon, DateTime, Field, NgTemplateOutlet,
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

  protected readonly embed = computed(() => !!this.view());

  protected readonly entities: NovoListEntity[] = ['candidate', 'job', 'company', 'contact', 'note'];

  protected readonly candidates: DefaultSample[] = [
    { title: '2034 | Tyler Brooks', comment: 'Tyler is Pre-Registered and available starting June 23, 2026, seeking entry-level cloud/infrastructure roles.' },
    { title: '1897 | Dana Whitfield', entity: 'candidate', fields: [
      { icon: 'company', text: 'Orbit Systems' }, { icon: 'contact', text: 'Priya Anand' },
      { icon: 'email', text: 'dana.w@email.com' }, { icon: 'location', text: 'Austin, TX' } ] },
    { title: '5521 | Senior React Developer', entity: 'job', fields: [
      { icon: 'company', text: 'Nexus Dynamics' }, { icon: 'location', text: 'Remote — US' } ] },
  ];
  protected readonly tasks = [
    { title: 'Call Tyler Brooks', comment: 'Tyler is Pre-Registered and available starting June 23, 2026, seeking entry-level cloud/infrastructure...' },
    { title: 'Send offer to Dana Whitfield', fields: [
      { icon: 'calendar', text: '7/22/2026, 10:00 AM' }, { icon: 'info', text: 'Offer' }, { icon: 'user', text: 'Marcus Lee' } ] as NovoListField[] },
  ];
  protected readonly notes = [
    { date: '07/16/2026', time: '12:00 PM', label: 'Pre-screen', user: 'Chloe Davis', body: 'Tyler is Pre-Registered and available starting June 23, 2026, seeking entry-level cloud/infrastructure...' },
    { date: '07/14/2026', time: '9:30 AM', label: 'Call', user: 'Marcus Lee', body: 'Left a voicemail about the React opening; will follow up Thursday.' },
  ];
  protected readonly submissions = [
    { title: '5521 | Senior React Developer' },
    { title: '5480 | Cloud Infrastructure Engineer', datetime: '7/22/2026, 10:00 AM', status: 'Submitted', company: 'Orbit Systems' },
  ];
  protected readonly contentFields: NovoListField[] = [{ icon: 'company', text: 'Nexus Dynamics' }, { icon: 'contact', text: 'Steve Smith' }];

  /** Slice to `count`, then apply the title/comment overrides to the first item. */
  protected pick<T extends { title?: string; comment?: string }>(items: T[]): T[] {
    const out = items.slice(0, this.count() ?? items.length).map((i) => ({ ...i }));
    if (out[0]) {
      if (this.title()) out[0].title = this.title();
      if (this.comment() != null) out[0].comment = this.comment() === 'none' ? undefined : this.comment();
    }
    return out;
  }

  protected readonly embedDefaults = computed(() =>
    this.pick(this.candidates).map((c, i) => (i === 0 && this.entity() ? { ...c, entity: this.entity() } : c)),
  );
  protected readonly embedTasks = computed(() => this.pick(this.tasks));
  protected readonly embedNotes = computed(() => this.notes.slice(0, this.count() ?? this.notes.length));
  protected readonly embedSubmissions = computed(() => this.pick(this.submissions));
  protected readonly embedEntities = computed(() => (this.entity() ? [this.entity()!] : this.entities));
  protected readonly embedHeaderTitle = computed(() => this.title() ?? '2034 | Tyler Brooks');
  protected readonly embedHeaderEntity = computed(() => this.entity() ?? 'candidate');
  protected readonly embedComment = computed(() =>
    this.comment() === 'none' ? undefined : (this.comment() ?? 'Short note preview text.'),
  );
}
