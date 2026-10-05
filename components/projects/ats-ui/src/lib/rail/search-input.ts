import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * SearchInput (Figma: "search-input") — pill search field used by the rail's Fast
 * Find, the Menu overlay and the Header. States: default / hover / active
 * (`active` forces it; `:focus-within` gives it live). The close X shows when active.
 *
 *   <ats-search-input placeholder="Search" [(value)]="q" (closed)="dismiss()" />
 */
@Component({
  selector: 'ats-search-input',
  imports: [Icon],
  template: `
    <div class="ats-search-input__field">
      <ats-icon class="ats-search-input__icon" name="search" [size]="12" color="var(--color-icon-subtle)" />
      <input
        #field
        class="ats-search-input__input"
        type="text"
        [placeholder]="placeholder()"
        [attr.aria-label]="ariaLabel() || placeholder()"
        [value]="value()"
        (input)="value.set(field.value)"
        (focus)="focused.emit()"
        (keydown.escape)="closed.emit()"
      />
    </div>
    <button class="ats-search-input__close" type="button" aria-label="Close" (click)="onClose($event)">
      <ats-icon name="close" [size]="12" color="var(--color-icon-subtle)" />
    </button>
  `,
  styleUrl: './search-input.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-search-input', '[class.is-active]': 'active()' },
})
export class SearchInput {
  readonly placeholder = input('Find anything in Bullhorn…');
  readonly ariaLabel = input<string>();
  /** Render in the active (keyboard-focused) state. */
  readonly active = input(false, { transform: booleanAttribute });
  readonly value = model('');
  /** The close X was clicked (or Escape pressed in the field). */
  readonly closed = output<void>();
  readonly focused = output<void>();

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
