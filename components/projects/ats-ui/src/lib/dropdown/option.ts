import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { Icon } from '../icon/icon';
import { DROPDOWN } from './dropdown-token';

/** Figma option `Property 1`. Hover is also live (keyboard focus shows it too); `state` forces one for docs. */
export type OptionState = 'default' | 'hover' | 'selected';

/**
 * Option (Figma: "option", 364:8124 — default 364:8144, hover 364:8125, selected 1474:50703).
 * One row of a Dropdown: an optional 16px icon (Figma `show icon`), the label in
 * input/value/default (projected), and on `selected` the check indicator (bhi-check).
 * Hover and selected fill with dropdown/color/content/background/*.
 *
 *   <button ats-option value="list" icon="add">Add to list</button>
 *   <li ats-option [selected]="true">Verizon</li>
 *
 * Applied as an attribute on a native element (button / li / div) so its semantics stay.
 * Inside an `ats-dropdown` it takes `role="option"` (listbox) or `role="menuitem"` (menu),
 * is reached with the arrow keys (tabindex -1; the panel moves focus), and choosing it
 * (click, Enter, Space) emits `chosen` and tells the dropdown.
 * Not built: Figma `fastadd` (the 40px entity icon-container row) — MenuOption type=entity covers it.
 */
@Component({
  selector: 'button[ats-option], li[ats-option], div[ats-option]',
  imports: [Icon],
  template: `
    @if (icon()) {
      <ats-icon class="ats-option__icon" [name]="icon()!" [size]="16" color="currentColor" aria-hidden="true" />
    }
    <span class="ats-option__label"><ng-content /></span>
    @if (isSelected()) {
      <ats-icon class="ats-option__check" name="check" [size]="16" color="currentColor" aria-hidden="true" />
    }
  `,
  styleUrl: './option.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-option',
    tabindex: '-1',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.role]': 'role()',
    '[attr.aria-selected]': "role() === 'option' ? isSelected() : null",
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[class.is-hover]': "state() === 'hover'",
    '[class.is-selected]': 'isSelected()',
    '[class.is-disabled]': 'disabled()',
    '(click)': 'choose()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
})
export class Option {
  private readonly dropdown = inject(DROPDOWN, { optional: true });
  protected readonly isButton = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  /** Forces the Figma variant (docs). `selected` also shows the check. */
  readonly state = input<OptionState>();
  /** Selected (Figma selected: fill + check). */
  readonly selected = input(false, { transform: booleanAttribute });
  /** Figma `show icon`: a 16px glyph before the label. */
  readonly icon = input<string>();
  /** Emitted with `chosen` and passed to the dropdown's `chosen`. */
  readonly value = input<unknown>();
  readonly disabled = input(false, { transform: booleanAttribute });

  /** The option was chosen (click, Enter, Space). */
  readonly chosen = output<unknown>();

  protected readonly role = computed(() => (this.dropdown ? (this.dropdown.role() === 'menu' ? 'menuitem' : 'option') : null));
  protected readonly isSelected = computed(() => this.selected() || this.state() === 'selected');

  protected choose(): void {
    if (this.disabled()) return;
    this.chosen.emit(this.value());
    this.dropdown?.choose(this.value());
  }

  /** Native buttons already click on Enter / Space; other elements need it. */
  protected onKey(e: Event): void {
    if (this.isButton) return;
    e.preventDefault();
    this.choose();
  }
}
