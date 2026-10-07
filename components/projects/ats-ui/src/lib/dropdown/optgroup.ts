import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

/** Figma novo-optgroup `Property 1` (built ones). */
export type OptgroupType = 'default' | 'check-list';

/**
 * Optgroup (Figma: "novo-optgroup", 338:7812). A group of rows inside a Dropdown.
 *  - default (338:7813): a column of Options (`[ats-option]`), no gap.
 *  - check-list (1779:42497): a column of CheckboxLabels (`label[ats-checkbox-label]`,
 *    lib/checkbox-label) — multi-select. The arrow keys move between the checkboxes;
 *    Space toggles.
 * `label` adds an optional group heading (not drawn in Figma; for screen readers it also
 * names the group). Rows are projected.
 *
 *   <ats-optgroup label="Lists">
 *     <button ats-option>Q4 Verizon outreach</button>
 *     <button ats-option>Comcast hiring managers</button>
 *   </ats-optgroup>
 *   <ats-optgroup type="check-list">
 *     <label ats-checkbox-label [(checked)]="details">Details</label>
 *   </ats-optgroup>
 *
 * Not built: check-list-nested (2904:72055: parent checkbox rows with indented children)
 * and drag-and-drop (1330:44940).
 */
@Component({
  selector: 'ats-optgroup',
  template: `
    @if (label()) {
      <div class="ats-optgroup__label" aria-hidden="true">{{ label() }}</div>
    }
    <ng-content />
  `,
  styleUrl: './dropdown.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-optgroup',
    role: 'group',
    '[attr.aria-label]': 'label() || null',
    '[attr.data-type]': 'typeName()',
  },
})
export class Optgroup {
  readonly type = input<OptgroupType>();
  /** Optional group heading (not in Figma). */
  readonly label = input<string>();
  protected readonly typeName = computed<OptgroupType>(() => this.type() ?? 'default');
}
