import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model, output, signal, viewChild } from '@angular/core';
import { Button } from '../../button/button';
import { Icon } from '../../icon/icon';
import { SearchInput } from '../../search-input/search-input';
import { AmplifyChatChatCard, AmplifyChatChatCardStatus, AmplifyChatChatRecord } from './chat-card';

/** History group, by last activity. */
export type AmplifyChatChatGroup = 'today' | 'yesterday' | 'previous-7-days' | 'older';

/** One chat in the history. */
export interface AmplifyChatChat {
  id: string | number;
  title: string;
  group: AmplifyChatChatGroup;
  /** Last activity, e.g. "3 hours ago". */
  ago?: string;
  description?: string;
  record?: AmplifyChatChatRecord;
}

/** One scheduled prompt and its chat (listed under Scheduled, not in the history). */
export interface AmplifyChatScheduledChat {
  id: string | number;
  /** The scheduled prompt's chat (what `openChat` opens). */
  chatId: string | number;
  name: string;
  /** Frequency and time window, e.g. "Weekdays, 8–9 AM". */
  schedule: string;
  status?: AmplifyChatChatCardStatus;
  /** New runs since the chat was last opened. */
  unread?: number;
  /** Last run, e.g. "Today, 8:12 AM". */
  last?: string;
}

const GROUPS: { id: AmplifyChatChatGroup; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'previous-7-days', label: 'Previous 7 days' },
  { id: 'older', label: 'Older' },
];

/** Scheduled shows this many cards; View All opens the rest (prototype SCHED_LIMIT). */
const SCHEDULED_LIMIT = 3;

/**
 * AmplifyChatChatsPanel (Figma: "amplify-chat/chats-panel", 6835:133241 — state=default,
 * state=no-results). The chat history for the Amplify tab, from the Amplify tab prototype.
 * A right-hand slideout surface (slideout/color/background, general/level 3 - right) at the
 * docked-chat width (420). Put it last in a flex row with the page: the page contracts beside it.
 * Below 1100px it overlays the page instead.
 *  - Header (novo-header, slideout): "Chats", then New Chat (Button secondary, small, add-thin)
 *    and Close in the actions (the docked-chat header, with New Chat in place of pop-out).
 *  - Toolbar: search (SearchInput pill, "Search chats"). Filters as you type: scheduled names,
 *    chat titles, descriptions and record names. Escape or the clear button empties it.
 *  - Scheduled: View All and up to 3 scheduled chats (chat-card type="scheduled"). While
 *    searching it lists every match.
 *  - History: Today, Yesterday, Previous 7 days, Older (chat-card type="chat"). Empty groups are
 *    not shown. `current` marks the open chat (chat-card selected).
 *  - Scrolled: when cards scroll under the toolbar its background changes to
 *    chats-panel/color/toolbar/background-scrolled (color/background/scroll) — state=scrolled.
 *  - No matches: empty-state (search icon, "No chats match “query”", "Try a different word.") —
 *    state=no-results.
 *
 * The host owns opening: the Chats button in the Amplify header toggles `open` (aria-pressed,
 * aria-controls the panel id), shows a badge with the unread scheduled runs (`unreadCount`),
 * and gets focus back when Close is used (`closed`). Closed by default in the Amplify tab.
 *
 *   <ats-amplify-chat-chats-panel id="chats" [(open)]="chatsOpen" [chats]="chats" [scheduled]="scheduled"
 *       [current]="chatId" (openChat)="go($event)" (newChat)="startChat()" (viewScheduled)="go('scheduled')"
 *       (closed)="chatsButton.focus()" />
 */
@Component({
  selector: 'ats-amplify-chat-chats-panel',
  imports: [AmplifyChatChatCard, Button, Icon, SearchInput],
  template: `
    <div class="ats-amplify-chat-chats-panel__panel">
      <header class="ats-amplify-chat-chats-panel__header">
        <h2 class="ats-amplify-chat-chats-panel__title">{{ title() ?? 'Chats' }}</h2>
        <div class="ats-amplify-chat-chats-panel__actions">
          <button ats-button theme="secondary" size="small" iconLeft="add-thin" (click)="newChat.emit()">New Chat</button>
          <button ats-button theme="icon" size="small" icon="close" aria-label="Close chats" (click)="close()"></button>
        </div>
      </header>
      <div class="ats-amplify-chat-chats-panel__toolbar" [class.is-scrolled]="isScrolled()">
        <ats-search-input #search variant="pill" placeholder="Search chats" ariaLabel="Search chats"
          [closable]="!!queryText()" [active]="!!queryText()" [value]="query() ?? ''" (valueChange)="query.set($event)" (closed)="clear()" />
      </div>
      <div class="ats-amplify-chat-chats-panel__list" (scroll)="onListScroll($event)">
        @if (scheduledMatches().length || (!queryText() && scheduledList().length)) {
          <section class="ats-amplify-chat-chats-panel__group" aria-labelledby="ats-chats-g-scheduled">
            <div class="ats-amplify-chat-chats-panel__group-header">
              <h3 class="ats-amplify-chat-chats-panel__label" id="ats-chats-g-scheduled">Scheduled</h3>
              <button ats-button theme="dialogue" size="small" (click)="viewScheduled.emit()">View All</button>
            </div>
            <ul class="ats-amplify-chat-chats-panel__cards">
              @for (s of scheduledShown(); track s.id) {
                <li><ats-amplify-chat-chat-card type="scheduled" [title]="s.name" [schedule]="s.schedule" [status]="s.status"
                  [unread]="s.unread" [ago]="s.last" [selected]="s.chatId === current()" (open)="openChat.emit(s.chatId)" /></li>
              }
            </ul>
          </section>
        }
        @for (g of groups(); track g.id) {
          <section class="ats-amplify-chat-chats-panel__group" [attr.aria-labelledby]="'ats-chats-g-' + g.id">
            <div class="ats-amplify-chat-chats-panel__group-header">
              <h3 class="ats-amplify-chat-chats-panel__label" [id]="'ats-chats-g-' + g.id">{{ g.label }}</h3>
            </div>
            <ul class="ats-amplify-chat-chats-panel__cards">
              @for (c of g.chats; track c.id) {
                <li><ats-amplify-chat-chat-card [title]="c.title" [ago]="c.ago" [record]="c.record" [description]="c.description"
                  [selected]="c.id === current()" (open)="openChat.emit(c.id)" /></li>
              }
            </ul>
          </section>
        }
        @if (queryText() && !scheduledMatches().length && !groups().length) {
          <div class="ats-amplify-chat-chats-panel__empty" role="status">
            <ats-icon name="search" [size]="64" color="var(--color-icon-illustration)" />
            <div class="ats-amplify-chat-chats-panel__empty-body">
              <p class="ats-amplify-chat-chats-panel__empty-title">No chats match “{{ queryText() }}”</p>
              <p class="ats-amplify-chat-chats-panel__empty-text">Try a different word.</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './chats-panel.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-chats-panel',
    role: 'complementary',
    'aria-label': 'Chats',
    '[class.is-open]': 'isOpen()',
    '[attr.inert]': 'isOpen() ? null : ""',
    '[attr.aria-hidden]': 'isOpen() ? null : "true"',
  },
})
export class AmplifyChatChatsPanel {
  /** Shown (two-way: `[(open)]`). Default true; the Amplify tab starts it closed. */
  readonly open = model<boolean | undefined>(true);
  readonly chats = input<AmplifyChatChat[] | undefined>([]);
  readonly scheduled = input<AmplifyChatScheduledChat[] | undefined>([]);
  /** Id of the open chat (a chat id or a scheduled chat's `chatId`). */
  readonly current = input<string | number | null | undefined>();
  /** Search text (two-way). */
  readonly query = model<string | undefined>('');
  /** Docs: force the toolbar's scrolled background (state=scrolled). Otherwise it follows the list's scroll. */
  readonly scrolled = input(false, { transform: booleanAttribute });
  /** Header title. Default "Chats". */
  readonly title = input<string>();

  /** A chat card was activated: the chat id. */
  readonly openChat = output<string | number>();
  readonly newChat = output<void>();
  /** View All: open the Scheduled page. */
  readonly viewScheduled = output<void>();
  /** Close was activated (`open` is false too). Return focus to the Chats button. */
  readonly closed = output<void>();

  private readonly search = viewChild.required<SearchInput>('search');

  protected readonly isOpen = computed(() => this.open() ?? true);
  /** Cards are scrolled under the toolbar. */
  private readonly listScrolled = signal(false);
  protected readonly isScrolled = computed(() => this.scrolled() || this.listScrolled());
  protected readonly queryText = computed(() => (this.query() ?? '').trim());
  private readonly needle = computed(() => this.queryText().toLowerCase());
  protected readonly scheduledList = computed(() => this.scheduled() ?? []);
  protected readonly scheduledMatches = computed(() => {
    const q = this.needle();
    return this.scheduledList().filter((s) => !q || s.name.toLowerCase().includes(q));
  });
  protected readonly scheduledShown = computed(() =>
    this.queryText() ? this.scheduledMatches() : this.scheduledList().slice(0, SCHEDULED_LIMIT));
  protected readonly groups = computed(() => {
    const q = this.needle();
    const hits = (this.chats() ?? []).filter((c) =>
      !q || [c.title, c.description, c.record?.label].join(' ').toLowerCase().includes(q));
    return GROUPS.map((g) => ({ ...g, chats: hits.filter((c) => c.group === g.id) })).filter((g) => g.chats.length);
  });
  /** Unread scheduled runs, for the Chats button badge. */
  readonly unreadCount = computed(() => this.scheduledList().reduce((n, s) => n + (s.unread ?? 0), 0));

  protected onListScroll(e: Event): void { this.listScrolled.set((e.target as HTMLElement).scrollTop > 0); }

  protected clear(): void { this.query.set(''); this.search().focus(); }

  protected close(): void {
    this.open.set(false);
    this.closed.emit();
  }

  /** Focus the search input. */
  focusSearch(): void { this.search().focus(); }
}
