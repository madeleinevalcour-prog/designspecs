import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../../icon/icon';
import { LIST_SAMPLE_COLUMNS, LIST_SAMPLE_ROWS, ListDataTableColumn, ListDataTableRow } from '../list-variations-sample-data';

/**
 * ListDataTable (Figma: "novo-data-table" 39:15572, appearance=Default, in the List
 * Variations file 0LCuwDp7YHGGqK6WiseTRi). The record-list table: a header row with
 * per-column sort + filter icons, then body rows with a checkbox, a preview icon and
 * plain / link-styled cells. Fixed 240px columns, so it grows wider than its
 * container and scrolls horizontally inside it; the header row is sticky; body rows
 * are zebra-striped (white / muted backdrop).
 *
 *   <ats-list-data-table [columns]="cols" [rows]="rows" />
 *
 * Not the generic NovoDataTable (`ats-data-table`). Renders the prototype's sample
 * data when `columns` / `rows` are not given. Usually placed in ats-list-data-table-container,
 * which provides the scroll region the sticky header pins to.
 * Port of the prototype repo's list-variations/DataTable.astro.
 */
@Component({
  selector: 'ats-list-data-table',
  imports: [Icon],
  templateUrl: './list-data-table.html',
  styleUrl: './list-data-table.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-list-data-table', role: 'table' },
})
export class ListDataTable {
  readonly columns = input<ListDataTableColumn[]>();
  readonly rows = input<ListDataTableRow[]>();

  protected readonly cols = computed(() => this.columns() ?? LIST_SAMPLE_COLUMNS);
  protected readonly data = computed(() => this.rows() ?? LIST_SAMPLE_ROWS);
}
