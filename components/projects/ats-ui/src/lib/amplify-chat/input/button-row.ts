import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { Button } from '../../button/button';

// Accepts booleans, '' (bare attribute) and Figma's 'yes' / 'no'; undefined stays undefined.
const yesNo = (v: unknown): boolean | undefined => (v == null ? undefined : v === 'yes' ? true : v === 'no' ? false : booleanAttribute(v));

/**
 * AmplifyChatButtonRow (Figma: "button-row", set 4608:172446). The row under the
 * chat text area: Add File, Add Tools and Prompt Library (Button, Dialogue / Small)
 * on the left, and the send button (Amplify Radial fill, 32px round, arrow-up) on
 * the right.
 *  - `showLabels` true = Figma "show button labels=yes" (4608:172447), full-page chat.
 *  - `showLabels` false = "show button labels=no" (6223:173575), docked chat: icon-only
 *    buttons, each keeping its label as the accessible name (WCAG 4.1.2).
 *
 * The parent owns the draft: pass `canSend` (false disables Send, e.g. while the
 * text area is empty) and listen to the outputs.
 *
 * While a reply is generating (`generating`), a Stop button (Button, Dialogue / Small,
 * icon-only `stop-circle`, aria-label "Stop generating") sits just before Send and
 * emits `stop`; Send stays disabled until generating ends.
 *
 *   <ats-amplify-chat-button-row [canSend]="draft().trim().length > 0" (send)="submit()" (addFile)="pickFile()" />
 *   <ats-amplify-chat-button-row [showLabels]="false" [canSend]="true" />
 *   <ats-amplify-chat-button-row [generating]="busy()" (stop)="cancel()" />
 */
@Component({
  selector: 'ats-amplify-chat-button-row',
  imports: [Button],
  template: `
    <div class="ats-amplify-chat-button-row__tools">
      <button ats-button theme="dialogue" size="small" iconLeft="add-thin" [attr.aria-label]="labels() ? null : 'Add File'" (click)="addFile.emit()">{{ labels() ? 'Add File' : '' }}</button>
      <button ats-button theme="dialogue" size="small" iconLeft="tools" [attr.aria-label]="labels() ? null : 'Add Tools'" (click)="addTools.emit()">{{ labels() ? 'Add Tools' : '' }}</button>
      <button ats-button theme="dialogue" size="small" iconLeft="book" [attr.aria-label]="labels() ? null : 'Prompt Library'" (click)="promptLibrary.emit()">{{ labels() ? 'Prompt Library' : '' }}</button>
    </div>
    @if (isGenerating()) {
      <button ats-button class="ats-amplify-chat-button-row__stop" theme="dialogue" size="small" iconLeft="stop-circle"
        aria-label="Stop generating" (click)="stop.emit()"></button>
    }
    <button ats-button class="ats-amplify-chat-button-row__send" theme="primary" color="amplify" size="small" iconLeft="arrow-up"
      aria-label="Send" [disabled]="!sendable() || isGenerating()" (click)="send.emit()"></button>
  `,
  styleUrl: './button-row.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-button-row', '[class.ats-amplify-chat-button-row--icons-only]': '!labels()' },
})
export class AmplifyChatButtonRow {
  /** Figma "show button labels" (yes = true). Default true. */
  readonly showLabels = input<boolean | undefined, unknown>(true, { transform: yesNo });
  /** Enables Send. Default false (nothing to send). */
  readonly canSend = input<boolean | undefined, unknown>(false, { transform: yesNo });
  /** A reply is generating: shows Stop and keeps Send disabled. Default false. */
  readonly generating = input<boolean | undefined, unknown>(false, { transform: yesNo });

  readonly send = output<void>();
  /** Emits when Stop is activated (only shown while `generating`). */
  readonly stop = output<void>();
  readonly addFile = output<void>();
  readonly addTools = output<void>();
  readonly promptLibrary = output<void>();

  protected readonly labels = computed(() => this.showLabels() ?? true);
  protected readonly sendable = computed(() => this.canSend() ?? false);
  protected readonly isGenerating = computed(() => this.generating() ?? false);
}
