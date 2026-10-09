import { Component, computed, input, signal } from '@angular/core';
import {
  AmplifyChatButtonRow, AmplifyChatClarifyAnswer, AmplifyChatClarifyingQuestion, AmplifyChatContainer, AmplifyChatContextContainer,
  AmplifyChatContextContainerSize, AmplifyChatContextItem, AmplifyChatGlobalChatContainer, AmplifyChatInput, AmplifyChatTextArea,
} from 'ats-ui';

type InputComponent = 'chat-input' | 'amplify-chat-container' | 'global-chat-container' | 'text-area' | 'button-row' | 'context-container';

/** Sample round for the container's clarifying-questions state (Figma 6337:209113). */
const QUESTIONS: AmplifyChatClarifyingQuestion[] = [
  {
    question: 'How far from Boston should Amplify look?',
    options: [
      { label: 'Within 25 mi of Boston', recommended: 'Recommended · from', recordLink: 'JO-4821' },
      { label: 'Within 50 mi of Boston' },
      { label: 'Include remote candidates' },
    ],
  },
  {
    question: 'Which candidates should Amplify include?',
    help: 'Amplify only searches records you can access.',
    options: [
      { label: 'Active candidates only', recommended: 'Recommended · your saved search' },
      { label: 'Active and passive candidates' },
    ],
  },
];

/**
 * /amplify-chat-input — Amplify Chat — Chat input (Figma doc frame 6300:127598,
 * subsection/input 6352:28898). One section per component; add new sections
 * (composites: chat-input, amplify-chat-container, global-chat-container) to the
 * reference view and a branch to the embed switch.
 *
 * Embed mode (`component` set) renders one component:
 *   /examples/amplify-chat-input?component=text-area&placeholder=Or%20reply%20directly…
 *   /examples/amplify-chat-input?component=button-row&showLabels=no&canSend=true
 *   /examples/amplify-chat-input?component=context-container&size=docked&items=Tyler%20Brooks,Verizon
 *   /examples/amplify-chat-input?component=chat-input&size=docked
 *   /examples/amplify-chat-input?component=chat-input&generating=true
 *   /examples/amplify-chat-input?component=amplify-chat-container&questions=yes
 *   /examples/amplify-chat-input?component=global-chat-container&name=Chloe
 * Params:
 *   component = chat-input | amplify-chat-container | global-chat-container | text-area | button-row | context-container
 *   chat-input:             size = full page | docked (default full page), placeholder, value,
 *                           generating = true (Stop next to Send, Send disabled; also on the containers and button-row)
 *   amplify-chat-container: size, items (context chips, default "Tyler Brooks"; "none" hides the row),
 *                           questions = yes (sample clarifying-questions round replaces the context row)
 *   global-chat-container:  size, name (default Chloe), greeting (whole headline), items (default none)
 *   text-area:          placeholder, value
 *   button-row:         showLabels = yes | no (default yes), canSend = true | false (default false), generating = true
 *   context-container:  size = full page | docked (default full page),
 *                       items (comma list of chip labels, default "Tyler Brooks")
 *   sources (container + context-container): comma list of Amplify data-source chips with the Amplify
 *     icon, e.g. sources=Prospect (shown before any items)
 */
@Component({
  imports: [AmplifyChatTextArea, AmplifyChatButtonRow, AmplifyChatContextContainer, AmplifyChatInput, AmplifyChatContainer, AmplifyChatGlobalChatContainer],
  selector: 'app-amplify-chat-input-page',
  template: `
    @if (component()) {
      <div class="embed">
        @switch (component()) {
          @case ('chat-input') {
            <ats-amplify-chat-input [size]="size()" [placeholder]="placeholder()" [value]="value() ?? ''" [generating]="isGenerating()" (stop)="noop()" />
          }
          @case ('amplify-chat-container') {
            <ats-amplify-chat-container [size]="size()" [context]="embedItems()" [questions]="questions() === 'yes' ? round : undefined" [generating]="isGenerating()" (removed)="drop($event)" />
          }
          @case ('global-chat-container') {
            <ats-amplify-chat-global-chat-container [size]="size()" [name]="name()" [greeting]="greeting()" [context]="items() || sources() ? embedItems() : []" [generating]="isGenerating()" />
          }
          @case ('text-area') {
            <textarea ats-amplify-chat-text-area aria-label="Message Amplify" [placeholder]="placeholder()" [value]="value() ?? ''"></textarea>
          }
          @case ('button-row') {
            <ats-amplify-chat-button-row [showLabels]="showLabels() ?? 'yes'" [canSend]="canSend() ?? false" [generating]="isGenerating()" />
          }
          @case ('context-container') {
            <ats-amplify-chat-context-container [size]="size()" [items]="embedItems()" (removed)="drop($event)" />
          }
        }
      </div>
    } @else {
      <h1>Amplify Chat — Chat input</h1>
      <p class="lede">Figma <code>amplify-chat/chat-input</code> group (doc frame 6300:127598, subsection/input 6352:28898). The input where the recruiter asks Amplify for something and sets what it works from.</p>

      <section>
        <h2>Live demo</h2>
        <p class="note">Type and press ↵ to send (Shift+↵ for a new line). Sending starts a ~2s "generating" state: Stop appears next to Send (Send is disabled); Stop ends it early. "Ask a clarifying question" opens the card above the input; answer with a click, 1–4, ↑ ↓ + ↵, Skip, or by typing in the input. While the card is open, typing anywhere in the container (outside the chat input) goes to Something else, which then shows the submit FAB.</p>
        <div class="demo w800">
          <div class="toolbar">
            <button type="button" (click)="ask()">Ask a clarifying question</button>
            <label><input type="checkbox" [checked]="demoDocked()" (change)="demoDocked.set(!demoDocked())" /> docked</label>
          </div>
          <ol class="log" aria-live="polite">
            @for (m of log(); track $index) { <li>{{ m }}</li> } @empty { <li class="muted">Nothing sent yet.</li> }
          </ol>
          <ats-amplify-chat-container [size]="demoDocked() ? 'docked' : 'full page'" [context]="demoContext()" [questions]="demoQuestions()"
            [generating]="demoGenerating()" (send)="sent($event)" (stop)="stopped()" (completed)="done($event)" (dismissed)="say('(questions dismissed)')" (removed)="demoContext.set([])" />
        </div>
      </section>

      <section>
        <h2>chat-input <span class="node">4608:172361</span></h2>
        <p class="note">Text area + button row in the card box. Owns the draft: Send enables when there is text; ↵ sends and clears.</p>
        <div class="stack w750">
          <div class="item"><span class="caption">size=full page (4510:141056)</span><ats-amplify-chat-input /></div>
          <div class="item"><span class="caption">size=docked (4608:172362) · icon-only buttons</span><ats-amplify-chat-input size="docked" /></div>
          <div class="item"><span class="caption">size=full page · with a draft (Send enabled)</span><ats-amplify-chat-input value="Find Java developers within 25 miles of Boston" /></div>
          <div class="item"><span class="caption">generating · Stop next to Send (Send disabled)</span><ats-amplify-chat-input [generating]="true" /></div>
          <div class="item"><span class="caption">size=docked · generating</span><ats-amplify-chat-input size="docked" [generating]="true" /></div>
        </div>
      </section>

      <section>
        <h2>amplify-chat-container <span class="node">4527:169494</span></h2>
        <p class="note">Context row over the chat input. With a clarifying-questions round, the card replaces the context row and the placeholder becomes "Or reply directly…".</p>
        <div class="stack w750">
          <div class="item"><span class="caption">size=full page · show context</span><ats-amplify-chat-container [context]="['Tyler Brooks']" /></div>
          <div class="item"><span class="caption">size=docked · show context</span><ats-amplify-chat-container size="docked" [context]="['Tyler Brooks']" /></div>
          <div class="item"><span class="caption">show context off</span><ats-amplify-chat-container /></div>
          <div class="item"><span class="caption">clarifying questions open (6337:209113)</span><ats-amplify-chat-container [context]="['Tyler Brooks']" [questions]="round" /></div>
          <div class="item"><span class="caption">clarifying questions open · docked</span><ats-amplify-chat-container size="docked" [context]="['Tyler Brooks']" [questions]="round" /></div>
        </div>
      </section>

      <section>
        <h2>global-chat-container <span class="node">4527:171709</span></h2>
        <p class="note">The starting point for a new chat: greeting + input (context row hidden, taller text area).</p>
        <div class="stack w750">
          <div class="item"><span class="caption">default</span><ats-amplify-chat-global-chat-container /></div>
          <div class="item"><span class="caption">with the current record as context</span><ats-amplify-chat-global-chat-container [context]="[{ label: 'Verizon', entity: 'company' }]" /></div>
        </div>
      </section>

      <section>
        <h2>amplify-text-area <span class="node">4608:172388</span></h2>
        <p class="note">Native textarea; grows with its content up to 400px, then scrolls. Type to try it.</p>
        <div class="stack w600">
          <div class="item"><span class="caption">size=default · placeholder</span><div class="frame"><textarea ats-amplify-chat-text-area aria-label="Message Amplify"></textarea></div></div>
          <div class="item"><span class="caption">size=default · placeholder "Or reply directly…" (clarifying questions open)</span><div class="frame"><textarea ats-amplify-chat-text-area aria-label="Message Amplify" placeholder="Or reply directly…"></textarea></div></div>
          <div class="item"><span class="caption">size=default · input</span><div class="frame"><textarea ats-amplify-chat-text-area aria-label="Message Amplify" value="Find Java developers within 25 miles of Boston for the Verizon job order"></textarea></div></div>
        </div>
      </section>

      <section>
        <h2>button-row <span class="node">4608:172446</span></h2>
        <p class="note">Send is disabled until the parent says there is something to send (<code>canSend</code>). The live demo below enables it as you type.</p>
        <div class="stack w625">
          <div class="item"><span class="caption">show button labels=yes (4608:172447) · canSend</span><ats-amplify-chat-button-row [canSend]="true" /></div>
          <div class="item"><span class="caption">show button labels=no (6223:173575) · canSend</span><ats-amplify-chat-button-row [showLabels]="false" [canSend]="true" /></div>
          <div class="item"><span class="caption">show button labels=yes · empty (Send disabled)</span><ats-amplify-chat-button-row /></div>
          <div class="item"><span class="caption">generating · Stop (Dialogue, icon-only stop-circle) + Send disabled</span><ats-amplify-chat-button-row [canSend]="true" [generating]="true" /></div>
          <div class="item"><span class="caption">show button labels=no · generating</span><ats-amplify-chat-button-row [showLabels]="false" [generating]="true" /></div>
          <div class="item">
            <span class="caption">live: text area + button row</span>
            <div class="frame col">
              <textarea ats-amplify-chat-text-area aria-label="Message Amplify" [value]="draft()" (input)="draft.set($any($event.target).value)"></textarea>
              <ats-amplify-chat-button-row [canSend]="draft().trim().length > 0" (send)="draft.set('')" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>amplify-context-container <span class="node">6349:218552</span></h2>
        <p class="note">Chips are removable (try the ×); + adds context.</p>
        <div class="stack w828">
          <div class="item"><span class="caption">Property 1=full page (4527:169452)</span><ats-amplify-chat-context-container [items]="contextItems()" (removed)="drop($event)" /></div>
          <div class="item"><span class="caption">Property 1=docked (6349:218553)</span><ats-amplify-chat-context-container size="docked" [items]="contextItems()" (removed)="drop($event)" /></div>
          <div class="item"><span class="caption">full page · several records</span><ats-amplify-chat-context-container [items]="many" /></div>
          <div class="item"><span class="caption">source chip (Prospect: Amplify icon) + a record</span><ats-amplify-chat-context-container [items]="withSource" /></div>
        </div>
      </section>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 16px 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 0 0 4px; }
    .node { font-size: 12px; font-weight: 400; color: #5d7798; }
    .lede { color: #5d7798; margin: 0 0 32px; font-size: 14px; }
    .note { color: #5d7798; margin: 0 0 16px; font-size: 13px; }
    section { margin: 0 0 48px; }
    .stack { display: flex; flex-direction: column; gap: 24px; }
    .w600 { width: 600px; } .w625 { width: 625px; } .w828 { width: 828px; } .w750 { width: 750px; } .w800 { width: 800px; max-width: 100%; }
    .embed { max-width: 800px; }
    .demo { display: flex; flex-direction: column; gap: 12px; padding: 16px; border: 1px dashed #c2c5cb; border-radius: 8px; background: #f7f8f9; }
    .toolbar { display: flex; gap: 16px; align-items: center; font-size: 13px; }
    .log { margin: 0; padding: 0 0 0 20px; min-height: 60px; font-size: 13px; color: #3d464d; display: flex; flex-direction: column; gap: 4px; }
    .muted { color: #5d7798; list-style: none; margin-left: -20px; }
    .item { display: flex; flex-direction: column; gap: 8px; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
    .frame { padding: 12px 16px; border: 1px dashed #c2c5cb; border-radius: 8px; background: #fff; }
    .frame.col { display: flex; flex-direction: column; gap: 12px; }
  `,
})
export class AmplifyChatInputPage {
  readonly component = input<InputComponent>();
  readonly placeholder = input<string>();
  readonly value = input<string>();
  readonly showLabels = input<string>();
  readonly canSend = input<string>();
  readonly size = input<AmplifyChatContextContainerSize>();
  readonly items = input<string>();
  /** Comma list of Amplify data-source chips (Amplify icon), shown before the record chips, e.g. "Prospect". */
  readonly sources = input<string>();
  readonly questions = input<string>();
  readonly name = input<string>();
  readonly greeting = input<string>();
  readonly generating = input<string>();

  protected readonly round = QUESTIONS;
  protected readonly log = signal<string[]>([]);
  protected readonly demoDocked = signal(false);
  protected readonly demoContext = signal<AmplifyChatContextItem[]>(['Tyler Brooks']);
  protected readonly demoQuestions = signal<AmplifyChatClarifyingQuestion[] | undefined>(undefined);
  protected readonly demoGenerating = signal(false);
  private genTimer?: ReturnType<typeof setTimeout>;
  protected readonly isGenerating = computed(() => this.generating() === 'true' || this.generating() === 'yes');

  protected readonly draft = signal('');
  protected readonly contextItems = signal<AmplifyChatContextItem[]>(['Tyler Brooks']);
  protected readonly many: AmplifyChatContextItem[] = [
    'Tyler Brooks',
    { label: 'Jordan Ellis', entity: 'contact' },
    { label: 'Verizon', entity: 'company' },
    { label: '425 | Software Engineer', entity: 'job' },
  ];
  protected readonly withSource: AmplifyChatContextItem[] = [{ label: 'Prospect', source: true }, { label: 'Verizon', entity: 'company' }];
  private readonly removedLabels = signal<string[]>([]);

  protected readonly embedItems = computed<AmplifyChatContextItem[]>(() => {
    const removed = this.removedLabels();
    const sources: AmplifyChatContextItem[] = (this.sources()?.split(',').map((s) => s.trim()).filter(Boolean) ?? [])
      .filter((l) => !removed.includes(l)).map((label) => ({ label, source: true }));
    const records = (this.items() === 'none' ? [] : this.items()?.split(',').map((s) => s.trim()).filter(Boolean) ?? (sources.length ? [] : ['Tyler Brooks']))
      .filter((l) => !removed.includes(l));
    return [...sources, ...records];
  });

  protected say(line: string): void {
    this.log.update((l) => [...l, line]);
  }

  protected noop(): void {}

  /** Live demo: sending starts a ~2s generating state (Stop shows; Send disabled). */
  protected sent(text: string): void {
    this.say('You: ' + text);
    this.demoGenerating.set(true);
    clearTimeout(this.genTimer);
    this.genTimer = setTimeout(() => {
      this.demoGenerating.set(false);
      this.say('Amplify: (reply)');
    }, 2000);
  }

  protected stopped(): void {
    clearTimeout(this.genTimer);
    this.demoGenerating.set(false);
    this.say('(generating stopped)');
  }

  protected ask(): void {
    this.say('Amplify: I found 500 candidates that match Product Manager. A few details will help narrow the search.');
    this.demoQuestions.set([...QUESTIONS]);
  }

  protected done(answers: AmplifyChatClarifyAnswer[]): void {
    this.say('You: ' + answers.map((a) => `${a.question} ${a.value}`).join(' · '));
    this.demoQuestions.set(undefined);
  }

  protected drop(label: string): void {
    this.contextItems.update((list) => list.filter((i) => (typeof i === 'string' ? i : i.label) !== label));
    this.removedLabels.update((l) => [...l, label]);
  }
}
