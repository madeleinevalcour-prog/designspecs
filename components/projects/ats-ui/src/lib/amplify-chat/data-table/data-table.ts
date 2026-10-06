import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model, output } from '@angular/core';
import { AmplifyChatSelectionBar } from '../selection/selection-bar';
import { AmplifyChatSelectionAction } from '../selection/selection-split-button';
import { AmplifyChatDataTableHeaderRow } from './data-table-header-row';
import { AmplifyChatDataTableRow } from './data-table-row';
import { AmplifyChatProspect, AmplifyChatProspectColumn, AmplifyChatRevealField } from './models';

/** Chat width the table sits in: full-page chat (up to 6 columns) or the docked slideout (4). */
export type AmplifyChatDataTableWidth = 'full' | 'docked';

/** Default columns for the docked chat (4 at most, record name first). */
export const AMPLIFY_CHAT_DOCKED_COLUMNS: AmplifyChatProspectColumn[] = ['name', 'inBullhorn', 'title', 'email'];

/**
 * AmplifyChatDataTable (Figma: "amplify-chat/data-table", 6271:183099; Property 1 = default
 * 6171:165787, selected 6271:183100). The chat reply table: a card (card border, 8px radius,
 * 0 2 4 charcoal-04 shadow, max 800 wide) holding a native <table> of
 * novo-data-table-header-row-chat + novo-data-table-row-chat, and the selection bar.
 *
 *   <ats-amplify-chat-data-table [records]="prospects" [actions]="actions" noun="Contact"
 *       [(selection)]="ids" (primary)="addContacts($event)" (action)="run($event)"
 *       (open)="openRecord($event)" (preview)="slideout($event)" (reveal)="reveal($event)" />
 *   <ats-amplify-chat-data-table [records]="prospects" width="docked" [selectable]="false" />
 *
 * The table owns selection (amplify-chat-interface-patterns.md, "Selection and bulk actions"):
 *  - header checkbox selects / clears every row; indeterminate when some are selected;
 *  - rows toggle on their own; `selection` (ids) is two-way and emits `selectionChange`;
 *  - the `selected` variant: a selection bar under the table, "N of M selected" + the split
 *    button ("Add 5 Contacts"). With nothing selected the whole bar is hidden;
 *  - nothing is written until the split button is clicked: `primary` / `action` emit the
 *    selected records.
 * `selectable=false` drops the checkboxes and the bar (no bulk action in the reply).
 * `width="docked"` defaults to 4 columns; `columns` overrides either width.
 * No sort, filter or minimum column width in chat tables.
 */
@Component({
  selector: 'ats-amplify-chat-data-table',
  imports: [AmplifyChatDataTableHeaderRow, AmplifyChatDataTableRow, AmplifyChatSelectionBar],
  template: `
    <div class="ats-amplify-chat-data-table__scroll">
      <table class="ats-ndt__table" [attr.aria-label]="label() ?? 'Records'">
        <thead>
          <tr ats-amplify-chat-data-table-header-row [columns]="cols()" [selectable]="isSelectable()" [showPreview]="hasPreview()"
            [checked]="allSelected()" [indeterminate]="someSelected()" (toggleAll)="toggleAll($event)"></tr>
        </thead>
        <tbody>
          @for (r of recordList(); track r.id) {
            <tr ats-amplify-chat-data-table-row [record]="r" [columns]="cols()" [selectable]="isSelectable()" [showPreview]="hasPreview()"
              [selected]="selectedSet().has(r.id)" (selectedChange)="toggle(r.id, $event)"
              (open)="open.emit($event)" (preview)="preview.emit($event)" (reveal)="reveal.emit($event)"></tr>
          }
        </tbody>
      </table>
    </div>
    @if (isSelectable()) {
      <ats-amplify-chat-selection-bar appearance="attached" [count]="selectedRecords().length" [total]="recordList().length"
        [verb]="verb()" [noun]="noun()" [nounPlural]="nounPlural()" [label]="actionLabel()" [actions]="actions()"
        (primary)="primary.emit(selectedRecords())" (action)="action.emit({ action: $event, records: selectedRecords() })" />
    }
  `,
  styleUrl: './data-table.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-data-table',
    '[attr.data-width]': 'widthName()',
  },
})
export class AmplifyChatDataTable {
  /** Rows: one prospect per row (2–10; show at most 10 in chat). */
  readonly records = input<AmplifyChatProspect[] | undefined>([]);
  /** Columns, in order. Default: all five (full) or 4 (docked). */
  readonly columns = input<AmplifyChatProspectColumn[]>();
  /** full | docked. Default full. */
  readonly width = input<AmplifyChatDataTableWidth | undefined>('full');
  /** Checkboxes + selection bar. Default true; off when the reply offers no bulk action. */
  readonly selectable = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Preview (binoculars) column. Default true. */
  readonly showPreview = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Selected record ids (two-way; emits `selectionChange`). */
  readonly selection = model<(string | number)[]>([]);
  /** Split button verb. Default "Add". */
  readonly verb = input<string>();
  /** Split button noun, singular. Default "Contact". */
  readonly noun = input<string>();
  /** Plural noun. Default noun + "s". */
  readonly nounPlural = input<string>();
  /** Split button full label override. */
  readonly actionLabel = input<string>();
  /** Related actions in the split button menu. */
  readonly actions = input<AmplifyChatSelectionAction[] | undefined>([]);
  /** Accessible name for the table. Default "Records". */
  readonly label = input<string>();

  /** The split button's default action: the selected records. */
  readonly primary = output<AmplifyChatProspect[]>();
  /** A split button menu action, with the selected records. */
  readonly action = output<{ action: AmplifyChatSelectionAction; records: AmplifyChatProspect[] }>();
  /** A record-name link: open the full record. */
  readonly open = output<AmplifyChatProspect>();
  /** The binoculars: open the record slideout beside the chat. */
  readonly preview = output<AmplifyChatProspect>();
  /** A "Reveal …" link. */
  readonly reveal = output<{ record: AmplifyChatProspect; field: AmplifyChatRevealField }>();

  protected readonly recordList = computed(() => this.records() ?? []);
  protected readonly widthName = computed(() => this.width() ?? 'full');
  protected readonly cols = computed(() => this.columns() ?? (this.widthName() === 'docked' ? AMPLIFY_CHAT_DOCKED_COLUMNS : undefined));
  protected readonly isSelectable = computed(() => this.selectable() ?? true);
  protected readonly hasPreview = computed(() => this.showPreview() ?? true);

  protected readonly selectedSet = computed(() => new Set(this.selection() ?? []));
  /** Selected records, in table order (ids not in `records` are ignored). */
  protected readonly selectedRecords = computed(() => this.recordList().filter((r) => this.selectedSet().has(r.id)));
  protected readonly allSelected = computed(() => this.recordList().length > 0 && this.selectedRecords().length === this.recordList().length);
  protected readonly someSelected = computed(() => this.selectedRecords().length > 0 && !this.allSelected());

  protected toggle(id: string | number, on: boolean): void {
    const ids = (this.selection() ?? []).filter((x) => x !== id);
    this.selection.set(on ? [...ids, id] : ids);
  }

  protected toggleAll(on: boolean): void {
    this.selection.set(on ? this.recordList().map((r) => r.id) : []);
  }
}
