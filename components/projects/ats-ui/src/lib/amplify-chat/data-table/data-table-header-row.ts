import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { Checkbox } from '../../checkbox/checkbox';
import { NovoDataTableHeaderCell } from '../../novo-data-table/novo-data-table-header-cell';
import { AMPLIFY_CHAT_PROSPECT_COLUMNS, AMPLIFY_CHAT_PROSPECT_COLUMN_LABELS, AmplifyChatProspectColumn } from './models';

/**
 * AmplifyChatDataTableHeaderRow (Figma: "novo-data-table-header-row-chat", 6171:165361).
 * The header row of a chat data table: the select-all checkbox cell, the empty preview
 * column (48px) and one label-only header cell per column. Chat tables have no sort or
 * filter controls, so the novo-data-table-header-cell icons are off.
 *
 * Applied to a native <tr> inside a <thead>, so table semantics stay intact:
 *
 *   <thead>
 *     <tr ats-amplify-chat-data-table-header-row [checked]="all()" [indeterminate]="some()"
 *         (toggleAll)="selectAll($event)"></tr>
 *   </thead>
 *   <tr ats-amplify-chat-data-table-header-row [columns]="['name', 'inBullhorn', 'title', 'email']"></tr>
 *
 * Select-all reflects the selection (checked / indeterminate / empty) and emits
 * `toggleAll` with the new value; the parent table owns the selection.
 * `selectable=false` drops the checkbox column (no bulk action in the reply).
 */
@Component({
  selector: 'tr[ats-amplify-chat-data-table-header-row]',
  imports: [Checkbox, NovoDataTableHeaderCell],
  template: `
    @if (isSelectable()) {
      <th class="ats-ndt-th ats-ndt-th--check" scope="col">
        <div class="ats-ndt-cell ats-ndt-cell--check">
          <input
            ats-checkbox
            aria-label="Select all"
            [checked]="checked()"
            [indeterminate]="indeterminate()"
            (change)="toggleAll.emit($any($event.target).checked)"
          />
        </div>
      </th>
    }
    @if (hasPreview()) {
      <th class="ats-ndt-th ats-ndt-th--icon" scope="col">
        <div class="ats-ndt-cell ats-ndt-cell--icon"><span class="ats-ndt-sr">Preview</span></div>
      </th>
    }
    @for (col of cols(); track col) {
      <th ats-novo-data-table-header-cell [label]="labels[col]" [sortable]="false" [filter]="false"></th>
    }
  `,
  styleUrl: './data-table.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-data-table-header-row ats-ndt-hrow' },
})
export class AmplifyChatDataTableHeaderRow {
  /** Columns to show, in order. Default: all five Figma columns. */
  readonly columns = input<AmplifyChatProspectColumn[]>();
  /** Leading select-all checkbox column. Default true. */
  readonly selectable = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Empty preview column (lines up with the rows' binoculars). Default true. */
  readonly showPreview = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Every row selected. */
  readonly checked = input(false, { transform: booleanAttribute });
  /** Some rows selected. */
  readonly indeterminate = input(false, { transform: booleanAttribute });

  /** Select-all toggled: true = select every visible row, false = clear. */
  readonly toggleAll = output<boolean>();

  protected readonly labels = AMPLIFY_CHAT_PROSPECT_COLUMN_LABELS;
  protected readonly cols = computed(() => this.columns() ?? AMPLIFY_CHAT_PROSPECT_COLUMNS);
  protected readonly isSelectable = computed(() => this.selectable() ?? true);
  protected readonly hasPreview = computed(() => this.showPreview() ?? true);
}
