import { InjectionToken, Signal } from '@angular/core';

/** What a DropdownOption needs from the Dropdown it sits in (avoids a circular import). */
export interface DropdownHost {
  /** The panel's ARIA role: options become `menuitem` in a menu, `option` in a listbox. */
  readonly role: Signal<'listbox' | 'menu'>;
  /** An option was chosen (click, Enter or Space). */
  choose(value: unknown): void;
}

export const DROPDOWN = new InjectionToken<DropdownHost>('ats-dropdown');
