import { Component, computed, input, signal } from '@angular/core';
import { AmplifyChatDataTableHeaderRow, AmplifyChatDataTableRow, AmplifyChatProspect, AmplifyChatProspectColumn } from 'ats-ui';

const PROSPECTS: AmplifyChatProspect[] = [
  { id: 1, name: 'Marie Smith', inBullhorn: true, title: 'District Security Director', company: 'Verizon', mobilePhone: '679-274-4162', email: 'marie.smith@nexus.com' },
  { id: 2, name: 'Fred Johnson', inBullhorn: false, title: 'District Security Director', company: 'Comcast' },
];

/**
 * /amplify-chat-data-table — Amplify Chat — Data table (Figma doc/data-table 6300:127565).
 * Sections: header row (novo-data-table-header-row-chat 6171:165361), rows
 * (novo-data-table-row-chat 6174:165788: "prospect - existing content", "prospect - not in BH").
 * The composite amplify-chat/data-table gets its own section here later.
 *
 * Embed mode: `component` renders one piece, e.g.
 *   /examples/amplify-chat-data-table?component=header-row
 *   /examples/amplify-chat-data-table?component=row&variant=not-in-bh&selected=true
 * Params:
 *   component = header-row | row
 *   variant (row) = existing | not-in-bh | both (default both)
 *   selected (row) = true | false; state (row) = hover
 *   columns = comma list of name, inBullhorn, title, mobilePhone, email (default all)
 *   selectable = false (drop the checkbox column)
 */
@Component({
  imports: [AmplifyChatDataTableHeaderRow, AmplifyChatDataTableRow],
  selector: 'app-amplify-chat-data-table-page',
  templateUrl: './amplify-chat-data-table-page.html',
  styleUrl: './amplify-chat-data-table-page.css',
})
export class AmplifyChatDataTablePage {
  readonly component = input<'header-row' | 'row'>();
  readonly variant = input<'existing' | 'not-in-bh' | 'both'>();
  readonly selected = input<string>();
  readonly state = input<'hover'>();
  readonly columns = input<string>();
  readonly selectable = input<string>();

  protected readonly embed = computed(() => !!this.component());
  protected readonly cols = computed(() => (this.columns() ? (this.columns()!.split(',').map((s) => s.trim()) as AmplifyChatProspectColumn[]) : undefined));
  protected readonly isSelectable = computed(() => this.selectable() !== 'false');
  protected readonly embedRows = computed(() => {
    const v = this.variant() ?? 'both';
    return v === 'existing' ? [PROSPECTS[0]] : v === 'not-in-bh' ? [PROSPECTS[1]] : PROSPECTS;
  });
  protected readonly embedSelected = computed(() => this.selected() === 'true');

  protected readonly prospects = PROSPECTS;
  /** Live selection for the reference matrix. */
  protected readonly sel = signal<Record<string, boolean>>({ 1: true });
  protected readonly all = computed(() => PROSPECTS.every((p) => this.sel()[p.id]));
  protected readonly some = computed(() => !this.all() && PROSPECTS.some((p) => this.sel()[p.id]));
  protected readonly log = signal('');

  protected setSel(id: string | number, v: boolean): void {
    this.sel.update((s) => ({ ...s, [id]: v }));
  }
  protected selectAll(v: boolean): void {
    this.sel.set(Object.fromEntries(PROSPECTS.map((p) => [p.id, v])));
  }
}
