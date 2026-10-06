import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { Button } from '../../button/button';
import { MenuOption } from '../../menu/menu-option';

/** One related action in the split button's menu. */
export interface AmplifyChatSelectionAction {
  /** Stable id, emitted with `action`. */
  id: string;
  /** Menu label, verb first, e.g. "Add to Outreach sequence". */
  label: string;
  /** Optional 16px glyph from the icon set. */
  icon?: string;
  /**
   * Higher-risk action: it opens an action preview before anything runs, and the menu
   * item says so ("Review before sending"). Low-risk actions run in one click, with undo.
   */
  preview?: boolean;
}

/** Forces a segment's visual state for docs. Real hover / focus work too. */
export type AmplifyChatSelectionSplitButtonState = 'hover' | 'focus' | 'active';

/**
 * AmplifyChatSelectionSplitButton (Figma: "amplify-chat/selection-split-button", 6271:183528).
 * The primary action of a selection bar under a chat data table or card stack: two primary
 * small Buttons 1px apart. The left segment runs the default action and names the verb and
 * the count ("Add 5 Contacts"); the chevron segment opens a menu of related actions.
 *
 *   <ats-amplify-chat-selection-split-button verb="Add" noun="Contact" [count]="selected().length"
 *       [actions]="[{ id: 'list', label: 'Add to list' }, { id: 'seq', label: 'Add to Outreach sequence', preview: true }]"
 *       (primary)="addContacts()" (action)="run($event)" />
 *
 * Behaviour (amplify-chat-interface-patterns.md, which takes precedence; then record-actions):
 *  - The label is verb + count + noun ("Add 5 Contacts", as Figma and the patterns doc) and
 *    follows the selection live. `label` overrides it entirely.
 *  - Zero selected: hidden. The selection bar it sits in is hidden too.
 *  - No check icon on the button: nothing has happened yet.
 *  - Menu items with `preview: true` say they open a review step first.
 *  - The action runs only on click; selecting never writes on its own.
 * Keyboard: the chevron is a menu button (aria-haspopup / aria-expanded). Enter, Space or
 * ArrowDown open the menu and focus the first item; ArrowUp / ArrowDown / Home / End move;
 * Escape or Tab closes it (Escape returns focus to the chevron). Clicking outside closes it.
 * `open` is two-way, so a showcase can show the menu open.
 */
@Component({
  selector: 'ats-amplify-chat-selection-split-button',
  imports: [Button, MenuOption],
  template: `
    <button ats-button theme="primary" size="small" class="ats-amplify-chat-selection-split-button__primary"
      [state]="state()" [disabled]="isEmpty()" (click)="primary.emit(countValue())">{{ text() }}</button>
    <button #trigger ats-button theme="primary" size="small" iconLeft="chevron-down"
      class="ats-amplify-chat-selection-split-button__toggle"
      [state]="state()" [disabled]="isEmpty() || !actionList().length"
      aria-haspopup="menu" [attr.aria-expanded]="open()" [attr.aria-controls]="menuId" [attr.aria-label]="toggleLabel()"
      (click)="toggle()" (keydown)="onTriggerKey($event)"></button>
    @if (open() && !isEmpty()) {
      <div class="ats-dropdown-card ats-amplify-chat-selection-split-button__menu" role="menu" [id]="menuId"
        [attr.aria-label]="toggleLabel()" (keydown)="onMenuKey($event)">
        @for (a of actionList(); track a.id) {
          <button #item ats-menu-option role="menuitem" tabindex="-1" [icon]="a.icon" (click)="choose(a)">
            {{ a.label }}@if (a.preview) {<span class="ats-amplify-chat-selection-split-button__hint"> · {{ previewHint() }}</span>}
          </button>
        }
      </div>
    }
  `,
  styleUrls: ['../../menu/dropdown-card.css', './selection-split-button.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-selection-split-button',
    role: 'group',
    '[hidden]': 'isEmpty()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class AmplifyChatSelectionSplitButton {
  private static nextId = 0;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Verb of the default action. Default "Add". */
  readonly verb = input<string>();
  /** Record noun, singular. Default "Contact". */
  readonly noun = input<string>();
  /** Plural noun. Default `noun` + "s". */
  readonly nounPlural = input<string>();
  /** Number of selected records. */
  readonly count = input<number | undefined, unknown>(0, { transform: (v: unknown) => (v == null || v === '' ? undefined : Number(v)) });
  /** Full label override (otherwise verb + count + noun). */
  readonly label = input<string>();
  /** Related actions for the menu (about 2–4). With none, the chevron is disabled. */
  readonly actions = input<AmplifyChatSelectionAction[] | undefined>([]);
  /** Menu hint for `preview` actions. Default "Review first". */
  readonly previewHint = input<string, string | undefined>('Review first', { transform: (v) => v ?? 'Review first' });
  /** Menu open (two-way). */
  readonly open = model(false);
  /** Forces both segments' visual state, for docs. */
  readonly state = input<AmplifyChatSelectionSplitButtonState>();

  /** The default action was clicked; emits the count. */
  readonly primary = output<number>();
  /** A menu action was chosen. */
  readonly action = output<AmplifyChatSelectionAction>();

  protected readonly menuId = `ats-amplify-chat-selection-menu-${AmplifyChatSelectionSplitButton.nextId++}`;
  private readonly trigger = viewChild.required('trigger', { read: ElementRef<HTMLButtonElement> });
  private readonly items = viewChildren('item', { read: ElementRef });
  private focusFirstOnOpen = false;

  protected readonly countValue = computed(() => Math.max(0, Math.floor(this.count() ?? 0)));
  protected readonly isEmpty = computed(() => this.countValue() === 0);
  protected readonly actionList = computed(() => this.actions() ?? []);
  private readonly verbText = computed(() => this.verb() ?? 'Add');
  private readonly singular = computed(() => this.noun() ?? 'Contact');
  private readonly plural = computed(() => this.nounPlural() ?? `${this.singular()}s`);

  protected readonly text = computed(() => {
    if (this.label()) return this.label()!;
    const n = this.countValue();
    return `${this.verbText()} ${n} ${n === 1 ? this.singular() : this.plural()}`;
  });
  protected readonly toggleLabel = computed(() => `More actions for ${this.countValue()} selected`);

  constructor() {
    // Move focus into the menu when it was opened from the keyboard.
    effect(() => {
      const items = this.items();
      if (this.open() && items.length && this.focusFirstOnOpen) {
        untracked(() => {
          this.focusFirstOnOpen = false;
          (items[0].nativeElement as HTMLElement).focus();
        });
      }
    });
  }

  protected toggle(): void {
    this.open.set(!this.open());
  }

  protected choose(a: AmplifyChatSelectionAction): void {
    this.open.set(false);
    this.action.emit(a);
    this.trigger().nativeElement.focus();
  }

  protected onTriggerKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.focusFirstOnOpen = true;
      if (this.open()) (this.items()[0]?.nativeElement as HTMLElement | undefined)?.focus();
      else this.open.set(true);
    } else if (e.key === 'Escape' && this.open()) {
      this.open.set(false);
    }
  }

  protected onMenuKey(e: KeyboardEvent): void {
    const els = this.items().map((r) => r.nativeElement as HTMLElement);
    const i = els.indexOf(document.activeElement as HTMLElement);
    const move = (n: number) => { e.preventDefault(); els[(n + els.length) % els.length]?.focus(); };
    switch (e.key) {
      case 'ArrowDown': move(i + 1); break;
      case 'ArrowUp': move(i - 1); break;
      case 'Home': move(0); break;
      case 'End': move(els.length - 1); break;
      case 'Escape': e.preventDefault(); this.open.set(false); this.trigger().nativeElement.focus(); break;
      case 'Tab': this.open.set(false); break;
    }
  }

  protected onDocumentClick(e: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.open.set(false);
  }
}
