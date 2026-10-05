import { ChangeDetectionStrategy, Component, ViewEncapsulation, model, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Amplify (Figma: "Amplify", 157:2984) — the right-dock chat panel, standalone.
 * Slides in from the right (flex-basis 0 → 420px) inside a flex row, so the content
 * beside it contracts to fit. Bind `[(open)]`; its close X sets it to false.
 * The thread is the prototype's sample conversation.
 * Not yet documented: no showcase route or doc page (pending its own review).
 *
 *   <div style="display: flex"><main>…</main><ats-amplify [(open)]="amplifyOpen" /></div>
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
    '[class.is-open]': 'open()',
    '[attr.aria-hidden]': 'open() ? null : "true"',
    '[attr.inert]': 'open() ? null : ""',
  },
})
export class Amplify {
  /** Open / closed (two-way). */
  readonly open = model(false);
  readonly closed = output<void>();
  readonly expanded = output<void>();

  protected readonly draft = signal('');
  protected readonly context = signal(['Tyler Brooks']);
  protected readonly results = [0, 1, 2].map(() => ({ initials: 'MS', name: 'Marie Smith', sub: 'Nexus Dynamics • Head of Engine…', badge: '10 Open Jobs' }));

  protected close() {
    this.open.set(false);
    this.closed.emit();
  }
}
