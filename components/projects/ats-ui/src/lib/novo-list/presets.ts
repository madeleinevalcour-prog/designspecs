import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { NovoListItem } from './novo-list';
import { DateTime, EntityIcon, Field, ItemContent, ItemHeader, NovoListEntity, NovoListField } from './parts';

// Inputs accept `undefined` and fall back to the Figma defaults in computeds, so
// an unset binding (e.g. a missing query param) still renders the default.

const DEFAULT_FIELDS: NovoListField[] = [
  { icon: 'company', text: 'Nexus Dynamics' },
  { icon: 'contact', text: 'Steve Smith' },
  { icon: 'email', text: 'name@email.com' },
  { icon: 'location', text: 'Boston, MA' },
];
const TASK_FIELDS: NovoListField[] = [
  { icon: 'calendar', text: '7/20/2026, 3:00 PM' },
  { icon: 'info', text: 'Follow-up' },
  { icon: 'user', text: 'Chloe Davis' },
];

const presetHost = { class: 'ats-novo-list-preset', '[attr.title]': 'null' };

/**
 * NovoListItemDefault (preset of novo-list-item, 182:18861). Entity header
 * (EntityIcon + link title) over a fields row and an optional comment.
 */
@Component({
  selector: 'ats-novo-list-item-default',
  imports: [NovoListItem, ItemHeader, ItemContent, EntityIcon],
  template: `
    <ats-novo-list-item>
      <ats-item-header [title]="title()"><ats-entity-icon avatar [entity]="entity()" /></ats-item-header>
      <ats-item-content [fields]="fieldList()" [comment]="comment()" />
    </ats-novo-list-item>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: presetHost,
})
export class NovoListItemDefault {
  readonly entity = input<NovoListEntity | undefined>('candidate');
  readonly title = input.required<string>();
  readonly fields = input<NovoListField[] | undefined>(DEFAULT_FIELDS);
  readonly comment = input<string>();
  protected readonly fieldList = computed(() => this.fields() ?? DEFAULT_FIELDS);
}

/**
 * NovoListItemTask (preset, 574:3658). Circle-outline avatar + link title over
 * calendar / info / user fields and an optional comment.
 */
@Component({
  selector: 'ats-novo-list-item-task',
  imports: [NovoListItem, ItemHeader, ItemContent, Icon],
  template: `
    <ats-novo-list-item>
      <ats-item-header [title]="title()"><ats-icon avatar name="circle-outline" [size]="16" /></ats-item-header>
      <ats-item-content [fields]="fieldList()" [comment]="comment()" />
    </ats-novo-list-item>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: presetHost,
})
export class NovoListItemTask {
  readonly title = input.required<string>();
  readonly fields = input<NovoListField[] | undefined>(TASK_FIELDS);
  readonly comment = input<string>();
  protected readonly fieldList = computed(() => this.fields() ?? TASK_FIELDS);
}

/**
 * NovoListItemNote (preset, 574:3196). Horizontal: preview avatar, stacked
 * date/time, then a comment (label + user field row over the note body).
 */
@Component({
  selector: 'ats-novo-list-item-note',
  imports: [NovoListItem, DateTime, Field, Icon],
  template: `
    <ats-novo-list-item>
      <div class="ats-item-content ats-item-content--row">
        <span class="ats-item-avatar"><ats-icon name="preview" [size]="16" /></span>
        <ats-date-time [date]="date()" [time]="time()" />
        <div class="ats-item-comment">
          <div class="ats-item-fields">
            <ats-field [icon]="labelIcon() ?? 'note'" [text]="label() ?? 'Pre-screen'" />
            <ats-field icon="user" [text]="user() ?? 'Chloe Davis'" />
          </div>
          <p class="ats-item-comment__body">{{ body() }}</p>
        </div>
      </div>
    </ats-novo-list-item>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-novo-list-preset' },
})
export class NovoListItemNote {
  readonly date = input.required<string>();
  readonly time = input.required<string>();
  readonly label = input<string | undefined>('Pre-screen');
  readonly labelIcon = input<string | undefined>('note');
  readonly user = input<string | undefined>('Chloe Davis');
  readonly body = input.required<string>();
}

/**
 * NovoListItemSubmission (preset, Figma 1528:61198 "Open Submissions"). A 12px
 * circle in the job entity color + link title, over calendar / info / company
 * fields.
 */
@Component({
  selector: 'ats-novo-list-item-submission',
  imports: [NovoListItem, ItemHeader, Field, Icon],
  template: `
    <ats-novo-list-item>
      <ats-item-header [title]="title()"><ats-icon avatar name="circle" [size]="12" [color]="color() ?? 'var(--color-entity-job)'" /></ats-item-header>
      <div class="ats-item-content">
        <div class="ats-item-fields">
          <ats-field icon="calendar" [text]="datetime() ?? '7/20/2026, 3:00 PM'" />
          <ats-field icon="info" [text]="status() ?? 'Interviewing'" />
          <ats-field icon="company" [text]="company() ?? 'Nexus Dynamics'" />
        </div>
      </div>
    </ats-novo-list-item>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: presetHost,
})
export class NovoListItemSubmission {
  readonly title = input.required<string>();
  readonly datetime = input<string | undefined>('7/20/2026, 3:00 PM');
  readonly status = input<string | undefined>('Interviewing');
  readonly company = input<string | undefined>('Nexus Dynamics');
  /** Leading circle color; any CSS color or var(). Job entity color by default. */
  readonly color = input<string | undefined>('var(--color-entity-job)');
}
