import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, input, model, output, viewChild } from '@angular/core';
import { AmplifyChatTextArea } from './amplify-text-area';
import { AmplifyChatButtonRow } from './button-row';

/** Figma chat-input `size`. */
export type AmplifyChatInputSize = 'full page' | 'docked';

/**
 * AmplifyChatInput (Figma: "chat-input", set 4608:172361). The input box at the
 * bottom of the chat: an AmplifyChatTextArea over an AmplifyChatButtonRow, in a
 * card-bordered box (padding 16, gap 16).
 *  - size `full page` (4510:141056): card/border/radius/default, general/level 2
 *    shadow, buttons with labels.
 *  - size `docked` (4608:172362): border/radius/sm, general/level 1 shadow,
 *    icon-only buttons (each keeps its label as its accessible name).
 *
 * Owns the draft (`value`, two-way bindable): Send is enabled only when the trimmed
 * draft is non-empty. ↵ sends, Shift+↵ adds a new line (IME composition is left
 * alone). Sending emits `send` with the trimmed text and clears the field. The
 * Add File / Add Tools / Prompt Library outputs pass through from the button row.
 * Pass `placeholder="Or reply directly…"` while clarifying questions are open.
 *
 *   <ats-amplify-chat-input (send)="ask($event)" />
 *   <ats-amplify-chat-input size="docked" placeholder="Or reply directly…" (send)="reply($event)" />
 */
@Component({
  selector: 'ats-amplify-chat-input',
  imports: [AmplifyChatTextArea, AmplifyChatButtonRow],
  template: `
    <textarea #field ats-amplify-chat-text-area [attr.aria-label]="label() ?? 'Message Amplify'" [placeholder]="placeholder()"
      [value]="value() ?? ''" (input)="value.set($any($event.target).value)" (keydown.enter)="onEnter($event)"></textarea>
    <ats-amplify-chat-button-row [showLabels]="sizeName() === 'full page'" [canSend]="canSend()" (send)="submit()"
      (addFile)="addFile.emit()" (addTools)="addTools.emit()" (promptLibrary)="promptLibrary.emit()" />
  `,
  styleUrl: './chat-input.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-input', '[attr.data-size]': 'sizeName()' },
})
export class AmplifyChatInput {
  readonly size = input<AmplifyChatInputSize | undefined>('full page');
  /** Placeholder; defaults to "What would you like to know or do today?". */
  readonly placeholder = input<string>();
  /** Accessible name of the text field. Default "Message Amplify". */
  readonly label = input<string>();
  /** The draft text (two-way: `[(value)]`). */
  readonly value = model<string | undefined>('');

  /** Emits the trimmed draft when the recruiter sends (↵ or Send); the field then clears. */
  readonly send = output<string>();
  readonly addFile = output<void>();
  readonly addTools = output<void>();
  readonly promptLibrary = output<void>();

  private readonly field = viewChild.required('field', { read: ElementRef<HTMLTextAreaElement> });
  private readonly textArea = viewChild.required(AmplifyChatTextArea);

  protected readonly sizeName = computed(() => this.size() ?? 'full page');
  protected readonly canSend = computed(() => (this.value() ?? '').trim().length > 0);

  /** Moves focus to the text field. */
  focus(): void {
    this.field().nativeElement.focus();
  }

  protected onEnter(event: Event): void {
    const e = event as KeyboardEvent;
    if (e.shiftKey || e.isComposing) return; // Shift+↵ = new line
    e.preventDefault();
    this.submit();
  }

  protected submit(): void {
    const text = (this.value() ?? '').trim();
    if (!text) return;
    this.send.emit(text);
    const el = this.field().nativeElement;
    el.value = '';
    this.value.set('');
    this.textArea().resize();
  }
}
