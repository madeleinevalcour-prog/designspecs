import { Component, computed, input } from '@angular/core';
import { CountBadge } from 'ats-ui';

/**
 * /count-badge — CountBadge (Figma "count-badge" 6814:24310, Amplify page navigation and header).
 *
 * Embed mode: any param renders a compact row, e.g.
 *   /examples/count-badge?counts=1,12,140
 *   /examples/count-badge?count=2&surface=muted
 * Params:
 *   count = one badge with this number
 *   counts = comma list: one captioned badge each
 *   surface = muted (shows the white ring against a grey surface)
 */
@Component({
  imports: [CountBadge],
  selector: 'app-count-badge-page',
  template: `
    @if (embed()) {
      <div class="embed row" [class.muted]="surface() === 'muted'">
        @for (c of list(); track $index) {
          <div class="cell"><ats-count-badge [count]="c" />@if (counts()) { <span class="caption">{{ c > 99 ? c + ' → 99+' : c }}</span> }</div>
        }
      </div>
    } @else {
      <h1>Count badge</h1>
      <p class="lede">Figma <code>count-badge</code> (6814:24310), Amplify page navigation and header.</p>
      <h2>Counts</h2>
      <div class="row">
        @for (c of [1, 9, 12, 99, 140]; track c) { <div class="cell"><ats-count-badge [count]="c" /><span class="caption">{{ c }}</span></div> }
      </div>
      <h2>Ring on a grey surface</h2>
      <div class="row muted">
        @for (c of [1, 12, 140]; track c) { <div class="cell"><ats-count-badge [count]="c" /><span class="caption">{{ c }}</span></div> }
      </div>
      <h2>Zero renders nothing</h2>
      <div class="row"><div class="cell"><ats-count-badge [count]="0" /><span class="caption">count = 0</span></div></div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .row { display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; padding: 12px; border-radius: 8px; }
    .row.muted { background: var(--color-background-subtle-hover); }
    .cell { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class CountBadgePage {
  readonly count = input<string>();
  readonly counts = input<string>();
  readonly surface = input<string>();
  protected readonly embed = computed(() => !!(this.count() || this.counts() || this.surface()));
  protected readonly list = computed<number[]>(() => (this.counts() ? this.counts()!.split(',').map((s) => +s.trim()) : [+(this.count() ?? 2)]));
}
