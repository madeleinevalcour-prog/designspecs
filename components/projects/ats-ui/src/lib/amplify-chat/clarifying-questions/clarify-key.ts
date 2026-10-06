import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../../icon/icon';

export type AmplifyChatClarifyKeyType = 'number' | 'icon';
/** Figma clarify-key `state`; follows the parent option row. */
export type AmplifyChatClarifyKeyState = 'default' | 'active' | 'selected';

/**
 * AmplifyChatClarifyKey (Figma: "clarify-key", set 6334:28241). The 24px key badge
 * at the start of a clarifying-question option.
 *  - type `number` shows the 1–4 shortcut (input/label/field-label); type `icon`
 *    shows the 12px edit-outline pencil, for the "Something else" row.
 *  - state `default` (6334:28232): color/background/subtle-hover, text secondary.
 *  - state `active` (6334:28234): color/background/default + color/border/default, text body.
 *  - state `selected` (6334:28236): color/background/hover + color/border/focus, text link.
 * Inside AmplifyChatClarifyOption the key follows the row's hover / focus / selected
 * state on its own; set `state` only when using the key standalone (or for docs).
 * Decorative (aria-hidden): the shortcut is announced by the option.
 *
 *   <ats-amplify-chat-clarify-key number="2" state="selected" />
 *   <ats-amplify-chat-clarify-key type="icon" />
 */
@Component({
  selector: 'ats-amplify-chat-clarify-key',
  imports: [Icon],
  template: `
    @if (typeName() === 'icon') {
      <ats-icon name="edit-outline" [size]="12" color="var(--_key-icon)" />
    } @else {
      <span class="ats-amplify-chat-clarify-key__number">{{ number() ?? '1' }}</span>
    }
  `,
  styleUrl: './clarify-key.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-clarify-key',
    'aria-hidden': 'true',
    '[attr.data-type]': 'typeName()',
    '[class.is-active]': "state() === 'active'",
    '[class.is-selected]': "state() === 'selected'",
  },
})
export class AmplifyChatClarifyKey {
  readonly type = input<AmplifyChatClarifyKeyType | undefined>('number');
  readonly state = input<AmplifyChatClarifyKeyState>();
  /** The shortcut shown by type=number (Figma default "1"). */
  readonly number = input<string | number | undefined>('1');

  protected readonly typeName = computed(() => this.type() ?? 'number');
}
