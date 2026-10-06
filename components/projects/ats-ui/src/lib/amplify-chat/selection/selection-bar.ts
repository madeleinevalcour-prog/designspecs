import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';
import { IconButtonNoContainer } from '../../icon-button-no-container/icon-button-no-container';
import { AmplifyChatSelectionAction, AmplifyChatSelectionSplitButton } from './selection-split-button';

/** Figma placement of the bar: inside the table card, or its own card under a card stack. */
export type AmplifyChatSelectionBarAppearance = 'attached' | 'card';

/**
 * AmplifyChatSelectionBar (Figma: the `novo-data-table-pagination` instance at the bottom of
 * amplify-chat/data-table "selected" 6271:183633 and amplify-chat/chat-cards "selected"
 * 6271:184050). The bar that appears under a chat table or card stack once something is
 * selected: left "N of M selected" (meta/small, uppercase), right the
 * <ats-amplify-chat-selection-split-button>. Shared by AmplifyChatDataTable and
 * AmplifyChatChatCards so both behave the same.
 *
 *   <ats-amplify-chat-selection-bar [count]="ids.length" [total]="records.length" noun="Contact"
 *       [actions]="actions" (primary)="add()" (action)="run($event)" />
 *
 * Behaviour (amplify-chat-interface-patterns.md, "Selection and bulk actions"):
 *  - Nothing selected: the whole bar is hidden (`[hidden]`), count and button together.
 *  - The count and the button label follow the selection live.
 *  - appearance `attached` (table): a top divider inside the table card. `card` (card stack):
 *    its own bordered card with radius and level-2 shadow, as in Figma.
 *  - Optional pager (`pageCount` > 1): previous / page numbers / next, the pages part of
 *    novo-data-table-pagination. With a pager the bar stays visible at zero selected and
 *    shows `idleLabel` (e.g. "1–3 of 8") on the left instead of the count.
 */
@Component({
  selector: 'ats-amplify-chat-selection-bar',
  imports: [AmplifyChatSelectionSplitButton, IconButtonNoContainer],
  template: `
    <span class="ats-amplify-chat-selection-bar__count" aria-live="polite">{{ statusText() }}</span>
    @if (hasPager()) {
      <nav class="ats-amplify-chat-selection-bar__pages" [attr.aria-label]="pagerLabel()">
        <button ats-icon-button-no-container icon="previous" aria-label="Previous page"
          [disabled]="currentPage() <= 1" (click)="go(currentPage() - 1)"></button>
        @for (p of pageNumbers(); track p) {
          <button type="button" class="ats-amplify-chat-selection-bar__page" [class.is-current]="p === currentPage()"
            [attr.aria-current]="p === currentPage() ? 'page' : null" [attr.aria-label]="'Page ' + p" (click)="go(p)">{{ p }}</button>
        }
        <button ats-icon-button-no-container icon="next" aria-label="Next page"
          [disabled]="currentPage() >= pages()" (click)="go(currentPage() + 1)"></button>
      </nav>
    }
    <ats-amplify-chat-selection-split-button class="ats-amplify-chat-selection-bar__action"
      [count]="countValue()" [verb]="verb()" [noun]="noun()" [nounPlural]="nounPlural()" [label]="label()"
      [actions]="actions()" [previewHint]="previewHint()" [(open)]="open"
      (primary)="primary.emit($event)" (action)="action.emit($event)" />
  `,
  styleUrl: './selection-bar.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-selection-bar',
    role: 'region',
    '[attr.aria-label]': "'Selection'",
    '[attr.data-appearance]': 'appearanceName()',
    '[hidden]': 'isHidden()',
  },
})
export class AmplifyChatSelectionBar {
  /** Number of selected records. */
  readonly count = input<number | undefined, unknown>(0, { transform: (v: unknown) => (v == null || v === '' ? undefined : Number(v)) });
  /** Number of records in the table / stack ("of M"). Default = count. */
  readonly total = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : Number(v)) });
  /** Split button verb. Default "Add". */
  readonly verb = input<string>();
  /** Split button noun, singular. Default "Contact". */
  readonly noun = input<string>();
  /** Plural noun. Default noun + "s". */
  readonly nounPlural = input<string>();
  /** Split button full label override. */
  readonly label = input<string>();
  /** Split button menu actions. */
  readonly actions = input<AmplifyChatSelectionAction[] | undefined>([]);
  /** Menu hint for preview actions. */
  readonly previewHint = input<string>();
  /** Split button menu open (two-way). */
  readonly open = model(false);
  /** attached (inside the table card) | card (under a card stack). Default attached. */
  readonly appearance = input<AmplifyChatSelectionBarAppearance | undefined>('attached');
  /** Current page, 1-based (two-way). Only used with `pageCount` > 1. */
  readonly page = model<number | undefined>(1);
  /** Number of pages. > 1 shows the pager. */
  readonly pageCount = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : Number(v)) });
  /** Left text when nothing is selected but the pager is showing, e.g. "1–3 of 8". */
  readonly idleLabel = input<string>();

  /** Split button default action; emits the count. */
  readonly primary = output<number>();
  /** Split button menu action. */
  readonly action = output<AmplifyChatSelectionAction>();

  protected readonly countValue = computed(() => Math.max(0, Math.floor(this.count() ?? 0)));
  protected readonly appearanceName = computed(() => this.appearance() ?? 'attached');
  protected readonly pages = computed(() => Math.max(1, Math.floor(this.pageCount() ?? 1)));
  protected readonly hasPager = computed(() => this.pages() > 1);
  protected readonly currentPage = computed(() => Math.min(this.pages(), Math.max(1, this.page() ?? 1)));
  protected readonly isHidden = computed(() => this.countValue() === 0 && !this.hasPager());
  protected readonly statusText = computed(() => {
    const n = this.countValue();
    if (n === 0) return this.idleLabel() ?? '';
    return `${n} of ${Math.max(n, this.total() ?? n)} selected`;
  });
  protected readonly pagerLabel = computed(() => `Pages, page ${this.currentPage()} of ${this.pages()}`);
  /** Up to five page numbers around the current page. */
  protected readonly pageNumbers = computed(() => {
    const total = this.pages();
    const size = Math.min(5, total);
    const start = Math.min(Math.max(1, this.currentPage() - 2), total - size + 1);
    return Array.from({ length: size }, (_, i) => start + i);
  });

  protected go(p: number): void {
    this.page.set(Math.min(this.pages(), Math.max(1, p)));
  }
}
