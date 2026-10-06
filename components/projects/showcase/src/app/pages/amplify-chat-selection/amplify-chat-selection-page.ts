import { Component, computed, input, signal } from '@angular/core';
import {
  AmplifyChatSelectionAction,
  AmplifyChatSelectionBar,
  AmplifyChatSelectionBarAppearance,
  AmplifyChatSelectionSplitButton,
  AmplifyChatSelectionSplitButtonState,
} from 'ats-ui';

const ACTIONS: AmplifyChatSelectionAction[] = [
  { id: 'list', label: 'Add to list', icon: 'list-outline' },
  { id: 'tearsheet', label: 'Add to tearsheet', icon: 'tearsheet' },
  { id: 'sequence', label: 'Add to Outreach sequence', icon: 'automation', preview: true },
];

/**
 * /amplify-chat-selection — Amplify Chat — Selection (Figma doc/selection 6300:127589).
 * amplify-chat/selection-split-button (6271:183528): one and many selected (hidden at zero), the
 * menu open, and a live example. ats-amplify-chat-selection-bar (the novo-data-table-pagination
 * instance under amplify-chat/data-table 6271:183633 and chat-cards 6271:184050): attached and
 * card appearances, with the pager.
 *
 * Embed mode: `component=selection-split-button | selection-bar` renders one piece, e.g.
 *   /examples/amplify-chat-selection?component=selection-bar&count=5&total=5&appearance=card
 *   /examples/amplify-chat-selection?component=selection-bar&count=0&pageCount=3
 *   /examples/amplify-chat-selection?component=selection-split-button&count=5
 *   /examples/amplify-chat-selection?component=selection-split-button&count=0
 *   /examples/amplify-chat-selection?component=selection-split-button&count=3&open=true
 * Params:
 *   component = selection-split-button | selection-bar
 *   selection-bar: total (default = count) · appearance = attached | card (default card) · pageCount · page
 *   count (default 5) · verb (default "Add") · noun (default "Contact") · label (full override)
 *   open = true (menu open) · state = hover | focus | active
 */
@Component({
  imports: [AmplifyChatSelectionBar, AmplifyChatSelectionSplitButton],
  selector: 'app-amplify-chat-selection-page',
  templateUrl: './amplify-chat-selection-page.html',
  styleUrl: './amplify-chat-selection-page.css',
})
export class AmplifyChatSelectionPage {
  readonly component = input<'selection-split-button' | 'selection-bar'>();
  readonly total = input<string>();
  readonly appearance = input<AmplifyChatSelectionBarAppearance>();
  readonly pageCount = input<string>();
  readonly page = input<string>();
  readonly count = input<string>();
  readonly verb = input<string>();
  readonly noun = input<string>();
  readonly label = input<string>();
  readonly open = input<string>();
  readonly state = input<AmplifyChatSelectionSplitButtonState>();

  protected readonly embed = computed(() => !!this.component());
  protected readonly embedCount = computed(() => (this.count() == null ? 5 : Number(this.count())));
  protected readonly embedOpen = computed(() => this.open() === 'true');

  protected readonly embedAppearance = computed(() => this.appearance() ?? 'card');
  protected readonly embedPage = computed(() => Number(this.page() ?? 1) || 1);

  protected readonly actions = ACTIONS;
  /** Live bar with a pager. */
  protected readonly barPage = signal(1);
  /** Live example: a selection of 5 contacts. */
  protected readonly selectedCount = signal(5);
  protected readonly log = signal('');
  protected step(n: number): void {
    this.selectedCount.update((c) => Math.max(0, c + n));
  }
}
