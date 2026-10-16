import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, numberAttribute } from '@angular/core';

/**
 * CountBadge (Figma: "count-badge", 6814:24310 — Amplify page navigation and header).
 * A small round count of new items, for the corner of a control (e.g. unread scheduled
 * runs on the Chats button). 16px tall; one digit is a circle, longer counts stretch into a
 * pill. A 2px ring separates it from the control underneath. Text style meta/small.
 *
 * Shows `count`, or "{max}+" above `max` (default 99 → "99+"). It renders nothing visible
 * at 0 or below; the parent usually doesn't render it then. Decorative (aria-hidden): put
 * the count in the control's accessible name instead ("Chats, 2 new").
 *
 *   <ats-count-badge [count]="2" />
 *   <ats-count-badge [count]="140" />          → 99+
 */
@Component({
  selector: 'ats-count-badge',
  template: `{{ text() }}`,
  styleUrl: './count-badge.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-count-badge', 'aria-hidden': 'true', '[hidden]': 'hidden()' },
})
export class CountBadge {
  /** The number to show. Default 2 (Figma's default). */
  readonly count = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)) });
  /** Above this, show "{max}+". Default 99. */
  readonly max = input<number | undefined, unknown>(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)) });

  private readonly value = computed(() => this.count() ?? 2);
  protected readonly hidden = computed(() => this.value() <= 0);
  protected readonly text = computed(() => { const m = this.max() ?? 99; return this.value() > m ? `${m}+` : String(this.value()); });
}
