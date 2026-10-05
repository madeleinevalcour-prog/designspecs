import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, model } from '@angular/core';
import { ATS_ICON_PATH } from '../icon-path';

export type CheckboxState = 'hover' | 'focus';

/**
 * Checkbox (Figma: checkbox atom, 250:17814; used by novo-data-table). Port of the
 * prototype repo's data-table/Checkbox.astro: a 16×16 box styled from the Tier-3
 * checkbox/* tokens.
 *
 * Applied as an attribute on a native checkbox, so `checked`, `disabled`, `name`,
 * `(change)`, keyboard (Space), forms and ngModel / formControl all stay native.
 * It has no visible label, so give it an aria-label (or wrap it in a <label>):
 *
 *   <input ats-checkbox aria-label="Select row" />
 *   <input ats-checkbox [checked]="all()" [(indeterminate)]="some" aria-label="Select all" />
 *
 * `indeterminate` mirrors the native DOM property (there is no HTML attribute for it;
 * assistive tech reads it as "mixed"). The browser clears it when the user clicks,
 * and the model follows.
 * `state` forces a visual state for showcases/docs.
 */
@Component({
  selector: 'input[ats-checkbox]',
  template: '',
  styleUrl: './checkbox.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'checkbox',
    '[class]': 'hostClass()',
    '[indeterminate]': 'indeterminate()',
    '[style.--ats-checkbox-check]': 'checkUrl',
    '(change)': 'indeterminate.set(false)',
  },
})
export class Checkbox {
  private readonly iconPath = inject(ATS_ICON_PATH);

  readonly indeterminate = model(false);
  readonly state = input<CheckboxState>();

  /** The check glyph comes from the icon set (`check.svg`), drawn as a CSS mask. */
  protected readonly checkUrl = `url("${new URL(`${this.iconPath}/check.svg`, document.baseURI)}")`;

  protected readonly hostClass = computed(() =>
    ['ats-checkbox', this.state() && `is-${this.state()}`].filter(Boolean).join(' '),
  );
}
