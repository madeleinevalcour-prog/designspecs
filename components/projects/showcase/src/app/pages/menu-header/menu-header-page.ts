import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { MenuHeader } from 'ats-ui';

const flag = (v: unknown, fallback: boolean) => (v == null ? fallback : booleanAttribute(v));

/**
 * /menu-header — MenuHeader (Figma "menu-header" 2469:64743): the default header,
 * the edit-mode header (Done) and the header with a close button.
 *
 * Embed mode: any param renders one 480px header, e.g.
 *   /examples/menu-header?edit=true
 *   /examples/menu-header?heading=Edit%20Menu&edit=false&editMenu=true
 *   /examples/menu-header?close=true&state=active
 * Params:
 *   edit = true | false (Add/Remove, default true) · editMenu = true | false (Done, default false)
 *   close = true | false (close button, default false) · heading (default "Menu")
 *   state = default | active (active = the Filter's forced focus look)
 *   placeholder (default "Filter"), value (prefilled Filter text)
 */
@Component({
  imports: [MenuHeader],
  selector: 'app-menu-header-page',
  template: `
    @if (embed()) {
      <div class="embed">
        <ats-menu-header [heading]="heading() ?? 'Menu'" [edit]="flagEdit()" [editMenu]="flagEditMenu()" [close]="flagClose()"
          [filterActive]="state() === 'active'" [placeholder]="placeholder() ?? 'Filter'" [filter]="value() ?? ''" />
      </div>
    } @else {
      <h1>Menu Header</h1>
      <p class="lede">Figma <code>menu-header</code> (2469:64743). Title row, then a pill Filter.</p>
      <h2>Default (edit on)</h2>
      <div class="embed"><ats-menu-header [(filter)]="q" (addRemove)="last.set('Add/Remove')" /></div>
      <h2>Edit mode (editMenu on, edit off)</h2>
      <div class="embed"><ats-menu-header heading="Edit Menu" [edit]="false" editMenu (done)="last.set('Done')" /></div>
      <h2>With close</h2>
      <div class="embed"><ats-menu-header close (closed)="last.set('closed')" /></div>
      <h2>Filter focused</h2>
      <div class="embed"><ats-menu-header filterActive /></div>
      @if (last() || q()) { <p class="note">Last action: {{ last() }} · Filter: {{ q() }}</p> }
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(> .embed) { padding: 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .embed { width: 480px; }
    .note { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class MenuHeaderPage {
  readonly edit = input<string>();
  readonly editMenu = input<string>();
  readonly close = input<string>();
  readonly heading = input<string>();
  readonly state = input<'default' | 'active'>();
  readonly placeholder = input<string>();
  readonly value = input<string>();

  protected readonly embed = computed(
    () => !!(this.edit() || this.editMenu() || this.close() || this.heading() || this.state() || this.placeholder() || this.value()),
  );
  protected readonly flagEdit = computed(() => flag(this.edit(), true));
  protected readonly flagEditMenu = computed(() => flag(this.editMenu(), false));
  protected readonly flagClose = computed(() => flag(this.close(), false));
  protected readonly q = signal('');
  protected readonly last = signal('');
}
