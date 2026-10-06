import { Component, OnInit, booleanAttribute, computed, inject, input } from '@angular/core';
import { BowlingAlleyController, MenuEdit, MenuOverlay } from 'ats-ui';

const flag = (v: unknown) => v != null && booleanAttribute(v);

/**
 * /menu-edit — MenuEdit (Figma "menu-edit" 1217:58486): the Edit Menu, side by side
 * with the Menu it edits (both share one BowlingAlleyController, so unchecking an app
 * or turning Grouped on updates the Menu live).
 *
 * Embed mode: any param, e.g.
 *   /examples/menu-edit?view=edit
 *   /examples/menu-edit?view=pair
 *   /examples/menu-edit?view=edit&hide=amplify,tasks&grouped=primary
 * Params:
 *   view = edit (the Edit Menu alone) | pair (Edit Menu + Menu)
 *   hide (comma list of app ids to start unchecked, e.g. amplify, tasks, my-dashboard)
 *   grouped (comma list of folder ids to start Grouped: primary, pay-bill; replaces Figma's default)
 *   ungrouped = true (start with every folder's Grouped off)
 */
@Component({
  imports: [MenuEdit, MenuOverlay],
  selector: 'app-menu-edit-page',
  providers: [BowlingAlleyController],
  template: `
    @if (embed()) {
      <div class="embed row">
        <ats-menu-edit [autofocus]="false" />
        @if (view() === 'pair') { <ats-menu-overlay [autofocus]="false" /> }
      </div>
    } @else {
      <h1>Edit Menu</h1>
      <p class="lede">
        Figma <code>menu-edit</code> (1217:58486). Opened from the Menu's Add/Remove; Done returns to the Menu.
        Uncheck an app to hide it from the Menu; turn Grouped on to show a folder's apps as their own labelled group.
      </p>
      <div class="row">
        <div class="cell"><ats-menu-edit [autofocus]="false" /><span class="caption">Edit Menu</span></div>
        <div class="cell"><ats-menu-overlay [autofocus]="false" /><span class="caption">Menu (live result)</span></div>
      </div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; background: #f4f6f9; min-height: 100vh; box-sizing: border-box; }
    :host:has(.embed) { padding: 24px; min-height: 0; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; max-width: 760px; }
    .row { display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; }
    .cell { display: flex; flex-direction: column; gap: 10px; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class MenuEditPage implements OnInit {
  private readonly ctrl = inject(BowlingAlleyController);
  readonly view = input<'edit' | 'pair'>();
  readonly hide = input<string>();
  readonly grouped = input<string>();
  readonly ungrouped = input(false, { transform: flag });

  protected readonly embed = computed(() => !!(this.view() || this.hide() || this.grouped() || this.ungrouped()));

  /** Apply the starting state from the query params. */
  ngOnInit() {
      for (const id of (this.hide() ?? '').split(',').map((s) => s.trim()).filter(Boolean)) this.ctrl.setAppVisible(id, false);
      const g = this.grouped();
      if (g != null || this.ungrouped()) {
        const on = new Set((g ?? '').split(',').map((s) => s.trim()));
        for (const f of this.ctrl.menuFolders()) this.ctrl.setFolderGrouped(f.id, on.has(f.id));
      }
  }
}
