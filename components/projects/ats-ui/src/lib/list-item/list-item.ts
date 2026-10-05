import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

export interface ListItemField {
  /** Icon name from the icon set. */
  icon: string;
  text: string;
  /** Icon color (a CSS color / token). Defaults to color/icon/illustration. */
  color?: string;
}

/**
 * ListItem (Figma: "list-item", Component Migration; as used in fast-find-results
 * 1323:67009). A result row: item-header (entity avatar + title), then item-content
 * (wrapping meta fields, then an optional body line). Applied to a native button:
 *
 *   <button ats-list-item entity="candidate" label="2034 | Tyler Brooks"
 *           [fields]="[{ icon: 'company', text: 'Company Name', color: 'var(--color-entity-company)' }]"
 *           body="Tyler is Pre-Registered and available…"></button>
 *
 * `entity` picks the avatar color (--color-entity-<entity>); `glyph` overrides its
 * white glyph (defaults to the entity name).
 */
@Component({
  selector: 'button[ats-list-item]',
  imports: [Icon],
  template: `
    <span class="ats-list-item__header">
      <span class="ats-list-item__avatar" [style.background]="avatarBg()">
        <ats-icon [name]="glyphName()" [size]="12" color="var(--color-icon-icon-knockout)" />
      </span>
      <span class="ats-list-item__title">{{ label() }}</span>
    </span>
    @if (fields().length || body()) {
      <span class="ats-list-item__content">
        @if (fields().length) {
          <span class="ats-list-item__data">
            @for (f of fields(); track $index) {
              <span class="ats-list-item__field">
                <ats-icon [name]="f.icon" [size]="12" [color]="f.color ?? 'var(--color-icon-illustration)'" />
                <span>{{ f.text }}</span>
              </span>
            }
          </span>
        }
        @if (body()) { <span class="ats-list-item__body">{{ body() }}</span> }
      </span>
    }
  `,
  styleUrl: './list-item.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-list-item', type: 'button' },
})
export class ListItem {
  readonly entity = input.required<string>();
  readonly glyph = input<string>();
  /** The title line (named `label` so it doesn't set a native tooltip). */
  readonly label = input.required<string>();
  readonly fields = input<ListItemField[]>([]);
  /** Optional body line under the fields (body/default). */
  readonly body = input<string>();

  protected readonly glyphName = computed(() => this.glyph() ?? this.entity());
  protected readonly avatarBg = computed(() => `var(--color-entity-${this.entity()})`);
}
