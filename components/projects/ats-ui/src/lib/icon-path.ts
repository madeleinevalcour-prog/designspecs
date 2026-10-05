import { InjectionToken } from '@angular/core';

/**
 * Base URL the icon set (`assets/icons/*.svg`) is served from. Defaults to `icons`,
 * resolved against the app's <base href> (so it works under a sub-path like /examples/).
 */
export const ATS_ICON_PATH = new InjectionToken<string>('ATS_ICON_PATH', {
  providedIn: 'root',
  factory: () => 'icons',
});
