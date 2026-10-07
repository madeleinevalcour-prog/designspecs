import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, input, model, output, viewChild } from '@angular/core';
import { Button } from '../../button/button';
import { AmplifyChatClarifyKey } from './clarify-key';

/** Figma clarify-something-else `state`. `typing` is also live (while the field has focus). */
export type AmplifyChatClarifySomethingElseState = 'default' | 'typing';

/**
 * AmplifyChatClarifySomethingElse (Figma: "clarify-something-else", set 6335:128906).
 * The last row of a clarifying question: a free-text answer. The pencil clarify-key
 * (type=icon), an inline text field ("Something else", body/default; placeholder in
 * color/text/subtle, value in color/text/body) and, at the end, Skip (Button,
 * Secondary / Small) or the submit FAB.
 *  - state `default` (6335:128884): color/border/subtle row, Skip.
 *  - state `typing` (6335:128895): color/border/focus row. Live while the field has
 *    focus; `state` forces it for docs.
 *  - Once the field has text, Skip is replaced by a small primary FAB (Button, Fab /
 *    Small, arrow-right, aria-label "Submit answer"); clearing the text brings Skip back.
 *
 * ↵ in the field or the FAB emits `submitted` with the trimmed text (ignored when
 * empty). Skip emits `skip`; the parent answers with the recommended option. `value`
 * is two-way bindable. `insertText(text)` appends text and focuses the field (the parent
 * card routes stray keystrokes here).
 *
 *   <ats-amplify-chat-clarify-something-else (submitted)="answer($event)" (skip)="useRecommended()" />
 *   <ats-amplify-chat-clarify-something-else state="typing" value="Within 10 mi of Cambridge" />  <!-- shows the submit FAB -->
 */
@Component({
  selector: 'ats-amplify-chat-clarify-something-else',
  imports: [Button, AmplifyChatClarifyKey],
  template: `
    <ats-amplify-chat-clarify-key type="icon" />
    <input #field class="ats-amplify-chat-clarify-something-else__value" type="text" [attr.aria-label]="placeholderText()"
      [placeholder]="placeholderText()" [value]="value() ?? ''" (input)="value.set($any($event.target).value)" (keydown.enter)="submit($event)" />
    @if (hasText()) {
      <button ats-button class="ats-amplify-chat-clarify-something-else__submit" theme="fab" size="small" icon="arrow-right"
        aria-label="Submit answer" (click)="submit()"></button>
    } @else if (skipShown()) {
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

  /** Emits the trimmed answer on ↵ in the field or the submit FAB. */
  readonly submitted = output<string>();
  /** Emits when Skip is activated. */
  readonly skip = output<void>();

  protected readonly placeholderText = computed(() => this.placeholder() ?? 'Something else');
  protected readonly skipShown = computed(() => this.showSkip() ?? true);
  /** The field has text: the submit FAB replaces Skip. */
  readonly hasText = computed(() => (this.value() ?? '').trim().length > 0);

  private readonly field = viewChild.required('field', { read: ElementRef<HTMLInputElement> });

  /** Moves focus to the text field. */
  focus(): void {
    this.field().nativeElement.focus();
  }

  /** Appends `text` at the end of the field, focuses it and updates `value`. */
  insertText(text: string): void {
    const el = this.field().nativeElement;
    el.focus();
    const end = el.value.length;
    el.setRangeText(text, end, end, 'end');
    this.value.set(el.value);
  }

  protected submit(event?: Event): void {
    event?.preventDefault();
    const text = (this.value() ?? '').trim();
    if (text) this.submitted.emit(text);
  }
}
