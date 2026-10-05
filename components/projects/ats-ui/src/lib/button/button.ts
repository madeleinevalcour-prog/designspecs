import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input } from '@angular/core';
import { Icon } from '../icon/icon';

export type ButtonTheme = 'base' | 'standard' | 'primary' | 'secondary' | 'dialogue' | 'fab' | 'icon';
export type ButtonSize = 'default' | 'small' | 'large';
export type ButtonColor = 'default' | 'negative' | 'success' | 'warning' | 'amplify';
export type ButtonState = 'hover' | 'focus' | 'active';

/**
 * Button (Figma: "Button" full matrix, Component Migration 68:2694).
 * Theme × Size × Color × State, styled entirely from the Tier-3 button tokens.
 *
 * Applied as an attribute so native button semantics (type, disabled,
 * aria-label, forms) stay on the real element:
 *
 *   <button ats-button theme="primary" iconLeft="add">Add candidate</button>
 *   <button ats-button theme="secondary" color="negative">Delete</button>
 *   <button ats-button theme="icon" icon="close" aria-label="Close"></button>
 *
 * Colors per theme (from the tokens): negative + success on every theme; warning on
 * all but standard; amplify on primary (gradient), secondary, dialogue and icon.
 * An unsupported combination renders the theme's default color.
 * `state` forces a visual state for showcases/docs; real interaction works too.
 */
@Component({
  selector: 'button[ats-button], a[ats-button]',
  imports: [Icon],
  templateUrl: './button.html',
  styleUrl: './button.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.type]': 'isAnchor ? null : type()',
  },
})
export class Button {
  protected readonly isAnchor = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'A';

  readonly theme = input<ButtonTheme>('standard');
  readonly size = input<ButtonSize>('default');
  readonly color = input<ButtonColor>('default');
  readonly state = input<ButtonState>();
  /** Force a fully-round (999px) radius, e.g. toggle segments. */
  readonly pill = input(false, { transform: booleanAttribute });
  /** Leading / trailing icon names from the icon set (text themes). */
  readonly iconLeft = input<string>();
  readonly iconRight = input<string>();
  /** The glyph for the icon-only themes (fab / icon). Or project your own. */
  readonly icon = input<string>();
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  protected readonly iconOnly = computed(() => this.theme() === 'fab' || this.theme() === 'icon');
  protected readonly iconSize = computed(() => ({ small: 12, default: 14, large: 16 })[this.size()]);

  protected readonly hostClass = computed(() =>
    [
      'ats-btn',
      `ats-btn--${this.theme()}`,
      `ats-btn--${this.size()}`,
      this.color() !== 'default' && `ats-btn--${this.color()}`,
      this.pill() && 'ats-btn--pill',
      this.state() && `is-${this.state()}`,
    ]
      .filter(Boolean)
      .join(' '),
  );
}
