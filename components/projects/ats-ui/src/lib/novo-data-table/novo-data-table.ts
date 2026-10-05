import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../icon/icon';
import { NovoDataTableCell } from './novo-data-table-cell';
import { NovoDataTableHeaderCell } from './novo-data-table-header-cell';

/** One column of a NovoDataTable. */
export interface NovoDataTableColumn {
  /** Header text. */
  label: string;
  /** Property of each row to show in this column. */
  key: string;
  /** Fixed width in px. Unset = at least 128px, grows to fit. */
  width?: number;
  /** Render values in the hyperlink style. */
  link?: boolean;
  /** Show the filter icon in the header. Default true. */
  filter?: boolean;
}

/** A row: values looked up by column `key`. */
export type NovoDataTableRow = Record<string, unknown>;

/** Template context for a custom cell (`*atsNovoDataTableCell`). */
export interface NovoDataTableCellContext<R extends NovoDataTableRow = NovoDataTableRow> {
  /** The row's value for this column. */
  $implicit: unknown;
  row: R;
  column: NovoDataTableColumn;
  index: number;
}

/**
 * Custom content for every cell in one column, keyed by the column's `key`:
 *
 *   <ats-novo-data-table [columns]="cols" [rows]="rows">
 *     <ng-template atsNovoDataTableCell="status" let-value let-row="row">
 *       <my-status-chip [status]="value" />
 *     </ng-template>
 *   </ats-novo-data-table>
 */
@Directive({ selector: 'ng-template[atsNovoDataTableCell]' })
export class NovoDataTableCellDef {
  readonly key = input.required<string>({ alias: 'atsNovoDataTableCell' });
  readonly template = inject<TemplateRef<NovoDataTableCellContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: NovoDataTableCellDef, ctx: unknown): ctx is NovoDataTableCellContext {
    return true;
  }
}

/**
 * NovoDataTable (Figma: "novo-data-table", Component Migration 46:1541 / 254:6720).
 * Port of the prototype repo's NovoDataTable.astro: a sticky header row and banded
 * body rows, each with a checkbox cell, a preview-icon cell and the data cells.
 * The column-count variants (three…eight) are just fewer `columns`.
 *
 *   <ats-novo-data-table [columns]="columns" [rows]="rows" label="Candidates" />
 *   <ats-novo-data-table [columns]="columns" [rows]="rows" [banded]="false" [preview]="false" />
 *
 * The host is the scroll container (both axes); give it a max-height to keep the
 * header sticky inside a fixed-height area. Renders a native <table>.
 * Selection: the header checkbox selects / clears all rows (indeterminate when
 * some are selected); `selectionChange` emits the selected rows.
 */
@Component({
  selector: 'ats-novo-data-table',
  imports: [NgTemplateOutlet, Icon, NovoDataTableCell, NovoDataTableHeaderCell],
  templateUrl: './novo-data-table.html',
  styleUrl: './novo-data-table.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-ndt' },
})
export class NovoDataTable<R extends NovoDataTableRow = NovoDataTableRow> {
  readonly columns = input.required<NovoDataTableColumn[]>();
  readonly rows = input.required<R[]>();
  /** Leading checkbox column. */
  readonly checkbox = input(true, { transform: booleanAttribute });
  /** Preview-icon column after the checkbox. */
  readonly preview = input(true, { transform: booleanAttribute });
  /** Alternate rows on the muted background. */
  readonly banded = input(true, { transform: booleanAttribute });
  /** Accessible name for the table (aria-label). */
  readonly label = input<string>();

  /** Emits the selected rows whenever selection changes. */
  readonly selectionChange = output<R[]>();

  private readonly cellDefs = contentChildren(NovoDataTableCellDef);
  protected readonly templates = computed(() => new Map(this.cellDefs().map((d) => [d.key(), d.template])));

  /** Selected row indexes; cleared when `rows` changes. */
  protected readonly selected = linkedSignal<R[], ReadonlySet<number>>({
    source: this.rows,
    computation: () => new Set<number>(),
  });
  protected readonly allSelected = computed(() => this.rows().length > 0 && this.selected().size === this.rows().length);
  protected readonly someSelected = computed(() => this.selected().size > 0 && !this.allSelected());

  protected value(row: R, column: NovoDataTableColumn): string {
    const v = row[column.key];
    return v == null ? '' : String(v);
  }

  /** Accessible name for a row checkbox: "Select <first column value>". */
  protected rowLabel(row: R): string {
    const first = this.columns()[0];
    const name = first ? this.value(row, first) : '';
    return name ? `Select ${name}` : 'Select row';
  }

  protected toggleAll(checked: boolean): void {
    this.commit(checked ? new Set(this.rows().map((_, i) => i)) : new Set());
  }

  protected toggleRow(index: number, checked: boolean): void {
    const next = new Set(this.selected());
    if (checked) next.add(index);
    else next.delete(index);
    this.commit(next);
  }

  private commit(next: Set<number>): void {
    this.selected.set(next);
    this.selectionChange.emit(this.rows().filter((_, i) => next.has(i)));
  }
}
