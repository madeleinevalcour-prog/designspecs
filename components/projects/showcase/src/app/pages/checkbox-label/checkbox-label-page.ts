import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { CheckboxLabel, CheckboxState } from 'ats-ui';

type Variant = 'default' | 'hover' | 'focus' | 'checked' | 'indeterminate' | 'disabled' | 'disabled-checked' | 'disabled-indeterminate' | 'has-gripper';

/**
 * /checkbox-label — CheckboxLabel (Figma "checkbox+label" 250:17848): all 9 variants.
 *
 * Embed mode: any param renders one row (or a column), e.g.
 *   /examples/checkbox-label?variant=checked&label=Placements
 *   /examples/checkbox-label?variants=default,hover,focus,checked
 * Params:
 *   variant = default | hover | focus | checked | indeterminate | disabled |
 *     disabled-checked | disabled-indeterminate | has-gripper (default "default")
 *   variants (comma list: one row per variant)
 *   label (default "label")
 */
@Component({
  imports: [NgTemplateOutlet, CheckboxLabel],
  selector: 'app-checkbox-label-page',
  template: `
    @if (embed()) {
      <div class="embed col">
        @for (v of embedVariants(); track $index) {
          <ng-container *ngTemplateOutlet="row; context: { $implicit: v, text: label() ?? 'label' }" />
        }
      </div>
    } @else {
      <h1>Checkbox + label</h1>
      <p class="lede">Figma <code>checkbox+label</code> (250:17848, Checkbox page). A Checkbox and its label; clicking the label toggles it. Hover and focus are live.</p>
      <div class="col">
        @for (v of all; track v) {
          <div class="line"><ng-container *ngTemplateOutlet="row; context: { $implicit: v, text: 'label' }" /><span class="caption">{{ v }}</span></div>
        }
      </div>
    }
    <ng-template #row let-v let-text="text">
      <label ats-checkbox-label [state]="forced(v)" [checked]="v.includes('checked')" [indeterminate]="v.includes('indeterminate')"
        [disabled]="v.startsWith('disabled')" [gripper]="v === 'has-gripper'">{{ v === 'has-gripper' && text === 'label' ? 'has-gripper' : text }}</label>
    </ng-template>
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 16px 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; }
    .col { display: flex; flex-direction: column; width: 308px; }
    .line { display: flex; align-items: center; gap: 16px; }
    .line > label { flex: 1; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; width: 160px; }
  `,
})
export class CheckboxLabelPage {
  readonly variant = input<Variant>();
  readonly variants = input<string>();
  readonly label = input<string>();

  protected readonly all: Variant[] = ['default', 'hover', 'focus', 'checked', 'indeterminate', 'disabled', 'disabled-checked', 'disabled-indeterminate', 'has-gripper'];
  protected readonly embed = computed(() => !!(this.variant() || this.variants() || this.label()));
  protected readonly embedVariants = computed<Variant[]>(() =>
    this.variants() ? (this.variants()!.split(',').map((s) => s.trim()) as Variant[]) : [this.variant() ?? 'default'],
  );
  protected forced = (v: Variant): CheckboxState | undefined => (v === 'hover' || v === 'focus' ? v : undefined);
}
