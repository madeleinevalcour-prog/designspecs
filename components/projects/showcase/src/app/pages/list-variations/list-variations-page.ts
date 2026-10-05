import { Component, computed, input, numberAttribute, signal } from '@angular/core';
import {
  AdvancedSearch, LIST_SAMPLE_CARDS, LIST_SAMPLE_ROWS, ListDataTable, ListDataTableCards,
  ListDataTableContainer, ListHeader, ListVariant, ListView, Toggle, ToggleOption,
} from 'ats-ui';

type Show = 'toggle' | 'search' | 'header' | 'table' | 'cards' | 'list';

/**
 * /list-variations — reference for the List Variations components (Figma file
 * 0LCuwDp7YHGGqK6WiseTRi): Toggle, AdvancedSearch, ListHeader, ListDataTable,
 * ListDataTableCards, ListDataTableContainer, plus the composed record list.
 *
 * Embed mode: pass `show` to render one component for a docs page, e.g.
 *   /examples/list-variations?show=toggle&mode=icon
 *   /examples/list-variations?show=list&variant=modern&view=cards
 * Params:
 *   show    = toggle | search | header | table | cards | list (header + container in a framed canvas)
 *   mode    = text (default) | icon             — toggle: Bullhorn/Job Boards or list/cards icons
 *   value   = selected toggle value             — toggle (default: first option)
 *   variant = classic (default) | modern        — header, list
 *   view    = list (default) | cards            — header, list
 *   scrolled= true                              — header: force the Modern scrolled state
 *   rows    = number of table rows (default 6 for show=table, all for show=list)
 *   cards   = number of cards (default 4 for show=cards, all for show=list)
 *   height  = canvas height in px for show=list (default 560)
 *   placeholder = search placeholder            — search
 */
@Component({
  imports: [Toggle, AdvancedSearch, ListHeader, ListDataTable, ListDataTableCards, ListDataTableContainer],
  selector: 'app-list-variations-page',
  styleUrl: './list-variations-page.css',
  templateUrl: './list-variations-page.html',
})
export class ListVariationsPage {
  // Bound from query params. Absent params arrive as `undefined`, so defaults are
  // applied in the computeds below.
  readonly show = input<Show>();
  readonly mode = input<'text' | 'icon'>();
  readonly value = input<string>();
  readonly variant = input<ListVariant>();
  readonly view = input<ListView>();
  readonly scrolled = input<string>();
  readonly rows = input<number | undefined, unknown>(undefined, { transform: optNumber });
  readonly cards = input<number | undefined, unknown>(undefined, { transform: optNumber });
  readonly height = input<number | undefined, unknown>(undefined, { transform: optNumber });
  readonly placeholder = input<string>();

  protected readonly sourceOptions: ToggleOption[] = [
    { value: 'bullhorn', label: 'Bullhorn' },
    { value: 'jobboards', label: 'Job Boards' },
  ];
  protected readonly viewOptions: ToggleOption[] = [
    { value: 'list', icon: 'list', ariaLabel: 'List view' },
    { value: 'cards', icon: 'dashboard', ariaLabel: 'Card view' },
  ];

  // ---- embed ----
  protected readonly embedOptions = computed(() => (this.mode() === 'icon' ? this.viewOptions : this.sourceOptions));
  protected readonly embedVariant = computed<ListVariant>(() => this.variant() ?? 'classic');
  protected readonly embedScrolled = computed(() => (this.scrolled() === 'true' ? true : undefined));
  protected readonly embedRows = computed(() => LIST_SAMPLE_ROWS.slice(0, this.rows() ?? 6));
  protected readonly embedCards = computed(() => LIST_SAMPLE_CARDS.slice(0, this.cards() ?? 4));
  protected readonly listRows = computed(() => (this.rows() == null ? undefined : LIST_SAMPLE_ROWS.slice(0, this.rows())));
  protected readonly listCards = computed(() => (this.cards() == null ? undefined : LIST_SAMPLE_CARDS.slice(0, this.cards())));
  protected readonly frameHeight = computed(() => this.height() ?? 560);
  /** Live view state of the embedded list (starts from `view`, then the header toggle drives it). */
  protected readonly embedView = signal<ListView | undefined>(undefined);
  protected readonly listView = computed<ListView>(() => this.embedView() ?? this.view() ?? 'list');

  // ---- reference view ----
  protected readonly demoVariant = signal<ListVariant>('classic');
  protected readonly demoView = signal<ListView>('list');
  protected readonly demoSource = signal('bullhorn');
  protected readonly demoViewToggle = signal('list');
  protected readonly lastSearch = signal<string | null>(null);
  protected readonly sampleRows = LIST_SAMPLE_ROWS.slice(0, 6);
  protected readonly sampleCards = LIST_SAMPLE_CARDS.slice(0, 4);
  protected readonly variants: ListVariant[] = ['classic', 'modern'];
}

function optNumber(v: unknown): number | undefined {
  return v == null || v === '' ? undefined : numberAttribute(v);
}
