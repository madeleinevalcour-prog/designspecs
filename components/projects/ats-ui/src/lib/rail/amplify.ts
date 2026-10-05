import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { RailController } from './rail-controller';

/**
 * Amplify (Figma: "Amplify", 157:2984) — the right-dock chat panel. Slides in from
 * the right (flex-basis 0 → 420px) and the canvas contracts to fit. Inside
 * `<ats-rail-shell>` it follows the controller's `amplify` signal (rail Amplify tab,
 * Header Amplify button, its own close X). `open` forces the state (standalone use).
 * The thread is the prototype's sample conversation.
 */
@Component({
  selector: 'ats-amplify',
  imports: [Icon],
  templateUrl: './amplify.html',
  styleUrl: './amplify.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify',
    role: 'complementary',
    'aria-label': 'Amplify',
    '[class.is-open]': 'isOpen()',
    '[attr.aria-hidden]': 'isOpen() ? null : "true"',
    '[attr.inert]': 'isOpen() ? null : ""',
  },
})
export class Amplify {
  private readonly ctrl = inject(RailController, { optional: true });
  /** Force open / closed. Unset = follow the rail shell. */
  readonly open = input<boolean | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)),
  });
  readonly closed = output<void>();
  readonly expanded = output<void>();

  protected readonly isOpen = computed(() => this.open() ?? this.ctrl?.amplify() ?? false);
  protected readonly draft = signal('');
  protected readonly context = signal(['Tyler Brooks']);
  protected readonly results = [0, 1, 2].map(() => ({ initials: 'MS', name: 'Marie Smith', sub: 'Nexus Dynamics • Head of Engine…', badge: '10 Open Jobs' }));

  protected close() {
    this.ctrl?.amplify.set(false);
    this.closed.emit();
  }
}
