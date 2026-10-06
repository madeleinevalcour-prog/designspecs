import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

/** Figma novo-chip `type`: `default` labels in the content color, `link` in the link color. */
export type NovoChipType = 'default' | 'link';
export type NovoChipSize = 'small' | 'medium' | 'large';
export type NovoChipColor = 'default' | 'negative' | 'warning' | 'positive' | 'success';
export type NovoChipState = 'hover' | 'focus';

const ICON_SIZE: Record<NovoChipSize, number> = { small: 10, medium: 12, large: 14 };

/**
 * NovoChip (Figma: "novo-chip", 157:2949 in panel 45:445). type × size × state × color:
 * - type `default` | `link` (link-colored label; with `href` the label is a real link)
 * - size `small` (meta/sm, 10px icons) | `medium` (meta/default, 12px) | `large` (meta/large, 14px)
 * - color `default` | `negative` | `warning` | `positive` | `success`
 * - state default / hover / focus (hover + focus are live; `state` forces one for docs)
 *
 * Optional leading glyph (`icon`, Figma "Bolt" placeholder) and a trailing remove
 * control (`removable`, Figma "Close"): a native button labelled "Remove <label>"
 * that emits `removed`. Hover styling applies only when the chip is interactive
 * (removable or a link); focus styling shows while its control has keyboard focus.
 *
 *   <ats-novo-chip label="Java" removable (removed)="drop('Java')" />
 *   <ats-novo-chip color="positive" icon="bolt" label="10 New Results" />
 *   <ats-novo-chip type="link" href="/jobs/425" label="425 | Project Manager" />
 */
@Component({
  selector: 'ats-novo-chip',
  imports: [Icon],
  template: `
    @if (icon()) { <ats-icon class="ats-novo-chip__icon" [name]="icon()!" [size]="iconSize()" color="var(--_chip-icon)" /> }
    @if (label()) {
      @if (href()) {
        <a class="ats-novo-chip__label" [attr.href]="href()">{{ label() }}</a>
      } @else {
        <span class="ats-novo-chip__label">{{ label() }}</span>
      }
    }
    @if (isRemovable()) {
      <button type="button" class="ats-novo-chip__remove" [attr.aria-label]="removeLabel()" (click)="removed.emit($event)">
        <ats-icon name="close" [size]="iconSize()" color="var(--_chip-icon)" />
      </button>
    }
  `,
  styleUrl: './novo-chip.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-novo-chip',
    '[attr.data-type]': 'typeName()',
    '[attr.data-size]': 'sizeName()',
    '[attr.data-color]': 'colorName()',
    '[class.ats-novo-chip--interactive]': 'isRemovable() || !!href()',
    '[class.is-hover]': "state() === 'hover'",
    '[class.is-focus]': "state() === 'focus'",
  },
})
export class NovoChip {
  readonly label = input<string>();
  readonly type = input<NovoChipType | undefined>('default');
  readonly size = input<NovoChipSize | undefined>('medium');
  readonly color = input<NovoChipColor | undefined>('default');
  /** Leading glyph from the icon set; omit to hide it. */
  readonly icon = input<string>();
  /** Show the trailing remove (close) button. */
  readonly removable = input<boolean | undefined, unknown>(false, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Accessible name of the remove button; defaults to "Remove <label>". */
  readonly removeAriaLabel = input<string>();
  /** Render the label as a link to this URL. */
  readonly href = input<string>();
  /** Force a visual state, for showcases / docs. */
  readonly state = input<NovoChipState>();
  /** Emits when the remove button is activated. */
  readonly removed = output<MouseEvent>();

  protected readonly typeName = computed(() => this.type() ?? 'default');
  protected readonly sizeName = computed(() => this.size() ?? 'medium');
  protected readonly colorName = computed(() => this.color() ?? 'default');
  protected readonly isRemovable = computed(() => this.removable() ?? false);
  protected readonly iconSize = computed(() => ICON_SIZE[this.sizeName()]);
  protected readonly removeLabel = computed(() => this.removeAriaLabel() ?? (this.label() ? `Remove ${this.label()}` : 'Remove'));
}
