import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewEncapsulation, computed, effect, inject, input, output, signal, viewChild,
} from '@angular/core';
import { Button } from '../../button/button';
import { AmplifyChatSelectionAction, AmplifyChatSelectionSplitButton } from '../selection/selection-split-button';

/** What the draft is for. Sets the split button's default action and menu. */
export type AmplifyChatDraftBlockType = 'email' | 'note' | 'job';

/** The draft as edited: subject (when there is one) and body text. */
export interface AmplifyChatDraftBlockContent {
  subject?: string;
  text: string;
}

/** A split-button menu action chosen on a draft, with the draft as edited. */
export interface AmplifyChatDraftBlockAction extends AmplifyChatDraftBlockContent {
  action: AmplifyChatSelectionAction;
}

/** Default split-button action and menu per draft type. */
export const AMPLIFY_CHAT_DRAFT_BLOCK_PRESETS: Record<AmplifyChatDraftBlockType, { primary: string; actions: AmplifyChatSelectionAction[] }> = {
  email: {
    primary: 'Compose Message',
    actions: [{ id: 'send-outlook', label: 'Send with Outlook' }, { id: 'add-note', label: 'Add as Note' }],
  },
  note: { primary: 'Add Note', actions: [{ id: 'copy-to-task', label: 'Copy to Task' }] },
  job: { primary: 'Update Job Description', actions: [{ id: 'add-note', label: 'Add Note' }] },
};

/**
 * AmplifyChatDraftBlock (Figma: "amplify-chat/draft-block", 6149:20803). Text the
 * recruiter edits before using it: an email, a note or a job description. A
 * color/background/default container (1px card/color/border/default, radius
 * border/radius/xsm) with three sections split by card/color/border/default dividers:
 *  1. subject: "Subject:" in body/sm-medium color/text/secondary, then the subject in
 *     body/default, editable in place (one line). Shown when `subject` is set (Figma
 *     `Show subject`).
 *  2. body: the draft in body/default color/text/body, editable in place from the start
 *     (no Edit step). Pass `draft` (plain string; each line is a paragraph, blank lines
 *     kept, as in Figma) or project your own `<p>`s. Paste is plain text only.
 *  3. actions: Copy (Button, Secondary, Small) and a split button
 *     (amplify-chat/selection-split-button). The left segment runs the default action
 *     for the draft `type` (email: "Compose Message"); the chevron opens related actions.
 *     Hide the row with `[showActions]="false"`, which also makes the draft read-only.
 * Copy is live: it writes the body text as edited (not the subject) and emits `copied`.
 * The split button only emits, with the subject and body as edited: Amplify never sends or
 * saves a draft without the recruiter choosing an action. "Send with Outlook" hands off to
 * Outlook, where the recruiter confirms the send.
 *
 *   <ats-amplify-chat-draft-block type="email" subject="Draft email" [draft]="emailText"
 *     (primary)="composeMessage($event.subject, $event.text)" (action)="run($event)" />
 *   <ats-amplify-chat-draft-block type="note" [draft]="noteText" (primary)="addNote($event.text)" />
 */
@Component({
  selector: 'ats-amplify-chat-draft-block',
  imports: [Button, AmplifyChatSelectionSplitButton],
  template: `
    @if (subject()) {
      <div class="ats-amplify-chat-draft-block__subject">
        <span class="ats-amplify-chat-draft-block__subject-label">Subject:</span>
        <span class="ats-amplify-chat-draft-block__subject-value" #subjectField
          [attr.contenteditable]="editable() ? 'true' : null"
          [attr.role]="editable() ? 'textbox' : null"
          [attr.aria-label]="editable() ? 'Subject' : null"
          (keydown.enter)="$event.preventDefault()"
          (paste)="pastePlain($event, true)"></span>
      </div>
    }
    <div class="ats-amplify-chat-draft-block__body" #body
      [attr.contenteditable]="editable() ? 'true' : null"
      [attr.role]="editable() ? 'textbox' : null"
      [attr.aria-multiline]="editable() ? 'true' : null"
      [attr.aria-label]="editable() ? bodyLabel() : null"
      (paste)="pastePlain($event, false)"><ng-content /></div>
    @if (editable()) {
      <div class="ats-amplify-chat-draft-block__actions">
        <button ats-button theme="secondary" size="small" [iconLeft]="isCopied() ? 'check' : 'copy'" (click)="copy()">{{ isCopied() ? 'Copied' : 'Copy' }}</button>
        <ats-amplify-chat-selection-split-button [count]="1" [label]="primaryText()" [actions]="actionList()"
          [menuLabel]="'More actions for ' + (subject() || 'this draft')"
          (primary)="primary.emit(content())" (action)="action.emit({ action: $event, ...content() })" />
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
  /** What the draft is for; sets the default action and menu. Default "email". */
  readonly type = input<AmplifyChatDraftBlockType>();
  /** Overrides the split button's default action label. */
  readonly primaryLabel = input<string>();
  /** Overrides the split button's menu actions. */
  readonly actions = input<AmplifyChatSelectionAction[]>();
  /** Figma `Show actions` (default on). Off for read-only drafts: no actions, nothing editable. */
  readonly showActions = input<boolean | undefined>();

  /** Emits the copied body text after a successful copy. */
  readonly copied = output<string>();
  /** The default action (left segment) was chosen; emits the subject and body as edited. */
  readonly primary = output<AmplifyChatDraftBlockContent>();
  /** A menu action was chosen; emits it with the subject and body as edited. */
  readonly action = output<AmplifyChatDraftBlockAction>();

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');
  private readonly subjectField = viewChild<ElementRef<HTMLElement>>('subjectField');
  private readonly preset = computed(() => AMPLIFY_CHAT_DRAFT_BLOCK_PRESETS[this.type() ?? 'email'] ?? AMPLIFY_CHAT_DRAFT_BLOCK_PRESETS.email);
  protected readonly primaryText = computed(() => this.primaryLabel() ?? this.preset().primary);
  protected readonly actionList = computed(() => this.actions() ?? this.preset().actions);
  protected readonly editable = computed(() => this.showActions() ?? true);
  protected readonly bodyLabel = computed(() => (this.subject() ? `Draft: ${this.subject()}` : 'Draft'));
  protected readonly isCopied = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    // The body is edited in place, so `draft` is written to the DOM directly (not through
    // a template loop Angular would fight the caret over). A new `draft` or `subject`
    // resets the edits to it.
    effect(() => {
      const draft = this.draft();
      const el = this.body().nativeElement;
      if (draft == null) return; // projected content
      el.replaceChildren(...draft.split('\n').map((line) => {
        const p = document.createElement('p');
        if (line) p.textContent = line; else p.appendChild(document.createElement('br'));
        return p;
      }));
    });
    effect(() => {
      const el = this.subjectField()?.nativeElement;
      if (el) el.textContent = this.subject() ?? '';
    });
  }

  /** The draft as edited: subject (when shown) and body text. */
  protected content(): AmplifyChatDraftBlockContent {
    const el = this.subjectField()?.nativeElement;
    return el ? { subject: (el.textContent ?? '').trim(), text: this.text() } : { text: this.text() };
  }

  /** The body as plain text, as edited: one line per paragraph. */
  protected text(): string {
    const el = this.body().nativeElement;
    const blocks = Array.from(el.children).filter((c) => c.tagName === 'P' || c.tagName === 'DIV');
    if (!blocks.length) return (el.textContent ?? '').trim();
    return blocks.map((b) => (b.textContent ?? '').replace(/​/g, '')).join('\n');
  }

  /** Paste as plain text so the draft keeps body/default styling; the subject stays one line. */
  protected pastePlain(e: ClipboardEvent, singleLine: boolean): void {
    if (!this.editable()) return;
    const text = e.clipboardData?.getData('text/plain');
    if (text == null) return;
    e.preventDefault();
    document.execCommand('insertText', false, singleLine ? text.replace(/\s*\n\s*/g, ' ') : text);
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
