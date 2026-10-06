import { Component, computed, input, signal } from '@angular/core';
import {
  AmplifyChatDataTable,
  AmplifyChatDataTableHeaderRow,
  AmplifyChatDataTableRow,
  AmplifyChatDataTableWidth,
  AmplifyChatProspect,
  AmplifyChatProspectColumn,
  AmplifyChatSelectionAction,
} from 'ats-ui';

const PROSPECTS: AmplifyChatProspect[] = [
  { id: 1, name: 'Marie Smith', inBullhorn: true, title: 'District Security Director', company: 'Verizon', mobilePhone: '679-274-4162', email: 'marie.smith@nexus.com' },
  { id: 2, name: 'Fred Johnson', inBullhorn: false, title: 'District Security Director', company: 'Comcast' },
];

/** The ten prospects of the Figma amplify-chat/data-table (6271:183099). */
const TABLE: AmplifyChatProspect[] = [
  PROSPECTS[0],
  PROSPECTS[1],
  { id: 3, name: 'Nina Patel', inBullhorn: true, title: 'IT Director', company: 'Verizon', mobilePhone: '679-274-4162', email: 'marie.smith@nexus.com' },
  { id: 4, name: 'Owen Reed', inBullhorn: true, title: 'IT Operations Manager', company: 'Verizon', mobilePhone: '679-274-4162', email: 'marie.smith@nexus.com' },
  { id: 5, name: 'Leila Nguyen', inBullhorn: false, title: 'Infrastructure Manager', company: 'Comcast' },
  { id: 6, name: 'Caleb Kim', inBullhorn: true, title: 'Service Desk Manager', company: 'Verizon', mobilePhone: '679-274-4162', email: 'marie.smith@nexus.com' },
  { id: 7, name: 'Priya Desai', inBullhorn: false, title: 'Network Manager', company: 'Comcast' },
  { id: 8, name: 'Eli Romero', inBullhorn: true, title: 'Security Manager', company: 'Verizon', mobilePhone: '679-274-4162', email: 'marie.smith@nexus.com' },
  { id: 9, name: 'Tessa Clarke', inBullhorn: false, title: 'Systems Manager', company: 'Comcast' },
  { id: 10, name: 'Marcus Webb', inBullhorn: false, title: 'Applications Manager', company: 'Comcast' },
];

const ACTIONS: AmplifyChatSelectionAction[] = [
  { id: 'list', label: 'Add to list', icon: 'list-outline' },
  { id: 'tearsheet', label: 'Add to tearsheet', icon: 'tearsheet' },
  { id: 'sequence', label: 'Add to Outreach sequence', icon: 'automation', preview: true },
];

/**
 * /amplify-chat-data-table — Amplify Chat — Data table (Figma doc/data-table 6300:127565).
 * Sections: amplify-chat/data-table (6271:183099: Property 1=default 6171:165787, selected
 * 6271:183100), header row (novo-data-table-header-row-chat 6171:165361), rows
 * (novo-data-table-row-chat 6174:165788: "prospect - existing content", "prospect - not in BH").
 *
 * Embed mode: `component` renders one piece, e.g.
 *   /examples/amplify-chat-data-table?component=data-table&variant=selected
 *   /examples/amplify-chat-data-table?component=data-table&width=docked&rows=4
 *   /examples/amplify-chat-data-table?component=header-row
 *   /examples/amplify-chat-data-table?component=row&variant=not-in-bh&selected=true
 * Params:
 *   component = data-table | header-row | row
 *   variant (data-table) = default | selected (all selected) | some (3 selected); default default
 *   width (data-table) = full | docked (4 columns); rows (data-table) = 1–10 (default 10)
 *   verb / noun (data-table) = split button wording (default Add / Contact)
 *   variant (row) = existing | not-in-bh | both (default both)
 *   selected (row) = true | false; state (row) = hover
 *   columns = comma list of name, inBullhorn, title, mobilePhone, email (default all)
 *   selectable = false (drop the checkbox column)
 */
@Component({
  imports: [AmplifyChatDataTable, AmplifyChatDataTableHeaderRow, AmplifyChatDataTableRow],
  selector: 'app-amplify-chat-data-table-page',
  templateUrl: './amplify-chat-data-table-page.html',
  styleUrl: './amplify-chat-data-table-page.css',
})
export class AmplifyChatDataTablePage {
  readonly component = input<'data-table' | 'header-row' | 'row'>();
  readonly variant = input<'existing' | 'not-in-bh' | 'both' | 'default' | 'selected' | 'some'>();
  readonly width = input<AmplifyChatDataTableWidth>();
  readonly rows = input<string>();
  readonly verb = input<string>();
  readonly noun = input<string>();
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
  protected readonly embedTable = computed(() => TABLE.slice(0, Math.min(10, Math.max(1, Number(this.rows() ?? 10) || 10))));
  protected readonly embedSelection = computed(() => {
    const v = this.variant();
    const ids = this.embedTable().map((p) => p.id);
    return v === 'selected' ? ids : v === 'some' ? ids.slice(0, 3) : [];
  });

  protected readonly table = TABLE;
  protected readonly actions = ACTIONS;
  protected readonly docked: AmplifyChatProspectColumn[] = ['name', 'inBullhorn', 'title', 'email'];
  /** Live selection for the composite tables. */
  protected readonly tableSel = signal<(string | number)[]>(TABLE.map((p) => p.id));
  protected readonly dockedSel = signal<(string | number)[]>([]);
  protected readonly tableLog = signal('');

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
