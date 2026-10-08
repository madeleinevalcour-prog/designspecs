import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, input, model, output, viewChild } from '@angular/core';
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
 * `generating` (a reply is being written) shows Stop next to Send and keeps Send
 * disabled; Stop emits `stop`. ↵ doesn't send while generating.
 *
 *   <ats-amplify-chat-input (send)="ask($event)" />
 *   <ats-amplify-chat-input size="docked" placeholder="Or reply directly…" (send)="reply($event)" />
 *   <ats-amplify-chat-input [generating]="busy()" (send)="ask($event)" (stop)="cancel()" />
 */
@Component({
  selector: 'ats-amplify-chat-input',
  imports: [AmplifyChatTextArea, AmplifyChatButtonRow],
  template: `
    <textarea #field ats-amplify-chat-text-area [attr.aria-label]="label() ?? 'Message Amplify'" [placeholder]="placeholder()"
      [value]="value() ?? ''" (input)="value.set($any($event.target).value)" (keydown.enter)="onEnter($event)"></textarea>
    <ats-amplify-chat-button-row [showLabels]="labels()" [canSend]="canSend()" (send)="submit()"
      [generating]="isGenerating()" (stop)="stop.emit()"
      (addFile)="addFile.emit()" (addTools)="addTools.emit()" (promptLibrary)="promptLibrary.emit()" />
  `,
  styleUrl: './chat-input.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-input', '[attr.data-size]': 'sizeName()' },
})
export class AmplifyChatInput {
  readonly size = input<AmplifyChatInputSize | undefined>('full page');
  /** Button labels. Default: shown in full page, icon-only in docked. Full-page chat turns them
   *  off once a conversation has started (patterns doc). */
  readonly showLabels = input<boolean | undefined>();
  /** Placeholder; defaults to "What would you like to know or do today?". */
  readonly placeholder = input<string>();
  /** Accessible name of the text field. Default "Message Amplify". */
  readonly label = input<string>();
  /** The draft text (two-way: `[(value)]`). */
  readonly value = model<string | undefined>('');
  /** A reply is generating: Stop shows next to Send, and Send is disabled. Default false. */
  readonly generating = input<boolean | undefined, unknown>(false, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });

  /** Emits the trimmed draft when the recruiter sends (↵ or Send); the field then clears. */
  readonly send = output<string>();
  /** Emits when Stop is activated (while `generating`). */
  readonly stop = output<void>();
  readonly addFile = output<void>();
  readonly addTools = output<void>();
  readonly promptLibrary = output<void>();

  private readonly field = viewChild.required('field', { read: ElementRef<HTMLTextAreaElement> });
  private readonly textArea = viewChild.required(AmplifyChatTextArea);

  protected readonly sizeName = computed(() => this.size() ?? 'full page');
  protected readonly labels = computed(() => this.showLabels() ?? this.sizeName() === 'full page');
  protected readonly isGenerating = computed(() => this.generating() ?? false);
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
    if (!text || this.isGenerating()) return;
    this.send.emit(text);
    const el = this.field().nativeElement;
    el.value = '';
    this.value.set('');
    this.textArea().resize();
  }
}
