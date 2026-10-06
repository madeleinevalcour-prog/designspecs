import { Component, booleanAttribute, computed, input } from '@angular/core';
import { CheckList, CheckListType, CheckboxLabel } from 'ats-ui';

const flag = (v: unknown) => v != null && booleanAttribute(v);

/**
 * /check-list — CheckList (Figma "check-list" 331:1435): inline, basic, disabled,
 * disabled-vertical, with Figma's sample labels.
 *
 * Embed mode: any param renders one list, e.g.
 *   /examples/check-list?type=inline
 *   /examples/check-list?type=basic&disabled=true
 *   /examples/check-list?items=Placements*,Contacts
 * Params:
 *   type = inline | basic (default inline)
 *   disabled = true (Figma disabled / disabled-vertical)
 *   items (comma list of labels; a trailing * starts it checked). Default: Figma's samples
 *   (inline: unchecked, checked*; basic: default, checked*, checked*, default, default).
 */
@Component({
  imports: [CheckList, CheckboxLabel],
  selector: 'app-check-list-page',
  template: `
    @if (embed()) {
      <div class="embed">
        <ats-check-list [type]="embedType()" [disabled]="disabled()">
          @for (it of embedItems(); track $index) { <label ats-checkbox-label [checked]="it.checked">{{ it.label }}</label> }
        </ats-check-list>
      </div>
    } @else {
      <h1>Check list</h1>
      <p class="lede">Figma <code>check-list</code> (331:1435, Checkbox page). Lays out checkbox+label rows: inline (a row, equal shares) or basic (a column). <code>disabled</code> disables every item.</p>
      @for (v of variants; track v.name) {
        <h2>{{ v.name }}</h2>
        <ats-check-list class="sample" [type]="v.type" [disabled]="v.disabled">
          @for (it of samples(v.type, v.disabled); track $index) { <label ats-checkbox-label [checked]="it.checked">{{ it.label }}</label> }
        </ats-check-list>
      }
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 16px 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    h2 { font-size: 15px; margin: 32px 0 8px; color: #314158; }
    .sample, .embed ats-check-list { width: 432px; }
  `,
})
export class CheckListPage {
  readonly type = input<CheckListType>();
  readonly disabled = input(false, { transform: flag });
  readonly items = input<string>();

  protected readonly variants: { name: string; type: CheckListType; disabled: boolean }[] = [
    { name: 'inline', type: 'inline', disabled: false },
    { name: 'basic', type: 'basic', disabled: false },
    { name: 'disabled', type: 'inline', disabled: true },
    { name: 'disabled-vertical', type: 'basic', disabled: true },
  ];
  protected readonly embed = computed(() => !!(this.type() || this.disabled() || this.items()));
  protected readonly embedType = computed<CheckListType>(() => this.type() ?? 'inline');
  protected readonly embedItems = computed(() =>
    this.items()
      ? this.items()!.split(',').map((s) => ({ label: s.trim().replace(/\*$/, ''), checked: s.trim().endsWith('*') }))
      : this.samples(this.embedType(), this.disabled()),
  );
  protected samples(type: CheckListType, disabled: boolean) {
    if (type === 'inline') return [{ label: 'unchecked', checked: false }, { label: 'checked', checked: true }];
    if (disabled) return [{ label: 'disabled and unchecked', checked: false }, { label: 'disabled and checked', checked: true }];
    return ['default', 'checked*', 'checked*', 'default', 'default'].map((s) => ({ label: s.replace('*', ''), checked: s.endsWith('*') }));
  }
}
