import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import {
  AmplifyChatCardItem, AmplifyChatChatBlock, AmplifyChatChatCards, AmplifyChatDataTable, AmplifyChatDraftBlock,
  AmplifyChatHeader, AmplifyChatLink, AmplifyChatListItem, AmplifyChatLiteralValueBlock, AmplifyChatNumberedList, AmplifyChatProspect,
  AmplifyChatProspectColumn, AmplifyChatSelectionAction, AmplifyChatSource, AmplifyChatText, AmplifyChatUserBubble, AmplifyChatUserTurn,
} from 'ats-ui';

export type ReplyExample = 'prose' | 'draft' | 'literal' | 'status' | 'table' | 'cards' | 'user-turn';

const DRAFT = `Hi Jordan,

I came across your profile and think you could be a strong fit for a Senior Java Developer role with one of our clients in Boston. Would you be open to a quick call this week?

Best,
Pod Racer`;
const BOOLEAN = '("Java" OR "J2EE") AND ("Spring Boot" OR "Spring") AND ("AWS" OR "Azure") AND ("Senior" OR "Lead") NOT "Intern"';

const PROSPECTS: AmplifyChatProspect[] = [
  { id: 1, name: 'Marie Smith', inBullhorn: true, title: 'Head of HR', company: 'Verizon', mobilePhone: '679-274-4162', email: 'marie.smith@verizon.com' },
  { id: 2, name: 'James Chen', inBullhorn: false, title: 'VP of Engineering', company: 'Verizon' },
  { id: 3, name: 'Priya Patel', inBullhorn: false, title: 'Director of Operations', company: 'Verizon' },
  { id: 4, name: 'Fred Johnson', inBullhorn: false, title: 'District Security Director', company: 'Verizon' },
  { id: 5, name: 'Nina Alvarez', inBullhorn: true, title: 'IT Director', company: 'Verizon', mobilePhone: null, email: 'nina.alvarez@verizon.com' },
];

interface CardSample { name: string; jobTitle: string; email: string; signals: string[] }
const CARDS: CardSample[] = [
  { name: 'Marie Smith', jobTitle: 'Head of HR', email: 'marie.smith@verizon.com', signals: ['HR leader', 'Dept: People', 'Prior contact'] },
  { name: 'James Chen', jobTitle: 'VP of Engineering', email: 'james.chen@verizon.com', signals: ['Tech leader', 'Dept: Network', 'Mutual intro'] },
  { name: 'Priya Patel', jobTitle: 'Director of Operations', email: 'priya.patel@verizon.com', signals: ['Ops leader', 'Dept: Field Ops', 'High activity'] },
];

const JOB_SOURCES: AmplifyChatSource[] = [
  { label: 'Senior Java Developer', entity: 'job', href: '#' },
  { label: 'Data Engineer', entity: 'job', href: '#' },
  { label: 'Project Manager', entity: 'job', href: '#' },
];

/**
 * /amplify-chat-reply — Amplify Chat — Reply (Figma doc/reply 6300:27072):
 * amplify-chat/chat-block (6150:20828), the full Amplify reply, plus the user-turn
 * row (6237:176861). The reference view shows a short conversation and one reply per
 * response format, all composed from the step-1 amplify-chat components.
 *
 * The table and cards examples use the amplify-chat/data-table and chat-cards composites.
 *
 * Embed mode: any param renders one reply in an 800px column, e.g.
 *   /examples/amplify-chat-reply?example=prose
 *   /examples/amplify-chat-reply?example=status
 *   /examples/amplify-chat-reply?example=table&followUps=false&actions=false
 * Params:
 *   example = prose | draft | literal | status | table | cards | user-turn (default prose)
 *   followUps = false (hide the follow-up chips)
 *   actions = false (hide copy / thumbs / save prompt)
 *   action = a label for the optional right-aligned primary action, e.g. "Accept Updates"
 */
@Component({
  imports: [
    NgTemplateOutlet, AmplifyChatChatBlock, AmplifyChatChatCards, AmplifyChatDataTable, AmplifyChatDraftBlock,
    AmplifyChatHeader, AmplifyChatLink, AmplifyChatListItem, AmplifyChatLiteralValueBlock, AmplifyChatNumberedList,
    AmplifyChatText, AmplifyChatUserBubble, AmplifyChatUserTurn,
  ],
  selector: 'app-amplify-chat-reply-page',
  templateUrl: './amplify-chat-reply-page.html',
  styleUrl: './amplify-chat-reply-page.css',
})
export class AmplifyChatReplyPage {
  readonly example = input<ReplyExample>();
  readonly followUps = input<string>();
  readonly actions = input<string>();
  readonly action = input<string>();

  protected readonly embed = computed(() => !!(this.example() || this.followUps() || this.actions() || this.action()));
  protected readonly embedExample = computed<ReplyExample>(() => this.example() ?? 'prose');
  protected readonly showFollowUps = computed(() => this.followUps() !== 'false');
  protected readonly showActions = computed(() => this.actions() !== 'false');

  /** Follow-ups per example; empty when `followUps=false`. */
  protected chips(list: string[]): string[] {
    return this.showFollowUps() ? list : [];
  }

  protected readonly draft = DRAFT;
  protected readonly boolean = BOOLEAN;
  protected readonly prospects = PROSPECTS;
  protected readonly tableColumns: AmplifyChatProspectColumn[] = ['name', 'inBullhorn', 'title', 'email'];
  protected readonly cardItems: AmplifyChatCardItem[] = CARDS.map((c) => ({
    id: c.name, name: c.name, jobTitle: c.jobTitle, fields: [{ type: 'email', text: c.email }], inBullhorn: false, signals: c.signals,
  }));
  protected readonly selectionActions: AmplifyChatSelectionAction[] = [
    { id: 'list', label: 'Add to list', icon: 'list-outline' },
    { id: 'sequence', label: 'Add to Outreach sequence', icon: 'automation', preview: true },
  ];
  protected readonly jobSources = JOB_SOURCES;
  protected readonly prospectSources: AmplifyChatSource[] = PROSPECTS.map((p) => ({ label: p.name, entity: p.inBullhorn ? 'contact' : 'prospect', href: '#' }));

  protected readonly followUpsProse = ['Show all 14', 'Find matches for #1', 'Why this order?'];
  protected readonly followUpsDraft = ['Make it shorter', 'More formal', 'Add salary range'];
  protected readonly followUpsLiteral = ['Run this search', 'Add Kotlin', 'Remove location'];
  protected readonly followUpsTable = ['Show 10 more', 'Reveal emails', 'Company snapshot'];
  protected readonly followUpsCards = ['Show 10 more', 'Find matches for #1', 'Why this order?'];

  /** Last event from any reply in the reference view. */
  protected readonly log = signal('');
}
