import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';
import { WorkflowIndicator } from './workflow-indicator';
import type { WorkflowStepStatus } from './workflow-stepper';

/**
 * WorkflowItem (Figma workflow-item, Component Migration 311:28996 and variants
 * empty / check / number / current, plus the `-last` versions). One step: indicator, label and a
 * 1px connector that fills the space up to the next step (blue once the step is
 * complete or current, gray while upcoming). The current step carries a small
 * "current" label above its indicator. The last step has no connector (`last`).
 *
 *   <ats-workflow-item label="Prescreen" status="complete" />
 */
@Component({
  selector: 'ats-workflow-item',
  imports: [WorkflowIndicator],
  template: `
    <ats-workflow-indicator [status]="status()" [badge]="badge()" />
    <span class="ats-wf-step__label">{{ label() }}</span>
    @if (status() === 'complete') { <span class="ats-wf__sr">(complete)</span> }
    @if (!last()) { <span class="ats-wf-step__line" aria-hidden="true"></span> }
    @if (status() === 'current') { <span class="ats-wf-step__current" aria-hidden="true">current</span> }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listitem',
    class: 'ats-wf-step',
    '[class.is-complete]': "status() === 'complete'",
    '[class.is-current]': "status() === 'current'",
    '[class.is-active]': "status() !== 'upcoming'",
    '[class.is-last]': 'last()',
    '[attr.aria-current]': "status() === 'current' ? 'step' : null",
  },
})
export class WorkflowItem {
  readonly label = input.required<string>();
  readonly status = input<WorkflowStepStatus>('upcoming');
  /** Count shown in the indicator, e.g. 3 or 99+. */
  readonly badge = input<string>();
  /** The last step: no connector. */
  readonly last = input(false, { transform: booleanAttribute });
}
