import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, linkedSignal, model, output, viewChild, viewChildren } from '@angular/core';
import { Button } from '../../button/button';
import { Icon } from '../../icon/icon';
import { NovoListEntity } from '../../novo-list/parts';
import { SearchInput } from '../../search-input/search-input';
import { AmplifyChatPromptCard, AmplifyChatPromptCardAction } from './prompt-card';

/** One saved prompt. */
export interface AmplifyChatPrompt {
  id: string | number;
  title: string;
  description?: string;
  /** Header icon from the icon set (default search-menu). */
  icon?: string;
  /** Record type the prompt runs on; `null` for none (default candidate). */
  entity?: NovoListEntity | null;
  /** A suggestion for a scheduled prompt (clock-arrow icon, Scheduled tag). Clicking it emits `schedule`. */
  scheduled?: boolean;
  tags?: string[];
  favorite?: boolean;
  /** Created by the current user (My Prompts). */
  mine?: boolean;
}

/** Figma prompt-library tabs. */
export type AmplifyChatPromptLibraryTab = 'favorites' | 'mine' | 'all';

const TABS: { id: AmplifyChatPromptLibraryTab; label: string }[] = [
  { id: 'favorites', label: 'Favorites' },
  { id: 'mine', label: 'My Prompts' },
  { id: 'all', label: 'All Prompts' },
];

/**
 * AmplifyChatPromptLibrary (Figma: "prompt-library", 6789:132613 — State=default, empty favorites,
 * empty my prompts, no results, loading). Opens from Prompt Library in the chat input.
 * 850 wide: distinct from the starting-point composer (750) and the active-chat input (800).
 * It sits 8px from the composer, centered on it — below on the starting point, above on the
 * active chat (the host places it; see the docs).
 *  - Tab bar: Favorites / My Prompts / All Prompts, then the search input and the category filter.
 *  - Grid: two columns of Prompt Cards; every row is as tall as the tallest card, so the grid stays
 *    even while each card's data row can wrap. Click or Enter on a card → `send`; on a scheduled
 *    suggestion → `schedule` (start setting up the schedule).
 *  - Empty states (empty-state parts): Favorites links to All Prompts; My Prompts has no action;
 *    no results repeats the search term and clears it. Loading shows the Dots loader.
 * Keyboard: arrow keys move between cards (2 columns); ArrowDown from search enters the grid and
 * ArrowUp from the top row returns to it; Escape → `close` (an open kebab menu closes first).
 *
 *   <ats-amplify-chat-prompt-library [prompts]="prompts" (send)="ask($event)" (close)="open.set(false)" />
 */
@Component({
  selector: 'ats-amplify-chat-prompt-library',
  imports: [AmplifyChatPromptCard, Button, Icon, SearchInput],
  template: `
    <div class="ats-amplify-chat-prompt-library__tab-bar">
      <div class="ats-amplify-chat-prompt-library__tabs" role="tablist" aria-label="Prompts">
        @for (t of tabs; track t.id) {
          <button type="button" role="tab" class="ats-amplify-chat-prompt-library__tab" [class.is-active]="t.id === currentTab()"
            [attr.aria-selected]="t.id === currentTab()" (click)="tab.set(t.id)">
            @if (t.id === 'favorites' && t.id === currentTab()) {
              <ats-icon name="placement" [size]="12" color="var(--button-color-secondary-amplify-content-default)" />
            }
            {{ t.label }}
          </button>
        }
      </div>
      <div class="ats-amplify-chat-prompt-library__filters">
        <ats-search-input #search class="ats-amplify-chat-prompt-library__search" variant="pill" placeholder="Search..." ariaLabel="Search prompts"
          [closable]="!!queryText()" [active]="!!queryText()" [value]="query() ?? ''" (valueChange)="query.set($event)" (closed)="clear()" (keydown.arrowdown)="focusCard(0, $event)" />
        <button ats-button class="ats-amplify-chat-prompt-library__filter" theme="secondary" size="small" pill iconLeft="category-tags" iconRight="chevron-down">{{ categoryLabel() }}</button>
      </div>
    </div>
    <div class="ats-amplify-chat-prompt-library__grid" [class.is-state]="isLoading() || !visible().length" (keydown)="onGridKey($event)">
      @if (isLoading()) {
        <div class="ats-amplify-chat-prompt-library__loading" role="status" aria-label="Loading prompts">
          @for (c of dots; track c) { <i [style.background]="c"></i> }
        </div>
      } @else if (!visible().length) {
        <div class="ats-amplify-chat-prompt-library__empty">
          <ats-icon [name]="empty().icon" [size]="64" color="var(--color-icon-illustration)" />
          <div class="ats-amplify-chat-prompt-library__empty-body">
            <p class="ats-amplify-chat-prompt-library__empty-title">{{ empty().title }}</p>
            <p class="ats-amplify-chat-prompt-library__empty-text">{{ empty().text }}</p>
          </div>
          @if (empty().button; as b) {
            <button ats-button theme="secondary" (click)="empty().run()">{{ b }}</button>
          }
        </div>
      } @else {
        @for (p of visible(); track p.id) {
          <ats-amplify-chat-prompt-card [title]="p.title" [icon]="p.icon" [entity]="p.entity" [scheduled]="!!p.scheduled" [tags]="p.tags"
            [description]="p.description" [favorite]="isFav(p)" (favoriteChange)="setFav(p, $event)"
            (send)="send.emit(p)" (schedule)="schedule.emit(p)" (action)="action.emit({ prompt: p, action: $event })" />
        }
      }
    </div>
  `,
  styleUrl: './prompt-library.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-prompt-library',
    role: 'dialog',
    'aria-label': 'Prompt library',
    '(keydown.escape)': 'close.emit()',
  },
})
export class AmplifyChatPromptLibrary {
  readonly prompts = input<AmplifyChatPrompt[] | undefined>([]);
  /** Selected tab (two-way). Default favorites. */
  readonly tab = model<AmplifyChatPromptLibraryTab | undefined>('favorites');
  /** Search text (two-way). */
  readonly query = model<string | undefined>('');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly categoryLabel = input<string>('All Categories');

  readonly send = output<AmplifyChatPrompt>();
  /** A scheduled suggestion was chosen: start setting up the scheduled prompt. */
  readonly schedule = output<AmplifyChatPrompt>();
  readonly action = output<{ prompt: AmplifyChatPrompt; action: AmplifyChatPromptCardAction }>();
  readonly favoriteChange = output<{ prompt: AmplifyChatPrompt; favorite: boolean }>();
  /** Escape: the host closes the library and returns focus to Prompt Library. */
  readonly close = output<void>();

  protected readonly tabs = TABS;
  /** Dots / Medium loader colors (Figma 5621:46169). */
  protected readonly dots = ['#4a89dc', '#967adc', '#da4453', '#f6b042', '#37bc9b'];
  private readonly cards = viewChildren(AmplifyChatPromptCard);
  private readonly search = viewChild.required<SearchInput>('search');

  protected readonly currentTab = computed(() => this.tab() ?? 'favorites');
  protected readonly queryText = computed(() => (this.query() ?? '').trim());
  protected readonly isLoading = computed(() => this.loading());
  private readonly favs = linkedSignal(() => new Set((this.prompts() ?? []).filter((p) => p.favorite).map((p) => p.id)));

  protected readonly visible = computed(() => {
    const q = this.queryText().toLowerCase();
    const tab = this.currentTab();
    return (this.prompts() ?? [])
      .filter((p) => tab === 'all' || (tab === 'favorites' ? this.favs().has(p.id) : p.mine))
      .filter((p) => !q || [p.title, p.description, ...(p.tags ?? []), p.scheduled ? 'Scheduled' : ''].join(' ').toLowerCase().includes(q));
  });

  protected readonly empty = computed(() => {
    const q = this.queryText();
    if (q) return { icon: 'search', title: `No prompts match “${q}”`, text: 'Try a different word, or check another tab.', button: 'Clear search', run: () => this.clear() };
    if (this.currentTab() === 'mine') return { icon: 'book', title: 'You haven’t created any prompts', text: 'Prompts you create will appear here.', button: '', run: () => {} };
    return { icon: 'placement', title: 'No favorites yet', text: 'Star a prompt to keep it here for quick access.', button: 'Browse all prompts', run: () => this.tab.set('all') };
  });

  protected isFav(p: AmplifyChatPrompt): boolean { return this.favs().has(p.id); }
  protected setFav(p: AmplifyChatPrompt, on: boolean | undefined): void {
    const next = new Set(this.favs());
    if (on) next.add(p.id); else next.delete(p.id);
    this.favs.set(next);
    this.favoriteChange.emit({ prompt: p, favorite: !!on });
  }

  protected clear(): void { this.query.set(''); this.search().focus(); }

  /** Focus the first card (e.g. after opening with "/"). */
  focusFirst(): void { this.focusCard(0); }
  /** Focus the search input. */
  focusSearch(): void { this.search().focus(); }

  protected focusCard(i: number, e?: Event): void {
    const c = this.cards()[i];
    if (c) { e?.preventDefault(); c.focus(); }
  }

  protected onGridKey(e: KeyboardEvent): void {
    const cards = this.cards();
    const i = cards.findIndex((c) => c.contains(document.activeElement));
    if (i < 0 || (e.target as HTMLElement).closest('.ats-dropdown')) return;
    const cols = 2;
    const go = (n: number) => { if (n >= 0 && n < cards.length) { e.preventDefault(); cards[n].focus(); } };
    switch (e.key) {
      case 'ArrowRight': go(i + 1); break;
      case 'ArrowLeft': go(i - 1); break;
      case 'ArrowDown': go(i + cols); break;
      case 'ArrowUp': if (i - cols < 0) { e.preventDefault(); this.search().focus(); } else go(i - cols); break;
    }
  }
}
