import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, ViewEncapsulation, afterNextRender, booleanAttribute, computed, contentChildren,
  effect, inject, input, model, output, untracked, viewChild,
} from '@angular/core';
import { Button } from '../../button/button';
import { IconContainer } from '../../icon-container/icon-container';
import { AmplifyChatClarifyAnswer, AmplifyChatClarifyingQuestion } from '../clarifying-questions/clarifying-questions-model';
import { AmplifyChatConversation } from '../docked/conversation';
import { AmplifyChatContainer } from '../input/amplify-chat-container';
import { AmplifyChatContextItem } from '../input/amplify-context-container';
import { AmplifyChatGlobalChatContainer } from '../input/global-chat-container';
import { AmplifyChatChatBlock } from '../reply/chat-block';
import { AmplifyChatUserTurn } from '../reply/user-turn';

/** `auto` = empty until a user turn or chat-block is projected. */
export type AmplifyChatFullPageState = 'auto' | 'empty' | 'conversation';

const DEFAULT_TABS = ['Chat', 'Overview', 'Meetings', 'Audits'];
/** Input move from the starting point to the bottom (no token: motion). */
const MOVE_MS = 240;

/**
 * AmplifyChatFullPage (Figma: "global-chat-full-page" — starting point 6267:179466,
 * short conversation 6237:176854, long conversation 6267:181805). The full-page Amplify
 * chat: everything right of the Bowling Alley. A prototyping shell — project the turns,
 * the shell owns the header and the input.
 *
 * Header (Figma `novo-header`): the Amplify icon-container (lg) + `title` (title/default),
 * a Close button (emits `closed`) and tabs (`tabs`, default Chat · Overview · Meetings ·
 * Audits; `[(activeTab)]`, `tabSelect`). RecordHeader is not reused: its toolbar,
 * field row and More / Layout buttons are record-specific.
 *
 * States:
 *  - empty (no `ats-amplify-chat-user-turn` / `ats-amplify-chat-chat-block` projected):
 *    the global-chat-container greeting ("Hi {greetingName}, …") and input in the upper
 *    middle of the page (750 wide, 200 below the header).
 *  - conversation: the turns in `ats-amplify-chat-conversation` (800 column) with an
 *    `ats-amplify-chat-container` pinned at the bottom (`context` row, `questions`).
 *    Top-aligned while the turns fit; once they overflow, bottom-anchored (newest just
 *    above the input) and it follows new turns unless the user scrolled up.
 *  The first send moves the input from the middle to the bottom (animated; reduced
 *  motion skips it) and keeps focus in it. `state` forces a state for custom turns.
 *
 * Prototyping: bind a turn list to an array and push to it on `send`:
 *
 *   <ats-amplify-chat-full-page title="Amplify" greetingName="Chloe" [context]="['Prospect']"
 *       [generating]="busy()" (send)="ask($event)" (stop)="cancel()">
 *     @for (turn of turns(); track turn.id) {
 *       @if (turn.user) {
 *         <ats-amplify-chat-user-turn>
 *           <ats-amplify-chat-user-bubble>{{ turn.text }}</ats-amplify-chat-user-bubble>
 *         </ats-amplify-chat-user-turn>
 *       } @else if (turn.thinking) {
 *         <ats-amplify-chat-chat-block status="Thinking…" />
 *       } @else {
 *         <ats-amplify-chat-chat-block><ats-amplify-chat-text>{{ turn.text }}</ats-amplify-chat-text></ats-amplify-chat-chat-block>
 *       }
 *     }
 *   </ats-amplify-chat-full-page>
 *
 *   ask(text: string) { this.turns.update((t) => [...t, { id: ++this.id, user: true, text }]); … }
 *
 * Outputs: `send(text)`, `stop`, `closed`, `tabSelect`, and the input passthroughs
 * (`answered` / `completed` / `dismissed` for a clarifying round, context `removed` /
 * `add`, `addFile` / `addTools` / `promptLibrary`). Fills its parent: give it a height.
 */
@Component({
  selector: 'ats-amplify-chat-full-page',
  imports: [AmplifyChatContainer, AmplifyChatConversation, AmplifyChatGlobalChatContainer, Button, IconContainer],
  templateUrl: './full-page.html',
  styleUrl: './full-page.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-full-page', '[attr.data-state]': "isEmpty() ? 'empty' : 'conversation'" },
})
export class AmplifyChatFullPage {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  /** Header title. Default "Amplify". */
  readonly title = input<string>();
  /** First name in the starting greeting ("Hi Chloe, how can I help you today?"). Default "Chloe". */
  readonly greetingName = input<string>();
  /** Replaces the whole starting greeting. */
  readonly greeting = input<string>();
  /** Context records in the bottom input's context row (hidden at the starting point, as in Figma). */
  readonly context = input<AmplifyChatContextItem[] | undefined>([]);
  /** A clarifying-questions round shown in the bottom input (replaces the context row). */
  readonly questions = input<AmplifyChatClarifyingQuestion[] | undefined>();
  /** Input placeholder. */
  readonly placeholder = input<string>();
  /** A reply is generating: Stop shows in the input, Send stays disabled. */
  readonly generating = input<boolean | undefined, unknown>(false, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Force a state; `auto` (default) = empty until a user turn / chat-block is projected. */
  readonly state = input<AmplifyChatFullPageState | undefined>('auto');
  /** Header tabs. Default Chat · Overview · Meetings · Audits; `[]` hides the row. */
  readonly tabs = input<string[] | undefined>();
  /** Active tab index (two-way). Default 0 (Chat). */
  readonly activeTab = model<number | undefined>(0);
  /** Show the header Close button. Default true. */
  readonly closable = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Accessible name of the turns log. Default "Conversation". */
  readonly label = input<string>();

  /** The recruiter sent a message (from the starting point or the bottom input). */
  readonly send = output<string>();
  readonly stop = output<void>();
  /** The header Close button was activated. */
  readonly closed = output<void>();
  readonly tabSelect = output<number>();
  readonly answered = output<{ index: number; answer: AmplifyChatClarifyAnswer }>();
  readonly completed = output<AmplifyChatClarifyAnswer[]>();
  readonly dismissed = output<void>();
  readonly removed = output<string>();
  readonly add = output<void>();
  readonly addFile = output<void>();
  readonly addTools = output<void>();
  readonly promptLibrary = output<void>();

  private readonly userTurns = contentChildren(AmplifyChatUserTurn, { descendants: true });
  private readonly blocks = contentChildren(AmplifyChatChatBlock, { descendants: true });
  private readonly conversation = viewChild.required(AmplifyChatConversation);

  protected readonly titleText = computed(() => this.title() ?? 'Amplify');
  protected readonly tabList = computed(() => this.tabs() ?? DEFAULT_TABS);
  protected readonly currentTab = computed(() => this.activeTab() ?? 0);
  protected readonly isEmpty = computed(() => {
    const s = this.state() ?? 'auto';
    if (s !== 'auto') return s === 'empty';
    return this.userTurns().length === 0 && this.blocks().length === 0;
  });

  /** Where the starting input was when the first message was sent (for the move animation). */
  private moveFrom?: DOMRect;
  private refocus = false;

  constructor() {
    effect(() => {
      if (this.isEmpty()) return;
      untracked(() => {
        if (!this.moveFrom) return;
        const from = this.moveFrom;
        const refocus = this.refocus;
        this.moveFrom = undefined;
        this.refocus = false;
        afterNextRender(() => this.settleInput(from, refocus), { injector: this.injector });
      });
    });
  }

  /** Scrolls to the newest turn and resumes following new content. */
  scrollToBottom(behavior: ScrollBehavior = 'auto'): void {
    this.conversation().scrollToBottom(behavior);
  }

  protected selectTab(i: number): void {
    this.activeTab.set(i);
    this.tabSelect.emit(i);
  }

  /** Bottom input: jump to the latest so the new turn is followed, then emit. */
  protected onSend(text: string): void {
    this.conversation().scrollToBottom();
    this.send.emit(text);
  }

  /** Starting point: remember where the input was, so it can move to the bottom. */
  protected onStartSend(text: string): void {
    const box = this.el.querySelector<HTMLElement>('.ats-amplify-chat-full-page__start .ats-amplify-chat-input');
    this.moveFrom = box?.getBoundingClientRect();
    this.refocus = !!box?.contains(document.activeElement);
    this.onSend(text);
  }

  /** The bottom input has rendered: slide it in from the starting position and keep focus in it. */
  private settleInput(from: DOMRect, refocus: boolean): void {
    const box = this.el.querySelector<HTMLElement>('.ats-amplify-chat-conversation__input .ats-amplify-chat-input');
    if (!box) return;
    if (refocus) box.querySelector<HTMLTextAreaElement>('textarea')?.focus({ preventScroll: true });
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const to = box.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    if (!dx && !dy) return;
    box.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: MOVE_MS, easing: 'ease-out' });
  }
}
