import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, afterNextRender, computed, inject, input, viewChild,
} from '@angular/core';

/** Where the conversation lives: the full-page chat or the docked / pop-over panel. */
export type AmplifyChatConversationSize = 'full page' | 'docked';

/** How close to the bottom (px) still counts as "at the bottom" for auto-scroll. */
const STICK_THRESHOLD = 48;

/**
 * AmplifyChatConversation (Figma: the "conversation" frame inside docked-chat,
 * 6327:204603 / 6327:206595). The shared chat layout used by the docked chat, the
 * pop over and the full-page shell: a scrolling column of turns with the input area
 * pinned at the bottom.
 *
 * Content:
 *  - Turns: any projected children (`ats-amplify-chat-user-turn`,
 *    `ats-amplify-chat-chat-block`, …), in order, spacing/gap/xlg (32) apart.
 *  - Input: the element marked `slot="input"` (or an `ats-amplify-chat-container` /
 *    `ats-amplify-chat-global-chat-container`), pinned at the bottom with
 *    page/gap/vertical (16) above it. It sits on `general/level 2 - scroll`
 *    (color/background/scroll + background blur) and is sticky inside the scroller,
 *    so replies scroll behind it and the last line can always scroll clear.
 *
 * Sizes (patterns doc "Spacing and layout"):
 *  - `full page`: chat column (turns and input) 800px max, centered; on narrow windows
 *    the column is the available width minus spacing/margin (24) per side.
 *  - `docked`: no separate column. The conversation fills the panel; turns are inset
 *    spacing/padding/sm (8) and user turns another spacing/padding/lg (24) on the left
 *    (Figma chat-column / user-turn padding).
 *
 * Alignment: while the turns fit, they are top-aligned in the column and the input
 * sits at the bottom of the view (Figma full-page "short conversation" 6237:176854).
 * Once they overflow, the conversation is bottom-anchored (Figma "long conversation"
 * 6267:181805): the newest content sits just above the input and older turns scroll
 * off the top.
 *
 * Auto-scroll: when a turn is added or grows (e.g. a thinking block turns into the
 * reply), or the input area / viewport changes size, the view follows to the newest
 * content only if the user was already at the bottom; if they scrolled up to read,
 * they stay where they are. Call
 * `scrollToBottom()` to jump to the latest (e.g. right after the user sends).
 * The turns column is a `role="log"` region so new replies are announced politely.
 * The host fills its parent (`height: 100%`), so give the parent a bounded height.
 *
 *   <ats-amplify-chat-conversation size="docked">
 *     <ats-amplify-chat-user-turn>
 *       <ats-amplify-chat-user-bubble>Can you show me 5 contacts at Verizon that aren't in the ATS yet?</ats-amplify-chat-user-bubble>
 *     </ats-amplify-chat-user-turn>
 *     <ats-amplify-chat-chat-block status="Searching Prospect…" />
 *     <ats-amplify-chat-container slot="input" size="docked" (send)="ask($event)" />
 *   </ats-amplify-chat-conversation>
 */
@Component({
  selector: 'ats-amplify-chat-conversation',
  template: `
    <div class="ats-amplify-chat-conversation__scroll" #scroller (scroll)="onScroll()">
      <div class="ats-amplify-chat-conversation__column" #column role="log" aria-live="polite" [attr.aria-label]="label() ?? 'Conversation'">
        <ng-content />
      </div>
      <div class="ats-amplify-chat-conversation__input" #inputArea>
        <ng-content select="[slot=input], ats-amplify-chat-container, ats-amplify-chat-global-chat-container" />
      </div>
    </div>
  `,
  styleUrl: './conversation.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-conversation', '[attr.data-size]': 'sizeName()' },
})
export class AmplifyChatConversation {
  /** `full page` (800 column, centered) or `docked` (fills the panel). Default `full page`. */
  readonly size = input<AmplifyChatConversationSize | undefined>('full page');
  /** Accessible name of the turns log. Default "Conversation". */
  readonly label = input<string>();

  protected readonly sizeName = computed(() => this.size() ?? 'full page');

  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private readonly column = viewChild.required<ElementRef<HTMLElement>>('column');
  private readonly inputArea = viewChild.required<ElementRef<HTMLElement>>('inputArea');
  /** True while the user is at (or near) the bottom: new content keeps the view pinned there. */
  private atBottom = true;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const column = this.column().nativeElement;
      this.scrollToBottom();
      // A turn added, or a turn that grew (thinking → reply): follow only if already at the bottom.
      // Also follow when the input area grows (a clarifying-questions card opens) or the
      // viewport itself resizes, so the newest turn stays just above the input.
      const follow = () => { if (this.atBottom) this.scrollToBottom(); };
      const mo = new MutationObserver(follow);
      mo.observe(column, { childList: true, subtree: true, characterData: true });
      const ro = new ResizeObserver(follow);
      ro.observe(column);
      ro.observe(this.inputArea().nativeElement);
      ro.observe(this.scroller().nativeElement);
      destroyRef.onDestroy(() => { mo.disconnect(); ro.disconnect(); });
    });
  }

  /** Scrolls to the newest turn and resumes following new content. */
  scrollToBottom(behavior: ScrollBehavior = 'auto'): void {
    const el = this.scroller().nativeElement;
    this.atBottom = true;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  protected onScroll(): void {
    const el = this.scroller().nativeElement;
    this.atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_THRESHOLD;
  }
}
