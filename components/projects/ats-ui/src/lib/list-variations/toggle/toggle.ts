import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { Button } from '../../button/button';

export interface ToggleOption {
  value: string;
  /** Segment text. Omit for an icon-only segment. */
  label?: string;
  /** Icon name from the icon set (rendered as the Button's leading icon). */
  icon?: string;
  /** Accessible name for an icon-only segment (falls back to `value`). */
  ariaLabel?: string;
}

/**
 * Toggle (Figma: "toggle" 33:5338, List Variations file 0LCuwDp7YHGGqK6WiseTRi).
 * A pill container of segments; each segment is an ats-button `theme="dialogue" pill`.
 * The selected segment shows the dialogue Button's active state (lightest-blue fill +
 * inner shadow); the others are transparent dialogue Buttons. Text or icon-only mode.
 *
 *   <ats-toggle ariaLabel="Source" [options]="[{ value: 'bullhorn', label: 'Bullhorn' }, …]" [(value)]="source" />
 *   <ats-toggle ariaLabel="View" [options]="[{ value: 'list', icon: 'list' }, …]" [(value)]="view" />
 *
 * Port of the prototype repo's list-variations/Toggle.astro.
 */
@Component({
  selector: 'ats-toggle',
  imports: [Button],
  templateUrl: './toggle.html',
  styleUrl: './toggle.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-toggle',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
})
export class Toggle {
  readonly options = input.required<ToggleOption[]>();
  /** Selected option value (two-way). Defaults to the first option. */
  readonly value = model<string>();
  /** Accessible name for the group, e.g. "View". */
  readonly ariaLabel = input<string>();

  protected readonly selected = computed(() => this.value() ?? this.options()[0]?.value);

  protected select(option: ToggleOption): void {
    this.value.set(option.value);
  }
}
