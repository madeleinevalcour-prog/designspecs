import { Component, computed, input } from '@angular/core';
import { BOWLING_ALLEY_FAST_FIND_RESULTS, ListItem } from 'ats-ui';

/**
 * /list-item — ListItem (Figma "list-item"): entity avatar + title, wrapping meta
 * fields, optional body line. Sample rows are the Fast Find "Recently Viewed" list.
 *
 * Embed mode: any param renders rows for a docs page, e.g.
 *   /examples/list-item?entity=candidate
 * Params:
 *   entity = candidate | company | contact | job (one sample row; default all four)
 *   parts = all | header | fields (default all: header + fields + body)
 *   width (px, default 520)
 */
@Component({
  imports: [ListItem],
  selector: 'app-list-item-page',
  template: `
    @if (embed()) {
      <div class="list" [style.width.px]="embedWidth()">
        @for (r of rows(); track r.title) {
          <button ats-list-item [entity]="r.entity" [label]="r.title" [fields]="parts() === 'header' ? [] : r.fields" [body]="embedParts() === 'all' ? r.body : undefined"></button>
        }
      </div>
    } @else {
      <h1>List Item</h1>
      <p class="lede">Figma "list-item", as used in fast-find-results (1323:67009). Hover is live.</p>
      <h2>Full (header, fields, body)</h2>
      <div class="list">
        @for (r of all; track r.title) { <button ats-list-item [entity]="r.entity" [label]="r.title" [fields]="r.fields" [body]="r.body"></button> }
      </div>
      <h2>Header + fields</h2>
      <div class="list"><button ats-list-item entity="candidate" [label]="all[0].title" [fields]="all[0].fields"></button></div>
      <h2>Header only</h2>
      <div class="list"><button ats-list-item entity="job" [label]="all[3].title"></button></div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.list:only-child) { padding: 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .list { width: 520px; background: #fff; border: 1px solid #e3e8ef; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
  `,
})
export class ListItemPage {
  readonly entity = input<string>();
  readonly parts = input<'all' | 'header' | 'fields'>();
  readonly width = input<string>();

  protected readonly all = BOWLING_ALLEY_FAST_FIND_RESULTS;
  protected readonly embed = computed(() => !!(this.entity() || this.parts() || this.width()));
  protected readonly embedParts = computed(() => this.parts() ?? 'all');
  protected readonly embedWidth = computed(() => Number(this.width()) || 520);
  protected readonly rows = computed(() => {
    const e = this.entity();
    return e ? this.all.filter((r) => r.entity === e) : this.all;
  });
}
