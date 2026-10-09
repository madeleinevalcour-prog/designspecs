import { Component, computed, input } from '@angular/core';
import { AmplifyChatLink, AmplifyChatUserBubble, AmplifyChatUserBubbleState } from 'ats-ui';

const SHORT = 'Make a list of the open jobs I should prioritize today';
const LONG = `Can you find candidates for this role? Here's the job description:

Senior Java Developer, Verizon (Boston, MA, hybrid 3 days on site). 12-month contract with the option to convert.

We're looking for a Senior Java Developer to join the Network Platforms team. You'll design and build high-volume backend services in Java 17 and Spring Boot, deployed to AWS.

Requirements: 7+ years of Java, 3+ years of Spring Boot and microservices, hands-on AWS (ECS, Lambda, RDS), REST API design, CI/CD with Jenkins or GitHub Actions. Nice to have: Kafka, Terraform, telecom experience.

Rate: $85–95/hr W2. Start date: November 3. Interviews: two rounds, video then on site. Prioritize candidates who are local to Boston and available within two weeks.`;

/**
 * /amplify-chat-user-messages — Amplify Chat — User messages (Figma doc frame 6300:27101):
 * amplify-chat/user-bubble (6213:168866), all 3 states. Long text is detected live
 * (more than 8 lines → collapsed with Show More); Show More / Show Less toggles.
 *
 * Embed mode: any param renders one bubble, right-aligned in a chat column, e.g.
 *   /examples/amplify-chat-user-messages?component=user-bubble
 *   /examples/amplify-chat-user-messages?component=user-bubble&text=long
 *   /examples/amplify-chat-user-messages?component=user-bubble&state=long%20text%20expanded&text=long
 * Params:
 *   component = user-bubble (the only one)
 *   state = user-bubble | long text | long text expanded (forced; unset → detected)
 *   text = short | long | links (sample message; default short; links = a message that tags records) · message = custom text
 */
@Component({
  imports: [AmplifyChatLink, AmplifyChatUserBubble],
  selector: 'app-amplify-chat-user-messages-page',
  template: `
    @if (embed()) {
      <div class="embed column">
        @if (text() === 'links' && !message()) {
          <ats-amplify-chat-user-bubble [state]="state()">Can you show me 5 contacts at <a ats-amplify-chat-link entity="company" href="#">Verizon</a> that aren't in the ATS yet?</ats-amplify-chat-user-bubble>
        } @else {
          <ats-amplify-chat-user-bubble [state]="state()">{{ embedMessage() }}</ats-amplify-chat-user-bubble>
        }
      </div>
    } @else {
      <h1>Amplify Chat — User messages</h1>
      <p class="lede">Figma <code>amplify-chat/user-bubble</code> (6213:168866). The recruiter's message: hugs its content up to 440px, right-aligned in the chat column (the column's job). Over 8 lines it collapses with a fade and Show More; the toggle is live.</p>

      <h2>Figma variants (state forced)</h2>
      <div class="grid">
        <span class="caption">state=user-bubble</span>
        <div class="column"><ats-amplify-chat-user-bubble state="user-bubble">{{ short }}</ats-amplify-chat-user-bubble></div>
        <span class="caption">state=long text</span>
        <div class="column"><ats-amplify-chat-user-bubble state="long text">{{ long }}</ats-amplify-chat-user-bubble></div>
        <span class="caption">state=long text expanded</span>
        <div class="column"><ats-amplify-chat-user-bubble state="long text expanded">{{ long }}</ats-amplify-chat-user-bubble></div>
      </div>

      <h2>Live (state detected from the text)</h2>
      <div class="grid">
        <span class="caption">short message</span>
        <div class="column"><ats-amplify-chat-user-bubble>{{ short }}</ats-amplify-chat-user-bubble></div>
        <span class="caption">tagged records: the same inline entity link as Amplify's replies</span>
        <div class="column"><ats-amplify-chat-user-bubble>Find candidates for <a ats-amplify-chat-link entity="job" href="#">425 | Senior Java Developer</a> at <a ats-amplify-chat-link entity="company" href="#">Verizon</a></ats-amplify-chat-user-bubble></div>
        <span class="caption">pasted job description</span>
        <div class="column"><ats-amplify-chat-user-bubble>{{ long }}</ats-amplify-chat-user-bubble></div>
      </div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 16px 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 32px 0 12px; color: #3d464d; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; max-width: 720px; }
    .grid { display: grid; grid-template-columns: 180px minmax(0, 800px); gap: 24px 16px; align-items: start; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; padding-top: 8px; }
    /* stand-in chat column: messages right-aligned */
    .column { display: flex; flex-direction: column; align-items: flex-end; max-width: 800px; }
  `,
})
export class AmplifyChatUserMessagesPage {
  readonly component = input<string>();
  readonly state = input<AmplifyChatUserBubbleState>();
  readonly text = input<'short' | 'long' | 'links'>();
  readonly message = input<string>();

  protected readonly short = SHORT;
  protected readonly long = LONG;
  protected readonly embed = computed(() => !!(this.component() || this.state() || this.text() || this.message()));
  protected readonly embedMessage = computed(() => this.message() ?? (this.text() === 'long' ? LONG : SHORT));
}
