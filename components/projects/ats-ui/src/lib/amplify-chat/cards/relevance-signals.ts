import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../../icon/icon';
import { NovoChip } from '../../novo-chip/novo-chip';

/**
 * AmplifyChatRelevanceSignals (Figma: "relevance-signals", 6152:126071; the content slot
 * of chat-list-item theme=prospect). Why Amplify picked this record: an Amplify sparkle +
 * "Relevance Signals" label, then one small NovoChip per signal, inside an Amplify-gradient
 * border (Border/Amplify Gradient).
 *
 *   <ats-amplify-chat-relevance-signals [signals]="['Director-level', 'Previously contacted']" />
 *
 * Extra projected content goes after the chips.
 */
@Component({
  selector: 'ats-amplify-chat-relevance-signals',
  imports: [Icon, NovoChip],
  template: `
    <span class="ats-amplify-chat-relevance-signals__label">
      <ats-icon class="ats-amplify-chat-relevance-signals__sparkle" name="amplify" [size]="12" />
      {{ labelText() }}
    </span>
    <span class="ats-amplify-chat-relevance-signals__signals">
      @for (s of signalList(); track $index) {
        <ats-novo-chip size="small" [label]="s" />
      }
      <ng-content />
    </span>
  `,
  styleUrl: './chat-list-item.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-relevance-signals' },
})
export class AmplifyChatRelevanceSignals {
  /** Signal labels, e.g. "Director-level", "Department Match: Project Management". */
  readonly signals = input<string[] | undefined>([]);
  /** Leading label. Default "Relevance Signals". */
  readonly label = input<string>();

  protected readonly signalList = computed(() => this.signals() ?? []);
  protected readonly labelText = computed(() => this.label() ?? 'Relevance Signals');
}
