import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input } from '@angular/core';
import { CHECK_LIST } from './check-list-token';

/** Figma check-list `Property 1` layout: inline (a row) or basic (a column). */
export type CheckListType = 'inline' | 'basic';

/**
 * CheckList (Figma: "check-list", 331:1435 on the "Checkbox" page). Lays out
 * CheckboxLabels (`label[ats-checkbox-label]`, the projected content):
 *  - inline: a row; each item takes an equal share (checkbox/spacing/inline/gap between).
 *  - basic: a column.
 * Figma's disabled / disabled-vertical variants are `disabled` on inline / basic:
 * every item in the list is disabled.
 *
 *   <ats-check-list>
 *     <label ats-checkbox-label [(checked)]="a">Placements</label>
 *     <label ats-checkbox-label [(checked)]="b">Contacts</label>
 *   </ats-check-list>
 */
@Component({
  selector: 'ats-check-list',
  template: '<ng-content />',
  styleUrl: './checkbox-label.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: CHECK_LIST, useExisting: CheckList }],
  host: { class: 'ats-check-list', role: 'group', '[attr.data-type]': 'typeName()' },
})
export class CheckList {
  readonly type = input<CheckListType>();
  readonly disabled = input(false, { transform: booleanAttribute });
  protected readonly typeName = computed<CheckListType>(() => this.type() ?? 'inline');
}
