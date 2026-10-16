import { NgTemplateOutlet } from '@angular/common';
import { Component, booleanAttribute, computed, input, linkedSignal, numberAttribute, signal } from '@angular/core';
import { AmplifyChatChatsPanel, AmplifyHeader } from 'ats-ui';
import { CHATS, SCHEDULED } from '../amplify-chat-chats/amplify-chat-chats-page';

const flag = (v: unknown) => (v == null ? undefined : booleanAttribute(v));
const num = (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v));

/**
 * /amplify-header — AmplifyHeader (Figma "novo-header-amplify" 6815:49633, Amplify page
 * navigation and header).
 *
 * Embed mode: any param renders one header, e.g.
 *   /examples/amplify-header?level=root&unread=2
 *   /examples/amplify-header?title=New%20scheduled%20prompt&unread=2
 *   /examples/amplify-header?title=Scheduled&unread=0
 *   /examples/amplify-header?title=Shortlist&open=true&unread=2
 *   /examples/amplify-header?title=Follow-up:%20425%20%7C%20Project%20Manager,%20Nexus%20Dynamics&width=640&unread=2
 *   /examples/amplify-header?title=Shortlist%20for%20Product%20Manager,%20Nexus&panel=true
 *   /examples/amplify-header?title=Shortlist%20for%20Product%20Manager,%20Nexus&panel=true&open=true
 * Params:
 *   level = root (landing page; ignores title)
 *   title = current page or chat title
 *   unread = Chats count (0 hides the badge; default 2 in embeds)
 *   open = true (Chats panel open: State=Active)
 *   closable = false (hides Close)
 *   width = px, to show truncation
 *   panel = true (live: the header with the Chats panel it opens; unread = the panel's scheduled runs)
 */
@Component({
  imports: [NgTemplateOutlet, AmplifyChatChatsPanel, AmplifyHeader],
  selector: 'app-amplify-header-page',
  template: `
    @if (panel()) {
      <ng-container *ngTemplateOutlet="withPanel" />
    } @else if (embed()) {
      <div class="embed" [style.width.px]="width()">
        <ats-amplify-header [title]="level() === 'root' ? undefined : title()" [unread]="unread() ?? 2" [chatsOpen]="open() ?? false" [closable]="closable()" />
      </div>
    } @else {
      <h1>Amplify header</h1>
      <p class="lede">Figma <code>novo-header-amplify</code> (6815:49633), with <code>novo-title-amplify</code> and <code>actions</code>. Amplify page navigation and header.</p>
      <h2>Landing page (breadcrumb state=home)</h2>
      <ats-amplify-header [unread]="2" [(chatsOpen)]="openA" />
      <h2>Any other page or a chat</h2>
      <ats-amplify-header title="New scheduled prompt" [unread]="2" [(chatsOpen)]="openB" />
      <h2>No unread runs</h2>
      <ats-amplify-header title="Scheduled" [unread]="0" />
      <h2>Chats panel open (State=Active)</h2>
      <ats-amplify-header title="Shortlist for Product Manager, Nexus" [unread]="2" [chatsOpen]="true" />
      <h2>Truncation (640px)</h2>
      <div style="width: 640px"><ats-amplify-header title="Follow-up: 425 | Project Manager, Nexus Dynamics" [unread]="2" /></div>
      <h2>With the Chats panel (live)</h2>
      <ng-container *ngTemplateOutlet="withPanel" />
    }

    <!-- The Chats button opens AmplifyChatChatsPanel: shared open state, aria-controls = the panel id,
         count = the panel's unread scheduled runs, Close returns focus to Chats. -->
    <ng-template #withPanel>
      <div class="with-panel">
        <div class="with-panel__page">
          <ats-amplify-header #header [title]="title() ?? 'Shortlist for Product Manager, Nexus'" [(chatsOpen)]="panelOpen"
            [unread]="chatsPanel.unreadCount()" chatsPanelId="header-chats" [closable]="closable()" />
          <p class="with-panel__note">Page content. Chats opens the Chats panel; the page contracts beside it.</p>
        </div>
        <ats-amplify-chat-chats-panel #chatsPanel id="header-chats" [(open)]="panelOpen" [chats]="chats" [scheduled]="scheduled"
          [current]="current()" (openChat)="current.set($event)" (closed)="header.focusChats()" />
      </div>
    </ng-template>
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; background: var(--color-background-muted); }
    :host:has(.embed) { padding: 0 0 24px; }
    .embed { max-width: 100%; }
    :host:has(> .with-panel) { padding: 0; }
    .with-panel { display: flex; position: relative; height: 720px; border: 1px solid var(--color-border-subtle); background: var(--color-background-muted); overflow: hidden; }
    :host > .with-panel { border: 0; }
    .with-panel__page { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
    .with-panel__note { margin: 24px; font-size: 13px; color: #5d7798; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
  `,
})
export class AmplifyHeaderPage {
  readonly level = input<string>();
  readonly title = input<string>();
  readonly unread = input<number | undefined, unknown>(undefined, { transform: num });
  readonly open = input<boolean | undefined, unknown>(undefined, { transform: flag });
  readonly closable = input<boolean | undefined, unknown>(undefined, { transform: flag });
  readonly width = input<number | undefined, unknown>(undefined, { transform: num });
  readonly panelParam = input<boolean | undefined, unknown>(undefined, { alias: 'panel', transform: flag });
  protected readonly panel = computed(() => this.panelParam() === true);
  protected readonly chats = CHATS;
  protected readonly scheduled = SCHEDULED;
  /** Chats panel demo: starts closed (or open with ?open=true). */
  protected readonly panelOpen = linkedSignal(() => this.open() ?? false);
  protected readonly current = signal<string | number | null>('c4');
  protected readonly openA = signal(false);
  protected readonly openB = signal(false);
  protected readonly embed = computed(() => !!(this.level() || this.title() || this.unread() != null || this.open() != null || this.closable() != null || this.width() != null));
}
