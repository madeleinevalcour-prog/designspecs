import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, model, output, viewChild } from '@angular/core';
import { Button } from '../button/button';
import { SearchInput } from '../search-input/search-input';

/**
 * MenuHeader (Figma: "menu-header", 2469:64743). The Menu's header: a title row
 * (text style card/header) with up to three actions, then a pill SearchInput "Filter".
 * Figma's boolean properties map 1:1:
 *  - `edit` (default on): the "Add/Remove" dialogue small Button.
 *  - `editMenu` (default off): the edit-mode "Done" button (dialogue small, success, check icon).
 *  - `close` (default off): an icon Button (close).
 *
 *   <ats-menu-header [(filter)]="query" (addRemove)="edit()" />
 *   <ats-menu-header heading="Edit Menu" [edit]="false" editMenu (done)="save()" />
 */
@Component({
  selector: 'ats-menu-header',
  imports: [Button, SearchInput],
  template: `
    <div class="ats-menu-header__title-row">
      <span class="ats-menu-header__title">{{ heading() }}</span>
      @if (editMenu()) {
        <button ats-button theme="dialogue" size="small" color="success" iconLeft="check" (click)="done.emit()">Done</button>
      }
      @if (edit()) {
        <button ats-button theme="dialogue" size="small" (click)="addRemove.emit()">Add/Remove</button>
      }
      @if (close()) {
        <button ats-button theme="icon" size="small" icon="close" aria-label="Close menu" (click)="closed.emit()"></button>
      }
    </div>
    <ats-search-input #search variant="pill" [placeholder]="placeholder()" [active]="filterActive()" [(value)]="filter" (closed)="closed.emit()" />
  `,
  styleUrl: './menu-header.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-menu-header' },
})
export class MenuHeader {
  /** The title (Figma: "Menu"; "Edit Menu" in menu-edit). */
  readonly heading = input('Menu');
  /** Figma `edit`: show Add/Remove. */
  readonly edit = input(true, { transform: booleanAttribute });
  /** Figma `editMenu`: show Done (edit mode). */
  readonly editMenu = input(false, { transform: booleanAttribute });
  /** Figma `close`: show the close icon button. */
  readonly close = input(false, { transform: booleanAttribute });
  readonly placeholder = input('Filter');
  /** Force the Filter's focused look (docs). */
  readonly filterActive = input(false, { transform: booleanAttribute });
  /** The Filter text (two-way). */
  readonly filter = model('');
  readonly addRemove = output<void>();
  readonly done = output<void>();
  /** The close button was clicked, or Escape was pressed in the Filter. */
  readonly closed = output<void>();

  private readonly search = viewChild.required<SearchInput>('search');
  /** Focus the Filter. */
  focusFilter() {
    this.search().focus();
  }
}
