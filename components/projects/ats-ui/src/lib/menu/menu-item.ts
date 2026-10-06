import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconContainer, IconContainerTheme } from '../icon-container/icon-container';

/** Figma menu-item `Property 1`. Hover and focus are also live; `state` forces one (docs, or a drag in progress). */
export type MenuItemState = 'default' | 'hover' | 'focus' | 'drag';

/**
 * MenuItem (Figma: "menu-item", 1143:19746). An app tile in the Menu
 * (novo-drag-container): an icon-container md over a body/sm label.
 *  - hover: color/background/hover, plus a 12px "move" handle on top (the top
 *    padding drops by the handle + gap, so the tile keeps its height).
 *  - focus: the hover background with a 2px color/border/focus border.
 *  - drag: the focus look with the handle and the general/level 3 shadow.
 * The label is the projected content.
 *
 *   <button ats-menu-item theme="candidate">Candidates</button>
 *   <button ats-menu-item theme="neutral" icon="dashboard">My Dashboard</button>
 */
@Component({
  selector: 'button[ats-menu-item]',
  imports: [Icon, IconContainer],
  template: `
    <span class="ats-menu-item__handle" aria-hidden="true"><ats-icon name="move" [size]="12" color="var(--color-icon-subtle)" /></span>
    <ats-icon-container class="ats-menu-item__icon-container" size="md" [theme]="theme()" [icon]="icon()" [background]="background()" />
    <span class="ats-menu-item__label"><ng-content /></span>
  `,
  styleUrl: './menu-item.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-menu-item',
    type: 'button',
    '[class.is-hover]': "state() === 'hover'",
    '[class.is-focus]': "state() === 'focus'",
    '[class.is-drag]': "state() === 'drag'",
  },
})
export class MenuItem {
  readonly state = input<MenuItemState>();
  /** Icon-container theme (Figma instance: size=md, theme=candidate). */
  readonly theme = input<IconContainerTheme>();
  /** Glyph name; defaults to the theme's entity glyph. */
  readonly icon = input<string>();
  /** Icon-container fill override, for an app with no Figma theme. */
  readonly background = input<string>();
}
