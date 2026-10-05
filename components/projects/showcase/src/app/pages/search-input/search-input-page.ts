import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { SearchInput, SearchInputVariant } from 'ats-ui';

const flag = (v: unknown) => v != null && booleanAttribute(v);

/**
 * /search-input — SearchInput (Figma "search-input"): the Fast Find field and the
 * Menu's Filter pill, each default and focused.
 *
 * Embed mode: any param renders a single input for a docs page, e.g.
 *   /examples/search-input?variant=pill&state=active
 * Params:
 *   variant = field | pill (default field)
 *   state = default | active (active = forced focus look)
 *   placeholder (default per variant), value (prefilled text), closable = true | false
 *   width (px, default 360)
 */
@Component({
  imports: [SearchInput],
  selector: 'app-search-input-page',
  template: `
    @if (embed()) {
      <div class="embed" [style.width.px]="embedWidth()">
        <ats-search-input [variant]="embedVariant()" [active]="state() === 'active'" [placeholder]="placeholder()"
          [value]="value() ?? ''" [closable]="embedClosable()" />
      </div>
    } @else {
      <h1>Search Input</h1>
      <p class="lede">Figma "search-input". Hover and focus are live; <code>active</code> forces the focused look.</p>
      <h2>field — Fast Find (1323:67011)</h2>
      <div class="row">
        <div class="cell"><ats-search-input [(value)]="q" /><span class="caption">default</span></div>
        <div class="cell"><ats-search-input active /><span class="caption">active</span></div>
        <div class="cell"><ats-search-input active value="Tyler" /><span class="caption">active, with text</span></div>
      </div>
      <h2>pill — Menu filter (1323:68245)</h2>
      <div class="row">
        <div class="cell"><ats-search-input variant="pill" /><span class="caption">default</span></div>
        <div class="cell"><ats-search-input variant="pill" active /><span class="caption">active</span></div>
      </div>
      @if (q()) { <p class="note">Typed: {{ q() }}</p> }
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .row { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; }
    .cell { display: flex; flex-direction: column; gap: 10px; width: 360px; }
    .caption, .note { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class SearchInputPage {
  readonly variant = input<SearchInputVariant>();
  readonly state = input<'default' | 'active'>();
  readonly placeholder = input<string>();
  readonly value = input<string>();
  readonly closable = input<string>();
  readonly width = input<string>();

  protected readonly embed = computed(() => !!(this.variant() || this.state() || this.placeholder() || this.value() || this.closable() || this.width()));
  protected readonly embedVariant = computed(() => this.variant() ?? 'field');
  protected readonly embedWidth = computed(() => Number(this.width()) || 360);
  protected readonly embedClosable = computed(() => (this.closable() == null ? undefined : flag(this.closable())));
  protected readonly q = signal('');
}
