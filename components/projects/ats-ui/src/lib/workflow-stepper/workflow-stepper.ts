import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Icon } from '../icon/icon';

export type WorkflowStepStatus = 'complete' | 'current' | 'upcoming';

export interface WorkflowStep {
  label: string;
  /** Defaults to `upcoming`. */
  status?: WorkflowStepStatus;
  /** Short text (e.g. a count) shown in the indicator. Only rendered on the current step. */
  badge?: string;
}

/** The candidate placement pipeline used by the prototypes (all upcoming). */
export const PLACEMENT_WORKFLOW_STEPS: readonly WorkflowStep[] = [
  'Prescreen',
  'Pre-Submission',
  'Internal Submission',
  'Client Submission',
  'Schedule Interview',
  'Offer Extended',
  'Placement',
].map((label) => ({ label, status: 'upcoming' as const }));

/**
 * WorkflowStepper (Figma: workflow, Component Migration 589:6990 / 1528:61198).
 * Port of the prototype repo's `WorkflowStepper.astro`.
 *
 * A rounded card holding a horizontally-scrollable row of steps joined by 40px
 * connectors. The current step shows a filled dark indicator (optionally with a
 * white `badge`); connectors up to and including it read as active. When the row
 * overflows, translucent scroll arrows appear on the overflowing edge(s).
 *
 *   <ats-workflow-stepper [steps]="steps" />
 *   steps = [{ label: 'Prescreen', status: 'current', badge: '3' }, { label: 'Placement' }];
 *
 * Rendered as an ordered list; the current step carries `aria-current="step"`.
 */
@Component({
  selector: 'ats-workflow-stepper',
  imports: [Icon],
  templateUrl: './workflow-stepper.html',
  styleUrl: './workflow-stepper.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-wf',
    '[class.ats-wf--of-left]': 'overflowLeft()',
    '[class.ats-wf--of-right]': 'overflowRight()',
  },
})
export class WorkflowStepper {
  readonly steps = input<readonly WorkflowStep[]>(PLACEMENT_WORKFLOW_STEPS);
  /** Accessible name for the list of steps. */
  readonly ariaLabel = input('Placement workflow');

  protected readonly items = computed(() =>
    this.steps().map((s) => ({ ...s, status: s.status ?? ('upcoming' as WorkflowStepStatus) })),
  );

  protected readonly overflowLeft = signal(false);
  protected readonly overflowRight = signal(false);

  private readonly row = viewChild.required<ElementRef<HTMLElement>>('row');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Re-measure after every render that changes the steps.
    afterRenderEffect(() => {
      this.items();
      this.update();
    });
    afterNextRender(() => {
      const ro = 'ResizeObserver' in window ? new ResizeObserver(() => this.update()) : null;
      ro?.observe(this.host);
      document.fonts?.ready.then(() => this.update());
      this.destroyRef.onDestroy(() => ro?.disconnect());
    });
  }

  protected scroll(dir: -1 | 1): void {
    const el = this.row().nativeElement;
    const amount = Math.max(160, Math.round(el.clientWidth * 0.75));
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  protected update(): void {
    const el = this.row().nativeElement;
    const max = el.scrollWidth - el.clientWidth;
    this.overflowLeft.set(el.scrollLeft > 1);
    this.overflowRight.set(el.scrollLeft < max - 1);
  }
}
