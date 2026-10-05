import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

export type IconButtonNoContainerState = 'hover' | 'focus' | 'active';

/**
 * Icon Button - no container (Figma: Component Migration 164:17717,
 * theme="Icon-no-container"). Port of the prototype repo's IconButtonNoContainer.astro.
 * A 24×24 icon-only button: transparent, 4px radius, 12px glyph, fill on
 * hover / active, 2px inset focus ring.
 *
 * Applied as an attribute so native button semantics stay on the real element.
 * Icon-only, so always give it an aria-label:
 *
 *   <button ats-icon-button-no-container aria-label="Expand"></button>
 *   <button ats-icon-button-no-container icon="close" aria-label="Remove"></button>
 *
 * `icon` is a name from the icon set (default `chevron-down`); leave it empty and
 * project your own 12px glyph instead. `state` forces a visual state for showcases.
 */
@Component({
  selector: 'button[ats-icon-button-no-container]',
  imports: [Icon],
  template: `
    @if (icon(); as name) {
      <ats-icon [name]="name" [size]="12" />
    }
    <ng-content />
  `,
  styleUrl: './icon-button-no-container.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.type]': 'type()',
  },
})
export class IconButtonNoContainer {
  /** Glyph from the icon set. Pass an empty string to project your own. */
  readonly icon = input<string>('chevron-down');
  readonly state = input<IconButtonNoContainerState>();
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  protected readonly hostClass = computed(() =>
    ['ats-icon-button-no-container', this.state() && `is-${this.state()}`].filter(Boolean).join(' '),
  );
}
