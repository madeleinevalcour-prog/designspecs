import { InjectionToken, Signal } from '@angular/core';

/** Provided by CheckList so its CheckboxLabels can follow its `disabled`. */
export const CHECK_LIST = new InjectionToken<{ disabled: Signal<boolean> }>('CHECK_LIST');
