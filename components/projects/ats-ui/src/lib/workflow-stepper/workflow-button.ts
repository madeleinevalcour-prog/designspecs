import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * WorkflowButton (Figma workflow-button, Component Migration 756:62). A white tile with a
 * large count over a small label; five of them sit in a row above the stepper
 * (Task, Submission, Client submission, Interviews, Placement).
 *
 *   <button ats-workflow-button number="1" label="Task"></button>
 */
@Component({
  selector: 'button[ats-workflow-button]',
  template: `<span class="ats-wf-button__number">{{ number() }}</span><span class="ats-wf-button__label">{{ label() }}</span>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-wf-button', type: 'button' },
})
export class WorkflowButton {
  readonly number = input<string | number>('1');
  readonly label = input<string>('Task');
}
