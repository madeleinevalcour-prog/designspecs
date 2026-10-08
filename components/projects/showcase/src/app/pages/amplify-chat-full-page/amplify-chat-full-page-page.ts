import { Component, DestroyRef, computed, inject, input, linkedSignal, signal } from '@angular/core';
import {
  AmplifyChatChatBlock, AmplifyChatChatCards, AmplifyChatClarifyAnswer, AmplifyChatClarifyingQuestion, AmplifyChatContextItem,
  AmplifyChatDataTable, AmplifyChatDraftBlock, AmplifyChatFullPage, AmplifyChatHeader, AmplifyChatLink, AmplifyChatListItem,
  AmplifyChatNumberedList, AmplifyChatText, AmplifyChatUserBubble, AmplifyChatUserTurn, BowlingAlley, BowlingAlleyShell, Button,
} from 'ats-ui';
import {
  CARD_ITEMS, CLARIFY_ROUND, COLUMNS, DRAFT, FIRST_QUESTION, JOB_SOURCES, PROSPECTS, PROSPECT_SOURCES, ROTATION, ReplyFormat,
  SELECTION_ACTIONS, THINKING, Turn,
} from './full-page-data';

export type FullPageState = 'empty' | 'short' | 'long';

/** How long the canned reply "thinks" (ms). */
const REPLY_DELAY = 1500;

/**
 * /amplify-chat-full-page — Amplify Chat — Full page: the prototyping shell (Figma
 * global-chat-full-page: starting point 6267:179466, short conversation 6237:176854,
 * long conversation 6267:181805). Bowling Alley (open) on the left + ats-amplify-chat-full-page.
 *
 * Live: starts empty (greeting + input in the upper middle). Send → a user turn and a
 * thinking chat-block (Stop in the input) → a canned reply after ~1.5s, rotating through
 * data table (selection) · prose + numbered list · chat cards · a clarifying-questions
 * round in the input · draft block. Reset (top right of the toolbar) starts over.
 *
 * Prototype with it: the turns are a plain array bound with @for; push a user turn and
 * a reply on `send` (see `ask()` below and the AmplifyChatFullPage JSDoc).
 *
 * Embed mode: `?state=` pre-fills the conversation and renders just the shell:
 *   /examples/amplify-chat-full-page?state=empty   starting point (6267:179466)
 *   /examples/amplify-chat-full-page?state=short   one exchange, top-aligned (6237:176854)
 *   /examples/amplify-chat-full-page?state=long    several exchanges, bottom-anchored, rows selected (6267:181805)
 * The embed is still live (send / Stop / Reset work).
 */
@Component({
  imports: [
    AmplifyChatChatBlock, AmplifyChatChatCards, AmplifyChatDataTable, AmplifyChatDraftBlock, AmplifyChatFullPage, AmplifyChatHeader,
    AmplifyChatLink, AmplifyChatListItem, AmplifyChatNumberedList, AmplifyChatText, AmplifyChatUserBubble, AmplifyChatUserTurn,
    BowlingAlley, BowlingAlleyShell, Button,
  ],
  selector: 'app-amplify-chat-full-page-page',
  templateUrl: './amplify-chat-full-page-page.html',
  styleUrl: './amplify-chat-full-page-page.css',
})
export class AmplifyChatFullPagePage {
  readonly state = input<FullPageState>();

  protected readonly embed = computed(() => !!this.state());
  private nextId = 1;
  /** Reset bumps this to rebuild the turn list from `state`. */
  private readonly resets = signal(0);
  protected readonly turns = linkedSignal<Turn[]>(() => {
    this.resets();
    return this.seed(this.state() ?? 'empty');
  });
  protected readonly generating = computed(() => this.turns().some((t) => t.kind === 'reply' && !!t.thinking));
  /** The open clarifying round (shown in the input). */
  protected readonly questions = signal<AmplifyChatClarifyingQuestion[] | undefined>(undefined);
  protected readonly log = signal('');

  protected readonly context: AmplifyChatContextItem[] = [{ label: 'Prospect', source: true }];
  protected readonly prospects = PROSPECTS;
  protected readonly columns = COLUMNS;
  protected readonly prospectSources = PROSPECT_SOURCES;
  protected readonly jobSources = JOB_SOURCES;
  protected readonly cardItems = CARD_ITEMS;
  protected readonly selectionActions = SELECTION_ACTIONS;
  protected readonly draft = DRAFT;
  protected readonly thinking = THINKING;

  private timer?: ReturnType<typeof setTimeout>;
  /** Next canned reply in ROTATION. */
  private canned = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** The three Figma states as turn lists. */
  private seed(state: FullPageState): Turn[] {
    this.canned = 0;
    if (state === 'empty') return [];
    const opening: Turn[] = [
      { id: this.nextId++, kind: 'user', text: FIRST_QUESTION },
      { id: this.nextId++, kind: 'reply', format: 'table' },
    ];
    this.canned = 1;
    if (state === 'short') return opening;
    this.canned = 3;
    return [
      { id: this.nextId++, kind: 'user', text: 'Make a list of the open jobs I should prioritize today' },
      { id: this.nextId++, kind: 'reply', format: 'prose' },
      { id: this.nextId++, kind: 'user', text: 'Which Verizon contacts should I reach out to first?' },
      { id: this.nextId++, kind: 'reply', format: 'cards' },
      { id: this.nextId++, kind: 'user', text: FIRST_QUESTION },
      { id: this.nextId++, kind: 'reply', format: 'table', selection: PROSPECTS.map((p) => p.id as number) },
    ];
  }

  /** The recruiter sent a message: user turn + thinking block, then the next canned reply. */
  protected ask(text: string): void {
    this.reply(text, ROTATION[this.canned++ % ROTATION.length]);
  }

  private reply(text: string | null, format: ReplyFormat): void {
    const pending: Turn = { id: this.nextId++, kind: 'reply', format, thinking: true };
    const user: Turn[] = text ? [{ id: this.nextId++, kind: 'user', text }] : [];
    this.turns.update((t) => [...t, ...user, pending]);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.settle(pending.id);
      if (format === 'clarify') this.questions.set(CLARIFY_ROUND);
    }, REPLY_DELAY);
  }

  protected stop(): void {
    clearTimeout(this.timer);
    const pending = this.turns().find((t) => t.kind === 'reply' && t.thinking);
    if (pending) this.settle(pending.id, true);
  }

  /** Clarifying round answered: the answers become the user's turn, then Amplify answers. */
  protected answeredAll(answers: AmplifyChatClarifyAnswer[]): void {
    this.questions.set(undefined);
    this.reply(answers.map((a) => a.value).join(' · '), 'answer');
  }

  protected reset(): void {
    clearTimeout(this.timer);
    this.questions.set(undefined);
    this.log.set('');
    this.resets.update((n) => n + 1);
  }

  private settle(id: number, stopped = false): void {
    this.turns.update((list) => list.map((t) => (t.id === id && t.kind === 'reply' ? { ...t, thinking: false, stopped } : t)));
  }
}
