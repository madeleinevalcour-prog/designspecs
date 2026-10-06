import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, computed, inject, input, output, signal, viewChild,
} from '@angular/core';
import { Button } from '../../button/button';
import { Icon } from '../../icon/icon';
import { IconButtonNoContainer } from '../../icon-button-no-container/icon-button-no-container';
import { AmplifyChatSource, AmplifyChatSourcesRow } from '../sources/sources-row';
import { AmplifyChatText } from '../text/text';

/** Thumbs up / thumbs down on a reply. */
export type AmplifyChatFeedback = 'up' | 'down';

/**
 * AmplifyChatChatBlock (Figma: "amplify-chat/chat-block", 6150:20828). The full
 * Amplify reply, top to bottom (patterns doc "Response structure"):
 *  1. identity: Icon/Amplify Radial 16 + "Amplify" (body/sm-medium, color/text/secondary);
 *  2. the reply body — projected, in order: the answer (`ats-amplify-chat-text`),
 *     optional section headings (`ats-amplify-chat-header`) and lists
 *     (`ol[ats-amplify-chat-numbered-list]`), evidence (data table / chat cards),
 *     a draft or literal value block, a rationale line…;
 *  3. footer: the sources row (`sourcesSummary` + `sources`) and 2–3 follow-up chips
 *     (Button Secondary Small, pill) that send a follow-up prompt;
 *  4. controls: Copy, Thumbs up, Thumbs down, Save prompt (icon-button-no-container)
 *     and an optional right-aligned primary action (`actionLabel`).
 * Groups sit spacing/gap/md (16) apart. Inside the body: paragraph to block 16,
 * paragraph to paragraph and heading to its content spacing/gap/sm (8), 24 above a
 * section heading. Prose (text, headings, lists) is capped at ~70ch (560px); tables,
 * cards and blocks use the full column (800 max, set by the chat column).
 *
 * Thinking state: set `status` ("Searching open jobs…") and the block shows only the
 * status line (amplify-chat/text type=status: Amplify icon + body/sm secondary) with a
 * Stop control; the body, footer and controls are hidden until `status` is cleared.
 *
 *   <ats-amplify-chat-chat-block sourcesSummary="Based on 14 job orders · Updated today"
 *     [followUps]="['Show all 14', 'Find matches for #1', 'Why this order?']" (followUp)="send($event)">
 *     <ats-amplify-chat-text>5 of your 14 open jobs need action today.</ats-amplify-chat-text>
 *     <ats-amplify-chat-header>Needs Attention Today</ats-amplify-chat-header>
 *     <ol ats-amplify-chat-numbered-list>
 *       <li ats-amplify-chat-list-item>Senior Java Developer at Verizon starts Oct 6 with no submittals.</li>
 *       <li ats-amplify-chat-list-item>Data Engineer at PepsiCo has 1 submittal and client priority High.</li>
 *     </ol>
 *   </ats-amplify-chat-chat-block>
 *   <ats-amplify-chat-chat-block status="Ranking 14 job orders…" (stop)="cancel()" />
 *
 * Copy writes the body's visible text to the clipboard and emits it. Thumbs up / down
 * are toggle buttons (aria-pressed); pressing one clears the other.
 */
@Component({
  selector: 'ats-amplify-chat-chat-block',
  imports: [AmplifyChatSourcesRow, AmplifyChatText, Button, Icon, IconButtonNoContainer],
  template: `
    @if (status()) {
      <div class="ats-amplify-chat-chat-block__status">
        <ats-amplify-chat-text type="status">{{ status() }}</ats-amplify-chat-text>
        @if (showStop() !== false) {
          <button ats-button theme="dialogue" size="small" class="ats-amplify-chat-chat-block__stop" (click)="stop.emit()">Stop</button>
        }
      </div>
    } @else {
      <div class="ats-amplify-chat-chat-block__identity">
        <ats-icon class="ats-amplify-chat-chat-block__identity-icon" name="amplify" [size]="16" />
        <span class="ats-amplify-chat-chat-block__identity-name">Amplify</span>
      </div>
    }

    <!-- one projection slot, never inside @if: hidden (not removed) while thinking -->
    <div class="ats-amplify-chat-chat-block__body" #body [hidden]="!!status()"><ng-content /></div>

    @if (!status()) {
      @if (hasSources() || followUpList().length) {
        <div class="ats-amplify-chat-chat-block__footer">
          @if (hasSources()) {
            <ats-amplify-chat-sources-row [summary]="sourcesSummary()" [sources]="sources()" (sourceClick)="sourceClick.emit($event)" />
          }
          @if (followUpList().length) {
            <div class="ats-amplify-chat-chat-block__follow-ups" role="group" aria-label="Suggested follow-ups">
              @for (f of followUpList(); track $index) {
                <button ats-button theme="secondary" size="small" pill (click)="followUp.emit(f)">{{ f }}</button>
              }
            </div>
          }
        </div>
      }

      @if (showActions() !== false || actionLabel()) {
        <div class="ats-amplify-chat-chat-block__controls">
          <div class="ats-amplify-chat-chat-block__actions">
            @if (showActions() !== false) {
              <button ats-icon-button-no-container [icon]="isCopied() ? 'check' : 'copy'"
                [attr.aria-label]="isCopied() ? 'Copied' : 'Copy reply'" (click)="copyReply()"></button>
              <button ats-icon-button-no-container icon="thumbs-up-line" aria-label="Good response"
                [attr.aria-pressed]="rating() === 'up'" [state]="rating() === 'up' ? 'active' : undefined"
                (click)="rate('up')"></button>
              <button ats-icon-button-no-container icon="thumbs-down-line" aria-label="Bad response"
                [attr.aria-pressed]="rating() === 'down'" [state]="rating() === 'down' ? 'active' : undefined"
                (click)="rate('down')"></button>
              <button ats-icon-button-no-container icon="bookmark-outline" aria-label="Save prompt" (click)="savePrompt.emit()"></button>
              <span class="ats-amplify-chat-chat-block__sr" aria-live="polite">{{ isCopied() ? 'Copied' : '' }}</span>
            }
          </div>
          @if (actionLabel()) {
            <button ats-button theme="primary" size="small" pill [iconRight]="actionIcon()" (click)="action.emit()">{{ actionLabel() }}</button>
          }
        </div>
      }
    }
  `,
  styleUrl: './chat-block.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-chat-block',
    role: 'article',
    '[attr.aria-label]': "status() ? 'Amplify is working' : 'Amplify reply'",
    '[attr.aria-busy]': '!!status()',
    '[class.is-status]': '!!status()',
  },
})
export class AmplifyChatChatBlock {
  /** Thinking state: the current step, e.g. "Searching open jobs…". Set → only the status line shows. */
  readonly status = input<string>();
  /** Show the Stop control in the thinking state (default true). */
  readonly showStop = input<boolean | undefined>();
  /** Sources row summary (meta/default), e.g. "Based on 14 job orders · Updated today". Shows the row. */
  readonly sourcesSummary = input<string>();
  /** The records the answer used (the sources row's expanded list). */
  readonly sources = input<AmplifyChatSource[]>();
  /** 2–3 follow-up prompts, shown as chips under the sources row. */
  readonly followUps = input<string[]>();
  /** Copy / thumbs up / thumbs down / Save prompt (default true). */
  readonly showActions = input<boolean | undefined>();
  /** Optional right-aligned primary action (Figma `action`, hidden by default), e.g. "Accept Updates". */
  readonly actionLabel = input<string>();
  /** Optional trailing icon on the action button. */
  readonly actionIcon = input<string>();

  /** A follow-up chip was clicked: send its text as the next prompt. */
  readonly followUp = output<string>();
  /** Copy succeeded; emits the copied text. (Named `copied`, not `copy`, so it never collides with the native DOM copy event.) */
  readonly copied = output<string>();
  /** Thumbs up / down pressed, or `null` when the pressed one is clicked again (cleared). */
  readonly feedback = output<AmplifyChatFeedback | null>();
  readonly savePrompt = output<void>();
  readonly action = output<void>();
  readonly stop = output<void>();
  /** A source in the expanded sources row was activated. */
  readonly sourceClick = output<AmplifyChatSource>();

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');
  protected readonly rating = signal<AmplifyChatFeedback | null>(null);
  protected readonly isCopied = signal(false);
  protected readonly followUpList = computed(() => this.followUps() ?? []);
  protected readonly hasSources = computed(() => !!this.sourcesSummary() || !!this.sources()?.length);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected rate(value: AmplifyChatFeedback): void {
    const next = this.rating() === value ? null : value;
    this.rating.set(next);
    this.feedback.emit(next);
  }

  protected async copyReply(): Promise<void> {
    const text = this.body().nativeElement.innerText.trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // clipboard blocked (permissions / insecure context)
    }
    this.copied.emit(text);
    this.isCopied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.isCopied.set(false), 1500);
  }
}
