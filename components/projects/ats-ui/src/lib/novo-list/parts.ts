import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

export type NovoListEntity = 'candidate' | 'job' | 'note' | 'company' | 'contact';
export interface NovoListField { icon: string; text: string; }

/**
 * EntityIcon (Figma: item-avatar → entity icon chip, 164:17911). A 24px square in
 * the entity color token (`--color-entity-<entity>`) with a 12px knockout glyph
 * from the icon set.
 *
 *   <ats-entity-icon entity="job" />
 */
@Component({
  selector: 'ats-entity-icon',
  imports: [Icon],
  template: '<ats-icon [name]="entityName()" [size]="12" color="var(--color-icon-icon-knockout)" />',
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-entity-icon', '[attr.data-entity]': 'entityName()' },
})
export class EntityIcon {
  readonly entity = input<NovoListEntity | undefined>('candidate');
  protected readonly entityName = computed(() => this.entity() ?? 'candidate');
}

/**
 * Field (Figma: "field", 182:18710). A 12px icon in the icon-illustration color
 * plus a body/sm label. Used in item-content field rows and note headers.
 *
 *   <ats-field icon="email" text="name@email.com" />
 */
@Component({
  selector: 'ats-field',
  imports: [Icon],
  template: '<ats-icon [name]="icon()" [size]="12" /><span class="ats-field__text">{{ text() }}</span>',
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-field' },
})
export class Field {
  readonly icon = input.required<string>();
  readonly text = input.required<string>();
}

/**
 * DateTime (Figma: "date-time", 574:2764). Stacked date (body color) over time
 * (subtle color), used in the note preset.
 */
@Component({
  selector: 'ats-date-time',
  template: '<p class="ats-date-time__date">{{ date() }}</p><p class="ats-date-time__time">{{ time() }}</p>',
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-date-time' },
})
export class DateTime {
  readonly date = input.required<string>();
  readonly time = input.required<string>();
}

/**
 * ItemHeader (Figma: "item-header", 182:18818). Avatar + a link-colored title.
 * Project the avatar with the `avatar` attribute (an <ats-entity-icon>, or a
 * 16px <ats-icon>):
 *
 *   <ats-item-header title="2034 | Tyler Brooks"><ats-entity-icon avatar entity="candidate" /></ats-item-header>
 */
@Component({
  selector: 'ats-item-header',
  template: `
    <span class="ats-item-avatar"><ng-content select="[avatar]" /></span>
    <p class="ats-item-header__title">{{ title() }}</p>
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `title` is an input; drop the native attribute so it doesn't show a tooltip.
  host: { class: 'ats-item-header', '[attr.title]': 'null' },
})
export class ItemHeader {
  readonly title = input.required<string>();
}

/**
 * ItemContent (Figma: "item-content", 574:3106). A wrapping row of fields plus an
 * optional comment body.
 *
 *   <ats-item-content [fields]="[{ icon: 'company', text: 'Nexus Dynamics' }]" comment="Short note." />
 */
@Component({
  selector: 'ats-item-content',
  imports: [Field],
  template: `
    @if (fieldList().length) {
      <div class="ats-item-fields">
        @for (f of fieldList(); track $index) { <ats-field [icon]="f.icon" [text]="f.text" /> }
      </div>
    }
    @if (comment()) {
      <div class="ats-item-comment"><p class="ats-item-comment__body">{{ comment() }}</p></div>
    }
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-item-content' },
})
export class ItemContent {
  readonly fields = input<NovoListField[] | undefined>([]);
  readonly comment = input<string>();
  protected readonly fieldList = computed(() => this.fields() ?? []);
}
