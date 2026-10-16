import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { Icon } from '../../icon/icon';
import { NovoChip } from '../../novo-chip/novo-chip';
import { ItemData, ItemField, NovoListEntity } from '../../novo-list/parts';

/** Figma chat-card `type`. */
export type AmplifyChatChatCardType = 'chat' | 'scheduled';
/** Figma chat-card `status` (scheduled chats only). */
export type AmplifyChatChatCardStatus = 'active' | 'paused' | 'attention';
/** Figma chat-card `state` forced for docs (hover and focus are also live; selected comes from `selected`). */
export type AmplifyChatChatCardState = 'hover' | 'focus';

/** The record a chat is about (item-data). */
export interface AmplifyChatChatRecord {
  entity: NovoListEntity;
  label: string;
}

const STATUS: Record<Exclude<AmplifyChatChatCardStatus, 'active'>, { label: string; icon: string; color?: string }> = {
  paused: { label: 'Paused', icon: 'inactive' },
  attention: { label: 'Needs attention', icon: 'caution', color: 'var(--amplify-chat-chat-card-color-icon-attention, var(--color-icon-utility-warning))' },
};

/**
 * AmplifyChatChatCard (Figma: "amplify-chat/chat-card", 6832:132835). One chat in the Chats
 * panel. Built from the same list-item parts, spacing, border, radius and fills as Prompt Card
 * and chat-list-item (amplify-chat/chat-list-item tokens), without the kebab:
 *  - item-header: the title (body/lg-medium, 1 line, truncates) and the caption on the right —
 *    the last activity (`ago`), or for unread scheduled runs the indicator chip "N new"
 *    (NovoChip, positive, small) in its place;
 *  - item-data: `type="chat"` → the record the chat is about (entity icon + label);
 *    `type="scheduled"` → the frequency and time window (clock-arrow), plus the status when it is
 *    not active: Paused (inactive icon) or Needs attention (caution icon, color/icon/utility/warning);
 *  - the description (body/default, 2 lines, then truncates). Chats only.
 * The whole card opens the chat: the title is the button and its hit area covers the card.
 * `selected` marks the open chat (aria-current="page"): border utility/positive, background hover.
 *
 *   <ats-amplify-chat-chat-card title="Shortlist for Product Manager, Nexus" ago="3 hours ago"
 *       [record]="{ entity: 'job', label: '425 | Project Manager' }"
 *       description="Jane Jones and Tyler Brooks meet 4 of 5 must-haves" (open)="go(chat)" />
 *   <ats-amplify-chat-chat-card type="scheduled" title="Open job order status" schedule="Weekdays, 8–9 AM"
 *       [unread]="1" ago="Today, 8:12 AM" (open)="go(run)" />
 */
@Component({
  selector: 'ats-amplify-chat-chat-card',
  imports: [Icon, ItemData, ItemField, NovoChip],
  template: `
    <div class="ats-amplify-chat-chat-card__list-item">
      <div class="ats-amplify-chat-chat-card__header">
        <button type="button" class="ats-amplify-chat-chat-card__title" [title]="title()"
          [attr.aria-current]="selected() ? 'page' : null" [attr.aria-label]="accessibleName()" (click)="open.emit()">{{ title() }}</button>
        @if (unreadCount()) {
          <ats-novo-chip class="ats-amplify-chat-chat-card__new" size="small" color="positive" [label]="unreadCount() + ' new'" aria-hidden="true" />
        } @else if (ago()) {
          <span class="ats-amplify-chat-chat-card__ago">{{ ago() }}</span>
        }
      </div>
      @if (isScheduled() ? !!schedule() || !!statusInfo() : !!record()) {
        <ats-item-data class="ats-amplify-chat-chat-card__data">
          @if (isScheduled()) {
            @if (schedule()) { <ats-item-field icon="clock-arrow" [text]="schedule()" /> }
            @if (statusInfo(); as s) {
              <span class="ats-item-field ats-amplify-chat-chat-card__status" [attr.data-status]="statusName()">
                <ats-icon [name]="s.icon" [size]="12" [color]="s.color" />
                <span class="ats-item-field__text">{{ s.label }}</span>
              </span>
            }
          } @else if (record(); as r) {
            <ats-item-field class="ats-amplify-chat-chat-card__record" [icon]="r.entity" [text]="r.label" />
          }
        </ats-item-data>
      }
      @if (!isScheduled() && description()) {
        <p class="ats-amplify-chat-chat-card__description">{{ description() }}</p>
      }
    </div>
  `,
  styleUrl: './chat-card.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-chat-card',
    // `title` is an input; drop the native attribute so it doesn't show a tooltip on the whole card.
    '[attr.title]': 'null',
    '[attr.data-type]': 'typeName()',
    '[attr.data-state]': 'state() ?? null',
    '[class.is-selected]': 'selected()',
    '[class.is-unread]': '!!unreadCount()',
  },
})
export class AmplifyChatChatCard {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** `chat` (default) or `scheduled` (a scheduled prompt's chat, listed under Scheduled). */
  readonly type = input<AmplifyChatChatCardType | undefined>('chat');
  readonly title = input<string>('');
  /** Last activity, e.g. "3 hours ago" or "Today, 8:12 AM". Hidden while `unread` is set. */
  readonly ago = input<string>();
  /** Chats: the record the chat is about. */
  readonly record = input<AmplifyChatChatRecord | undefined>();
  /** Chats: one-line summary of the last answer (2 lines max). */
  readonly description = input<string>();
  /** Scheduled: frequency and time window, e.g. "Weekdays, 8–9 AM". */
  readonly schedule = input<string>();
  /** Scheduled: `active` (default, no status shown), `paused` or `attention`. */
  readonly status = input<AmplifyChatChatCardStatus | undefined>('active');
  /** Scheduled: new runs since the chat was last opened. Shows the "N new" chip instead of `ago`. */
  readonly unread = input<number | undefined>(0);
  /** The open chat (aria-current="page"). */
  readonly selected = input(false, { transform: booleanAttribute });
  /** Forces a visual state for docs. */
  readonly state = input<AmplifyChatChatCardState | undefined>();

  /** The card was clicked, or Enter / Space on the focused card. */
  readonly open = output<void>();

  protected readonly typeName = computed<AmplifyChatChatCardType>(() => this.type() ?? 'chat');
  protected readonly isScheduled = computed(() => this.typeName() === 'scheduled');
  protected readonly statusName = computed<AmplifyChatChatCardStatus>(() => this.status() ?? 'active');
  protected readonly statusInfo = computed(() => {
    const s = this.statusName();
    return this.isScheduled() && s !== 'active' ? STATUS[s] : null;
  });
  protected readonly unreadCount = computed(() => (this.isScheduled() ? Math.max(0, this.unread() ?? 0) : 0));
  /** Screen readers hear the unread count with the title (the chip is decorative). */
  protected readonly accessibleName = computed(() => {
    const n = this.unreadCount();
    return n ? `${this.title()}, ${n} new run${n > 1 ? 's' : ''}` : null;
  });

  /** Moves focus to the card (its open button). */
  focus(): void {
    this.host.nativeElement.querySelector<HTMLButtonElement>('.ats-amplify-chat-chat-card__title')?.focus();
  }
}
