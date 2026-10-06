import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, numberAttribute } from '@angular/core';

/** Figma amplify-chat/header `level`: section = markdown `##`, label = `###`. */
export type AmplifyChatHeaderLevel = 'section' | 'label';

/**
 * AmplifyChatHeader (Figma: "amplify-chat/header", 6147:20798). A heading inside an
 * Amplify chat reply. Fills its parent's width; the heading text is projected.
 *  - level=section (6147:20794): `##` → title/sm in color/text/headline.
 *  - level=label (6147:20796): `###` → body/default-medium in color/text/headline.
 * Title case, 2–5 words, no numbering, no trailing punctuation. Rendered as
 * role="heading"; `ariaLevel` defaults to 3 (section) / 4 (label) so it sits below
 * the chat panel's own title — override it to fit the host page.
 *
 *   <ats-amplify-chat-header>Needs Attention Today</ats-amplify-chat-header>
 *   <ats-amplify-chat-header level="label">Can Wait</ats-amplify-chat-header>
 */
@Component({
  selector: 'ats-amplify-chat-header',
  template: `<ng-content />`,
  styleUrl: './header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-header',
    role: 'heading',
    '[attr.aria-level]': 'resolvedAriaLevel()',
    '[class.ats-amplify-chat-header--section]': "resolvedLevel() === 'section'",
    '[class.ats-amplify-chat-header--label]': "resolvedLevel() === 'label'",
  },
})
export class AmplifyChatHeader {
  readonly level = input<AmplifyChatHeaderLevel>();
  readonly ariaLevel = input(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)) });

  protected readonly resolvedLevel = computed<AmplifyChatHeaderLevel>(() => this.level() ?? 'section');
  protected readonly resolvedAriaLevel = computed(() => this.ariaLevel() ?? (this.resolvedLevel() === 'section' ? 3 : 4));
}
