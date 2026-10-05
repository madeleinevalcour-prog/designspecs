import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';
import { Button } from '../../button/button';
import { Icon } from '../../icon/icon';

export const ADVANCED_SEARCH_PLACEHOLDER =
  'Try: Find me senior react developers with typescript in the Boston area, bonus for angular experience.';

/**
 * AdvancedSearch (Figma: "advanced-search" 33:5738, List Variations file
 * 0LCuwDp7YHGGqK6WiseTRi). AI search bar: amplify glyph + a free-text prompt + a
 * primary Search button (search icon left). Full width of its container.
 *
 *   <ats-advanced-search [(value)]="query" (search)="run($event)" />
 *
 * `search` fires on the Search button or Enter, with the current text.
 * Port of the prototype repo's list-variations/AdvancedSearch.astro.
 */
@Component({
  selector: 'ats-advanced-search',
  imports: [Button, Icon],
  templateUrl: './advanced-search.html',
  styleUrl: './advanced-search.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-advanced-search' },
})
export class AdvancedSearch {
  readonly placeholder = input<string>();
  /** The prompt text (two-way). */
  readonly value = model('');
  /** Accessible name for the text field. */
  readonly ariaLabel = input<string>();
  /** Search button label. */
  readonly buttonLabel = input<string>();
  readonly search = output<string>();

  protected readonly placeholderText = computed(() => this.placeholder() ?? ADVANCED_SEARCH_PLACEHOLDER);
  protected readonly label = computed(() => this.ariaLabel() ?? 'AI search');
  protected readonly button = computed(() => this.buttonLabel() ?? 'Search');

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected submit(): void {
    this.search.emit(this.value());
  }
}
