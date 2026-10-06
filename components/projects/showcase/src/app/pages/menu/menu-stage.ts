import { Component, OnInit, inject, input } from '@angular/core';
import { BowlingAlleyController } from 'ats-ui';

const list = (v: string | undefined) => (v ?? '').split(',').map((s) => s.trim()).filter(Boolean);

/**
 * Gives the Menus projected into it one shared BowlingAlleyController (as the
 * bowling-alley shell does), so an Edit Menu beside a Menu updates it live. Optional
 * starting state: `hide` (app ids to start unchecked), `grouped` (folder ids to start Grouped).
 */
@Component({
  selector: 'app-menu-stage',
  providers: [BowlingAlleyController],
  template: `<ng-content />`,
  styles: `:host { display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; }`,
})
export class MenuStage implements OnInit {
  private readonly ctrl = inject(BowlingAlleyController);
  readonly hide = input<string>();
  readonly grouped = input<string>();

  ngOnInit() {
    for (const id of list(this.hide())) this.ctrl.setAppVisible(id, false);
    const on = new Set(list(this.grouped()));
    for (const f of this.ctrl.menuFolders()) if (on.has(f.id)) this.ctrl.setFolderGrouped(f.id, true);
  }
}
