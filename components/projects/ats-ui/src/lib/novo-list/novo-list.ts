import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';

/**
 * NovoList (Figma: "novo-list", 3775:94850 / 575:5824). A vertical stack of
 * list items, no gap or padding; every item (including the last) keeps its
 * bottom divider, as in Figma.
 *
 *   <ats-novo-list>
 *     <ats-novo-list-item-default entity="candidate" title="2034 | Tyler Brooks" (itemClick)="open()" />
 *     <ats-novo-list-item-task title="Call Tyler Brooks" />
 *   </ats-novo-list>
 */
@Component({
  selector: 'ats-novo-list',
  template: '<ng-content />',
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-novo-list', role: 'list' },
})
export class NovoList {}

export type NovoListItemState = 'hover' | 'focus';

/**
 * NovoListItem (Figma: "list-item", 692:19339; state=default 182:18861 / hover
 * 692:19388). Padding 16/24, gap 8, bottom divider, `list/color/background/default`.
 * Project an <ats-item-header> and/or <ats-item-content>, or use a preset.
 *
 * Clickable by default: a full-row native <button> (or <a> when `href` is set) is
 * laid over the row, so the whole row is one click target with button / link
 * semantics, keyboard focus and Enter / Space (button) or Enter (link) for free.
 * Hover paints `list/color/background/hover`; keyboard focus adds an inset ring
 * in `color/border/focus`. Controls inside the row (checkbox, Button) stack above
 * the overlay, so they stay separately clickable and are never nested inside it.
 * Not draggable.
 *
 *   <ats-novo-list-item label="Open Tyler Brooks" (itemClick)="open()">…</ats-novo-list-item>
 *   <ats-novo-list-item href="/candidate/2034" label="Tyler Brooks">…</ats-novo-list-item>
 *   <ats-novo-list-item [clickable]="false">…</ats-novo-list-item>
 */
@Component({
  selector: 'ats-novo-list-item',
  template: `
    @if (isClickable()) {
      @if (href()) {
        <a class="ats-novo-list-item__action" [attr.href]="href()" [attr.aria-label]="label()" (click)="itemClick.emit($event)"></a>
      } @else {
        <button type="button" class="ats-novo-list-item__action" [attr.aria-label]="label()" (click)="itemClick.emit($event)"></button>
      }
    }
    <ng-content />
  `,
  styleUrl: './novo-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-novo-list-item',
    role: 'listitem',
    '[class.ats-novo-list-item--clickable]': 'isClickable()',
    '[class.is-hover]': "state() === 'hover'",
    '[class.is-focus]': "state() === 'focus'",
  },
})
export class NovoListItem {
  /** Make the row a click target (default true). */
  readonly clickable = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Accessible name of the row action, e.g. the record title. */
  readonly label = input<string>();
  /** Render the row action as a link to this URL instead of a button. */
  readonly href = input<string>();
  /** Force a visual state, for showcases / docs. */
  readonly state = input<NovoListItemState>();
  /** Emits when the row is activated (click, Enter, or Space). */
  readonly itemClick = output<MouseEvent>();

  protected readonly isClickable = computed(() => this.clickable() ?? true);
}
