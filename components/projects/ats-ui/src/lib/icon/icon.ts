import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, numberAttribute } from '@angular/core';
import { ATS_ICON_PATH } from '../icon-path';

/**
 * Icon — renders a glyph from the icon set (`assets/icons/<name>.svg`) as a CSS
 * mask, so its color comes from a token (or `currentColor`) instead of the file's
 * baked fill. Port of the prototype repo's `Icon.astro`.
 *
 *   <ats-icon name="search" />                         illustration color, 16px
 *   <ats-icon name="add" [size]="14" color="currentColor" />
 *
 * Decorative by default (aria-hidden). Give the parent control an accessible name.
 */
@Component({
  selector: 'ats-icon',
  template: '',
  styleUrl: './icon.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-icon',
    'aria-hidden': 'true',
    '[style.--ats-icon]': 'url()',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.background-color]': 'color()',
  },
})
export class Icon {
  private readonly iconPath = inject(ATS_ICON_PATH);

  readonly name = input.required<string>();
  readonly size = input(16, { transform: numberAttribute });
  /** Any CSS color or var(); defaults to the `--color-icon-illustration` token. */
  readonly color = input<string>();

  protected readonly url = computed(() => `url("${new URL(`${this.iconPath}/${this.name()}.svg`, document.baseURI)}")`);
}
