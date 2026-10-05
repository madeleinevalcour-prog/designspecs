import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { ListDataTable } from '../list-data-table/list-data-table';
import { ListDataTableCards } from '../list-data-table-cards/list-data-table-cards';
import { ListCard, ListDataTableColumn, ListDataTableRow } from '../list-variations-sample-data';

export type ListVariant = 'classic' | 'modern';
export type ListView = 'list' | 'cards';

/**
 * ListDataTableContainer (Figma: "data-table-container" 38:10113, List Variations
 * file 0LCuwDp7YHGGqK6WiseTRi). Wraps the record list and shows either the table
 * (ats-list-data-table) or the card grid (ats-list-data-table-cards), per `view`.
 *
 * - `variant="classic"`: list view is edge-to-edge (no chrome, no padding).
 * - `variant="modern"`: list view sits in a bordered, rounded, elevated, translucent card.
 * - Cards view gets 24px padding in both variants.
 *
 * In list view the container is its own scroll region (columns scroll
 * horizontally, rows vertically, header row sticky), so give it a bounded height:
 * put it in a flex column with a fixed height (it flexes to fill). In cards view it
 * grows with its content and the page scrolls.
 *
 *   <ats-list-data-table-container variant="modern" [view]="view" />
 *
 * Port of the prototype repo's list-variations/DataTableContainer.astro.
 */
@Component({
  selector: 'ats-list-data-table-container',
  imports: [ListDataTable, ListDataTableCards],
  templateUrl: './list-data-table-container.html',
  styleUrl: './list-data-table-container.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class ListDataTableContainer {
  readonly variant = input<ListVariant>();
  readonly view = input<ListView>();
  /** Passed through to the table / cards; sample data when not given. */
  readonly columns = input<ListDataTableColumn[]>();
  readonly rows = input<ListDataTableRow[]>();
  readonly cards = input<ListCard[]>();

  protected readonly currentView = computed<ListView>(() => this.view() ?? 'list');
  protected readonly hostClass = computed(() =>
    [
      'ats-list-data-table-container',
      `ats-list-data-table-container--${this.variant() ?? 'classic'}`,
      `ats-list-data-table-container--${this.currentView()}`,
    ].join(' '),
  );
}
