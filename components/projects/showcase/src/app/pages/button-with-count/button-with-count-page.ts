import { Component, booleanAttribute, computed, input, signal } from '@angular/core';
import { Button, ButtonWithCount } from 'ats-ui';

const flag = (v: unknown) => v != null && booleanAttribute(v);

/**
 * /button-with-count — ButtonWithCount (Figma "button-with-count" 6816:24357, Amplify page
 * navigation and header): a Secondary · Small Button with a count-badge pinned top-right.
 *
 * Embed mode: any param renders a compact row, e.g.
 *   /examples/button-with-count?examples=0,2,12,140
 *   /examples/button-with-count?count=2&open=true
 * Params:
 *   count = the badge number (0 hides it); one example
 *   examples = comma list of counts, one captioned example each
 *   open = true (button State=Active: the Chats panel is open)
 *   label = button label (default Chats)
 */
@Component({
  imports: [Button, ButtonWithCount],
  selector: 'app-button-with-count-page',
  template: `
    @if (embed()) {
      <div class="embed row">
        @for (c of list(); track $index) {
          <div class="cell">
            <ats-button-with-count [count]="c">
              <button ats-button theme="secondary" size="small" [state]="open() ? 'active' : undefined" [attr.aria-pressed]="open()"
                [attr.aria-label]="c > 0 ? text() + ', ' + c + ' new' : text()">{{ text() }}</button>
            </ats-button-with-count>
            @if (examples()) { <span class="caption">{{ c === 0 ? 'No count' : c }}</span> }
          </div>
        }
      </div>
    } @else {
      <h1>Button with count</h1>
      <p class="lede">Figma <code>button-with-count</code> (6816:24357), Amplify page navigation and header.</p>
      <h2>Counts</h2>
      <div class="row">
        @for (c of [0, 2, 12, 140]; track c) {
          <div class="cell">
            <ats-button-with-count [count]="c"><button ats-button theme="secondary" size="small" [attr.aria-label]="c ? 'Chats, ' + c + ' new' : 'Chats'">Chats</button></ats-button-with-count>
            <span class="caption">{{ c === 0 ? 'No count (hidden at 0)' : c }}</span>
          </div>
        }
      </div>
      <h2>Toggle (State=Active = panel open)</h2>
      <div class="row">
        <div class="cell">
          <ats-button-with-count [count]="2">
            <button ats-button theme="secondary" size="small" [state]="demo() ? 'active' : undefined" [attr.aria-pressed]="demo()" aria-label="Chats, 2 new" (click)="demo.set(!demo())">Chats</button>
          </ats-button-with-count>
          <span class="caption">open = {{ demo() }}</span>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .row { display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start; }
    .cell { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class ButtonWithCountPage {
  readonly count = input<string>();
  readonly examples = input<string>();
  readonly open = input(false, { transform: flag });
  readonly label = input<string>();
  protected readonly demo = signal(false);
  protected readonly text = computed(() => this.label() ?? 'Chats');
  protected readonly embed = computed(() => !!(this.count() != null || this.examples() || this.open() || this.label()));
  protected readonly list = computed<number[]>(() => (this.examples() ? this.examples()!.split(',').map((s) => +s.trim()) : [+(this.count() ?? 2)]));
}
