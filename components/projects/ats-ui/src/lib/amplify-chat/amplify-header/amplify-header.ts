import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, input, model, numberAttribute, output, viewChild } from '@angular/core';
import { Breadcrumb, BreadcrumbItem } from '../../breadcrumb/breadcrumb';
import { Button } from '../../button/button';
import { ButtonWithCount } from '../../button-with-count/button-with-count';
import { IconContainer } from '../../icon-container/icon-container';

/**
 * AmplifyHeader (Figma: "novo-header-amplify", 6815:49633 — Amplify page navigation and
 * header; with "novo-title-amplify" 6806:36034 and "actions" 6815:49614). The one-row header
 * for the full-page Amplify tab. It replaces the title row + tabs of the old full-page chat
 * header; Amplify pages are reached from the Amplify menu in the bowling alley instead.
 *
 * Left (novo-title-amplify): the Amplify icon-container (md) and a Breadcrumb, 16px apart.
 *  - `title` unset → breadcrumb state=home: just "Amplify", as the page's h1 (the landing page).
 *  - `title` set → "Amplify / {title}"; the root emits `rootClick` (or links to `rootHref`).
 * Right (actions, 8px apart): the Chats toggle (ButtonWithCount: Button Secondary · Small +
 * count-badge for `unread`; State=Active while `chatsOpen`) and Close (Button Icon).
 *
 * The Chats button opens AmplifyChatChatsPanel (lib/amplify-chat/chats). AmplifyChatFullPage
 * renders the two together; to pair them yourself, share the open state and the panel id, and
 * call `focusChats()` when the panel closes:
 *
 *   <ats-amplify-header #header [(chatsOpen)]="panelOpen" [unread]="panel.unreadCount()" chatsPanelId="chats" (closed)="close()" />
 *   <ats-amplify-chat-chats-panel #panel id="chats" [(open)]="panelOpen" [chats]="chats" [scheduled]="scheduled" (closed)="header.focusChats()" />
 *   <ats-amplify-header title="Scheduled" (rootClick)="goHome()" [(chatsOpen)]="panelOpen" />
 */
@Component({
  selector: 'ats-amplify-header',
  imports: [Breadcrumb, Button, ButtonWithCount, IconContainer],
  template: `
    <header class="ats-amplify-header__bar">
      <div class="ats-amplify-header__page-title">
        <div class="ats-amplify-header__title">
          <ats-icon-container theme="amplify" size="md" aria-hidden="true" />
          <ats-breadcrumb class="ats-amplify-header__breadcrumb" [items]="items()" [headingCurrent]="true" (navigate)="rootClick.emit()" />
        </div>
        <div class="ats-amplify-header__actions">
          <ats-button-with-count [count]="unreadCount()">
            <button #chatsButton ats-button theme="secondary" size="small" [state]="isOpen() ? 'active' : undefined"
              [attr.aria-pressed]="isOpen()" [attr.aria-controls]="chatsPanelId() || null" [attr.aria-label]="chatsLabel()"
              (click)="toggle()">Chats</button>
          </ats-button-with-count>
          @if (isClosable()) {
            <button ats-button theme="icon" icon="close" aria-label="Close Amplify" (click)="closed.emit()"></button>
          }
        </div>
      </div>
    </header>
  `,
  styleUrl: './amplify-header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-header', '[attr.data-level]': "title() ? 'page' : 'root'" },
})
export class AmplifyHeader {
  /** The current page or chat title. Unset = the landing page (breadcrumb shows only the root). */
  readonly title = input<string>();
  /** Breadcrumb root label. Default "Amplify". */
  readonly rootLabel = input<string>();
  /** Root link target; without it the root is a button that emits `rootClick`. */
  readonly rootHref = input<string>();
  /** The Chats panel is open (two-way). Default false. */
  readonly chatsOpen = model<boolean | undefined>(false);
  /** Unread scheduled runs shown on Chats. 0 hides the badge. Default 0. */
  readonly unread = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)) });
  /** id of the Chats panel, for aria-controls. */
  readonly chatsPanelId = input<string>();
  /** Show Close. Default true. */
  readonly closable = input<boolean | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });

  /** The breadcrumb root was activated: go to the Amplify landing page. */
  readonly rootClick = output<void>();
  /** Chats was toggled; emits the new open state. */
  readonly chatsToggle = output<boolean>();
  /** Close was activated. */
  readonly closed = output<void>();

  protected readonly items = computed<BreadcrumbItem[]>(() => {
    const root: BreadcrumbItem = { label: this.rootLabel() ?? 'Amplify', href: this.rootHref() };
    const t = this.title();
    return t ? [root, { label: t }] : [{ label: root.label }];
  });
  protected readonly unreadCount = computed(() => this.unread() ?? 0);
  protected readonly isOpen = computed(() => this.chatsOpen() ?? false);
  protected readonly isClosable = computed(() => this.closable() ?? true);
  protected readonly chatsLabel = computed(() => (this.unreadCount() > 0 ? `Chats, ${this.unreadCount()} new` : 'Chats'));

  private readonly chatsButton = viewChild.required<string, ElementRef<HTMLButtonElement>>('chatsButton', { read: ElementRef });

  /** Focus the Chats button (when the Chats panel closes). */
  focusChats(): void { this.chatsButton().nativeElement.focus(); }

  protected toggle(): void {
    const next = !this.isOpen();
    this.chatsOpen.set(next);
    this.chatsToggle.emit(next);
  }
}
