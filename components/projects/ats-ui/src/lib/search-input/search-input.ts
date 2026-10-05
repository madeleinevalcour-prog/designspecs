import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { Icon } from '../icon/icon';

export type SearchInputVariant = 'field' | 'pill';

/**
 * SearchInput (Figma: "search-input", Component Migration). Two shapes, both from
 * the bowling-alley frames:
 *  - `field` (default): the Fast Find field (node 1323:67011). 32px, radius xsm,
 *    16px text, a close button on the right.
 *  - `pill`: the Menu overlay's Filter (novo-drag-container 1323:68245). 40px min,
 *    fully round, 14px text, no close button.
 * Hover and focus are live; `active` forces the focused look (docs).
 *
 *   <ats-search-input placeholder="Find anything in Bullhorn" [(value)]="q" (closed)="dismiss()" />
 *   <ats-search-input variant="pill" placeholder="Filter" [(value)]="filter" />
 */
@Component({
  selector: 'ats-search-input',
  imports: [Icon],
  template: `
    <span class="ats-search-input__icon"><ats-icon name="search" [size]="12" color="var(--search-color-content-icon)" /></span>
    <input
      #field
      class="ats-search-input__input"
      type="search"
      [placeholder]="placeholderText()"
      [attr.aria-label]="ariaLabel() || placeholderText()"
      [value]="value()"
      (input)="value.set(field.value)"
      (focus)="focused.emit()"
      (keydown.escape)="closed.emit()"
    />
    @if (showClose()) {
      <button class="ats-search-input__close" type="button" aria-label="Close search" (click)="onClose($event)">
        <ats-icon name="close" [size]="12" color="var(--color-icon-subtle)" />
      </button>
    }
  `,
  styleUrl: './search-input.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-search-input',
    '[class.ats-search-input--pill]': "shape() === 'pill'",
    '[class.is-active]': 'active()',
    '(click)': 'focus()',
  },
})
export class SearchInput {
  readonly variant = input<SearchInputVariant>();
  readonly placeholder = input<string>();
  readonly ariaLabel = input<string>();
  /** Render in the focused state (docs / showcases). */
  readonly active = input(false, { transform: booleanAttribute });
  /** Show the close button. Defaults to true for `field`, false for `pill`. */
  readonly closable = input<boolean | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)),
  });
  readonly value = model('');
  /** The close button was clicked, or Escape was pressed in the field. */
  readonly closed = output<void>();
  readonly focused = output<void>();

  protected readonly shape = computed<SearchInputVariant>(() => this.variant() ?? 'field');
  protected readonly placeholderText = computed(
    () => this.placeholder() ?? (this.shape() === 'pill' ? 'Filter' : 'Find anything in Bullhorn'),
  );
  protected readonly showClose = computed(() => this.closable() ?? this.shape() === 'field');

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  focus() {
    this.field().nativeElement.focus();
  }
  blur() {
    this.field().nativeElement.blur();
  }

  protected onClose(e: Event) {
    e.stopPropagation();
    this.closed.emit();
  }
}
