import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { BreadcrumbLink } from './breadcrumb-link';

/** One level of a breadcrumb. The last item is the current page. */
export interface BreadcrumbItem {
  label: string;
  /** Link target for the levels above the current page. Without it the level renders as a button and emits `navigate`. */
  href?: string;
}

/**
 * Breadcrumb (Figma: "breadcrumb", 6806:36042 — Amplify page navigation and header).
 * Where you are inside a page area: links to the levels above, a "/" separator, then the
 * current page. Built from BreadcrumbLink, one per level.
 *  - Figma state=Default: two levels, e.g. "Amplify / New scheduled prompt".
 *  - Figma state=home: one level, the landing page itself ("Amplify"), shown as current.
 *
 * Renders `<nav aria-label="Breadcrumb">` with an ordered list. The current item gets
 * `aria-current="page"`; pass `headingCurrent` to make it the page's `<h1>` (the Amplify
 * header does). Separators are `aria-hidden`. The current title truncates with an ellipsis;
 * the levels above never shrink.
 *
 *   <ats-breadcrumb [items]="[{ label: 'Amplify', href: '/amplify' }, { label: 'Scheduled' }]" />
 *   <ats-breadcrumb [items]="[{ label: 'Amplify' }]" />                 (state=home)
 *   <ats-breadcrumb [items]="items" headingCurrent (navigate)="go($event)" />
 */
@Component({
  selector: 'ats-breadcrumb',
  imports: [BreadcrumbLink],
  template: `
    <nav class="ats-breadcrumb__nav" [attr.aria-label]="label() ?? 'Breadcrumb'">
      <ol class="ats-breadcrumb__list">
        @for (item of list(); track $index; let last = $last; let i = $index) {
          <li class="ats-breadcrumb__item" [class.ats-breadcrumb__item--current]="last">
            @if (i > 0) { <span class="ats-breadcrumb__separator" aria-hidden="true">/</span> }
            @if (last) {
              @if (headingCurrent()) {
                <h1 ats-breadcrumb-link state="current" aria-current="page">{{ item.label }}</h1>
              } @else {
                <span ats-breadcrumb-link state="current" aria-current="page">{{ item.label }}</span>
              }
            } @else if (item.href) {
              <a ats-breadcrumb-link [state]="forceHover() === i ? 'hover' : 'root'" [attr.href]="item.href" (click)="navigate.emit(i)">{{ item.label }}</a>
            } @else {
              <button type="button" ats-breadcrumb-link [state]="forceHover() === i ? 'hover' : 'root'" (click)="navigate.emit(i)">{{ item.label }}</button>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumb.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-breadcrumb', '[attr.data-state]': "list().length > 1 ? 'default' : 'home'" },
})
export class Breadcrumb {
  /** The levels, top first; the last is the current page. Default Amplify / New scheduled prompt. */
  readonly items = input<BreadcrumbItem[] | undefined>();
  /** Render the current item as the page's h1. Default false. */
  readonly headingCurrent = input<boolean | undefined>(false);
  /** Accessible name of the nav. Default "Breadcrumb". */
  readonly label = input<string>();
  /** Force the hover look on one level (index), for docs. */
  readonly forceHover = input<number | undefined>();
  /** A level above the current page was activated (index into `items`). */
  readonly navigate = output<number>();

  protected readonly list = computed<BreadcrumbItem[]>(() => this.items() ?? [{ label: 'Amplify' }, { label: 'New scheduled prompt' }]);
}
