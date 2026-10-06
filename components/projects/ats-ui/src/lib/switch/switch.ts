import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, model } from '@angular/core';

/**
 * Switch (Figma: "switch", 1156:45039 on the "Switch" page). A pill track with a 16px
 * thumb; status Off | On | disabled-off | disabled-on × has-label No | Yes.
 *
 * Applied to a <label> so the whole row is clickable; it renders a native
 * `<input type="checkbox" role="switch">` inside, so Space, focus and screen readers
 * work natively. The projected content is the label, shown left of the track
 * (Figma has-label=Yes); leave it empty for has-label=No and give it an aria-label.
 *
 *   <label ats-switch [(checked)]="grouped">Grouped</label>
 *   <label ats-switch [(checked)]="on" aria-label="Notifications"></label>
 */
@Component({
  selector: 'label[ats-switch]',
  template: `
    <span class="ats-switch__label"><ng-content /></span>
    <input class="ats-switch__input" type="checkbox" role="switch" [checked]="checked()" [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()" (change)="checked.set($any($event.target).checked)" />
    <span class="ats-switch__track" aria-hidden="true"><span class="ats-switch__thumb"></span></span>
  `,
  styleUrl: './switch.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-switch',
    '[class.is-on]': 'checked()',
    '[class.is-disabled]': 'disabled()',
    '[class.is-focus]': "state() === 'focus'",
    '[attr.aria-label]': 'null',
  },
})
export class Switch {
  /** On (two-way). Figma status On / Off. */
  readonly checked = model(false);
  /** Figma status disabled-off / disabled-on. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name when there is no visible label (moved onto the inner input). */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });
  /** Force the focus ring (docs). */
  readonly state = input<'focus'>();
}
