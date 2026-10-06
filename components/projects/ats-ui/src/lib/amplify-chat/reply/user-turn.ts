import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * AmplifyChatUserTurn (Figma: "user-turn" frame 6237:176861). The recruiter's turn
 * in the 800px chat column: a full-width row that right-aligns its projected
 * `ats-amplify-chat-user-bubble` (the bubble hugs its text up to 440px). Turns are
 * spacing/gap/xlg (32) apart — that spacing belongs to the conversation column.
 *
 *   <ats-amplify-chat-user-turn>
 *     <ats-amplify-chat-user-bubble>Make a list of the open jobs I should prioritize today</ats-amplify-chat-user-bubble>
 *   </ats-amplify-chat-user-turn>
 */
@Component({
  selector: 'ats-amplify-chat-user-turn',
  template: `<ng-content />`,
  styleUrl: './user-turn.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-user-turn' },
})
export class AmplifyChatUserTurn {}
