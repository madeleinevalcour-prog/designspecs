import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

/** Record types with a `color/entity/*` token. */
export type AmplifyChatLinkEntity =
  | 'candidate' | 'job' | 'contact' | 'company' | 'lead'
  | 'opportunity' | 'placement' | 'submission';

/** Hover and focus are live; `state` forces one for docs. */
export type AmplifyChatLinkState = 'default' | 'hover' | 'focus';

/**
 * AmplifyChatLink — the inline entity record link inside Amplify chat prose
 * (Figma: amplify-chat/text type=paragraph-with-links, 6154:20875; mirrors the
 * `link-text` component at its default size). A "●" in the entity color
 * (`color/entity/*`), joined to the record name with a no-break space so the circle
 * never sits alone at a line end, then the name in body/default-medium,
 * link-text/color/default (hover link-text/color/hover). Weight, color and the
 * circle together carry the link, not color alone. The circle is decorative
 * (aria-hidden); the record name is the projected link text.
 *
 *   <a ats-amplify-chat-link entity="job" href="/job/4821">Senior Java Developer</a>
 *   <a ats-amplify-chat-link entity="company" href="/company/112">Verizon</a>
 */
@Component({
  selector: 'a[ats-amplify-chat-link]',
  template: `<span class="ats-amplify-chat-link__circle" aria-hidden="true">●</span>&nbsp;<ng-content />`,
  styleUrl: './link.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-link',
    '[attr.data-entity]': 'resolvedEntity()',
    '[class.is-hover]': "state() === 'hover'",
    '[class.is-focus]': "state() === 'focus'",
  },
})
export class AmplifyChatLink {
  /** Record type; sets the circle color. Default "job". */
  readonly entity = input<AmplifyChatLinkEntity>();
  readonly state = input<AmplifyChatLinkState>();

  protected readonly resolvedEntity = computed<AmplifyChatLinkEntity>(() => this.entity() ?? 'job');
}
