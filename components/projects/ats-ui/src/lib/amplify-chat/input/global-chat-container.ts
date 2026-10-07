import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { AmplifyChatContextItem } from './amplify-context-container';
import { AmplifyChatContainer } from './amplify-chat-container';
import { AmplifyChatInputSize } from './chat-input';

/**
 * AmplifyChatGlobalChatContainer (Figma: "global-chat-container", 4527:171709). The
 * starting point of a new chat: a greeting headline (novo-title, title/default in
 * color/text/headline) over an AmplifyChatContainer (gap page/gap/vertical). In
 * Figma the container's context row is hidden and the text area is taller (the
 * input box is 128px instead of 102px); pass `context` to show the current record.
 *
 * `greeting` replaces the whole headline; otherwise it reads
 * "Hi {name}, how can I help you today?" (name defaults to Chloe). `generating`
 * passes through to the input (Stop next to Send; Stop emits `stop`).
 *
 *   <ats-amplify-chat-global-chat-container name="Chloe" (send)="start($event)" />
 *   <ats-amplify-chat-global-chat-container [context]="[{ label: 'Verizon', entity: 'company' }]" />
 */
@Component({
  selector: 'ats-amplify-chat-global-chat-container',
  imports: [AmplifyChatContainer],
  template: `
    <h2 class="ats-amplify-chat-global-chat-container__greeting">{{ headline() }}</h2>
    <ats-amplify-chat-container [size]="size()" [context]="context()" [placeholder]="placeholder()" (send)="send.emit($event)"
      [generating]="generating()" (stop)="stop.emit()"
      (removed)="removed.emit($event)" (add)="add.emit()"
      (addFile)="addFile.emit()" (addTools)="addTools.emit()" (promptLibrary)="promptLibrary.emit()" />
  `,
  styleUrl: './global-chat-container.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-global-chat-container' },
})
export class AmplifyChatGlobalChatContainer {
  /** The recruiter's first name. Default "Chloe". */
  readonly name = input<string>();
  /** Replaces the whole headline. */
  readonly greeting = input<string>();
  readonly size = input<AmplifyChatInputSize | undefined>('full page');
  /** Optional context records (e.g. the current record). Empty hides the row. */
  readonly context = input<AmplifyChatContextItem[] | undefined>([]);
  readonly placeholder = input<string>();
  /** A reply is generating: shows Stop in the input and keeps Send disabled. */
  readonly generating = input<boolean | undefined, unknown>(false, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });

  readonly send = output<string>();
  /** Emits when Stop is activated in the input. */
  readonly stop = output<void>();
  readonly removed = output<string>();
  readonly add = output<void>();
  readonly addFile = output<void>();
  readonly addTools = output<void>();
  readonly promptLibrary = output<void>();

  protected readonly headline = computed(() => this.greeting() ?? `Hi ${this.name() ?? 'Chloe'}, how can I help you today?`);
}
