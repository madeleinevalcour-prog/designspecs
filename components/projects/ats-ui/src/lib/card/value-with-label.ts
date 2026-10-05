import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * ValueWithLabel (Figma: value-with-label, Component Migration 250:17791) — an
 * uppercase label stacked over a value. Port of the prototype repo's
 * `card/ValueWithLabel.astro`.
 *
 *   <ats-value-with-label label="Owner" value="Marcus Lee" />
 *   <ats-value-with-label label="Date Added" value="07/16/2026" plain icon="calendar" />
 *
 * Default value uses meta/default; `plain` uses input/value/default (dates, yes/no).
 * `icon` (a name from the icon set) renders after the value.
 */
@Component({
  selector: 'ats-value-with-label',
  imports: [Icon],
  template: `
    <span class="ats-value-with-label__label">{{ label() }}</span>
    <div class="ats-value-with-label__value">
      <span class="ats-value-with-label__value-text" [class.ats-value-with-label__value-text--plain]="plain()">{{ value() }}</span>
      @if (icon(); as name) { <ats-icon [name]="name" [size]="12" /> }
    </div>
  `,
  styleUrl: './value-with-label.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-value-with-label' },
})
export class ValueWithLabel {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly plain = input(false, { transform: booleanAttribute });
  readonly icon = input<string>();
}
