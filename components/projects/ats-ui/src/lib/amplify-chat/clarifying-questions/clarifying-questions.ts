import {
  ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, ElementRef, ViewEncapsulation, computed, effect, inject, input, linkedSignal, output, signal,
  untracked, viewChild,
} from '@angular/core';
import { IconButtonNoContainer } from '../../icon-button-no-container/icon-button-no-container';
import { AmplifyChatClarifyOption, AmplifyChatClarifyOptionState } from './clarify-option';
import { AmplifyChatClarifySomethingElse } from './clarify-something-else';
import { AmplifyChatClarifyAnswer, AmplifyChatClarifyingQuestion } from './clarifying-questions-model';

/** Figma clarifying-questions `size`. */
export type AmplifyChatClarifyingQuestionsSize = 'full page' | 'docked';

let nextId = 0;

/** Text fields keep their own keystrokes (Something else itself, the chat input, …). */
const isEditable = (el: Element | null): boolean =>
  !!el?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]');

/**
 * AmplifyChatClarifyingQuestions (Figma: "clarifying-questions", set 6336:28366). The
 * card Amplify shows above the chat input when a request is ambiguous: a header
 * (question, pager "2 of 3" with previous / next, dismiss), optional help text, 2–4
 * AmplifyChatClarifyOption rows and the AmplifyChatClarifySomethingElse row, in a
 * Border/Amplify Gradient card.
 *  - size `full page` (6336:28246): card/border/radius/default, general/level 2.
 *  - size `docked` (6336:28306): border/radius/sm, general/level 1.
 *
 * Behaviour (patterns doc, "Clarifying questions"):
 *  - The options are a radiogroup labelled by the question (roving tabindex).
 *    ↑ ↓ move between options, ↵ / click selects, 1–4 choose directly while the
 *    Something else field is empty.
 *  - Typing goes to Something else by default: printable keys (no Ctrl / ⌘ / Alt)
 *    pressed anywhere in the card that isn't a text field land in the field. The
 *    parent AmplifyChatContainer forwards keys from the rest of the container via
 *    `routeKey(event)`; keys pressed with focus on the page body are routed too when
 *    this is the only clarifying-questions card on the page. Once the field has
 *    text, digits are text. Tab order: options → Something else → Skip / submit FAB
 *    → (the chat input, after the card).
 *  - Choosing an option (or ↵ in Something else) answers the question and moves to
 *    the next one; answering the last emits `completed` with every answer.
 *  - Skip answers with the recommended option (first option with `recommended`,
 *    else the first option). Previous answers stay selected when paging back.
 *  - The pager is hidden for a single question; the step is announced politely.
 *  - Dismiss (×) emits `dismissed`; the parent removes the card.
 *  - `answerCustom(text)` answers the current question with typed text (the chat
 *    input's "Or reply directly…" path).
 *
 *   <ats-amplify-chat-clarifying-questions [questions]="questions" (completed)="run($event)" (dismissed)="close()" />
 */
@Component({
  selector: 'ats-amplify-chat-clarifying-questions',
  imports: [IconButtonNoContainer, AmplifyChatClarifyOption, AmplifyChatClarifySomethingElse],
  template: `
    <div class="ats-amplify-chat-clarifying-questions__header">
      <p class="ats-amplify-chat-clarifying-questions__question" [id]="qid">{{ current()?.question }}</p>
      @if (list().length > 1) {
        <div class="ats-amplify-chat-clarifying-questions__pager">
          <button ats-icon-button-no-container icon="previous" aria-label="Previous question" [disabled]="index() === 0" (click)="go(index() - 1)"></button>
          <span class="ats-amplify-chat-clarifying-questions__step" aria-live="polite">{{ index() + 1 }} of {{ list().length }}</span>
          <button ats-icon-button-no-container icon="next" aria-label="Next question" [disabled]="index() >= list().length - 1" (click)="go(index() + 1)"></button>
        </div>
      }
      <button ats-icon-button-no-container icon="close" aria-label="Dismiss questions" (click)="dismissed.emit()"></button>
    </div>
    @if (current()?.help) {
      <p class="ats-amplify-chat-clarifying-questions__help" [id]="hid">{{ current()?.help }}</p>
    }
    <div class="ats-amplify-chat-clarifying-questions__options" role="radiogroup" [attr.aria-labelledby]="qid"
      [attr.aria-describedby]="current()?.help ? hid : null" (keydown)="onKey($event)">
      @for (o of options(); track $index; let i = $index) {
        <button ats-amplify-chat-clarify-option [type]="o.type ?? 'text'" [number]="i + 1" [label]="o.label"
          [recommended]="o.recommended" [recordLink]="o.recordLink" [recordLinkEntity]="o.recordLinkEntity"
          [description]="o.description" [entity]="o.entity" [fields]="o.fields ?? []"
          [state]="optionState(i)" [attr.tabindex]="i === tabStop() ? 0 : -1" (click)="choose(i)"></button>
      }
      @if (current()?.allowSomethingElse !== false) {
        <ats-amplify-chat-clarify-something-else [(value)]="draft" (submitted)="answerCustom($event)" (skip)="skip()" />
      }
    </div>
  `,
  styleUrl: './clarifying-questions.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-clarifying-questions', '[attr.data-size]': 'sizeName()', '(keydown)': 'routeKey($event)' },
})
export class AmplifyChatClarifyingQuestions {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly size = input<AmplifyChatClarifyingQuestionsSize | undefined>('full page');
  /** The round: up to 3 questions, asked one at a time. */
  readonly questions = input<AmplifyChatClarifyingQuestion[] | undefined>([]);

  /** Emits each answer as it is given (with the question index). */
  readonly answered = output<{ index: number; answer: AmplifyChatClarifyAnswer }>();
  /** Emits when the × is activated. */
  readonly dismissed = output<void>();
  /** Emits every answer once the last question is answered. */
  readonly completed = output<AmplifyChatClarifyAnswer[]>();

  protected readonly qid = `ats-acq-q-${nextId++}`;
  protected readonly hid = `${this.qid}-help`;
  protected readonly sizeName = computed(() => this.size() ?? 'full page');
  protected readonly list = computed(() => this.questions() ?? []);
  /** Current question index (resets when `questions` changes). */
  readonly index = linkedSignal({ source: this.list, computation: () => 0 });
  /** Answers so far, by question index. */
  readonly answers = linkedSignal<AmplifyChatClarifyingQuestion[], (AmplifyChatClarifyAnswer | undefined)[]>({
    source: this.list, computation: () => [],
  });
  protected readonly current = computed(() => this.list()[this.index()]);
  protected readonly options = computed(() => (this.current()?.options ?? []).slice(0, 4));
  protected readonly draft = signal<string | undefined>('');
  private readonly focusIdx = signal(-1);
  private readonly somethingElse = viewChild(AmplifyChatClarifySomethingElse);
  protected readonly tabStop = computed(() => {
    const f = this.focusIdx();
    if (f >= 0) return f;
    const a = this.answers()[this.index()];
    return a?.option ?? 0;
  });

  constructor() {
    // New question: clear the Something else draft (or show the earlier typed answer).
    effect(() => {
      const i = this.index();
      untracked(() => {
        const a = this.answers()[i];
        this.draft.set(a?.via === 'custom' ? a.value : '');
        this.focusIdx.set(-1);
      });
    });

    // Keys typed with nothing focused (page body) go to Something else, but only when
    // this is the only card on the page (otherwise it's ambiguous which one is meant).
    const doc = inject(DOCUMENT);
    const onDocKey = (e: KeyboardEvent) => {
      if (e.target === doc.body && doc.querySelectorAll('.ats-amplify-chat-clarifying-questions').length === 1) this.routeKey(e);
    };
    doc.addEventListener('keydown', onDocKey);
    inject(DestroyRef).onDestroy(() => doc.removeEventListener('keydown', onDocKey));
  }

  /**
   * Handles a keystroke from the card, the surrounding chat container or the page
   * body: 1–4 choose an option while Something else is empty; any other printable
   * key (no Ctrl / ⌘ / Alt) is typed into Something else. Text fields keep their own
   * keys. Returns true when the key was handled (and default-prevented).
   */
  routeKey(e: KeyboardEvent): boolean {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing || e.key.length !== 1) return false;
    const target = e.target as HTMLElement;
    if (isEditable(target)) return false;
    const empty = (this.draft() ?? '') === '';
    if (empty && /^[1-4]$/.test(e.key)) {
      const i = Number(e.key) - 1;
      if (i < this.options().length) {
        e.preventDefault();
        this.choose(i);
        return true;
      }
    }
    const field = this.somethingElse();
    if (!field) return false;
    // Space activates the focused button; a leading space is never meant as text.
    if (e.key === ' ' && (empty || target.closest('button, a, [role="button"]'))) return false;
    e.preventDefault();
    field.insertText(e.key);
    return true;
  }

  protected optionState(i: number): AmplifyChatClarifyOptionState | undefined {
    return this.answers()[this.index()]?.option === i ? 'selected' : undefined;
  }

  /** Go to question `i` (pager). */
  go(i: number): void {
    if (i >= 0 && i < this.list().length) this.index.set(i);
  }

  /** Answer the current question with option `i`. */
  choose(i: number, via: 'option' | 'skip' = 'option'): void {
    const o = this.options()[i];
    if (!o) return;
    const q = this.current()!;
    this.record({ question: q.question, label: q.label ?? q.question, value: o.value ?? o.label, option: i, via, entity: o.type === 'record' ? (o.entity ?? 'job') : undefined });
  }

  /** Answer the current question with typed text. */
  answerCustom(text: string): void {
    const t = text.trim();
    if (!t || !this.current()) return;
    const q = this.current()!;
    this.record({ question: q.question, label: q.label ?? q.question, value: t, option: null, via: 'custom' });
  }

  /** Answer with the recommended option. */
  skip(): void {
    const r = this.options().findIndex((o) => !!o.recommended);
    this.choose(r < 0 ? 0 : r, 'skip');
  }

  private record(answer: AmplifyChatClarifyAnswer): void {
    const index = this.index();
    const next = [...this.answers()];
    next[index] = answer;
    this.answers.set(next);
    this.answered.emit({ index, answer });
    const all = this.list();
    const firstOpen = all.findIndex((_, i) => !next[i]);
    if (firstOpen < 0) {
      this.completed.emit(next as AmplifyChatClarifyAnswer[]);
    } else {
      // advance to the next unanswered question (after this one if possible)
      const after = all.findIndex((_, i) => i > index && !next[i]);
      this.index.set(after >= 0 ? after : firstOpen);
      // keep keyboard users in the card; don't steal focus from the chat input
      if (this.el.contains(document.activeElement)) queueMicrotask(() => this.focusOption(this.tabStop()));
    }
  }

  protected onKey(event: KeyboardEvent): void {
    const inField = (event.target as HTMLElement).tagName === 'INPUT';
    const count = this.options().length;
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const buttons = this.optionButtons();
    const pos = buttons.indexOf(event.target as HTMLElement);
    if (pos < 0 && !inField) return;
    event.preventDefault();
    // stops: the options, then the Something else field (when shown)
    const field = this.el.querySelector<HTMLInputElement>('.ats-amplify-chat-clarify-something-else__value');
    const total = count + (field ? 1 : 0);
    const from = pos < 0 ? count : pos;
    const to = event.key === 'ArrowDown' ? (from + 1) % total : (from - 1 + total) % total;
    if (to === count && field) field.focus();
    else this.focusOption(to);
  }

  private optionButtons(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>('.ats-amplify-chat-clarify-option'));
  }

  private focusOption(i: number): void {
    this.focusIdx.set(i);
    this.optionButtons()[i]?.focus();
  }
}
