import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, computed, inject, input, output, signal, viewChild,
} from '@angular/core';
import { Button } from '../../button/button';

/**
 * AmplifyChatDraftBlock (Figma: "amplify-chat/draft-block", 6149:20803). Text the
 * recruiter edits before using it: an email, note or job description. A
 * color/background/default container (1px card/color/border/default, radius
 * border/radius/xsm) with three sections split by card/color/border/default dividers:
 *  1. subject: "Subject:" in body/sm-medium color/text/secondary, then the subject in
 *     body/default. Shown when `subject` is set (Figma `Show subject`).
 *  2. body: the draft in body/default color/text/body. Pass `draft` (a plain string;
 *     each line is a paragraph, blank lines kept, as in Figma) or project your own
 *     `<p>`s.
 *  3. actions: existing Buttons, Copy and Edit (Secondary, Small) and Use draft
 *     (Primary, Small). Hide with `[showActions]="false"` for read-only drafts.
 * Copy is live: it writes the body text (not the subject) to the clipboard
 * and emits `copied`. Edit and Use draft only emit: Amplify never sends a draft
 * without the recruiter choosing an action.
 *
 *   <ats-amplify-chat-draft-block subject="Draft email" [draft]="emailText"
 *     (edit)="openEditor()" (useDraft)="insertIntoEmail($event)" />
 *   <ats-amplify-chat-draft-block [showActions]="false"><p>Called Jordan, left a voicemail.</p></ats-amplify-chat-draft-block>
 */
@Component({
  selector: 'ats-amplify-chat-draft-block',
  imports: [Button],
  template: `
    @if (subject()) {
      <div class="ats-amplify-chat-draft-block__subject">
        <span class="ats-amplify-chat-draft-block__subject-label">Subject:</span>
        <span class="ats-amplify-chat-draft-block__subject-value">{{ subject() }}</span>
      </div>
    }
    <div class="ats-amplify-chat-draft-block__body" #body>
      @for (line of lines(); track $index) {
        <p>{{ line || '​' }}</p>
      }
      <ng-content />
    </div>
    @if (showActions() ?? true) {
      <div class="ats-amplify-chat-draft-block__actions">
        <button ats-button theme="secondary" size="small" [iconLeft]="isCopied() ? 'check' : 'copy'" (click)="copy()">{{ isCopied() ? 'Copied' : 'Copy' }}</button>
        <button ats-button theme="secondary" size="small" iconLeft="edit" (click)="edit.emit()">Edit</button>
        <button ats-button theme="primary" size="small" (click)="useDraft.emit(text())">Use draft</button>
      </div>
    }
    <span class="ats-amplify-chat-draft-block__status" aria-live="polite">{{ isCopied() ? 'Draft copied' : '' }}</span>
  `,
  styleUrl: './draft-block.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-amplify-chat-draft-block', role: 'group', '[attr.aria-label]': 'subject() || "Draft"' },
})
export class AmplifyChatDraftBlock {
  /** Subject line (Figma `Show subject`); omit for drafts with no subject, such as notes. */
  readonly subject = input<string>();
  /** The draft as plain text; each line is a paragraph. Or project the body instead. */
  readonly draft = input<string>();
  /** Figma `Show actions` (default on). Off for read-only drafts. */
  readonly showActions = input<boolean | undefined>();

  /** Emits the copied body text after a successful copy. */
  readonly copied = output<string>();
  /** The recruiter chose Edit. */
  readonly edit = output<void>();
  /** The recruiter chose Use draft; emits the body text. */
  readonly useDraft = output<string>();

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');
  protected readonly lines = computed(() => (this.draft() ? this.draft()!.split('\n') : []));
  protected readonly isCopied = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** The body as plain text: `draft` when given, else the projected text. */
  protected text(): string {
    return this.draft() ?? this.body().nativeElement.innerText.trim();
  }

  protected async copy(): Promise<void> {
    const text = this.text();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // clipboard blocked (permissions / insecure context)
    }
    this.copied.emit(text);
    this.isCopied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.isCopied.set(false), 1500);
  }
}
