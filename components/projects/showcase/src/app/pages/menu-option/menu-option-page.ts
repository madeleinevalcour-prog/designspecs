import { Component, computed, input } from '@angular/core';
import { IconContainerTheme, MenuOption, MenuOptionState, MenuOptionType } from 'ats-ui';

/**
 * /menu-option — MenuOption (Figma "menu-option" 157:2911): Type × State, plus the
 * Add menu and user menu rows it builds.
 *
 * Embed mode: any param renders one option in a 240px dropdown-width frame, e.g.
 *   /examples/menu-option?type=entity&theme=candidate&label=Candidate
 *   /examples/menu-option?type=default&state=hover&icon=logout&label=Logout
 *   /examples/menu-option?list=add   (the whole Add menu column)   ·   ?list=user
 * Params:
 *   type = default | entity (default default)
 *   state = default | hover (forced; hover is live too)
 *   icon (glyph; default configure-outline for default, the theme's glyph for entity)
 *   theme (entity: icon-container theme, default jobs), label (default "Label")
 *   width (px, default 240), list = add | user (renders those rows instead)
 */
@Component({
  imports: [MenuOption],
  selector: 'app-menu-option-page',
  template: `
    @if (embed()) {
      <div class="frame" [style.width.px]="embedWidth()">
        @if (list() === 'add') {
          @for (r of addRows; track r.label) { <button ats-menu-option type="entity" [theme]="r.theme" [icon]="r.icon">{{ r.label }}</button> }
        } @else if (list() === 'user') {
          <button ats-menu-option icon="configure-outline">Preferences</button>
          <button ats-menu-option icon="logout">Logout</button>
        } @else {
          <button ats-menu-option [type]="type()" [state]="state()" [icon]="icon()" [theme]="embedTheme()">{{ label() ?? 'Label' }}</button>
        }
      </div>
    } @else {
      <h1>Menu Option</h1>
      <p class="lede">Figma <code>menu-option</code> (157:2911). A row in a dropdown menu. Hover is live; <code>state</code> forces it.</p>
      <h2>Type × State</h2>
      <div class="row">
        <div class="cell"><div class="frame"><button ats-menu-option>Label</button></div><span class="caption">default · default</span></div>
        <div class="cell"><div class="frame"><button ats-menu-option state="hover">Label</button></div><span class="caption">default · hover</span></div>
        <div class="cell"><div class="frame"><button ats-menu-option type="entity">Label</button></div><span class="caption">entity · default</span></div>
        <div class="cell"><div class="frame"><button ats-menu-option type="entity" state="hover">Label</button></div><span class="caption">entity · hover</span></div>
      </div>
      <h2>In use</h2>
      <div class="row">
        <div class="cell"><div class="frame">
          @for (r of addRows; track r.label) { <button ats-menu-option type="entity" [theme]="r.theme" [icon]="r.icon">{{ r.label }}</button> }
        </div><span class="caption">Add menu (fast-add-menu)</span></div>
        <div class="cell"><div class="frame">
          <button ats-menu-option icon="configure-outline">Preferences</button>
          <button ats-menu-option icon="logout">Logout</button>
        </div><span class="caption">User menu (user-dropdown-panel)</span></div>
      </div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(> .frame) { padding: 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .row { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; }
    .cell { display: flex; flex-direction: column; gap: 10px; }
    .frame { width: 240px; display: flex; flex-direction: column; background: #fff; border: 1px solid #f0f5f9; border-radius: 8px; padding: 8px 0; box-sizing: border-box; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class MenuOptionPage {
  readonly type = input<MenuOptionType>();
  readonly state = input<MenuOptionState>();
  readonly icon = input<string>();
  readonly theme = input<IconContainerTheme>();
  readonly label = input<string>();
  readonly width = input<string>();
  readonly list = input<'add' | 'user'>();

  protected readonly embed = computed(() => !!(this.type() || this.state() || this.icon() || this.theme() || this.label() || this.width() || this.list()));
  protected readonly embedWidth = computed(() => Number(this.width()) || 240);
  protected readonly embedTheme = computed(() => this.theme() ?? 'jobs');
  protected readonly addRows: { theme: IconContainerTheme; icon?: string; label: string }[] = [
    { theme: 'company', label: 'Company' }, { theme: 'contact', label: 'Contact' }, { theme: 'lead', label: 'Lead' },
    { theme: 'candidate', label: 'Candidate' }, { theme: 'opportunity', label: 'Opportunity' }, { theme: 'jobs', label: 'Job' },
    { theme: 'placement', label: 'Placement' }, { theme: 'neutral', icon: 'note', label: 'Note' },
    { theme: 'neutral', icon: 'check-outline', label: 'Task' }, { theme: 'neutral', icon: 'users', label: 'Distribution List' },
  ];
}
