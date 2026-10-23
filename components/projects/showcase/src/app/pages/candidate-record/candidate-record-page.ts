import { Component, booleanAttribute, computed, input } from '@angular/core';
import { BowlingAlleyNavState, CandidateRecord } from 'ats-ui';

/**
 * /candidate-record — the shell candidate record (Figma candidate-record 3868:89906):
 * Bowling Alley, Record Header, Workflow Stepper and the Overview cards.
 *
 * Embed mode: pass any param, e.g. /examples/candidate-record?embed=1&nav=collapsed&height=720
 * Params: embed=1 (frame without the page chrome), nav = collapsed | hover | open (default open),
 *         lock=true (freeze the nav), tab (active record header tab index), height (px; default 720).
 */
@Component({
  imports: [CandidateRecord],
  selector: 'app-candidate-record-page',
  styleUrl: './candidate-record-page.css',
  templateUrl: './candidate-record-page.html',
})
export class CandidateRecordPage {
  // Absent query params arrive as `undefined`, so defaults live in computeds.
  readonly embed = input<string>();
  readonly nav = input<BowlingAlleyNavState>();
  readonly lock = input(false, { transform: (v: unknown) => v != null && booleanAttribute(v) });
  readonly tab = input<string>();
  readonly height = input<string>();

  protected readonly isEmbed = computed(() => this.embed() != null);
  protected readonly embedNav = computed(() => this.nav() ?? 'open');
  protected readonly embedTab = computed(() => (this.tab() == null ? undefined : Number(this.tab())));
  protected readonly embedHeight = computed(() => Number(this.height()) || 720);
}
