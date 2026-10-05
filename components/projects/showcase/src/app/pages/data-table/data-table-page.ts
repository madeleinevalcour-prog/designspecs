import { Component, computed, input, signal } from '@angular/core';
import { NovoDataTable, NovoDataTableCell, NovoDataTableCellDef, NovoDataTableColumn, NovoDataTableHeaderCell } from 'ats-ui';
import { COLUMNS, ROWS } from './sample-data';

const off = (v: string | undefined) => v === 'false';

/**
 * /data-table — reference view (mirrors the prototype repo's /components/data-table).
 *
 * Embed mode: any of the params below renders one compact example for a docs page, e.g.
 *   /examples/data-table?cols=4&rows=5&hover=1
 *   /examples/data-table?part=header-cell&label=ID&filter=false
 * Params:
 *   part      = table (default) | header-cell | cell
 *   Table:    cols (1–8, default 8) · rows (1–8, default 8) · banded=true (opt-in) · checkbox=false ·
 *             hover (0-based row index to force the row hover state) ·
 *             preview=false · custom=true (Status column through a cell template) ·
 *             height (scroller max-height in px, default 320)
 *   Header cell: label (default "Name") · filter=false
 *   Cell:     value (default "District Security Director") · link=true · state=hover (link hover)
 */
@Component({
  imports: [NovoDataTable, NovoDataTableCellDef, NovoDataTableHeaderCell, NovoDataTableCell],
  selector: 'app-data-table-page',
  templateUrl: './data-table-page.html',
  styleUrl: './data-table-page.css',
})
export class DataTablePage {
  // Bound from query params. Absent params arrive as `undefined`, so defaults are
  // applied in the computeds below.
  readonly part = input<'table' | 'header-cell' | 'cell'>();
  readonly cols = input<string>();
  readonly rows = input<string>();
  readonly banded = input<string>();
  readonly checkbox = input<string>();
  readonly preview = input<string>();
  readonly custom = input<string>();
  readonly height = input<string>();
  readonly label = input<string>();
  readonly filter = input<string>();
  readonly value = input<string>();
  readonly link = input<string>();
  readonly hover = input<string>();
  readonly state = input<string>();

  protected readonly embed = computed(() =>
    [this.part(), this.cols(), this.rows(), this.banded(), this.checkbox(), this.preview(), this.custom(), this.height(), this.hover()].some(
      (v) => v != null,
    ),
  );
  protected readonly embedPart = computed(() => this.part() ?? 'table');
  protected readonly embedColumns = computed(() => COLUMNS.slice(0, this.clamp(this.cols(), COLUMNS.length)));
  protected readonly embedRows = computed(() => ROWS.slice(0, this.clamp(this.rows(), ROWS.length)));
  protected readonly embedBanded = computed(() => this.banded() === 'true');
  protected readonly embedHover = computed(() => {
    const n = Number(this.hover());
    return this.hover() == null || !Number.isInteger(n) || n < 0 ? undefined : n;
  });
  protected readonly embedState = computed(() => (this.state() === 'hover' ? 'hover' : undefined));
  protected readonly embedCheckbox = computed(() => !off(this.checkbox()));
  protected readonly embedPreview = computed(() => !off(this.preview()));
  protected readonly embedCustom = computed(() => this.custom() === 'true');
  protected readonly embedHeight = computed(() => Number(this.height() ?? 320) || 320);
  protected readonly embedLabel = computed(() => this.label() ?? 'Name');
  protected readonly embedFilter = computed(() => !off(this.filter()));
  protected readonly embedValue = computed(() => this.value() ?? 'District Security Director');
  protected readonly embedLink = computed(() => this.link() === 'true');

  protected readonly columns: NovoDataTableColumn[] = COLUMNS;
  protected readonly allRows = ROWS;
  protected readonly reducedColumns = COLUMNS.slice(0, 4);
  protected readonly reducedRows = ROWS.slice(0, 5);
  protected readonly selectedCount = signal(0);

  private clamp(v: string | undefined, max: number): number {
    const n = Math.round(Number(v));
    return v == null || !Number.isFinite(n) ? max : Math.min(Math.max(n, 1), max);
  }
}
