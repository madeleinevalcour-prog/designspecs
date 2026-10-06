import { Component, computed, input } from '@angular/core';
import { AmplifyChatSource, AmplifyChatSourcesRow, AmplifyChatSourcesRowState } from 'ats-ui';

const JOBS: AmplifyChatSource[] = [
  { label: 'Senior Java Developer', entity: 'job' },
  { label: 'Data Engineer', entity: 'job' },
  { label: 'Project Manager', entity: 'job' },
];
const MIXED: AmplifyChatSource[] = [
  { label: 'Verizon', entity: 'company' },
  { label: 'Dana Whitfield', entity: 'contact' },
  { label: 'Senior Java Developer', entity: 'job' },
  { label: 'Jordan Lee', entity: 'candidate' },
];

/**
 * /amplify-chat-sources — Amplify Chat — Sources (Figma doc frame 6300:27092):
 * amplify-chat/sources-row (6149:20865: state=collapsed / expanded). The toggle is live.
 *
 * Embed mode: any param renders one row, e.g.
 *   /examples/amplify-chat-sources?component=sources-row
 *   /examples/amplify-chat-sources?component=sources-row&state=expanded
 *   /examples/amplify-chat-sources?state=expanded&set=mixed
 * Params:
 *   component = sources-row (the only one)
 *   state = collapsed | expanded (initial; default collapsed)
 *   set = jobs | mixed (sample sources; default jobs) · summary (custom summary text)
 */
@Component({
  imports: [AmplifyChatSourcesRow],
  selector: 'app-amplify-chat-sources-page',
  template: `
    @if (embed()) {
      <div class="embed block">
        <ats-amplify-chat-sources-row [state]="state()" [summary]="summary() ?? (set() === 'mixed' ? mixedSummary : jobsSummary)"
          [sources]="set() === 'mixed' ? mixed : jobs" />
      </div>
    } @else {
      <h1>Amplify Chat — Sources</h1>
      <p class="lede">Figma <code>amplify-chat/sources-row</code> (6149:20865). Under a reply that used records: a summary that expands to the records, each a small link text with its entity-color circle. The toggle is live.</p>
      <div class="grid">
        <span class="caption">state=collapsed</span>
        <div class="block"><ats-amplify-chat-sources-row state="collapsed" [summary]="jobsSummary" [sources]="jobs" /></div>
        <span class="caption">state=expanded</span>
        <div class="block"><ats-amplify-chat-sources-row state="expanded" [summary]="jobsSummary" [sources]="jobs" /></div>
        <span class="caption">expanded, mixed record types</span>
        <div class="block"><ats-amplify-chat-sources-row state="expanded" [summary]="mixedSummary" [sources]="mixed" /></div>
      </div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 16px 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; max-width: 720px; }
    .grid { display: grid; grid-template-columns: 180px minmax(0, 560px); gap: 24px 16px; align-items: start; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; padding-top: 4px; }
    .block { max-width: 560px; }
  `,
})
export class AmplifyChatSourcesPage {
  readonly component = input<string>();
  readonly state = input<AmplifyChatSourcesRowState>();
  readonly set = input<'jobs' | 'mixed'>();
  readonly summary = input<string>();

  protected readonly jobs = JOBS;
  protected readonly mixed = MIXED;
  protected readonly jobsSummary = 'Based on 14 job orders · Updated today';
  protected readonly mixedSummary = 'Based on 4 records · Updated today';
  protected readonly embed = computed(() => !!(this.component() || this.state() || this.set() || this.summary()));
}
