import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { Button } from '../button/button';
import { NovoListItem, NovoListItemState } from './novo-list';
import { ItemAvatar, ItemContent, ItemHeader, NovoListEntity, NovoListField } from './parts';

// Presets mirror Figma "list-item presets" (574:3888) plus the default novo-list item.
// Inputs accept `undefined` and fall back to the Figma defaults in computeds, so an
// unset binding (e.g. a missing query param) still renders the default.

const DEFAULT_FIELDS: NovoListField[] = [
  { type: 'company', text: 'Company Name' },
  { type: 'owner', text: 'Owner Name' },
  { type: 'phone', text: '(784) 432 - 5293' },
  { type: 'email', text: 'Email' },
  { type: 'location', text: 'Location' },
  { type: 'status', text: 'Status' },
];
const FAST_FIND_FIELDS: NovoListField[] = DEFAULT_FIELDS.filter((f) => f.type !== 'owner');
const TASK_FIELDS: NovoListField[] = [
  { type: 'date', text: 'May 23, 2024' },
  { type: 'status', text: 'Status' },
  { type: 'owner', text: 'Chloe Davis' },
];

/** Row inputs every preset forwards to its NovoListItem. */
@Directive()
export abstract class NovoListItemPreset {
  readonly clickable = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  readonly href = input<string>();
  readonly state = input<NovoListItemState>();
  /** Accessible name of the row action; defaults to the item's title. */
  readonly label = input<string>();
  readonly itemClick = output<MouseEvent>();
}

const ROW = `<ats-novo-list-item [clickable]="clickable()" [href]="href()" [state]="state()" [label]="rowLabel()" (itemClick)="itemClick.emit($event)">`;
const presetHost = { class: 'ats-novo-list-preset', '[attr.title]': 'null' };

/**
 * NovoListItemDefault (Figma: novo-list's list-item, 182:18861). Entity avatar +
 * headline title over company / owner / phone / email / location / status and an
 * optional comment. `indicator` shows the header's indicator chip (a NovoChip).
 */
@Component({
  selector: 'ats-novo-list-item-default',
  imports: [NovoListItem, ItemHeader, ItemContent, ItemAvatar],
  template: `${ROW}
      <ats-item-header [title]="title()" [indicator]="indicator()"><ats-item-avatar avatar option="entity" [entity]="entity()" /></ats-item-header>
      <ats-item-content [fields]="fieldList()" [body]="comment()" />
    </ats-novo-list-item>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: presetHost,
})
export class NovoListItemDefault extends NovoListItemPreset {
  readonly entity = input<NovoListEntity | undefined>('candidate');
  readonly title = input.required<string>();
  /** Header indicator chip label, e.g. "10 New Results"; omit to hide. */
  readonly indicator = input<string>();
  readonly fields = input<NovoListField[] | undefined>(DEFAULT_FIELDS);
  readonly comment = input<string>();
  protected readonly fieldList = computed(() => this.fields() ?? DEFAULT_FIELDS);
  protected readonly rowLabel = computed(() => this.label() ?? this.title());
}

/**
 * NovoListItemFastFind (Figma preset "fast-find", 3868:71290). Like the default
 * item without the owner field or a comment.
 */
@Component({
  selector: 'ats-novo-list-item-fast-find',
  imports: [NovoListItem, ItemHeader, ItemContent, ItemAvatar],
  template: `${ROW}
      <ats-item-header [title]="title()" [indicator]="indicator()"><ats-item-avatar avatar option="entity" [entity]="entity()" /></ats-item-header>
      <ats-item-content [fields]="fieldList()" />
    </ats-novo-list-item>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: presetHost,
})
export class NovoListItemFastFind extends NovoListItemPreset {
  readonly entity = input<NovoListEntity | undefined>('candidate');
  readonly title = input.required<string>();
  /** Header indicator chip label, e.g. "10 New Results"; omit to hide. */
  readonly indicator = input<string>();
  readonly fields = input<NovoListField[] | undefined>(FAST_FIND_FIELDS);
  protected readonly fieldList = computed(() => this.fields() ?? FAST_FIND_FIELDS);
  protected readonly rowLabel = computed(() => this.label() ?? this.title());
}

/**
 * NovoListItemTask (Figma preset "task", 574:3887). 14px circle-outline header
 * avatar + link text, over date / status / owner and an optional comment.
 */
@Component({
  selector: 'ats-novo-list-item-task',
  imports: [NovoListItem, ItemHeader, ItemContent, ItemAvatar],
  template: `${ROW}
      <ats-item-header [link]="title()"><ats-item-avatar avatar icon="circle-outline" /></ats-item-header>
      <ats-item-content [fields]="fieldList()" [body]="comment()" />
    </ats-novo-list-item>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: presetHost,
})
export class NovoListItemTask extends NovoListItemPreset {
  readonly title = input.required<string>();
  readonly fields = input<NovoListField[] | undefined>(TASK_FIELDS);
  readonly comment = input<string>();
  protected readonly fieldList = computed(() => this.fields() ?? TASK_FIELDS);
  protected readonly rowLabel = computed(() => this.label() ?? this.title());
}

/**
 * NovoListItemJob (Figma preset "job", 1218:51138). Link text with a 12px circle
 * in the entity color (job by default), over company / date / status.
 */
@Component({
  selector: 'ats-novo-list-item-job',
  imports: [NovoListItem, ItemHeader, ItemContent],
  template: `${ROW}
      <ats-item-header [link]="title()" [linkCircle]="circle()" />
      <ats-item-content [fields]="fieldList()" />
    </ats-novo-list-item>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: presetHost,
})
export class NovoListItemJob extends NovoListItemPreset {
  readonly title = input.required<string>();
  readonly company = input<string | undefined>('Company Name');
  readonly date = input<string | undefined>('May 23, 2024');
  readonly status = input<string | undefined>('Internally submitted');
  /** Entity whose color tints the leading circle. */
  readonly entity = input<NovoListEntity | undefined>('job');
  protected readonly circle = computed(() => `var(--color-entity-${this.entity() ?? 'job'})`);
  protected readonly fieldList = computed<NovoListField[]>(() => [
    { type: 'company', text: this.company() ?? 'Company Name' },
    { type: 'date', text: this.date() ?? 'May 23, 2024' },
    { type: 'status', text: this.status() ?? 'Internally submitted' },
  ]);
  protected readonly rowLabel = computed(() => this.label() ?? this.title());
}

/**
 * NovoListItemNote (Figma preset "note", 574:3886). No header; a horizontal-list
 * item-content: 16px preview avatar, date over time, then owner / phone / note
 * action over the note body.
 */
@Component({
  selector: 'ats-novo-list-item-note',
  imports: [NovoListItem, ItemContent],
  template: `${ROW}
      <ats-item-content type="horizontal-list" [date]="date()" [time]="time()" [fields]="fieldList()" [body]="body()" />
    </ats-novo-list-item>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-novo-list-preset' },
})
export class NovoListItemNote extends NovoListItemPreset {
  readonly date = input.required<string>();
  readonly time = input.required<string>();
  /** Owner name (Figma "Owner" field). */
  readonly user = input<string | undefined>('Owner Name');
  /** Optional phone field; omit to hide. */
  readonly phone = input<string>();
  /** Note action (Figma "Note Action" field), e.g. Pre-screen. */
  readonly action = input<string | undefined>('Note Action');
  readonly body = input.required<string>();
  protected readonly fieldList = computed<NovoListField[]>(() => [
    { type: 'owner', text: this.user() ?? 'Owner Name' },
    ...(this.phone() ? [{ type: 'phone' as const, text: this.phone()! }] : []),
    { type: 'note-action', text: this.action() ?? 'Note Action' },
  ]);
  protected readonly rowLabel = computed(() => this.label() ?? `${this.action() ?? 'Note Action'}, ${this.date()} ${this.time()}`);
}

/**
 * NovoListItemSuggestedAction (Figma preset "suggested action", 5713:166322).
 * Headline title over a status message and a secondary / small / amplify pill
 * Button ("View" + arrow-right). The button is its own control (`action`), stacked
 * above the row action.
 */
@Component({
  selector: 'ats-novo-list-item-suggested-action',
  imports: [NovoListItem, ItemHeader, ItemContent, Button],
  template: `${ROW}
      <ats-item-header [title]="title()" />
      <ats-item-content [fields]="fieldList()">
        <button itemData ats-button theme="secondary" size="small" color="amplify" pill iconRight="arrow-right" (click)="action.emit($event)">{{ actionLabel() ?? 'View' }}</button>
      </ats-item-content>
    </ats-novo-list-item>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { ...presetHost, class: 'ats-novo-list-preset ats-novo-list-preset--suggested-action' },
})
export class NovoListItemSuggestedAction extends NovoListItemPreset {
  readonly title = input.required<string>();
  readonly text = input<string | undefined>('Amplify found 3 suggested record updates for this record.');
  readonly actionLabel = input<string | undefined>('View');
  /** Emits when the View button is clicked (not the row). */
  readonly action = output<MouseEvent>();
  protected readonly fieldList = computed<NovoListField[]>(() => [
    { type: 'status', text: this.text() ?? 'Amplify found 3 suggested record updates for this record.' },
  ]);
  protected readonly rowLabel = computed(() => this.label() ?? this.title());
}
