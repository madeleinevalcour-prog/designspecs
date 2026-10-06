import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input, model } from '@angular/core';
import { Checkbox, CheckboxState } from '../checkbox/checkbox';
import { Icon } from '../icon/icon';
import { CHECK_LIST } from './check-list-token';

/**
 * CheckboxLabel (Figma: "checkbox+label", 250:17848 on the "Checkbox" page). A
 * Checkbox (`input[ats-checkbox]`) followed by its label in input/value/default.
 * Figma `Property 1` maps to: default / checked / indeterminate (the value),
 * hover / focus (live, or forced with `state`), disabled (+ checked / indeterminate),
 * and has-gripper (`gripper`: a 16px grip-vertical handle before the box).
 * Figma `show checkbox` = `showCheckbox`.
 *
 * Applied to a <label>, so clicking the text toggles the box.
 *
 *   <label ats-checkbox-label [(checked)]="on">Placements</label>
 *   <label ats-checkbox-label disabled [checked]="true">Locked</label>
 */
@Component({
  selector: 'label[ats-checkbox-label]',
  imports: [Checkbox, Icon],
  template: `
    @if (gripper()) {
      <ats-icon class="ats-checkbox-label__grip" name="grip-vertical" [size]="16" color="var(--color-icon-subtle)" aria-hidden="true" />
    }
    @if (showCheckbox() ?? true) {
      <input ats-checkbox [state]="state()" [checked]="checked()" [(indeterminate)]="indeterminate"
        [disabled]="isDisabled()" (change)="checked.set($any($event.target).checked)" />
    }
    <span class="ats-checkbox-label__text"><ng-content /></span>
  `,
  styleUrl: './checkbox-label.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-checkbox-label',
    '[class.is-checked]': 'checked()',
    '[class.is-indeterminate]': 'indeterminate()',
    '[class.is-disabled]': 'isDisabled()',
    '[class.is-hover]': "state() === 'hover'",
    '[class.is-focus]': "state() === 'focus'",
    '[class.has-gripper]': 'gripper()',
  },
})
export class CheckboxLabel {
  private readonly list = inject(CHECK_LIST, { optional: true });

  readonly checked = model(false);
  readonly indeterminate = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Force hover / focus (docs). */
  readonly state = input<CheckboxState>();
  /** Figma has-gripper / drag-and-drop: the grip-vertical handle. */
  readonly gripper = input(false, { transform: booleanAttribute });
  /** Figma `show checkbox` (default on). */
  readonly showCheckbox = input<boolean | undefined, unknown>(undefined, { transform: (v: unknown) => (v === undefined ? undefined : booleanAttribute(v)) });

  /** Disabled on its own, or because its CheckList is. */
  protected readonly isDisabled = computed(() => this.disabled() || !!this.list?.disabled());
}
