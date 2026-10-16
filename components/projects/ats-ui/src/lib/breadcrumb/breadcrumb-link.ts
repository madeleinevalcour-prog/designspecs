import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

/** Figma breadcrumb-link `state`. Hover is the forced hover look (docs); real hover works on Root. */
export type BreadcrumbLinkState = 'root' | 'hover' | 'current';

/**
 * BreadcrumbLink (Figma: "breadcrumb-link", 6806:28195 — Amplify page navigation and header).
 * One level of a breadcrumb: the text, in title/md.
 *  - `root` (Root): a link back up, color/text/subtle; color/text/link-hover on hover.
 *  - `current` (Current): the page you're on, color/text/headline. Not interactive.
 *  - `hover` (Hover): forces the hover look, for docs and showcases.
 *
 * Applied as an attribute so the element keeps its native semantics: an `<a>` or
 * `<button>` for a link, a `<span>` (or heading) for the current page.
 *
 *   <a ats-breadcrumb-link href="/amplify">Amplify</a>
 *   <span ats-breadcrumb-link state="current">Scheduled</span>
 *
 * Focus: no focus look is defined for links in Novo / Modern UI yet, so the browser's
 * default focus outline is left in place.
 */
@Component({
  selector: 'a[ats-breadcrumb-link], button[ats-breadcrumb-link], span[ats-breadcrumb-link], h1[ats-breadcrumb-link]',
  template: `<ng-content />`,
  styleUrl: './breadcrumb-link.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-breadcrumb-link',
    '[attr.data-state]': 'stateName()',
  },
})
export class BreadcrumbLink {
  /** Default `root`. */
  readonly state = input<BreadcrumbLinkState | undefined>('root');
  protected readonly stateName = computed(() => this.state() ?? 'root');
}
