import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { IconContainer, IconContainerTheme } from '../icon-container/icon-container';

/** Figma menu-option `Type`: a 16px glyph (default) or an icon-container sm (entity). */
export type MenuOptionType = 'default' | 'entity';
/** Figma menu-option `State`. Hover is also live; `state` forces it (docs). */
export type MenuOptionState = 'default' | 'hover';

/**
 * MenuOption (Figma: "menu-option", 157:2911). One row of a dropdown menu: the Add
 * menu's entity rows (fast-add-menu) and the user menu's rows (user-dropdown-panel).
 * Type × State: default | entity × default | hover. The label is the projected content.
 *
 *   <button ats-menu-option icon="configure-outline">Preferences</button>
 *   <button ats-menu-option type="entity" theme="candidate">Candidate</button>
 *   <button ats-menu-option type="entity" theme="neutral" icon="check-outline">Task</button>
 *
 * Applied as an attribute so the row stays a native button.
 */
@Component({
  selector: 'button[ats-menu-option]',
  imports: [Icon, IconContainer],
  template: `
    @if (typeName() === 'entity') {
      <ats-icon-container class="ats-menu-option__icon-container" size="sm" [theme]="theme()" [icon]="icon()" [background]="background()" />
    } @else {
      <ats-icon class="ats-menu-option__icon" [name]="icon() || 'configure-outline'" [size]="16" color="var(--color-icon-subtle)" />
    }
    <span class="ats-menu-option__label"><ng-content /></span>
  `,
  styleUrl: './menu-option.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-menu-option',
    type: 'button',
    '[attr.data-type]': 'typeName()',
    '[class.is-hover]': "state() === 'hover'",
  },
})
export class MenuOption {
  readonly type = input<MenuOptionType>();
  readonly state = input<MenuOptionState>();
  /** Glyph name. Default type: the 16px glyph (Figma example: configure-outline). Entity type: the icon-container glyph (defaults to the theme's). */
  readonly icon = input<string>();
  /** Entity type: the icon-container theme. */
  readonly theme = input<IconContainerTheme>();
  /** Entity type: icon-container fill override, for an entity with no Figma theme. */
  readonly background = input<string>();

  protected readonly typeName = computed<MenuOptionType>(() => this.type() ?? 'default');
}
