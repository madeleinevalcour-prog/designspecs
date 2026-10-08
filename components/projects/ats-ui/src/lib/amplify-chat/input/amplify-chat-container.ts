import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, linkedSignal, output, viewChild } from '@angular/core';
import { AmplifyChatClarifyingQuestions } from '../clarifying-questions/clarifying-questions';
import { AmplifyChatClarifyAnswer, AmplifyChatClarifyingQuestion } from '../clarifying-questions/clarifying-questions-model';
import { AmplifyChatContextContainer, AmplifyChatContextItem } from './amplify-context-container';
import { AmplifyChatInput, AmplifyChatInputSize } from './chat-input';

/**
 * AmplifyChatContainer (Figma: "amplify-chat-container", 4527:169494). The input area
 * at the bottom of the conversation: AmplifyChatContextContainer over AmplifyChatInput
 * (gap 8), both in the same `size`.
 *  - No `context` items = Figma `show context` off: just the input.
 *  - With `questions` (instance 6337:209113 in 6337:209104): the
 *    AmplifyChatClarifyingQuestions card replaces the context row and the input
 *    placeholder becomes "Or reply directly…". Sending from the input answers the
 *    current question. The context row returns once the round is completed or
 *    dismissed (or when `questions` is cleared).
 *
 * While the card is open, typing anywhere in the container outside a text field goes
 * to the card's "Something else" field (see AmplifyChatClarifyingQuestions); typing
 * in the chat input stays in the chat input. Tab goes from the card to the input.
 * `generating` passes to the input (Stop next to Send; Stop emits `stop`).
 *
 * Outputs: `send(text)` (only when no questions are open), `stop`, the clarifying
 * `answered` / `completed` / `dismissed`, the context `removed` / `add`, and the
 * button-row passthroughs.
 *
 *   <ats-amplify-chat-container [context]="['Tyler Brooks']" (send)="ask($event)" />
 *   <ats-amplify-chat-container size="docked" [questions]="round" (completed)="run($event)" />
 */
@Component({
  selector: 'ats-amplify-chat-container',
  imports: [AmplifyChatContextContainer, AmplifyChatInput, AmplifyChatClarifyingQuestions],
  template: `
    @if (asking()) {
      <ats-amplify-chat-clarifying-questions [size]="sizeName()" [questions]="questions()"
        (answered)="answered.emit($event)" (completed)="finish($event)" (dismissed)="dismiss()" />
    } @else if (contextItems().length) {
      <ats-amplify-chat-context-container [size]="sizeName()" [items]="contextItems()" (removed)="removed.emit($event)" (add)="add.emit()" />
    }
    <ats-amplify-chat-input [size]="sizeName()" [showLabels]="showLabels()" [placeholder]="asking() ? 'Or reply directly…' : placeholder()" (send)="onSend($event)"
      [generating]="generating()" (stop)="stop.emit()"
      (addFile)="addFile.emit()" (addTools)="addTools.emit()" (promptLibrary)="promptLibrary.emit()" />
  `,
  styleUrl: './amplify-chat-container.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-container', '[attr.data-size]': 'sizeName()', '(keydown)': 'onKey($event)' },
})
export class AmplifyChatContainer {
  readonly size = input<AmplifyChatInputSize | undefined>('full page');
  /** Button labels in the input (default: by size). See AmplifyChatInput.showLabels. */
  readonly showLabels = input<boolean | undefined>();
  /** Records in the context row (chips). Empty hides the row. */
  readonly context = input<AmplifyChatContextItem[] | undefined>([]);
  /** A clarifying-questions round; while open it replaces the context row. */
  readonly questions = input<AmplifyChatClarifyingQuestion[] | undefined>();
  /** Input placeholder when no questions are open. */
  readonly placeholder = input<string>();
  /** A reply is generating: shows Stop in the input and keeps Send disabled. */
  readonly generating = input<boolean | undefined, unknown>(false, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });

  readonly send = output<string>();
  /** Emits when Stop is activated in the input. */
  readonly stop = output<void>();
  readonly answered = output<{ index: number; answer: AmplifyChatClarifyAnswer }>();
  readonly completed = output<AmplifyChatClarifyAnswer[]>();
  readonly dismissed = output<void>();
  readonly removed = output<string>();
  readonly add = output<void>();
  readonly addFile = output<void>();
  readonly addTools = output<void>();
  readonly promptLibrary = output<void>();

  private readonly card = viewChild(AmplifyChatClarifyingQuestions);

  protected readonly sizeName = computed(() => this.size() ?? 'full page');
  protected readonly contextItems = computed(() => this.context() ?? []);
  /** True while the clarifying card is shown (reopens when `questions` changes). */
  readonly asking = linkedSignal(() => (this.questions() ?? []).length > 0);

  protected onSend(text: string): void {
    const card = this.card();
    if (this.asking() && card) card.answerCustom(text);
    else this.send.emit(text);
  }

  /** Keys from outside the card (and outside the chat input) go to the card's Something else. */
  protected onKey(event: KeyboardEvent): void {
    if (this.asking()) this.card()?.routeKey(event);
  }

  protected finish(answers: AmplifyChatClarifyAnswer[]): void {
    this.asking.set(false);
    this.completed.emit(answers);
  }

  protected dismiss(): void {
    this.asking.set(false);
    this.dismissed.emit();
  }
}
