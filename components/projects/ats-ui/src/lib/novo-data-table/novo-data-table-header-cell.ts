import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, numberAttribute } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * NovoDataTableHeaderCell (Figma: "novo-data-table-header-cell", Component Migration 254:494).
 * Column label + sort icon + optional filter icon.
 * Port of the prototype repo's NovoDataTableHeaderCell.astro.
 *
 * Applied to a native <th> (scope="col" is set for you):
 *
 *   <th ats-novo-data-table-header-cell label="Name" [width]="240"></th>
 *   <th ats-novo-data-table-header-cell label="ID" [filter]="false"></th>
 *
 * The sort and filter icons are visual only, as in the source: no sorting or
 * filtering behaviour is attached.
 */
@Component({
  selector: 'th[ats-novo-data-table-header-cell]',
  imports: [Icon],
  template: `
    <div class="ats-ndt-cell ats-ndt-hcell" [style.width.px]="width()">
      <span class="ats-ndt-hcell__label">{{ label() }}<ng-content /></span>
      <ats-icon class="ats-ndt-ic" name="sortable" [size]="12" />
      @if (filter()) {
        <ats-icon class="ats-ndt-ic" name="filter" [size]="12" />
      }
    </div>
  `,
  styleUrl: './novo-data-table.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-ndt-th', scope: 'col' },
})
export class NovoDataTableHeaderCell {
  readonly label = input<string>('');
  /** Show the filter icon after the sort icon. */
  readonly filter = input(true, { transform: booleanAttribute });
  /** Fixed column width in px. */
  readonly width = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)),
  });
}
