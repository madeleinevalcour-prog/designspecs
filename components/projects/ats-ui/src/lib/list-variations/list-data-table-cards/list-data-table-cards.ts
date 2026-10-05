import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, numberAttribute } from '@angular/core';
import { Icon } from '../../icon/icon';
import { LIST_SAMPLE_CARDS, ListCard } from '../list-variations-sample-data';

/**
 * ListDataTableCards (Figma: "novo-data-table-cards" 56:12776, List Variations file
 * 0LCuwDp7YHGGqK6WiseTRi). The card view of the record list: columns of candidate
 * cards. Each card has a checkbox glyph + name, a wrapping row of meta fields
 * (icon + text) and a description clamped to 3 lines.
 *
 *   <ats-list-data-table-cards [cards]="cards" />
 *
 * Cards fill the columns in order (first half in column 1, …). Renders the
 * prototype's sample cards (16, two columns of 8) when `cards` is not given.
 * Port of the prototype repo's list-variations/DataTableCards.astro.
 */
@Component({
  selector: 'ats-list-data-table-cards',
  imports: [Icon],
  templateUrl: './list-data-table-cards.html',
  styleUrl: './list-data-table-cards.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-list-data-table-cards' },
})
export class ListDataTableCards {
  readonly cards = input<ListCard[]>();
  /** Number of card columns (default 2). */
  readonly columns = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null ? undefined : numberAttribute(v)),
  });

  protected readonly cols = computed(() => {
    const cards = this.cards() ?? LIST_SAMPLE_CARDS;
    const n = Math.max(1, this.columns() ?? 2);
    const per = Math.ceil(cards.length / n);
    return Array.from({ length: n }, (_, i) => cards.slice(i * per, (i + 1) * per));
  });
}
