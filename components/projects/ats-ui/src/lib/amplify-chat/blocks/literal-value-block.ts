import { ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, inject, input, output, signal } from '@angular/core';
import { IconButtonNoContainer } from '../../icon-button-no-container/icon-button-no-container';

/** Figma amplify-chat/literal-value-block `Property 1`. Hover is also live. */
export type AmplifyChatLiteralValueBlockState = 'default' | 'hover';

/**
 * AmplifyChatLiteralValueBlock (Figma: "amplify-chat/literal-value-block", 6152:117821).
 * Text the recruiter copies and uses exactly as written: Boolean search strings,
 * exact field values, short templates (the renderer maps a fenced code block here).
 * body/default on color/background/muted, 1px card/color/border/default, radius
 * border/radius/xsm. The value renders unchanged (no smart quotes, no markdown)
 * and wraps inside the block.
 *  - default: the value only.
 *  - hover (or keyboard focus inside): border chip/color/border/default/hover and the
 *    copy action (icon-button-no-container, theme=secondary, copy icon) at the right.
 * Copy writes the exact `value` string to the clipboard (navigator.clipboard) and
 * briefly shows a check; wrapping is visual only, so no line breaks are added.
 *
 *   <ats-amplify-chat-literal-value-block value='("Java" OR "J2EE") AND "Spring Boot"' />
 *
 * `state="hover"` forces the hover look (docs).
 */
@Component({
  selector: 'ats-amplify-chat-literal-value-block',
  imports: [IconButtonNoContainer],
  template: `
    <div class="ats-amplify-chat-literal-value-block__viewport">
      <p class="ats-amplify-chat-literal-value-block__value">{{ value() }}</p>
    </div>
    <button ats-icon-button-no-container class="ats-amplify-chat-literal-value-block__copy"
      [icon]="isCopied() ? 'check' : 'copy'" [attr.aria-label]="isCopied() ? 'Copied' : (copyLabel() ?? 'Copy')"
      (click)="copy()"></button>
    <span class="ats-amplify-chat-literal-value-block__status" aria-live="polite">{{ isCopied() ? 'Copied' : '' }}</span>
  `,
  styleUrl: './literal-value-block.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-literal-value-block',
    '[class.is-hover]': "state() === 'hover'",
    '[class.is-copied]': 'isCopied()',
  },
})
export class AmplifyChatLiteralValueBlock {
  /** The exact string. Rendered and copied unchanged. */
  readonly value = input.required<string>();
  /** Force the hover look (docs). */
  readonly state = input<AmplifyChatLiteralValueBlockState>();
  /** Accessible name of the copy button (default "Copy"), e.g. "Copy Boolean string". */
  readonly copyLabel = input<string>();
  /** Emits the copied string after a successful copy. */
  readonly copied = output<string>();

  protected readonly isCopied = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(): Promise<void> {
    const text = this.value();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // clipboard blocked (permissions / insecure context): leave the state unchanged
    }
    this.copied.emit(text);
    this.isCopied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.isCopied.set(false), 1500);
  }
}
