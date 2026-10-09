import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, afterNextRender, computed, inject, input, model, signal, viewChild,
} from '@angular/core';
import { Button } from '../../button/button';
import { AmplifyChatLink, AmplifyChatLinkEntity } from '../text/link';

/** Figma amplify-chat/user-bubble `state`. */
export type AmplifyChatUserBubbleState = 'user-bubble' | 'long text' | 'long text expanded' | 'clarify answers';

/**
 * One row of `state=clarify answers`: the question label and the recruiter's answer. Set
 * `entity` when the answer is a record: it shows as the inline entity link (Figma
 * "answer 1 is record").
 */
export interface AmplifyChatUserBubbleAnswer {
  question: string;
  answer: string;
  entity?: AmplifyChatLinkEntity;
  href?: string;
}

let nextId = 0;

/**
 * AmplifyChatUserBubble (Figma: "amplify-chat/user-bubble", 6213:168866). The
 * recruiter's message in Amplify chat: body/default in color/text/body on a
 * color/background/subtle-hover bubble, radius border/radius/sm. Hugs its content
 * up to 440px, then wraps. Right-aligning it in the chat column is the parent's job.
 *
 * Long messages are capped at 8 lines: the bubble measures the message and, when
 * it is taller than the cap, shows `state=long text` (the last 2 lines fade out
 * through an alpha mask, "Show More" below) and toggles to `state=long text
 * expanded` ("Show Less"). The message is the projected content.
 *
 *   <ats-amplify-chat-user-bubble>Make a list of the open jobs I should prioritize today</ats-amplify-chat-user-bubble>
 *   <ats-amplify-chat-user-bubble [(expanded)]="open">{{ pastedJobDescription }}</ats-amplify-chat-user-bubble>
 *
 * Records the recruiter tags in their request use the same inline entity link as
 * Amplify's replies (`a[ats-amplify-chat-link]`, lib/amplify-chat/text):
 *   <ats-amplify-chat-user-bubble>Find candidates for
 *     <a ats-amplify-chat-link entity="job" href="/job/425">425 | Senior Java Developer</a></ats-amplify-chat-user-bubble>
 *
 * `state` forces a variant (docs): "long text" / "long text expanded" show the
 * Show More / Show Less control even for short text; the control still toggles.
 */
@Component({
  selector: 'ats-amplify-chat-user-bubble',
  imports: [AmplifyChatLink, Button],
  template: `
    @if (isAnswers()) {
      <dl class="ats-amplify-chat-user-bubble__answers">
        @for (a of answerRows(); track $index) {
          <div class="ats-amplify-chat-user-bubble__answer">
            <dt class="ats-amplify-chat-user-bubble__question">{{ a.question }}</dt>
            <dd class="ats-amplify-chat-user-bubble__value">
              @if (a.entity) {
                <a ats-amplify-chat-link [entity]="a.entity" [attr.href]="a.href ?? '#'">{{ a.answer }}</a>
              } @else {
                {{ a.answer }}
              }
            </dd>
          </div>
        }
      </dl>
    }
    <div class="ats-amplify-chat-user-bubble__viewport" [id]="viewportId" [hidden]="isAnswers()">
      <div class="ats-amplify-chat-user-bubble__message" #message><ng-content /></div>
    </div>
    @if (isLong()) {
      <button ats-button theme="dialogue" size="small" class="ats-amplify-chat-user-bubble__toggle"
        [attr.aria-expanded]="isExpanded()" [attr.aria-controls]="viewportId" (click)="toggle()">
        {{ isExpanded() ? 'Show Less' : 'Show More' }}
      </button>
    }
  `,
  styleUrl: './user-bubble.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-user-bubble',
    '[class.is-long]': 'isLong()',
    '[class.is-answers]': 'isAnswers()',
    '[class.is-expanded]': 'isLong() && isExpanded()',
    '[attr.data-state]': 'stateName()',
  },
})
export class AmplifyChatUserBubble {
  /** Force a Figma variant (docs). Unset → detected from the message height. */
  readonly state = input<AmplifyChatUserBubbleState>();
  /** Long text expanded. Two-way bindable; unset → collapsed (or per `state`). */
  readonly expanded = model<boolean>();
  /** `state=clarify answers`: the answers to a clarifying-questions round, posted as one message
   *  (up to 3 rows, matching the 3-question cap). Setting answers shows this state. */
  readonly answers = input<AmplifyChatUserBubbleAnswer[]>();

  protected readonly viewportId = `ats-amplify-chat-user-bubble-${nextId++}`;
  private readonly message = viewChild.required<ElementRef<HTMLElement>>('message');
  /** The message is taller than the 8-line cap. */
  private readonly overflowing = signal(false);

  protected readonly answerRows = computed(() => (this.answers() ?? []).slice(0, 3));
  protected readonly isAnswers = computed(() => this.state() === 'clarify answers' || this.answerRows().length > 0);

  protected readonly isLong = computed(() => {
    if (this.isAnswers()) return false;
    const s = this.state();
    return s === 'long text' || s === 'long text expanded' || (s === undefined && this.overflowing());
  });
  protected readonly isExpanded = computed(() => this.expanded() ?? this.state() === 'long text expanded');
  protected readonly stateName = computed<AmplifyChatUserBubbleState>(() =>
    this.isAnswers() ? 'clarify answers' : !this.isLong() ? 'user-bubble' : this.isExpanded() ? 'long text expanded' : 'long text',
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const measure = () => {
        const el = this.message().nativeElement;
        const cap = (parseFloat(getComputedStyle(el).lineHeight) || 20) * 8; // 8 lines, as in the CSS cap
        this.overflowing.set(el.scrollHeight > cap + 1);
      };
      measure();
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(measure);
        ro.observe(this.message().nativeElement);
        destroyRef.onDestroy(() => ro.disconnect());
      }
    });
  }

  protected toggle(): void {
    this.expanded.set(!this.isExpanded());
  }
}
