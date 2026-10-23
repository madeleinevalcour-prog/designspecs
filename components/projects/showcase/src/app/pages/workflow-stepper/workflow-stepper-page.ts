import { Component, computed, input } from '@angular/core';
import { PLACEMENT_WORKFLOW_STEPS, WorkflowButton, WorkflowIndicator, WorkflowItem, WorkflowStep, WorkflowStepper } from 'ats-ui';

/** Builds typed steps: steps before `current` are complete. `badge` is the count on the first step (Prescreen). */
function build(labels: readonly string[], current: number, badge?: string): WorkflowStep[] {
  return labels.map((label, i) => ({
    label,
    status: i < current ? 'complete' : i === current ? 'current' : 'upcoming',
    badge: i === 0 && i <= current ? badge : undefined,
  }));
}

const PLACEMENT = PLACEMENT_WORKFLOW_STEPS.map((s) => s.label);

/**
 * /workflow-stepper — reference view of every state, plus overflow.
 *
 * Embed mode: pass any param to render a single stepper for a docs page, e.g.
 *   /examples/workflow-stepper?current=0&badge=3
 *   /examples/workflow-stepper?current=3&width=560
 *   /examples/workflow-stepper?part=indicator | item | buttons   (the subcomponents)
 * Params: current (index of the current step; earlier steps read complete; default
 *         none = all upcoming), badge (count in the first step's indicator pill),
 *         steps (comma list of labels; default the 7 placement steps),
 *         width (px; constrain the card to show the overflow arrows).
 */
@Component({
  imports: [WorkflowStepper, WorkflowIndicator, WorkflowItem, WorkflowButton],
  selector: 'app-workflow-stepper-page',
  styleUrl: './workflow-stepper-page.css',
  templateUrl: './workflow-stepper-page.html',
})
export class WorkflowStepperPage {
  // Bound from query params. Absent params arrive as `undefined`, so defaults
  // are applied in the computeds below.
  readonly current = input<string>();
  readonly badge = input<string>();
  readonly steps = input<string>();
  readonly width = input<string>();
  readonly part = input<'indicator' | 'item' | 'buttons'>();

  protected readonly embed = computed(
    () => this.current() !== undefined || this.badge() !== undefined || this.steps() !== undefined || this.width() !== undefined || this.part() !== undefined,
  );
  protected readonly embedSteps = computed(() => {
    const labels = this.steps()?.split(',').map((s) => s.trim()).filter(Boolean) ?? PLACEMENT;
    const current = this.current() === undefined ? -1 : Number(this.current());
    return build(labels, Number.isFinite(current) ? current : -1, this.badge());
  });
  protected readonly embedWidth = computed(() => {
    const w = Number(this.width());
    return this.width() !== undefined && Number.isFinite(w) && w > 0 ? w : null;
  });

  protected readonly examples = [
    { title: 'All upcoming', note: 'No current step.', steps: build(PLACEMENT, -1) },
    { title: 'Count on the first step', note: 'Prescreen complete with a count of 3, second step current.', steps: build(PLACEMENT, 1, '3') },
    { title: 'In progress', note: 'Steps before the current one read complete; connectors from complete and current steps are blue.', steps: build(PLACEMENT, 3) },
    { title: 'Current step without badge', note: 'The blue ring and “current” label.', steps: build(PLACEMENT, 2) },
    { title: 'All complete', note: 'Every step complete; every connector active.', steps: build(PLACEMENT, PLACEMENT.length) },
    { title: 'Short workflow', note: 'Custom labels; no overflow.', steps: build(['Applied', 'Interview', 'Offer'], 1) },
  ];
  protected readonly overflowSteps = build(PLACEMENT, 3, '3');
  protected readonly buttons = [['1', 'Task'], ['1', 'Submission'], ['1', 'Client submission'], ['1', 'Interviews'], ['1', 'Placement']];
}
