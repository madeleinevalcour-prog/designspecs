import { AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { BowlingAlleyController } from '../bowling-alley/bowling-alley-controller';
import { BOWLING_ALLEY_MENU_APPS, BowlingAlleyMenuApp, matches } from '../bowling-alley/bowling-alley-data';
import { CheckList } from '../checkbox-label/check-list';
import { CheckboxLabel } from '../checkbox-label/checkbox-label';
import { MenuHeader } from './menu-header';
import { Switch } from '../switch/switch';

/**
 * MenuEdit (Figma: "menu-edit", 1217:58486). The Edit Menu, the edit mode of the
 * apps Menu (`<ats-menu variant="apps">` swaps to it on Add/Remove): a
 * MenuHeader in edit mode ("Edit Menu", Done, Filter), then one folder per app group.
 * Each folder has a folder-title (body/lg + a "Grouped" Switch) and folder-items: the
 * apps as CheckboxLabels, two per inline CheckList row.
 *  - Checking / unchecking an app shows / hides it in the Menu.
 *  - Grouped on: the folder's apps appear in the Menu as their own labelled group.
 *  - The Filter narrows the check-lists by app name.
 * State lives in the BowlingAlleyController (the shell's, or a private one when the
 * Edit Menu is shown on its own).
 *
 *   <ats-menu-edit (done)="backToMenu()" />
 */
@Component({
  selector: 'ats-menu-edit',
  imports: [MenuHeader, Switch, CheckList, CheckboxLabel],
  template: `
    <ats-menu-header #header heading="Edit Menu" [edit]="false" editMenu [placeholder]="placeholder()" [(filter)]="query"
      (done)="done.emit()" (closed)="closed.emit()" />
    <div class="ats-menu-edit__content">
      @for (f of folders(); track f.id) {
        <section class="ats-menu-edit__folder" [attr.aria-labelledby]="'ats-menu-edit-' + f.id">
          <div class="ats-menu-edit__folder-title">
            <span class="ats-menu-edit__folder-name" [id]="'ats-menu-edit-' + f.id">{{ f.title }}</span>
            <label ats-switch [checked]="f.grouped" (checkedChange)="ctrl.setFolderGrouped(f.id, $event)">Grouped</label>
          </div>
          <div class="ats-menu-edit__folder-items">
            @for (row of f.rows; track $index) {
              <ats-check-list>
                @for (app of row; track app.id) {
                  <label ats-checkbox-label [checked]="!ctrl.menuHidden().has(app.id)" (checkedChange)="ctrl.setAppVisible(app.id, $event)">{{ app.label }}</label>
                }
              </ats-check-list>
            }
          </div>
        </section>
      } @empty {
        <div class="ats-menu-edit__empty">No matches</div>
      }
    </div>
  `,
  styleUrl: './menu-edit.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-menu-edit' },
})
export class MenuEdit implements AfterViewInit {
  protected readonly ctrl = inject(BowlingAlleyController, { optional: true }) ?? new BowlingAlleyController();

  /** Focus the Filter when shown. */
  readonly autofocus = input(true, { transform: booleanAttribute });
  readonly placeholder = input('Filter Items');
  /** Done was clicked. */
  readonly done = output<void>();
  /** Escape in the Filter. */
  readonly closed = output<void>();

  protected readonly query = signal('');
  private readonly header = viewChild.required<MenuHeader>('header');

  /** Folders with their (filtered) apps, two per row. */
  protected readonly folders = computed(() => {
    const byId = new Map(BOWLING_ALLEY_MENU_APPS.map((a) => [a.id, a]));
    const q = this.query();
    return this.ctrl
      .menuFolders()
      .map((f) => {
        const apps = f.apps.map((id) => byId.get(id)!).filter((a) => a && matches(a.label, q));
        const rows: BowlingAlleyMenuApp[][] = [];
        for (let i = 0; i < apps.length; i += 2) rows.push(apps.slice(i, i + 2));
        return { ...f, rows };
      })
      .filter((f) => f.rows.length);
  });

  ngAfterViewInit() {
    if (this.autofocus()) setTimeout(() => this.header().focusFilter());
  }
}
