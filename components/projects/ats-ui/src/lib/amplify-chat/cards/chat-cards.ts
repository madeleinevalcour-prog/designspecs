import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, effect, input, model, output, untracked } from '@angular/core';
import { NovoChip } from '../../novo-chip/novo-chip';
import { NovoListEntity, NovoListField } from '../../novo-list/parts';
import { AmplifyChatSelectionBar } from '../selection/selection-bar';
import { AmplifyChatSelectionAction } from '../selection/selection-split-button';
import { AmplifyChatChatListItem, AmplifyChatListItemTheme } from './chat-list-item';
import { AmplifyChatRelevanceSignals } from './relevance-signals';

/** One card in a chat card stack: the data a chat-list-item renders. */
export interface AmplifyChatCardItem {
  /** Stable id, used to track cards and selection. */
  id: string | number;
  /** Card theme; falls back to the stack's `theme`. */
  theme?: AmplifyChatListItemTheme;
  /** prospect-contact: the name link. entity-record: the header title ("2034 | Tyler Brooks"). */
  name: string;
  /** prospect-contact: photo URL (else initials). */
  avatarUrl?: string;
  /** prospect-contact: job title. */
  jobTitle?: string;
  /** prospect-contact: fields after the job title. entity-record: the comment's data row. */
  fields?: NovoListField[];
  /** entity-record: summary paragraph. */
  body?: string;
  /** candidate: header entity. Default candidate. */
  entity?: NovoListEntity;
  /** prospect-contact: saved as a Contact in the ATS (contact circle) or not (grey). Default true. */
  inBullhorn?: boolean;
  /** prospect-contact: relevance signals, shown in the content slot. */
  signals?: string[];
  /** entity-record: chips (e.g. skills), shown in the content slot. */
  chips?: string[];
  /** Locks the checkbox, e.g. once added to Bullhorn. */
  disabled?: boolean;
}

/**
 * AmplifyChatChatCards (Figma: "amplify-chat/chat-cards", 6271:183686; Property 1 = default
 * 6223:173466, selected 6271:183687). A stack of amplify-chat/chat-list-item cards (gap 8),
 * with the same selection model and selection bar as AmplifyChatDataTable.
 *
 *   <ats-amplify-chat-chat-cards theme="prospect-contact" [items]="prospects" [actions]="actions" noun="Contact"
 *       [(selection)]="ids" (primary)="addContacts($event)" (action)="run($event)" (open)="openRecord($event)" />
 *   <ats-amplify-chat-chat-cards [items]="candidates" [pageSize]="3" [selectable]="false" />
 *
 * Behaviour (amplify-chat-interface-patterns.md, "Cards" + "Selection and bulk actions"):
 *  - each card toggles its own checkbox; `selection` (ids) is two-way (`selectionChange`).
 *    Figma shows no select-all for cards, so there is none;
 *  - the `selected` variant: a selection bar card under the stack, "N of M selected" + the
 *    split button. Nothing selected: the bar is hidden;
 *  - `pageSize`: with more items than that, the stack shows one page and the bar carries the
 *    novo-data-table-pagination pager (previous / pages / next) and, at zero selected,
 *    "1–3 of 8" on the left. Selection persists across pages; the count is over all items.
 *    (Chat guidance: 3 cards by default, 5 at most; above that prefer a table.)
 *  - `primary` / `action` emit the selected items; nothing runs until clicked.
 * Content slot per card: prospect-contact → relevance-signals from `signals`; entity-record → chips.
 */
@Component({
  selector: 'ats-amplify-chat-chat-cards',
  imports: [AmplifyChatChatListItem, AmplifyChatRelevanceSignals, AmplifyChatSelectionBar, NovoChip],
  template: `
    <div class="ats-amplify-chat-chat-cards__stack" role="list" [attr.aria-label]="label() ?? 'Records'">
      @for (it of pageItems(); track it.id) {
        <ats-amplify-chat-chat-list-item role="listitem" [theme]="it.theme ?? themeName()" [name]="it.name" [avatarUrl]="it.avatarUrl"
          [jobTitle]="it.jobTitle" [fields]="it.fields" [body]="it.body" [entity]="it.entity" [inBullhorn]="it.inBullhorn"
          [selectable]="isSelectable()" [disabled]="!!it.disabled"
          [selected]="selectedSet().has(it.id)" (selectedChange)="toggle(it.id, $event)" (open)="open.emit(it)">
          @if ((it.theme ?? themeName()) === 'prospect-contact') {
            @if (it.signals?.length) { <ats-amplify-chat-relevance-signals [signals]="it.signals" /> }
          } @else if (it.chips?.length) {
            <div class="ats-amplify-chat-chat-list-item__chips">@for (c of it.chips; track $index) { <ats-novo-chip [label]="c" /> }</div>
          }
        </ats-amplify-chat-chat-list-item>
      }
    </div>
    @if (isSelectable() || pageCount() > 1) {
      <ats-amplify-chat-selection-bar appearance="card" [count]="isSelectable() ? selectedItems().length : 0" [total]="itemList().length"
        [verb]="verb()" [noun]="noun()" [nounPlural]="nounPlural()" [label]="actionLabel()" [actions]="actions()"
        [pageCount]="pageCount()" [(page)]="page" [idleLabel]="rangeLabel()"
        (primary)="primary.emit(selectedItems())" (action)="action.emit({ action: $event, records: selectedItems() })" />
    }
  `,
  styleUrl: './chat-list-item.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-chat-cards' },
})
export class AmplifyChatChatCards {
  /** Cards, in rank order. */
  readonly items = input<AmplifyChatCardItem[] | undefined>([]);
  /** Default card theme. Default entity-record. */
  readonly theme = input<AmplifyChatListItemTheme | undefined>('entity-record');
  /** Checkboxes + selection bar. Default true; off when the reply offers no bulk action. */
  readonly selectable = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Cards per page. Unset: show all. */
  readonly pageSize = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : Number(v)) });
  /** Current page, 1-based (two-way). */
  readonly page = model<number | undefined>(1);
  /** Selected item ids (two-way; emits `selectionChange`). */
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
  /** Accessible name for the list. Default "Records". */
  readonly label = input<string>();

  /** The split button's default action: the selected items. */
  readonly primary = output<AmplifyChatCardItem[]>();
  /** A split button menu action, with the selected items. */
  readonly action = output<{ action: AmplifyChatSelectionAction; records: AmplifyChatCardItem[] }>();
  /** A card's name link: open the record. */
  readonly open = output<AmplifyChatCardItem>();

  protected readonly itemList = computed(() => this.items() ?? []);
  protected readonly themeName = computed(() => this.theme() ?? 'entity-record');
  protected readonly isSelectable = computed(() => this.selectable() ?? true);
  private readonly size = computed(() => {
    const n = Math.floor(this.pageSize() ?? 0);
    return n > 0 ? n : Math.max(1, this.itemList().length);
  });
  protected readonly pageCount = computed(() => Math.max(1, Math.ceil(this.itemList().length / this.size())));
  private readonly currentPage = computed(() => Math.min(this.pageCount(), Math.max(1, this.page() ?? 1)));
  protected readonly pageItems = computed(() => {
    const start = (this.currentPage() - 1) * this.size();
    return this.itemList().slice(start, start + this.size());
  });
  protected readonly rangeLabel = computed(() => {
    const total = this.itemList().length;
    if (!total) return '';
    const start = (this.currentPage() - 1) * this.size() + 1;
    return `${start}–${Math.min(total, start + this.size() - 1)} of ${total}`;
  });

  protected readonly selectedSet = computed(() => new Set(this.selection() ?? []));
  protected readonly selectedItems = computed(() => this.itemList().filter((it) => this.selectedSet().has(it.id)));

  constructor() {
    // Keep the page in range when the items or page size shrink.
    effect(() => {
      const max = this.pageCount();
      untracked(() => {
        if ((this.page() ?? 1) > max) this.page.set(max);
      });
    });
  }

  protected toggle(id: string | number, on: boolean): void {
    const ids = (this.selection() ?? []).filter((x) => x !== id);
    this.selection.set(on ? [...ids, id] : ids);
  }
}
