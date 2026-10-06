import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../../icon/icon';

/** Figma amplify-chat/text `type`. */
export type AmplifyChatTextType = 'paragraph' | 'status' | 'paragraph-with-links';

/**
 * AmplifyChatText (Figma: "amplify-chat/text", 6148:20800). Reading text in an
 * Amplify chat reply. Fills its parent's width; the text is projected.
 *  - type=paragraph (6148:20794): body/default in color/text/body. `<strong>` / `<b>`
 *    render body/default-medium (at most one phrase per paragraph). Several `<p>`
 *    children get the Figma paragraph spacing between them.
 *  - type=paragraph-with-links (6154:20875): the same paragraph with inline entity
 *    record links — project `a[ats-amplify-chat-link]` (see AmplifyChatLink).
 *  - type=status (6148:20796): the thinking / loading line — the Amplify icon
 *    (Icon/Amplify Radial) + body/sm in color/text/secondary, never link blue.
 *    Name the current step ("Searching open jobs…"). role="status" so the step
 *    change is announced politely.
 *
 *   <ats-amplify-chat-text>5 of your 14 open jobs need action today.</ats-amplify-chat-text>
 *   <ats-amplify-chat-text type="status">Ranking 14 job orders…</ats-amplify-chat-text>
 *   <ats-amplify-chat-text type="paragraph-with-links">
 *     Start with <a ats-amplify-chat-link entity="job" href="…">Senior Java Developer</a> at
 *     <a ats-amplify-chat-link entity="company" href="…">Verizon</a>.
 *   </ats-amplify-chat-text>
 */
@Component({
  selector: 'ats-amplify-chat-text',
  imports: [Icon],
  template: `
    @if (resolvedType() === 'status') {
      <ats-icon class="ats-amplify-chat-text__icon" name="amplify" [size]="16" />
      <span class="ats-amplify-chat-text__status"><ng-content /></span>
    } @else {
      <ng-content />
    }
  `,
  styleUrl: './text.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-text',
    '[class.ats-amplify-chat-text--paragraph]': "resolvedType() !== 'status'",
    '[class.ats-amplify-chat-text--with-links]': "resolvedType() === 'paragraph-with-links'",
    '[class.ats-amplify-chat-text--status]': "resolvedType() === 'status'",
    '[attr.role]': "resolvedType() === 'status' ? 'status' : null",
  },
})
export class AmplifyChatText {
  readonly type = input<AmplifyChatTextType>();
  protected readonly resolvedType = computed<AmplifyChatTextType>(() => this.type() ?? 'paragraph');
}
