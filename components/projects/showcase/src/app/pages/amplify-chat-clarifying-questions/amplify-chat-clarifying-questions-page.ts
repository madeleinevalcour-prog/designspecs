import { Component, computed, input, signal } from '@angular/core';
import {
  AmplifyChatClarifyKey, AmplifyChatClarifyKeyState, AmplifyChatClarifyKeyType,
  AmplifyChatClarifyOption, AmplifyChatClarifyOptionState, AmplifyChatClarifyOptionType,
  AmplifyChatClarifySomethingElse, AmplifyChatClarifySomethingElseState, NovoListField,
  AmplifyChatClarifyAnswer, AmplifyChatClarifyingQuestion, AmplifyChatClarifyingQuestions, AmplifyChatClarifyingQuestionsSize,
} from 'ats-ui';

type ClarifyComponent = 'clarifying-questions' | 'clarify-key' | 'clarify-option' | 'clarify-something-else';

const RECORD_FIELDS: NovoListField[] = [
  { type: 'company', text: 'Verizon' },
  { type: 'date', text: 'May 23, 2024' },
  { type: 'status', text: 'Internally submitted' },
];

/** Figma 6336:28246 sample: distance question (3 options, recommended from JO-4821). */
const DISTANCE: AmplifyChatClarifyingQuestion = {
  question: 'How far from Boston should Amplify look?',
  options: [
    { label: 'Within 25 mi of Boston', recommended: 'Recommended · from', recordLink: 'JO-4821' },
    { label: 'Within 50 mi of Boston' },
    { label: 'Include remote candidates' },
  ],
};
/** Record question (Figma 6337:209113 uses type=record options). */
const JOB: AmplifyChatClarifyingQuestion = {
  question: 'Which job order?',
  help: 'Amplify only searches records you can access.',
  options: [
    { type: 'record', label: '425 | Software Engineer', recommended: 'Recommended · you own it', fields: RECORD_FIELDS },
    { type: 'record', label: '431 | Java Developer', fields: [{ type: 'company', text: 'Comcast' }, { type: 'date', text: 'Jun 4, 2024' }, { type: 'status', text: 'Accepting candidates' }] },
    { type: 'record', label: '438 | Senior Java Developer', fields: [{ type: 'company', text: 'Verizon' }, { type: 'date', text: 'Jul 12, 2024' }, { type: 'status', text: 'Open' }] },
  ],
};
const WHO: AmplifyChatClarifyingQuestion = {
  question: 'Which candidates should Amplify include?',
  options: [
    { label: 'Active candidates only', recommended: 'Recommended · your saved search' },
    { label: 'Active and passive candidates' },
    { label: 'Placed in the last 12 months', description: 'Candidates you placed before, for re-engagement' },
    { label: 'Everyone in the talent pool' },
  ],
};

/**
 * /amplify-chat-clarifying-questions — Amplify Chat — Clarifying questions (Figma
 * subsection/clarifying-questions 6352:28917). One section per component; add new
 * sections (the clarifying-questions card) to the reference view and a branch to
 * the embed switch.
 *
 * Embed mode (`component` set) renders one component:
 *   /examples/amplify-chat-clarifying-questions?component=clarify-key&type=number&state=selected&number=2
 *   /examples/amplify-chat-clarifying-questions?component=clarify-option&type=record&state=active
 *   /examples/amplify-chat-clarifying-questions?component=clarify-option&label=Within%2025%20mi%20of%20Boston&recommended=Recommended%20·%20from&recordLink=JO-4821
 *   /examples/amplify-chat-clarifying-questions?component=clarify-something-else&state=typing&value=Within%2010%20mi
 *   /examples/amplify-chat-clarifying-questions?component=clarifying-questions&size=docked
 *   /examples/amplify-chat-clarifying-questions?component=clarifying-questions&set=record
 * Params:
 *   component = clarifying-questions | clarify-key | clarify-option | clarify-something-else
 *   clarifying-questions:    size = full page | docked (default full page),
 *                            set = round (default: distance, job order, candidates) | single (distance only, no pager) | record (job order first)
 *   clarify-key:             type = number | icon, state = default | active | selected, number
 *   clarify-option:          type = text | record, state = default | active | selected, number,
 *                            label, recommended, recordLink, description (record: sample Verizon fields)
 *   clarify-something-else:  state = default | typing, value, showSkip = true | false
 */
@Component({
  imports: [AmplifyChatClarifyingQuestions, AmplifyChatClarifyKey, AmplifyChatClarifyOption, AmplifyChatClarifySomethingElse],
  selector: 'app-amplify-chat-clarifying-questions-page',
  template: `
    @if (component()) {
      <div class="embed">
        @switch (component()) {
          @case ('clarifying-questions') {
            <ats-amplify-chat-clarifying-questions [size]="cqSize()" [questions]="embedSet()" />
          }
          @case ('clarify-key') {
            <ats-amplify-chat-clarify-key [type]="keyType()" [state]="keyState()" [number]="number() ?? '1'" />
          }
          @case ('clarify-option') {
            <div role="radiogroup" aria-label="Which job order?">
              <button ats-amplify-chat-clarify-option [type]="optionType()" [state]="optionState()" [number]="number() ?? '1'"
                [label]="label() ?? (optionType() === 'record' ? '425 | Software Engineer' : 'Within 25 mi of Boston')"
                [recommended]="recommended()" [recordLink]="recordLink()" [description]="description()" [fields]="fields"></button>
            </div>
          }
          @case ('clarify-something-else') {
            <ats-amplify-chat-clarify-something-else [state]="elseState()" [value]="value() ?? ''" [showSkip]="showSkip() !== 'false'" />
          }
        }
      </div>
    } @else {
      <h1>Amplify Chat — Clarifying questions</h1>
      <p class="lede">Figma <code>subsection/clarifying-questions</code> (6352:28917) in the <code>amplify-chat/chat-input</code> group. The parts of the card Amplify shows above the chat input when a request is ambiguous. Hover and keyboard focus are live.</p>

      <section>
        <h2>Live demo</h2>
        <p class="note">Click an option, press 1–4, or move with ↑ ↓ and press ↵. Answering moves to the next question; the pager pages back (earlier answers stay selected). Type in Something else and press ↵, or Skip to take the recommended option.</p>
        <div class="w750 col">
          @if (demoOpen()) {
            <ats-amplify-chat-clarifying-questions [questions]="demoRound()" (answered)="say('answered ' + ($event.index + 1) + ': ' + $event.answer.value + ' (' + $event.answer.via + ')')"
              (completed)="done($event)" (dismissed)="demoOpen.set(false); say('dismissed')" />
          } @else {
            <button type="button" class="restart" (click)="restart()">Ask again</button>
          }
          <ol class="log" aria-live="polite">
            @for (m of log(); track $index) { <li>{{ m }}</li> } @empty { <li class="muted">No answers yet.</li> }
          </ol>
        </div>
      </section>

      <section>
        <h2>clarifying-questions <span class="node">6336:28366</span></h2>
        <div class="stack w750">
          <div class="item"><span class="caption">size=full page (6336:28246) · step 1 of 3</span><ats-amplify-chat-clarifying-questions [questions]="round" /></div>
          <div class="item"><span class="caption">size=docked (6336:28306)</span><ats-amplify-chat-clarifying-questions size="docked" [questions]="round" /></div>
          <div class="item"><span class="caption">single question · show pager off</span><ats-amplify-chat-clarifying-questions [questions]="single" /></div>
          <div class="item"><span class="caption">type=record options · show help</span><ats-amplify-chat-clarifying-questions [questions]="recordSet" /></div>
          <div class="item"><span class="caption">4 options · description</span><ats-amplify-chat-clarifying-questions [questions]="fourSet" /></div>
        </div>
      </section>

      <section>
        <h2>clarify-option <span class="node">6335:28257</span></h2>
        <div class="stack w640" role="radiogroup" aria-label="Which job order?">
          <div class="item"><span class="caption">type=text, state=default (6335:28233)</span><button ats-amplify-chat-clarify-option number="1" label="Within 25 mi of Boston" recommended="Recommended · from" recordLink="JO-4821"></button></div>
          <div class="item"><span class="caption">type=text, state=active (6335:28241)</span><button ats-amplify-chat-clarify-option number="2" state="active" label="Within 50 mi of Boston"></button></div>
          <div class="item"><span class="caption">type=text, state=selected (6335:28249)</span><button ats-amplify-chat-clarify-option number="3" state="selected" label="Remote only" description="Matches candidates who marked remote in their profile"></button></div>
          <div class="item"><span class="caption">type=record, state=default (6341:28605)</span><button ats-amplify-chat-clarify-option type="record" number="1" label="425 | Software Engineer" recommended="Recommended · you own it" [fields]="fields"></button></div>
          <div class="item"><span class="caption">type=record, state=active (6341:28645)</span><button ats-amplify-chat-clarify-option type="record" number="2" state="active" label="431 | Java Developer" [fields]="fields2"></button></div>
          <div class="item"><span class="caption">type=record, state=selected (6341:28685)</span><button ats-amplify-chat-clarify-option type="record" number="3" state="selected" label="425 | Software Engineer" [fields]="fields"></button></div>
        </div>
      </section>

      <section>
        <h2>clarify-key <span class="node">6334:28241</span></h2>
        <div class="row">
          @for (k of keys; track $index) {
            <div class="item center"><ats-amplify-chat-clarify-key [type]="k.type" [state]="k.state" /><span class="caption">{{ k.caption }}</span></div>
          }
        </div>
      </section>

      <section>
        <h2>clarify-something-else <span class="node">6335:128906</span></h2>
        <p class="note">Type and press ↵ to submit; the row takes the typing look while the field has focus.</p>
        <div class="stack w640">
          <div class="item"><span class="caption">state=default (6335:128884)</span><ats-amplify-chat-clarify-something-else /></div>
          <div class="item"><span class="caption">state=typing (6335:128895)</span><ats-amplify-chat-clarify-something-else state="typing" value="Within 10 mi of Cambridge" /></div>
        </div>
      </section>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 16px 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 0 0 16px; }
    .node { font-size: 12px; font-weight: 400; color: #5d7798; }
    .lede { color: #5d7798; margin: 0 0 32px; font-size: 14px; max-width: 720px; }
    .note { color: #5d7798; margin: -8px 0 16px; font-size: 13px; }
    section { margin: 0 0 48px; }
    .stack { display: flex; flex-direction: column; gap: 16px; }
    .w640, .embed { width: 640px; max-width: 100%; }
    .embed:has(.ats-amplify-chat-clarifying-questions) { width: 750px; }
    .w750 { width: 750px; max-width: 100%; }
    .col { display: flex; flex-direction: column; gap: 16px; }
    .restart { align-self: flex-start; }
    .log { margin: 0; padding: 0 0 0 20px; font-size: 13px; color: #3d464d; display: flex; flex-direction: column; gap: 4px; }
    .muted { color: #5d7798; list-style: none; margin-left: -20px; }
    .row { display: flex; gap: 32px; }
    .item { display: flex; flex-direction: column; gap: 8px; }
    .item.center { align-items: center; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; }
  `,
})
export class AmplifyChatClarifyingQuestionsPage {
  readonly component = input<ClarifyComponent>();
  readonly type = input<string>();
  readonly state = input<string>();
  readonly number = input<string>();
  readonly label = input<string>();
  readonly recommended = input<string>();
  readonly recordLink = input<string>();
  readonly description = input<string>();
  readonly value = input<string>();
  readonly showSkip = input<string>();
  readonly size = input<string>();
  readonly set = input<string>();

  protected readonly round: AmplifyChatClarifyingQuestion[] = [DISTANCE, JOB, WHO];
  protected readonly single: AmplifyChatClarifyingQuestion[] = [DISTANCE];
  protected readonly recordSet: AmplifyChatClarifyingQuestion[] = [JOB, DISTANCE];
  protected readonly fourSet: AmplifyChatClarifyingQuestion[] = [WHO];
  protected readonly cqSize = computed(() => (this.size() as AmplifyChatClarifyingQuestionsSize | undefined) ?? 'full page');
  protected readonly embedSet = computed(() => (this.set() === 'single' ? this.single : this.set() === 'record' ? this.recordSet : this.round));

  protected readonly demoOpen = signal(true);
  protected readonly demoRound = signal<AmplifyChatClarifyingQuestion[]>([JOB, DISTANCE, WHO]);
  protected readonly log = signal<string[]>([]);
  protected say(line: string): void {
    this.log.update((l) => [...l, line]);
  }
  protected done(answers: AmplifyChatClarifyAnswer[]): void {
    this.say('completed → ' + answers.map((a) => `${a.question} ${a.value}`).join(' · '));
    this.demoOpen.set(false);
  }
  protected restart(): void {
    this.log.set([]);
    this.demoRound.set([JOB, DISTANCE, WHO]);
    this.demoOpen.set(true);
  }

  protected readonly fields = RECORD_FIELDS;
  protected readonly fields2: NovoListField[] = [
    { type: 'company', text: 'Comcast' },
    { type: 'date', text: 'Jun 4, 2024' },
    { type: 'status', text: 'Accepting candidates' },
  ];
  protected readonly keys: { type: AmplifyChatClarifyKeyType; state: AmplifyChatClarifyKeyState; caption: string }[] = [
    { type: 'number', state: 'default', caption: 'number · default' },
    { type: 'number', state: 'active', caption: 'number · active' },
    { type: 'number', state: 'selected', caption: 'number · selected' },
    { type: 'icon', state: 'default', caption: 'icon · default' },
  ];

  protected keyType = () => (this.type() as AmplifyChatClarifyKeyType | undefined) ?? 'number';
  protected keyState = () => (this.state() as AmplifyChatClarifyKeyState | undefined) ?? 'default';
  protected optionType = () => (this.type() as AmplifyChatClarifyOptionType | undefined) ?? 'text';
  protected optionState = () => (this.state() as AmplifyChatClarifyOptionState | undefined) ?? 'default';
  protected elseState = () => (this.state() as AmplifyChatClarifySomethingElseState | undefined) ?? 'default';
}
