import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { ATS_ICON_PATH } from '../icon-path';

export type ButtonTheme = 'base' | 'standard' | 'primary' | 'secondary' | 'dialogue' | 'fab' | 'icon';
export type ButtonSize = 'default' | 'small' | 'large';
export type ButtonColor = 'default' | 'warning' | 'amplify';
export type ButtonState = 'hover' | 'focus' | 'active';

/**
 * Button (Figma: "Button" full matrix, Component Migration 68:2694).
 * Port of the prototype repo's `Button.astro`. Theme × Size × State + Color.
 *
 * Applied as an attribute so native button semantics (type, disabled,
 * aria-label, forms) stay on the real element:
 *
 *   <button ats-button theme="primary" iconLeft="add">Add</button>
 *   <button ats-button theme="fab" aria-label="Close"><img src="/icons/close.svg" alt=""></button>
 *
 * `state` forces a visual state for showcases; real :hover / :focus-visible /
 * :active / [disabled] work interactively. Colors are the Figma placeholder
 * tokens ("pending Novo redesign"), captured 1:1.
 */
@Component({
  selector: 'button[ats-button], a[ats-button]',
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
  private readonly iconPath = inject(ATS_ICON_PATH);
  protected readonly isAnchor = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'A';

  readonly theme = input<ButtonTheme>('standard');
  readonly size = input<ButtonSize>('default');
  readonly color = input<ButtonColor>('default');
  readonly state = input<ButtonState>();
  /** Force a fully-round (999px) radius, e.g. toggle segments. */
  readonly pill = input(false, { transform: booleanAttribute });
  /** Leading / trailing icon names from the icon set. Ignored for fab/icon themes. */
  readonly iconLeft = input<string>();
  readonly iconRight = input<string>();
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  protected readonly showIcons = computed(() => this.theme() !== 'fab' && this.theme() !== 'icon');

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

  protected iconSrc(name: string): string {
    return `${this.iconPath}/${name}.svg`;
  }
}
