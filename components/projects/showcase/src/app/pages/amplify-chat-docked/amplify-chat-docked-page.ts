import { Component, DestroyRef, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import {
  AmplifyChatChatBlock, AmplifyChatContainer, AmplifyChatContextItem, AmplifyChatConversation, AmplifyChatDataTable, AmplifyChatDocked,
  AmplifyChatDockedMode, AmplifyChatHeader, AmplifyChatLink, AmplifyChatProspect, AmplifyChatProspectColumn, AmplifyChatSelectionAction,
  AmplifyChatSource, AmplifyChatText, AmplifyChatUserBubble, AmplifyChatUserTurn, Button, RecordHeader, RecordHeaderField, RecordHeaderTab,
} from 'ats-ui';

/** One turn in the live conversation. `seed` = the Figma Verizon reply (data table). */
type Turn =
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'reply'; status?: string; text?: string; seed?: boolean; stopped?: boolean };

const FIRST_QUESTION = "Can you show me 5 contacts at Verizon that aren't in the ATS yet?";

// Figma docked-chat sample (4608:182871): the Verizon prospects table.
const PROSPECTS: AmplifyChatProspect[] = [
  { id: 1, name: 'Marie Smith', inBullhorn: false, title: 'District Security Director', company: 'Verizon', mobilePhone: '679-274-4162' },
  { id: 2, name: 'Fred Johnson', inBullhorn: false, title: 'District Security Director', company: 'Verizon', mobilePhone: '679-274-4163' },
  { id: 3, name: 'Nina Patel', inBullhorn: false, title: 'IT Director', company: 'Verizon', mobilePhone: '679-274-4164' },
  { id: 4, name: 'Owen Reed', inBullhorn: false, title: 'IT Operations Manager', company: 'Verizon', mobilePhone: '679-274-4165' },
  { id: 5, name: 'Leila Nguyen', inBullhorn: false, title: 'Infrastructure Manager', company: 'Verizon', mobilePhone: '679-274-4166' },
];

/** Canned replies for anything the recruiter sends, in turn. */
const CANNED = [
  'I found 3 open jobs at Verizon: Senior Java Developer, Network Engineer and Project Manager. Senior Java Developer starts Oct 6 and has no submittals yet.',
  'Fred Johnson was last contacted 4 months ago by Pod Racer. There are no open tasks or scheduled appointments for him.',
  'Verizon has 12 placements this year, 3 of them in the last 30 days. Average time to fill is 34 days.',
];

/**
 * /amplify-chat-docked — Amplify Chat — Docked chat (Figma docked-chat 4608:182872:
 * state=Default 4608:182871, state=pop-over 4608:182873) and the shared
 * AmplifyChatConversation layout.
 *
 * A mock Verizon company record with the docked chat open beside it. The conversation
 * is live: send a message → a user turn and a thinking chat-block → a canned reply after
 * ~1.5s. Stop (in the chat input, while generating) ends the reply early. The record
 * header's Amplify button and the page toolbar open / close the chat; the header's
 * External Open / Columns button switches docked ↔ pop over.
 *
 * Embed mode: any param renders just the record + chat in a fixed-height frame, e.g.
 *   /examples/amplify-chat-docked?mode=docked
 *   /examples/amplify-chat-docked?mode=pop-over&state=conversation
 *   /examples/amplify-chat-docked?state=empty
 * Params:
 *   mode = docked | pop-over (default docked)
 *   state = empty | conversation (default conversation: the Figma Verizon exchange)
 */
@Component({
  imports: [
    AmplifyChatChatBlock, AmplifyChatContainer, AmplifyChatConversation, AmplifyChatDataTable, AmplifyChatDocked, AmplifyChatHeader,
    AmplifyChatLink, AmplifyChatText, AmplifyChatUserBubble, AmplifyChatUserTurn, Button, RecordHeader,
  ],
  selector: 'app-amplify-chat-docked-page',
  templateUrl: './amplify-chat-docked-page.html',
  styleUrl: './amplify-chat-docked-page.css',
})
export class AmplifyChatDockedPage {
  readonly mode = input<AmplifyChatDockedMode>();
  readonly state = input<'empty' | 'conversation'>();

  protected readonly embed = computed(() => !!(this.mode() || this.state()));
  protected readonly chatMode = linkedSignal<AmplifyChatDockedMode>(() => this.mode() ?? 'docked');
  protected readonly chatOpen = signal(true);

  private nextId = 1;
  protected readonly turns = linkedSignal<Turn[]>(() =>
    this.state() === 'empty' ? [] : [
      { id: this.nextId++, kind: 'user', text: FIRST_QUESTION },
      { id: this.nextId++, kind: 'reply', seed: true },
    ],
  );
  protected readonly generating = computed(() => this.turns().some((t) => t.kind === 'reply' && !!t.status));

  private readonly conversation = viewChild(AmplifyChatConversation);
  private timer?: ReturnType<typeof setTimeout>;
  private canned = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected readonly context: AmplifyChatContextItem[] = [{ label: 'Verizon', entity: 'company' }];
  protected readonly prospects = PROSPECTS;
  protected readonly columns: AmplifyChatProspectColumn[] = ['name', 'inBullhorn', 'title', 'mobilePhone'];
  protected readonly selectionActions: AmplifyChatSelectionAction[] = [
    { id: 'list', label: 'Add to list', icon: 'list-outline' },
    { id: 'sequence', label: 'Add to Outreach sequence', icon: 'automation', preview: true },
  ];
  protected readonly sources: AmplifyChatSource[] = PROSPECTS.map((p) => ({ label: p.name, entity: 'prospect', href: '#' }));
  protected readonly recordFields: RecordHeaderField[] = [
    { label: 'Status', value: 'Active Account', kind: 'select' },
    { label: 'Industry', value: 'Telecommunications' },
    { label: 'Owner', value: 'Pod Racer', kind: 'link' },
    { label: 'Phone', value: '(800) 922-0204' },
  ];
  protected readonly recordTabs: RecordHeaderTab[] = [
    { label: 'Overview', active: true }, { label: 'Contacts', count: 24 }, { label: 'Jobs', count: 3 }, { label: 'Placements', count: 12 },
  ];

  protected toggleOpen(): void {
    this.chatOpen.update((v) => !v);
  }

  /** Recruiter sent a message: user turn + thinking block, then a canned reply. */
  protected ask(text: string): void {
    const reply: Turn = { id: this.nextId++, kind: 'reply', status: 'Thinking…' };
    this.turns.update((t) => [...t, { id: this.nextId++, kind: 'user', text }, reply]);
    queueMicrotask(() => this.conversation()?.scrollToBottom('smooth'));
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.finish(reply.id, CANNED[this.canned++ % CANNED.length]), 1500);
  }

  protected stop(): void {
    clearTimeout(this.timer);
    const pending = this.turns().find((t) => t.kind === 'reply' && t.status);
    if (pending) this.finish(pending.id, 'You stopped this response.', true);
  }

  private finish(id: number, text: string, stopped = false): void {
    this.turns.update((list) => list.map((t) => (t.id === id ? { id, kind: 'reply', text, stopped } : t)));
  }

  protected readonly log = signal('');
}
