import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import {
  AmplifyChatChat,
  AmplifyChatChatCard,
  AmplifyChatChatCardState,
  AmplifyChatChatsPanel,
  AmplifyChatScheduledChat,
  Button,
} from 'ats-ui';

/** Sample history (from the Amplify tab prototype; fictional data). */
const CHATS: AmplifyChatChat[] = [
  { id: 'c4', title: 'Shortlist for Product Manager, Nexus', group: 'today', ago: '3 hours ago',
    description: 'Jane Jones and Tyler Brooks meet 4 of 5 must-haves', record: { entity: 'job', label: '425 | Project Manager' } },
  { id: 'c5', title: 'Draft outreach to Marcus Lehmann', group: 'yesterday', ago: '1 day ago',
    description: 'Check-in email about the Data Analyst role', record: { entity: 'contact', label: 'Marcus Lehmann' } },
  { id: 'c6', title: 'Interview prep: Harbor Labs', group: 'previous-7-days', ago: '4 days ago',
    description: 'Summary before the intake call', record: { entity: 'company', label: 'Harbor Labs' } },
  { id: 'c7', title: 'Candidates with expiring certifications', group: 'older', ago: '3 weeks ago',
    description: '4 candidates have certifications expiring before Dec 31' },
];

/** Sample scheduled prompts. 5, so the panel shows 3 (View All opens the rest). */
const SCHEDULED: AmplifyChatScheduledChat[] = [
  { id: 's1', chatId: 'c1', name: 'Open job order status', schedule: 'Weekdays, 8–9 AM', status: 'active', unread: 1, last: 'Today, 8:12 AM' },
  { id: 's3', chatId: 'c3', name: 'Overdue submittal follow-ups', schedule: 'Daily, 9–10 AM', status: 'attention', unread: 1, last: 'Yesterday, 9:05 AM' },
  { id: 's2', chatId: 'c2', name: 'Placements starting next week', schedule: 'Fridays, 4–5 PM', status: 'paused', last: 'Fri, Oct 9' },
  { id: 's4', chatId: 'c8', name: 'New applicants on hot jobs', schedule: 'Weekdays, 7–8 AM', status: 'active', last: 'Today, 7:20 AM' },
  { id: 's5', chatId: 'c9', name: 'Monday pipeline review', schedule: 'Mondays, 8–9 AM', status: 'active', last: 'Mon, Oct 12' },
];

/**
 * /amplify-chat-chats — Amplify Chat — Chats panel (Figma 6806:27178: chat-card 6832:132835,
 * chats-panel 6835:133241). From the Amplify tab prototype's Chats panel.
 *
 * Embed mode: `component` renders one piece, e.g.
 *   /examples/amplify-chat-chats?component=chat-card
 *   /examples/amplify-chat-chats?component=chat-card&chat=2&state=hover
 *   /examples/amplify-chat-chats?component=chat-card&selected=true
 *   /examples/amplify-chat-chats?component=chat-card&scheduled=1
 *   /examples/amplify-chat-chats?component=chat-card&scheduled=3&state=focus
 *   /examples/amplify-chat-chats?component=chats-panel
 *   /examples/amplify-chat-chats?component=chats-panel&current=c4
 *   /examples/amplify-chat-chats?component=chats-panel&scrolled=true
 *   /examples/amplify-chat-chats?component=chats-panel&query=harbor
 *   /examples/amplify-chat-chats?component=chats-panel&query=offer%20letter
 *   /examples/amplify-chat-chats?component=in-context
 * Params:
 *   component = chat-card | chats-panel | in-context
 *   chat-card: chat = 1–4 (sample history chat, default 1) or scheduled = 1–5 (sample scheduled chat);
 *     state = hover | focus; selected = true
 *   chats-panel: current = a chat id (c1–c9); query = search text; scrolled = true (toolbar's scrolled background)
 *   in-context: the Amplify header's Chats button toggles the panel beside the page (starts closed)
 */
@Component({
  imports: [NgTemplateOutlet, AmplifyChatChatCard, AmplifyChatChatsPanel, Button],
  selector: 'app-amplify-chat-chats-page',
  templateUrl: './amplify-chat-chats-page.html',
  styleUrl: './amplify-chat-chats-page.css',
})
export class AmplifyChatChatsPage {
  readonly component = input<'chat-card' | 'chats-panel' | 'in-context'>();
  readonly chat = input<string>();
  readonly scheduled = input<string>();
  readonly state = input<AmplifyChatChatCardState>();
  readonly selected = input<string>();
  readonly current = input<string>();
  readonly query = input<string>();
  readonly scrolled = input<string>();

  protected readonly chats = CHATS;
  protected readonly scheds = SCHEDULED;
  private readonly pick = <T>(list: T[], v: string | undefined) => list[Math.min(list.length, Math.max(1, Number(v ?? 1) || 1)) - 1];
  protected readonly embedChat = computed(() => this.pick(CHATS, this.chat()));
  protected readonly embedSched = computed(() => (this.scheduled() ? this.pick(SCHEDULED, this.scheduled()) : null));
  protected readonly embedSelected = computed(() => this.selected() === 'true');

  /** Live demo state. */
  protected readonly panelOpen = signal(false);
  protected readonly currentChat = signal<string | number | null>('c4');
  protected readonly log = signal('');
  protected readonly unread = SCHEDULED.reduce((n, s) => n + (s.unread ?? 0), 0);
  /** Close returns focus to the Chats button. */
  protected focusChatsButton(): void { document.getElementById('demo-chats-btn')?.focus(); }
  protected opened(id: string | number): void {
    this.currentChat.set(id);
    const c = CHATS.find((x) => x.id === id);
    const s = SCHEDULED.find((x) => x.chatId === id);
    this.log.set(`Opened chat: ${c?.title ?? s?.name ?? id}`);
  }
}
