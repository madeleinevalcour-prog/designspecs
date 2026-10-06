import { Component, computed, input } from '@angular/core';
import { AmplifyChatDraftBlock, AmplifyChatLiteralValueBlock, AmplifyChatLiteralValueBlockState } from 'ats-ui';

const DRAFT = `Hi Jordan,

I came across your profile and think you could be a strong fit for a Senior Java Developer role with one of our clients in Boston. Would you be open to a quick call this week?

Best,
Pod Racer`;
const BOOLEAN = '("Java" OR "J2EE") AND ("Spring Boot" OR "Spring") AND ("AWS" OR "Azure") AND ("Senior" OR "Lead") NOT "Intern"';

/**
 * /amplify-chat-blocks — Amplify Chat — Blocks (Figma doc frame 6300:27081):
 * amplify-chat/draft-block (6149:20803) and amplify-chat/literal-value-block
 * (6152:117821: Property 1=default / hover). Copy is live on both (navigator.clipboard).
 *
 * Embed mode: any param renders one block at chat-column width (560), e.g.
 *   /examples/amplify-chat-blocks?component=draft-block
 *   /examples/amplify-chat-blocks?component=draft-block&showSubject=false&showActions=false
 *   /examples/amplify-chat-blocks?component=literal-value-block&state=hover
 * Params:
 *   component = draft-block | literal-value-block (default draft-block)
 *   draft-block: subject (default "Draft email") · showSubject = true | false · showActions = true | false
 *   literal-value-block: state = default | hover · value (default the Boolean string)
 */
@Component({
  imports: [AmplifyChatDraftBlock, AmplifyChatLiteralValueBlock],
  selector: 'app-amplify-chat-blocks-page',
  template: `
    @if (embed()) {
      <div class="embed block">
        @if (component() === 'literal-value-block') {
          <ats-amplify-chat-literal-value-block [value]="value() ?? boolean" [state]="state()" />
        } @else {
          <ats-amplify-chat-draft-block [subject]="showSubject() === 'false' ? undefined : (subject() ?? 'Draft email')"
            [draft]="draft" [showActions]="showActions() !== 'false'" />
        }
      </div>
    } @else {
      <h1>Amplify Chat — Blocks</h1>
      <p class="lede">Text Amplify writes for the recruiter: a draft block to edit before using, and a literal value block to copy exactly. Both take the full chat-column width (560 here). Copy is live.</p>

      <h2>amplify-chat/draft-block <span>6149:20803</span></h2>
      <div class="grid">
        <span class="caption">Show subject · Show actions</span>
        <div class="block"><ats-amplify-chat-draft-block subject="Draft email" [draft]="draft" /></div>
        <span class="caption">no subject (a note)</span>
        <div class="block"><ats-amplify-chat-draft-block [draft]="note" /></div>
        <span class="caption">read-only (no actions)</span>
        <div class="block"><ats-amplify-chat-draft-block subject="Draft email" [draft]="draft" [showActions]="false" /></div>
      </div>

      <h2>amplify-chat/literal-value-block <span>6152:117821</span></h2>
      <div class="grid">
        <span class="caption">Property 1=default</span>
        <div class="block"><ats-amplify-chat-literal-value-block [value]="boolean" copyLabel="Copy Boolean string" /></div>
        <span class="caption">Property 1=hover</span>
        <div class="block"><ats-amplify-chat-literal-value-block [value]="boolean" state="hover" copyLabel="Copy Boolean string" /></div>
        <span class="caption">short value</span>
        <div class="block"><ats-amplify-chat-literal-value-block value="Senior Java Developer – Boston (Hybrid)" /></div>
      </div>
    }
  `,
  styles: `
    :host { display: block; padding: 32px 40px 80px; }
    :host:has(.embed) { padding: 16px 24px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 32px 0 12px; color: #3d464d; }
    h2 span { font-weight: 400; color: #8ca1b9; font-size: 12px; margin-left: 6px; }
    .lede { color: #5d7798; margin: 0 0 24px; font-size: 14px; max-width: 720px; }
    .grid { display: grid; grid-template-columns: 180px minmax(0, 560px); gap: 24px 16px; align-items: start; }
    .caption { font-size: 13px; font-weight: 500; color: #5d7798; padding-top: 8px; }
    .block { max-width: 560px; }
  `,
})
export class AmplifyChatBlocksPage {
  readonly component = input<'draft-block' | 'literal-value-block'>();
  readonly subject = input<string>();
  readonly showSubject = input<string>();
  readonly showActions = input<string>();
  readonly state = input<AmplifyChatLiteralValueBlockState>();
  readonly value = input<string>();

  protected readonly draft = DRAFT;
  protected readonly note = 'Called Jordan Lee about the Verizon Senior Java Developer role. Interested; available from November 3. Prefers hybrid, 3 days on site max.';
  protected readonly boolean = BOOLEAN;
  protected readonly embed = computed(() => !!(this.component() || this.subject() || this.showSubject() || this.showActions() || this.state() || this.value()));
}
