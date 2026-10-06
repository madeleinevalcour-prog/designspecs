import { Component, computed, input, signal } from '@angular/core';
import { AmplifyChatButtonRow, AmplifyChatContextContainer, AmplifyChatContextContainerSize, AmplifyChatContextItem, AmplifyChatTextArea } from 'ats-ui';

type InputComponent = 'text-area' | 'button-row' | 'context-container';

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
 * Params:
 *   component = text-area | button-row | context-container
 *   text-area:          placeholder, value
 *   button-row:         showLabels = yes | no (default yes), canSend = true | false (default false)
 *   context-container:  size = full page | docked (default full page),
 *                       items (comma list of chip labels, default "Tyler Brooks")
 */
@Component({
  imports: [AmplifyChatTextArea, AmplifyChatButtonRow, AmplifyChatContextContainer],
  selector: 'app-amplify-chat-input-page',
  template: `
    @if (component()) {
      <div class="embed">
        @switch (component()) {
          @case ('text-area') {
            <textarea ats-amplify-chat-text-area aria-label="Message Amplify" [placeholder]="placeholder()" [value]="value() ?? ''"></textarea>
          }
          @case ('button-row') {
            <ats-amplify-chat-button-row [showLabels]="showLabels() ?? 'yes'" [canSend]="canSend() ?? false" />
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
    .w600 { width: 600px; } .w625 { width: 625px; } .w828 { width: 828px; }
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

  protected readonly draft = signal('');
  protected readonly contextItems = signal<AmplifyChatContextItem[]>(['Tyler Brooks']);
  protected readonly many: AmplifyChatContextItem[] = [
    'Tyler Brooks',
    { label: 'Jordan Ellis', entity: 'contact' },
    { label: 'Verizon', entity: 'company' },
    { label: '425 | Software Engineer', entity: 'job' },
  ];
  private readonly removedLabels = signal<string[]>([]);

  protected readonly embedItems = computed<AmplifyChatContextItem[]>(() =>
    (this.items()?.split(',').map((s) => s.trim()).filter(Boolean) ?? ['Tyler Brooks']).filter((l) => !this.removedLabels().includes(l)),
  );

  protected drop(label: string): void {
    this.contextItems.update((list) => list.filter((i) => (typeof i === 'string' ? i : i.label) !== label));
    this.removedLabels.update((l) => [...l, label]);
  }
}
