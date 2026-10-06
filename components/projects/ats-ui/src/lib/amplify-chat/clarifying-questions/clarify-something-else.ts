import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model, output } from '@angular/core';
import { Button } from '../../button/button';
import { AmplifyChatClarifyKey } from './clarify-key';

/** Figma clarify-something-else `state`. `typing` is also live (while the field has focus). */
export type AmplifyChatClarifySomethingElseState = 'default' | 'typing';

/**
 * AmplifyChatClarifySomethingElse (Figma: "clarify-something-else", set 6335:128906).
 * The last row of a clarifying question: a free-text answer. The pencil clarify-key
 * (type=icon), an inline text field ("Something else", body/default; placeholder in
 * color/text/subtle, value in color/text/body) and Skip (Button, Secondary / Small).
 *  - state `default` (6335:128884): color/border/subtle row.
 *  - state `typing` (6335:128895): color/border/focus row. Live while the field has
 *    focus; `state` forces it for docs.
 *
 * ↵ in the field emits `submitted` with the trimmed text (ignored when empty).
 * Skip emits `skip`; the parent answers with the recommended option. `value` is
 * two-way bindable.
 *
 *   <ats-amplify-chat-clarify-something-else (submitted)="answer($event)" (skip)="useRecommended()" />
 *   <ats-amplify-chat-clarify-something-else state="typing" value="Within 10 mi of Cambridge" />
 */
@Component({
  selector: 'ats-amplify-chat-clarify-something-else',
  imports: [Button, AmplifyChatClarifyKey],
  template: `
    <ats-amplify-chat-clarify-key type="icon" />
    <input class="ats-amplify-chat-clarify-something-else__value" type="text" [attr.aria-label]="placeholderText()"
      [placeholder]="placeholderText()" [value]="value() ?? ''" (input)="value.set($any($event.target).value)" (keydown.enter)="submit($event)" />
    @if (skipShown()) {
      <button ats-button theme="secondary" size="small" pill (click)="skip.emit()">Skip</button>
    }
  `,
  styleUrl: './clarify-something-else.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-clarify-something-else',
    '[class.is-typing]': "state() === 'typing'",
  },
})
export class AmplifyChatClarifySomethingElse {
  readonly state = input<AmplifyChatClarifySomethingElseState>();
  /** The typed answer (two-way: `[(value)]`). */
  readonly value = model<string | undefined>('');
  /** Field placeholder and accessible name. Default "Something else". */
  readonly placeholder = input<string>();
  /** Figma `show skip`. Default true. */
  readonly showSkip = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });

  /** Emits the trimmed answer when ↵ is pressed in the field. */
  readonly submitted = output<string>();
  /** Emits when Skip is activated. */
  readonly skip = output<void>();

  protected readonly placeholderText = computed(() => this.placeholder() ?? 'Something else');
  protected readonly skipShown = computed(() => this.showSkip() ?? true);

  protected submit(event: Event): void {
    event.preventDefault();
    const text = (this.value() ?? '').trim();
    if (text) this.submitted.emit(text);
  }
}
