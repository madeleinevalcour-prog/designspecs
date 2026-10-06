import { Component, computed, input } from '@angular/core';
import { IconContainerTheme, MenuItem, MenuItemState } from 'ats-ui';

/**
 * /menu-item — MenuItem (Figma "menu-item" 1143:19746): the four states, plus a row
 * of app tiles as in the Menu.
 *
 * Embed mode: any param renders one tile (or a row), e.g.
 *   /examples/menu-item?state=hover
 *   /examples/menu-item?theme=neutral&icon=dashboard&label=My%20Dashboard
 *   /examples/menu-item?states=default,hover,focus,drag
 * Params:
 *   state = default | hover | focus | drag (forced; hover and focus are live too)
 *   states (comma list: renders one tile per state, captioned)
 *   theme (icon-container theme, default candidate), icon (glyph), label (default "Candidates")
 */
@Component({
  imports: [MenuItem],
  selector: 'app-menu-item-page',
  template: `
    @if (embed()) {
      <div class="embed row">
        @for (s of embedStates(); track $index) {
          <div class="cell">
            <button ats-menu-item [state]="s" [theme]="embedTheme()" [icon]="icon()">{{ label() ?? 'Candidates' }}</button>
            @if (states()) { <span class="caption">{{ s ?? 'default' }}</span> }
          </div>
        }
      </div>
    } @else {
      <h1>Menu Item</h1>
      <p class="lede">Figma <code>menu-item</code> (1143:19746). An app tile in the Menu. Hover and focus are live; <code>state</code> forces one.</p>
      <h2>States</h2>
      <div class="row">
        @for (s of allStates; track s) {
          <div class="cell"><button ats-menu-item [state]="s" theme="candidate">Candidates</button><span class="caption">{{ s }}</span></div>
        }
      </div>
      <h2>In a Menu row (128px tiles)</h2>
      <div class="grid">
        <button ats-menu-item theme="amplify">Amplify</button>
        <button ats-menu-item theme="candidate">Candidates</button>
        <button ats-menu-item theme="neutral" icon="dashboard">My Dashboard</button>
      </div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .row { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; }
    .cell { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 432px; padding: 16px 24px; background: #fff; border-radius: 8px; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class MenuItemPage {
  readonly state = input<MenuItemState>();
  readonly states = input<string>();
  readonly theme = input<IconContainerTheme>();
  readonly icon = input<string>();
  readonly label = input<string>();

  protected readonly allStates: MenuItemState[] = ['default', 'hover', 'focus', 'drag'];
  protected readonly embed = computed(() => !!(this.state() || this.states() || this.theme() || this.icon() || this.label()));
  protected readonly embedTheme = computed(() => this.theme() ?? 'candidate');
  protected readonly embedStates = computed<(MenuItemState | undefined)[]>(() =>
    this.states() ? (this.states()!.split(',').map((s) => s.trim()) as MenuItemState[]) : [this.state()],
  );
}
