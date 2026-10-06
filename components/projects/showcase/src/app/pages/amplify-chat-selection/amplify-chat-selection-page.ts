import { Component, computed, input, signal } from '@angular/core';
import { AmplifyChatSelectionAction, AmplifyChatSelectionSplitButton, AmplifyChatSelectionSplitButtonState } from 'ats-ui';

const ACTIONS: AmplifyChatSelectionAction[] = [
  { id: 'list', label: 'Add to list', icon: 'list-outline' },
  { id: 'tearsheet', label: 'Add to tearsheet', icon: 'tearsheet' },
  { id: 'sequence', label: 'Add to Outreach sequence', icon: 'automation', preview: true },
];

/**
 * /amplify-chat-selection — Amplify Chat — Selection (Figma doc/selection 6300:127589).
 * amplify-chat/selection-split-button (6271:183528): one and many selected (hidden at zero), the
 * menu open, and a live example.
 *
 * Embed mode: `component=selection-split-button` renders one button, e.g.
 *   /examples/amplify-chat-selection?component=selection-split-button&count=5
 *   /examples/amplify-chat-selection?component=selection-split-button&count=0
 *   /examples/amplify-chat-selection?component=selection-split-button&count=3&open=true
 * Params:
 *   component = selection-split-button
 *   count (default 5) · verb (default "Add") · noun (default "Contact") · label (full override)
 *   open = true (menu open) · state = hover | focus | active
 */
@Component({
  imports: [AmplifyChatSelectionSplitButton],
  selector: 'app-amplify-chat-selection-page',
  templateUrl: './amplify-chat-selection-page.html',
  styleUrl: './amplify-chat-selection-page.css',
})
export class AmplifyChatSelectionPage {
  readonly component = input<'selection-split-button'>();
  readonly count = input<string>();
  readonly verb = input<string>();
  readonly noun = input<string>();
  readonly label = input<string>();
  readonly open = input<string>();
  readonly state = input<AmplifyChatSelectionSplitButtonState>();

  protected readonly embed = computed(() => !!this.component());
  protected readonly embedCount = computed(() => (this.count() == null ? 5 : Number(this.count())));
  protected readonly embedOpen = computed(() => this.open() === 'true');

  protected readonly actions = ACTIONS;
  /** Live example: a selection of 5 contacts. */
  protected readonly selectedCount = signal(5);
  protected readonly log = signal('');
  protected step(n: number): void {
    this.selectedCount.update((c) => Math.max(0, c + n));
  }
}
