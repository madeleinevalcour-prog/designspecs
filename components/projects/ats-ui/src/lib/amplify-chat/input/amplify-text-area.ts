import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, afterNextRender, computed, inject, input } from '@angular/core';

/** Figma amplify-text-area `size` (only `default` exists). */
export type AmplifyChatTextAreaSize = 'default';

/** Default placeholder (Figma text "What would you like to know or do today?"). */
export const AMPLIFY_CHAT_PLACEHOLDER = 'What would you like to know or do today?';

/**
 * AmplifyChatTextArea (Figma: "amplify-text-area", set 4608:172388, size=default
 * 4608:172389). The text field inside the chat input: borderless, body/default,
 * the placeholder in `field/color/content/placeholder` and the value in
 * `field/color/content/value`.
 *
 * It starts one line tall (20px) and grows with its content up to 400px (Figma
 * max-height), then scrolls. Applied to a native textarea, so value binding,
 * forms, `(keydown.enter)` etc. stay native. While clarifying questions are open,
 * pass `placeholder="Or reply directly…"`. Give it an accessible name.
 *
 *   <textarea ats-amplify-chat-text-area aria-label="Message Amplify" [(ngModel)]="draft"></textarea>
 *   <textarea ats-amplify-chat-text-area aria-label="Message Amplify" placeholder="Or reply directly…"></textarea>
 *
 * Figma's `show chips` (a chip group inside the field) isn't supported: a textarea
 * can't hold chips. Context chips live in AmplifyChatContextContainer.
 */
@Component({
  selector: 'textarea[ats-amplify-chat-text-area]',
  template: '',
  styleUrl: './amplify-text-area.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-text-area',
    rows: '1',
    '[attr.placeholder]': 'placeholderText()',
    '[attr.data-size]': 'sizeName()',
    '(input)': 'resize()',
  },
})
export class AmplifyChatTextArea {
  private readonly el = inject<ElementRef<HTMLTextAreaElement>>(ElementRef).nativeElement;

  /** Placeholder text; defaults to "What would you like to know or do today?". */
  readonly placeholder = input<string>();
  readonly size = input<AmplifyChatTextAreaSize | undefined>('default');

  protected readonly placeholderText = computed(() => this.placeholder() ?? AMPLIFY_CHAT_PLACEHOLDER);
  protected readonly sizeName = computed(() => this.size() ?? 'default');

  constructor() {
    afterNextRender(() => this.resize());
  }

  /** Fit the height to the content (capped by the CSS max-height). Call after setting the value in code. */
  resize(): void {
    const el = this.el;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
}
