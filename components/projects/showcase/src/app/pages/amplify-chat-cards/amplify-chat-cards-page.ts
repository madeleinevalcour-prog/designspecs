import { Component, computed, input, signal } from '@angular/core';
import { AmplifyChatChatListItem, AmplifyChatListItemTheme, AmplifyChatRelevanceSignals, NovoChip, NovoListField } from 'ats-ui';

/**
 * /amplify-chat-cards — Amplify Chat — Cards (Figma doc/cards 6300:127578).
 * Sections: chat-list-item (6171:162369: theme=prospect 6223:172861, theme=candidate
 * 6223:173284) and its relevance-signals content. The composite amplify-chat/chat-cards
 * gets its own section here later.
 *
 * Embed mode: `component` renders one piece, e.g.
 *   /examples/amplify-chat-cards?component=chat-list-item&theme=candidate
 *   /examples/amplify-chat-cards?component=chat-list-item&theme=prospect&selected=false
 *   /examples/amplify-chat-cards?component=relevance-signals
 * Params:
 *   component = chat-list-item | relevance-signals
 *   theme (chat-list-item) = prospect | candidate (default prospect)
 *   selected = true | false (default true, as in Figma)
 *   selectable = false (no checkbox)
 */
@Component({
  imports: [AmplifyChatChatListItem, AmplifyChatRelevanceSignals, NovoChip],
  selector: 'app-amplify-chat-cards-page',
  templateUrl: './amplify-chat-cards-page.html',
  styleUrl: './amplify-chat-cards-page.css',
})
export class AmplifyChatCardsPage {
  readonly component = input<'chat-list-item' | 'relevance-signals'>();
  readonly theme = input<AmplifyChatListItemTheme>();
  readonly selected = input<string>();
  readonly selectable = input<string>();

  protected readonly embed = computed(() => !!this.component());
  protected readonly embedTheme = computed(() => this.theme() ?? 'prospect');
  protected readonly embedSelected = computed(() => this.selected() !== 'false');
  protected readonly isSelectable = computed(() => this.selectable() !== 'false');

  protected readonly prospectFields: NovoListField[] = [{ type: 'email', text: 'marie.smith@nexusdynamics.com' }];
  protected readonly signals = ['Director-level', 'Department Match: Project Management', 'Previously contacted'];
  protected readonly candidateFields: NovoListField[] = [
    { type: 'location', text: 'Location' },
    { type: 'phone', text: '(784) 432 - 5293' },
    { type: 'email', text: 'tyler.brooks@gmail.com' },
  ];
  protected readonly candidateBody =
    'Senior Software Engineer with 3 years of experience, bringing hands-on strength in Node.js and SQL. Motivated by solving problems and mentoring others along the way. Interested in remote software engineer roles.';
  protected readonly skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git', 'REST APIs', 'SQL'];

  /** Live two-way selection in the reference view. */
  protected readonly prospectSel = signal(true);
  protected readonly candidateSel = signal(false);
}
