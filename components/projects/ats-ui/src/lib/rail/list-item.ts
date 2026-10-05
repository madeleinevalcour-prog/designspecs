import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

export interface ListItemField {
  icon: string;
  text: string;
}

/**
 * ListItem (Figma: "list-item") — entity chip + title + wrapping meta fields. Used
 * for Fast Find results. Applied to a native button:
 *
 *   <button ats-list-item entity="candidate" label="2034 | Tyler Brooks"
 *           [fields]="[{ icon: 'info', text: 'Software Engineer' }]"></button>
 *
 * `entity` picks the chip color token (--color-entity-<entity>); `glyph` overrides
 * the white chip glyph (defaults to the entity name). `compact` = the 13px title
 * used in the narrow Fast Find option-1 overlay.
 */
@Component({
  selector: 'button[ats-list-item]',
  imports: [Icon],
  template: `
    <span class="ats-list-item__header">
      <span class="ats-entity-chip" [style.background]="chipBg()">
        <ats-icon [name]="glyphName()" [size]="12" color="var(--color-icon-icon-knockout)" />
      </span>
      <span class="ats-list-item__title">{{ label() }}</span>
    </span>
    <span class="ats-list-item__content">
      @for (f of fields(); track $index) {
        <span class="ats-list-item__field">
          <ats-icon [name]="f.icon" [size]="12" color="var(--color-icon-subtle)" />
          <span class="ats-list-item__field-text">{{ f.text }}</span>
        </span>
      }
    </span>
  `,
  styleUrl: './list-item.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-list-item', type: 'button', '[class.ats-list-item--compact]': 'compact()' },
})
export class ListItem {
  readonly entity = input.required<string>();
  readonly glyph = input<string>();
  /** The title line (Astro prop `title`; renamed so it doesn't set a native tooltip). */
  readonly label = input.required<string>();
  readonly fields = input<ListItemField[]>([]);
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly glyphName = computed(() => this.glyph() ?? this.entity());
  protected readonly chipBg = computed(() => `var(--color-entity-${this.entity()})`);
}
