import { Component, computed, input } from '@angular/core';
import { AmplifyChatRelevanceSignals } from 'ats-ui';

const THREE = ['Director-level', 'Department Match: Project Management', 'Previously contacted'];
// Sample signals from the Cards showcase data.
const MANY = [...THREE, 'Department Match: IT Operations', 'Department Match: Infrastructure', 'Department Match: Networking', 'Department Match: Security'];

/**
 * /amplify-chat-relevance-signals — AmplifyChatRelevanceSignals: why Amplify picked a
 * prospect. The label (default "Relevance Signals") and one small chip per signal, inside
 * the Amplify gradient border.
 *
 * Embed mode: `signals` (comma list) and/or `label`, e.g.
 *   /examples/amplify-chat-relevance-signals?signals=Director-level,Previously%20contacted&label=Hiring%20signals
 * No params → the matrix: 1, 3 and many signals × default and custom label.
 */
@Component({
  imports: [AmplifyChatRelevanceSignals],
  selector: 'app-amplify-chat-relevance-signals-page',
  templateUrl: './amplify-chat-relevance-signals-page.html',
  styleUrl: './amplify-chat-relevance-signals-page.css',
})
export class AmplifyChatRelevanceSignalsPage {
  readonly signals = input<string>();
  readonly label = input<string>();

  protected readonly embed = computed(() => this.signals() != null || this.label() != null);
  // Defaults in computeds: unset query params bind as undefined and would override input defaults.
  protected readonly signalList = computed(() => {
    const s = this.signals();
    return s == null ? THREE : s.split(',').map((x) => x.trim()).filter(Boolean);
  });

  protected readonly sets = [
    { name: '1 signal', signals: ['Director-level'] },
    { name: '3 signals', signals: THREE },
    { name: 'Many signals (wraps)', signals: MANY },
  ];
  protected readonly labels: { name: string; value: string | undefined }[] = [
    { name: 'Default label', value: undefined },
    { name: 'Custom label: Hiring signals', value: 'Hiring signals' },
  ];
}
