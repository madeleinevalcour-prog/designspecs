import { Component, computed, input, signal } from '@angular/core';
import { IconContainerTheme, Menu, MenuEdit, MenuHeader, MenuItem, MenuItemState, MenuOption, MenuOptionState, MenuOptionType, MenuVariant } from 'ats-ui';
import { MenuStage } from './menu-stage';

type Part = 'header' | 'item' | 'option' | 'edit';

/**
 * /menu — Menu (Figma "✅ Menu - Finalized" 46:3526): the three variants (apps, with
 * its edit mode; add; user), then each sub-component (MenuHeader, MenuItem,
 * MenuOption, MenuEdit) with its states.
 *
 * Embed mode: `variant` or `part` renders one piece for a docs page, e.g.
 *   /examples/menu?variant=apps
 *   /examples/menu?variant=apps&state=edit
 *   /examples/menu?variant=apps&state=pair&hide=amplify,tasks&grouped=primary
 *   /examples/menu?variant=add · ?variant=user
 *   /examples/menu?part=header&state=edit
 *   /examples/menu?part=item&state=all
 *   /examples/menu?part=option&type=entity&state=hover
 *   /examples/menu?part=edit
 * Params:
 *   variant = apps | add | user (the Menu)
 *     apps: state = menu (default) | edit (in edit mode) | pair (Edit Menu beside the
 *       Menu, sharing state); hide (comma app ids to start unchecked, e.g. amplify,tasks);
 *       grouped (comma folder ids to start Grouped: primary, pay-bill)
 *   part = header | item | option | edit (a sub-component)
 *     header: state = default | edit (Edit Menu title + Done) | close | active (Filter focused)
 *     item: state = default | hover | focus | drag | all (all four, captioned);
 *       theme (icon-container theme, default candidate), icon, label (default "Candidates")
 *     option: type = default | entity; state = default | hover | all (Type × State, captioned);
 *       theme (entity, default jobs), icon, label (default "Label"); width (px, default 240)
 *     edit: the Edit Menu on its own; hide, grouped as above
 */
@Component({
  imports: [Menu, MenuEdit, MenuHeader, MenuItem, MenuOption, MenuStage],
  selector: 'app-menu-page',
  templateUrl: './menu-page.html',
  styleUrl: './menu-page.css',
})
export class MenuPage {
  // Bound from query params. Absent params arrive as `undefined`, so defaults live in computeds.
  readonly variant = input<MenuVariant>();
  readonly part = input<Part>();
  readonly state = input<string>();
  readonly type = input<MenuOptionType>();
  readonly theme = input<IconContainerTheme>();
  readonly icon = input<string>();
  readonly label = input<string>();
  readonly width = input<string>();
  readonly hide = input<string>();
  readonly grouped = input<string>();

  protected readonly embed = computed(() => !!(this.variant() || this.part()));
  protected readonly embedState = computed(() => this.state() ?? 'default');
  protected readonly itemStates = computed<MenuItemState[]>(() =>
    this.state() === 'all' ? this.allItemStates : [(this.state() as MenuItemState) ?? 'default'],
  );
  protected readonly itemTheme = computed(() => this.theme() ?? 'candidate');
  protected readonly itemLabel = computed(() => this.label() ?? 'Candidates');
  protected readonly optionTheme = computed(() => this.theme() ?? 'jobs');
  protected readonly optionLabel = computed(() => this.label() ?? 'Label');
  protected readonly optionWidth = computed(() => Number(this.width()) || 240);

  protected readonly allItemStates: MenuItemState[] = ['default', 'hover', 'focus', 'drag'];
  protected readonly optionMatrix: { type: MenuOptionType; state: MenuOptionState }[] = [
    { type: 'default', state: 'default' }, { type: 'default', state: 'hover' },
    { type: 'entity', state: 'default' }, { type: 'entity', state: 'hover' },
  ];
  protected readonly last = signal('');
  protected readonly filter = signal('');
}
