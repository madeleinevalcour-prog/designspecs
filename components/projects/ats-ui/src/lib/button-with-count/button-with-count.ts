import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, numberAttribute } from '@angular/core';
import { CountBadge } from '../count-badge/count-badge';

/**
 * ButtonWithCount (Figma: "button-with-count", 6816:24357 — Amplify page navigation and header).
 * A Button with a CountBadge pinned to its top-right corner: the badge sits 4px above and
 * 4px right of the button (the wrapper's top / right padding) and grows to the left for 12
 * or 99+. Used for the Chats toggle in the Amplify header.
 *
 * Project the button (any ats-button); the wrapper adds the badge. With `showCount` off, or a
 * count of 0, the badge is hidden but the 4px space stays, so the button doesn't move.
 * Put the count in the button's accessible name ("Chats, 2 new"); the badge is aria-hidden.
 *
 *   <ats-button-with-count [count]="unread()">
 *     <button ats-button theme="secondary" size="small" [state]="open() ? 'active' : undefined"
 *       [attr.aria-pressed]="open()" [attr.aria-label]="'Chats, ' + unread() + ' new'" (click)="toggle()">Chats</button>
 *   </ats-button-with-count>
 */
@Component({
  selector: 'ats-button-with-count',
  imports: [CountBadge],
  template: `
    <ng-content />
    @if (visible()) { <ats-count-badge class="ats-button-with-count__badge" [count]="count()" [max]="max()" /> }
  `,
  styleUrl: './button-with-count.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-button-with-count' },
})
export class ButtonWithCount {
  /** Badge number. Default 2 (Figma's default). */
  readonly count = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)) });
  /** Above this the badge shows "{max}+". Default 99. */
  readonly max = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)) });
  /** Figma "show count". Default true; the badge also hides at 0. */
  readonly showCount = input<boolean | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });

  protected readonly visible = computed(() => (this.showCount() ?? true) && (this.count() ?? 2) > 0);
}
