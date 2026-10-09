import { Component, computed, input, signal } from '@angular/core';
import {
  AmplifyChatCardItem,
  AmplifyChatChatCards,
  AmplifyChatChatListItem,
  AmplifyChatListItemTheme,
  AmplifyChatRelevanceSignals,
  AmplifyChatSelectionAction,
  NovoChip,
  NovoListField,
} from 'ats-ui';

const SIGNALS = ['Director-level', 'Department Match: Project Management', 'Previously contacted'];

/** Prospect cards (Figma chat-cards 6271:183686 uses Marie Smith ×5; varied here with the table's Verizon / Comcast contacts). */
const PROSPECT_CARDS: AmplifyChatCardItem[] = [
  { id: 1, name: 'Marie Smith', jobTitle: 'Head of HR', inBullhorn: true, fields: [{ type: 'email', text: 'marie.smith@nexusdynamics.com' }], signals: SIGNALS },
  { id: 2, name: 'Fred Johnson', jobTitle: 'District Security Director', inBullhorn: false, fields: [{ type: 'company', text: 'Comcast' }], signals: ['Director-level', 'Department Match: Security'] },
  { id: 3, name: 'Nina Patel', jobTitle: 'IT Director', inBullhorn: true, fields: [{ type: 'email', text: 'nina.patel@verizon.com' }], signals: ['Director-level', 'Previously contacted'] },
  { id: 4, name: 'Owen Reed', jobTitle: 'IT Operations Manager', inBullhorn: true, fields: [{ type: 'email', text: 'owen.reed@verizon.com' }], signals: ['Department Match: IT Operations'] },
  { id: 5, name: 'Leila Nguyen', jobTitle: 'Infrastructure Manager', inBullhorn: false, fields: [{ type: 'company', text: 'Comcast' }], signals: ['Department Match: Infrastructure'] },
  { id: 6, name: 'Caleb Kim', jobTitle: 'Service Desk Manager', inBullhorn: true, fields: [{ type: 'email', text: 'caleb.kim@verizon.com' }], signals: ['Previously contacted'] },
  { id: 7, name: 'Priya Desai', jobTitle: 'Network Manager', inBullhorn: false, fields: [{ type: 'company', text: 'Comcast' }], signals: ['Department Match: Networking'] },
  { id: 8, name: 'Eli Romero', jobTitle: 'Security Manager', inBullhorn: true, fields: [{ type: 'email', text: 'eli.romero@verizon.com' }], signals: ['Department Match: Security'] },
];

const ACTIONS: AmplifyChatSelectionAction[] = [
  { id: 'list', label: 'Add to list', icon: 'list-outline' },
  { id: 'tearsheet', label: 'Add to tearsheet', icon: 'tearsheet' },
  { id: 'sequence', label: 'Add to Outreach sequence', icon: 'automation', preview: true },
];

/**
 * /amplify-chat-cards — Amplify Chat — Cards (Figma doc/cards 6300:127578).
 * Sections: amplify-chat/chat-cards (6271:183686: Property 1=default 6223:173466, selected
 * 6271:183687, plus paging), chat-list-item (6171:162369: theme=entity-record, the default, and
 * theme=prospect-contact) and its relevance-signals content.
 *
 * Embed mode: `component` renders one piece, e.g.
 *   /examples/amplify-chat-cards?component=chat-cards&variant=selected
 *   /examples/amplify-chat-cards?component=chat-cards&count=8&pageSize=3
 *   /examples/amplify-chat-cards?component=chat-cards&count=3
 *   /examples/amplify-chat-cards?component=chat-list-item&theme=entity-record
 *   /examples/amplify-chat-cards?component=chat-list-item&theme=prospect-contact&selected=false
 *   /examples/amplify-chat-cards?component=relevance-signals
 * Params:
 *   component = chat-cards | chat-list-item | relevance-signals
 *   chat-cards: variant = default | selected (all selected) | some (2 selected); count = 1–8 cards
 *     (default 5, as Figma); pageSize = cards per page (pager in the bar); theme = entity-record | prospect-contact (default entity-record);
 *     selectable = false; verb / noun = split button wording
 *   theme (chat-list-item) = entity-record | prospect-contact (default entity-record)
 *   selected (chat-list-item) = true | false (default true, as in Figma)
 *   selectable = false (no checkbox)
 */
@Component({
  imports: [AmplifyChatChatCards, AmplifyChatChatListItem, AmplifyChatRelevanceSignals, NovoChip],
  selector: 'app-amplify-chat-cards-page',
  templateUrl: './amplify-chat-cards-page.html',
  styleUrl: './amplify-chat-cards-page.css',
})
export class AmplifyChatCardsPage {
  readonly component = input<'chat-cards' | 'chat-list-item' | 'relevance-signals'>();
  readonly variant = input<'default' | 'selected' | 'some'>();
  readonly count = input<string>();
  readonly pageSize = input<string>();
  readonly verb = input<string>();
  readonly noun = input<string>();
  readonly theme = input<AmplifyChatListItemTheme>();
  readonly selected = input<string>();
  readonly selectable = input<string>();

  protected readonly embed = computed(() => !!this.component());
  protected readonly embedTheme = computed(() => this.theme() ?? 'entity-record');
  /** Split-button noun follows the records: candidates for the default stack, contacts for Prospect contacts. */
  protected readonly embedNoun = computed(() => this.noun() ?? (this.embedTheme() === 'entity-record' ? 'Candidate' : 'Contact'));
  protected readonly embedSelected = computed(() => this.selected() !== 'false');
  protected readonly isSelectable = computed(() => this.selectable() !== 'false');

  protected readonly embedItems = computed(() => {
    const n = Math.min(8, Math.max(1, Number(this.count() ?? 5) || 5));
    return this.embedTheme() === 'entity-record' ? this.candidateCards.slice(0, Math.min(n, this.candidateCards.length)) : PROSPECT_CARDS.slice(0, n);
  });
  protected readonly embedSelection = computed(() => {
    const ids = this.embedItems().map((i) => i.id);
    const v = this.variant();
    return v === 'selected' ? ids : v === 'some' ? ids.slice(0, 2) : [];
  });
  protected readonly embedPageSize = computed(() => (this.pageSize() ? Number(this.pageSize()) : undefined));

  protected readonly prospectCards = PROSPECT_CARDS;
  protected readonly actions = ACTIONS;
  /** Live selection for the composite stacks. */
  protected readonly cardsSel = signal<(string | number)[]>(PROSPECT_CARDS.slice(0, 5).map((p) => p.id));
  protected readonly pagedSel = signal<(string | number)[]>([]);
  protected readonly cardsLog = signal('');

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
  protected readonly candidateCards: AmplifyChatCardItem[] = [
    { id: 'c1', theme: 'entity-record', name: '2034 | Tyler Brooks', fields: this.candidateFields, body: this.candidateBody, chips: this.skills },
    { id: 'c2', theme: 'entity-record', name: '2051 | Jordan Ellis', fields: [{ type: 'location', text: 'Philadelphia, PA' }, { type: 'email', text: 'jordan.ellis@gmail.com' }],
      body: 'Full-stack engineer with 5 years in TypeScript and Angular. Led a migration to a component library at a telecom provider.', chips: ['TypeScript', 'Angular', 'Node.js', 'SQL'] },
    { id: 'c3', theme: 'entity-record', name: '2077 | Priya Raman', fields: [{ type: 'location', text: 'Boston, MA' }, { type: 'email', text: 'priya.raman@outlook.com' }],
      body: 'Backend engineer, 6 years in Java and Spring Boot on high-volume payment services. Open to hybrid roles in Boston.', chips: ['Java', 'Spring Boot', 'AWS', 'Kafka'] },
    { id: 'c4', theme: 'entity-record', entity: 'job', name: '425 | Senior Java Developer', fields: [{ type: 'company', text: 'Verizon' }, { type: 'location', text: 'Boston, MA' }],
      body: 'Network Platforms team. 12-month contract with the option to convert; hybrid, 3 days on site. Starts Oct 6, no submittals yet.', chips: ['Java 17', 'Spring Boot', 'Microservices'] },
    { id: 'c5', theme: 'entity-record', name: '2102 | Marcus Webb', fields: [{ type: 'location', text: 'Remote' }, { type: 'email', text: 'marcus.webb@gmail.com' }],
      body: 'Senior engineer focused on React and design systems. Interested in remote front-end roles.', chips: ['React', 'TypeScript', 'Storybook'] },
  ];

  /** Live two-way selection in the reference view. */
  protected readonly prospectSel = signal(true);
  protected readonly candidateSel = signal(false);
}
