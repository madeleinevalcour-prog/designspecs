import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { BowlingAlleyController, BowlingAlleyMenuMode } from '../bowling-alley/bowling-alley-controller';
import { BOWLING_ALLEY_ADD_ITEMS } from '../bowling-alley/bowling-alley-data';
import { MenuApps } from './menu-apps';
import { MenuEdit } from './menu-edit';
import { MenuOption } from './menu-option';
import { iconContainerTheme } from './menu-theme';

/**
 * Menu variants, named per Figma ("✅ Menu - Finalized" 46:3526):
 *  - `apps`: the app Menu (novo-drag-container 1217:58484), with its edit mode, the Edit Menu (menu-edit 1217:58486).
 *  - `add`: the Add menu (fast-add-menu 4711:42682).
 *  - `user`: the user menu (user-dropdown-panel 168:19961).
 */
export type MenuVariant = 'apps' | 'add' | 'user';

/**
 * Menu (Figma "✅ Menu - Finalized" 46:3526). One component for the bowling alley's
 * Menu, Add and user overlays, built from its sub-components MenuHeader, MenuItem,
 * MenuOption and MenuEdit.
 *  - `apps`: a MenuHeader (title, Add/Remove, Filter) over the app grid of MenuItems.
 *    Add/Remove swaps to the Edit Menu (MenuEdit); Done swaps back. Apps unchecked in the
 *    Edit Menu are left out; a folder with "Grouped" on shows as its own labelled section.
 *    Drag a tile, or Alt+Arrow keys, to reorder. Minimum height 520px (Figma 4266:86971).
 *  - `add`: entity MenuOptions (icon-container sm), one per record type.
 *  - `user`: default MenuOptions: Preferences, Logout.
 *
 * State (order, hidden apps, Grouped folders, edit mode) lives in the BowlingAlleyController:
 * the bowling-alley shell's when inside one, otherwise a private one, so the Menu also
 * works on its own.
 *
 *   <ats-menu variant="apps" (selected)="open($event)" (closed)="close()" />
 *   <ats-menu variant="add" (selected)="create($event)" />
 *   <ats-menu variant="user" (selected)="$event === 'logout' && logout()" />
 */
@Component({
  selector: 'ats-menu',
  imports: [MenuApps, MenuEdit, MenuOption],
  template: `
    @switch (variantName()) {
      @case ('add') {
        <div class="ats-dropdown-card ats-menu__add">
          @for (item of addItems; track item.label) {
            <button ats-menu-option type="entity" [theme]="iconTheme(item.color)" [icon]="item.glyph" (click)="selected.emit(item.label)">{{ item.label }}</button>
          }
        </div>
      }
      @case ('user') {
        <div class="ats-dropdown-card ats-menu__user">
          <button ats-menu-option icon="configure-outline" (click)="selected.emit('preferences')">Preferences</button>
          <button ats-menu-option icon="logout" (click)="selected.emit('logout')">Logout</button>
        </div>
      }
      @default {
        @if (ctrl.menuMode() === 'edit') {
          <ats-menu-edit [autofocus]="autofocus()" [placeholder]="placeholder()" (done)="ctrl.setMenuMode('menu')" (closed)="closed.emit()" />
        } @else {
          <ats-menu-apps [autofocus]="autofocus()" [placeholder]="placeholder()" (closed)="closed.emit()" (selected)="selected.emit($event)"
            (addRemove)="ctrl.setMenuMode('edit')" />
        }
      }
    }
  `,
  styleUrls: ['./dropdown-card.css', './menu.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-menu', '[attr.data-variant]': 'variantName()' },
  // share the shell's (or page's) controller; standalone, give the Menu and its parts one of their own
  providers: [
    {
      provide: BowlingAlleyController,
      useFactory: () => inject(BowlingAlleyController, { optional: true, skipSelf: true }) ?? new BowlingAlleyController(),
    },
  ],
})
export class Menu implements OnInit {
  protected readonly ctrl = inject(BowlingAlleyController);

  /** apps (default) | add | user. */
  readonly variant = input<MenuVariant>();
  /** apps only: start in `menu` (the grid) or `edit` (the Edit Menu). Unset = the controller's current mode. */
  readonly mode = input<BowlingAlleyMenuMode>();
  /** apps only: focus the Filter when shown (Figma: "Focus keyboard automatically on search input"). */
  readonly autofocus = input(true, { transform: booleanAttribute });
  /** apps only: the Filter placeholder. */
  readonly placeholder = input('Filter Items');

  /** A row or tile was picked: the app / record-type label, or `preferences` / `logout` (user). */
  readonly selected = output<string>();
  /** apps only: Escape in the Filter. */
  readonly closed = output<void>();

  protected readonly variantName = computed<MenuVariant>(() => this.variant() ?? 'apps');
  protected readonly addItems = BOWLING_ALLEY_ADD_ITEMS;
  protected readonly iconTheme = iconContainerTheme;

  ngOnInit() {
    // before the first render, so the Menu opens straight into the requested mode
    const m = this.mode();
    if (m) this.ctrl.setMenuMode(m);
  }
}
