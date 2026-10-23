import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';
import type { WorkflowStepStatus } from './workflow-stepper';

/**
 * WorkflowIndicator (Figma indicator, Component Migration 2269:42998 / 3384:87115).
 * The 18px mark in front of a workflow step: an empty gray ring (upcoming), a blue ring
 * (current), a filled blue circle with a check (complete), or a filled blue pill with a
 * count (`badge`, e.g. 3 or 99+) on a complete or current step.
 *
 *   <ats-workflow-indicator status="complete" />
 *   <ats-workflow-indicator status="complete" badge="99+" />
 */
@Component({
  selector: 'ats-workflow-indicator',
  imports: [Icon],
  template: `
    @if (badge()) {
      <span class="ats-wf-indicator__badge">{{ badge() }}</span>
    } @else if (status() === 'complete') {
      <ats-icon name="check" [size]="12" color="var(--workflow-color-content-complete)" />
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-wf-indicator',
    '[class.ats-wf-indicator--empty]': "status() === 'upcoming'",
    '[class.ats-wf-indicator--current]': "status() === 'current' && !badge()",
    '[class.ats-wf-indicator--filled]': "status() === 'complete' || !!badge()",
    '[class.ats-wf-indicator--pill]': '!!badge()',
    'aria-hidden': 'true',
  },
})
export class WorkflowIndicator {
  readonly status = input<WorkflowStepStatus>('upcoming');
  /** Short text (a count) shown in a filled pill instead of the check. */
  readonly badge = input<string>();
  protected readonly filled = computed(() => this.status() === 'complete' || !!this.badge());
}
