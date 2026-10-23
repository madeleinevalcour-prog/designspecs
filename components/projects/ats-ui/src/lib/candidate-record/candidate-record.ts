import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input } from '@angular/core';
import { BowlingAlley } from '../bowling-alley/bowling-alley';
import { BowlingAlleyEntityTab, BowlingAlleyNavState } from '../bowling-alley/bowling-alley-controller';
import { BowlingAlleyShell } from '../bowling-alley/bowling-alley-shell';
import { Card } from '../card/card';
import { CardDetailRow } from '../card/card-detail-row';
import { NovoList } from '../novo-list/novo-list';
import { NovoListItemJob, NovoListItemNote, NovoListItemTask } from '../novo-list/presets';
import { RecordHeader, RecordHeaderField, RecordHeaderTab } from '../record-header/record-header';
import { WorkflowStep, WorkflowStepper } from '../workflow-stepper/workflow-stepper';

/** The record tab that is open in the bowling alley (the candidate record's own tab). */
const TABS: BowlingAlleyEntityTab[] = [
  { id: 'candidates', type: 'candidate', label: 'Candidates', icon: 'candidate-list', pinned: false, active: false },
  { id: 'tyler', type: 'candidate', label: '213 | Tyler Brooks', pinned: true, active: true },
  { id: 'jobs', type: 'job', label: 'Jobs', icon: 'job-list', pinned: false, active: false },
  { id: 'swe', type: 'job', label: '425 | Software Engineer', pinned: false, active: false },
  { id: 'note', type: 'note', label: 'Add Note', pinned: false, active: false, pinnable: false },
];

const FIELDS: RecordHeaderField[] = [
  { label: 'ID', value: '2034' },
  { label: 'Full Name', value: 'Tyler Brooks' },
  { label: 'Status', value: 'Placed', kind: 'select' },
  { label: 'Primary Email', value: 'tyler.brooks@gmail.com', kind: 'link', href: '#' },
  { label: 'Job Title', value: 'Software Engineer' },
  { label: 'Risk Level', value: 'No Signal Data', kind: 'chip', icon: 'shield-outline' },
];

const HEADER_TABS: RecordHeaderTab[] = [
  { label: 'Overview', active: true },
  { label: 'Edit' },
  { label: 'Activity' },
  { label: 'Submissions' },
  { label: 'Employment Histories', count: 2 },
  { label: 'Notes', count: 4 },
];

const WORKFLOW: WorkflowStep[] = [
  { label: 'Prescreen', status: 'complete', badge: '3' },
  { label: 'Pre-Submission', status: 'current' },
  { label: 'Internal Submission' },
  { label: 'Client Submission' },
  { label: 'Schedule Interview' },
  { label: 'Offer Extended' },
  { label: 'Placement' },
];

/**
 * CandidateRecord — the shell candidate record page (Figma candidate-record, Component
 * Migration 3868:89906). Composed only from ats-ui components: the Bowling Alley (with
 * the candidate's tab open), the Record Header, the Workflow Stepper, and an Overview
 * of Cards (Details, Open Tasks, Open Submissions, Recent Notes) holding Novo list items.
 * Sample content only; it is the page every candidate-record prototype starts from.
 *
 *   <ats-candidate-record nav="collapsed" />
 *
 * Sizes to the browser window (100dvh), like `<ats-bowling-alley-shell>`; inside a sized
 * container, set `height: 100%` on it.
 */
@Component({
  selector: 'ats-candidate-record',
  imports: [BowlingAlleyShell, BowlingAlley, RecordHeader, WorkflowStepper, Card, CardDetailRow, NovoList, NovoListItemTask, NovoListItemJob, NovoListItemNote],
  templateUrl: './candidate-record.html',
  styleUrl: './candidate-record.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-candidate-record' },
})
export class CandidateRecord {
  /** Starting nav state. Default `open`, as in the Figma frame. */
  readonly nav = input<BowlingAlleyNavState>('open');
  /** Freeze the nav state (docs). */
  readonly lockNav = input(false, { transform: booleanAttribute });
  /** Active record header tab (index). */
  readonly tab = input<number>();

  protected readonly tabs = TABS;
  protected readonly fields = FIELDS;
  protected readonly headerTabs = HEADER_TABS;
  protected readonly workflow = WORKFLOW;
  protected readonly noteBody =
    'Tyler is Pre-Registered and available starting June 23, 2026, seeking entry-level cloud/infrastructure roles.';
  protected readonly tasks = ['Call Tyler Brooks', 'Set up interview for Software Engineer position', 'Call Tyler Brooks'];
  protected readonly submissions = [1, 2, 3, 4].map(() => '425 | Software Engineer');
}
