import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import {
  AmplifyChatGlobalChatContainer,
  AmplifyChatInput,
  AmplifyChatPrompt,
  AmplifyChatPromptCard,
  AmplifyChatPromptCardState,
  AmplifyChatPromptLibrary,
  AmplifyChatPromptLibraryTab,
} from 'ats-ui';

/** Sample prompts (sample content, not Bullhorn's default prompts). */
const PROMPTS: AmplifyChatPrompt[] = [
  { id: 1, icon: 'search-menu', title: 'Research Salary and Experience', tags: ['Recruiting'],
    description: 'Research market salary norms and experience expectation for a job or candidate.', favorite: true },
  { id: 2, icon: 'resume', title: 'Summarize Resume for Submission', tags: ['Screening', 'Recruiting'],
    description: 'Summarize the candidate’s resume into a short submission blurb highlighting relevant experience.', favorite: true, mine: true },
  // Scheduled suggestions (Figma prompt-library 6762:141808 / 6762:141964): set up a scheduled prompt, not one already running.
  { id: 3, scheduled: true, entity: null, title: 'Morning Review', tags: ['Recruiting', 'Scheduled', 'Productivity'],
    description: 'Set up a recurring morning review to help you organize your tasks for the day.', favorite: true },
  { id: 4, scheduled: true, entity: 'job', title: 'Daily Job Prioritization', tags: ['Recruiting', 'Scheduled', 'Account Management'],
    description: 'Set up a daily task to prioritize your open jobs across revenue, urgency, aging, coverage, and placement history' },
  { id: 5, icon: 'search-menu', title: 'Compare Candidate Skills Against Open Job Requirements and Flag Gaps', tags: ['Sourcing', 'Matching', 'Recruiting'],
    description: 'Compare listed skills with the requirements of open jobs the candidate is submitted to, and list missing or unverified skills.', mine: true },
  { id: 6, icon: 'book', title: 'Draft Follow-up Email', tags: ['Outreach'],
    description: 'Draft a follow-up email to the candidate after their last interview.' },
]

/**
 * /amplify-chat-prompt-library — Amplify Chat — Prompt library (Figma 6727:30597:
 * Prompt Card 6762:90134, prompt-library 6789:132613, in context 6762:148989 / 6806:27179).
 *
 * Embed mode: `component` renders one piece, e.g.
 *   /examples/amplify-chat-prompt-library?component=prompt-card
 *   /examples/amplify-chat-prompt-library?component=prompt-card&state=hover
 *   /examples/amplify-chat-prompt-library?component=prompt-card&favorite=true&menu=open
 *   /examples/amplify-chat-prompt-library?component=prompt-card&prompt=5
 *   /examples/amplify-chat-prompt-library?component=prompt-card&prompt=3   (scheduled suggestion)
 *   /examples/amplify-chat-prompt-library?component=prompt-library&tab=all
 *   /examples/amplify-chat-prompt-library?component=prompt-library&data=none
 *   /examples/amplify-chat-prompt-library?component=prompt-library&tab=all&query=offer%20letter
 *   /examples/amplify-chat-prompt-library?component=prompt-library&loading=true
 *   /examples/amplify-chat-prompt-library?component=in-context&surface=active
 * Params:
 *   component = prompt-card | prompt-library | in-context
 *   prompt-card: prompt = 1–6 (sample, default 1); state = hover | focus; favorite = true | false (default false); menu = open
 *   prompt-library: tab = favorites | mine | all (default favorites); query = search text; loading = true;
 *     data = none (no favorites or own prompts, for the empty states)
 *   in-context: surface = starting (default: library 8px below the starting-point composer) | active (8px above the
 *     active-chat input). Prompt Library toggles it; sending a prompt closes it.
 *   Choosing a scheduled suggestion logs that scheduling would start.
 */
@Component({
  imports: [NgTemplateOutlet, AmplifyChatGlobalChatContainer, AmplifyChatInput, AmplifyChatPromptCard, AmplifyChatPromptLibrary],
  selector: 'app-amplify-chat-prompt-library-page',
  templateUrl: './amplify-chat-prompt-library-page.html',
  styleUrl: './amplify-chat-prompt-library-page.css',
})
export class AmplifyChatPromptLibraryPage {
  readonly component = input<'prompt-card' | 'prompt-library' | 'in-context'>();
  readonly prompt = input<string>();
  readonly state = input<AmplifyChatPromptCardState>();
  readonly favorite = input<string>();
  readonly menu = input<string>();
  readonly tab = input<AmplifyChatPromptLibraryTab>();
  readonly query = input<string>();
  readonly loading = input<string>();
  readonly data = input<'none'>();
  readonly surface = input<'starting' | 'active'>();

  protected readonly prompts = PROMPTS;
  protected readonly noFavorites = PROMPTS.map((p) => ({ ...p, favorite: false, mine: false }));
  protected readonly embedPrompt = computed(() => PROMPTS[Math.min(6, Math.max(1, Number(this.prompt() ?? 1) || 1)) - 1]);
  protected readonly embedFavorite = computed(() => this.favorite() === 'true');
  protected readonly embedPrompts = computed(() => (this.data() === 'none' ? this.noFavorites : PROMPTS));
  protected readonly isActiveSurface = computed(() => this.surface() === 'active');

  /** Live demo state. */
  protected readonly open = signal(true);
  protected readonly log = signal('');
  protected sent(p: AmplifyChatPrompt): void { this.open.set(false); this.log.set(`Sent to chat: ${p.title}`); }
  protected scheduling(p: AmplifyChatPrompt): void { this.open.set(false); this.log.set(`Start setting up a scheduled prompt: ${p.title}`); }
}
