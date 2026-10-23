import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, inject, input, linkedSignal, model, output } from '@angular/core';
import { Dropdown, DropdownTrigger } from '../../dropdown/dropdown';
import { DropdownOptgroup } from '../../dropdown/optgroup';
import { DropdownOption } from '../../dropdown/option';
import { Icon } from '../../icon/icon';
import { IconButtonNoContainer } from '../../icon-button-no-container/icon-button-no-container';
import { NovoChip } from '../../novo-chip/novo-chip';
import { ItemAvatar, ItemData, ItemField, NovoListEntity } from '../../novo-list/parts';

/** Kebab menu actions on a prompt card. */
export type AmplifyChatPromptCardAction = 'edit' | 'share' | 'delete';
/** Figma Prompt Card `Property 1` (forced for docs; hover and focus are also live). */
export type AmplifyChatPromptCardState = 'hover' | 'focus';

const ENTITY_LABEL: Record<NovoListEntity, string> = {
  candidate: 'Candidate', contact: 'Contact', company: 'Company', lead: 'Lead', opportunity: 'Opportunity',
  job: 'Job', submission: 'Submission', placement: 'Placement', note: 'Note', task: 'Task',
};

/**
 * AmplifyChatPromptCard (Figma: "Prompt Card", 6762:90134 — Default 6762:90133, hover 6762:90135,
 * focus 6788:23069). One saved prompt in the prompt library: a list-item card with
 *  - header row: the prompt's icon (14px item-avatar, chosen per prompt), the title (1 line,
 *    truncates), then the star and kebab (icon-button-no-container) grouped on the right;
 *  - item-data: the record type the prompt runs on (optional), then the tag icon + a chip group
 *    (one chip per tag);
 *  - the description (2 lines, then truncates).
 * The card hugs its content; in the library grid every row takes the tallest card's height and
 * the card fills its cell, content at the top.
 * The whole card is one action: the title is the button and its hit area covers the card
 * (stretched), so the star and kebab stay separate controls. Click or Enter → `send`.
 * Prompts are starting inputs for a chat, not running chats. A `scheduled` card is a suggestion
 * for a scheduled prompt (like a starter card), not one that's already scheduled: it shows the
 * clock-arrow icon and a Scheduled tag by default, and click or Enter → `schedule`, which should
 * take the recruiter through setting the schedule up.
 * Favorite is two-way (`[(favorite)]`): filled star in `color/icon/utility/positive`.
 * The kebab opens a menu (Dropdown) with Edit, Share and Delete → `action`.
 *
 *   <ats-amplify-chat-prompt-card icon="search-menu" title="Research Salary and Experience"
 *       [tags]="['Recruiting']" [(favorite)]="fav"
 *       description="Research market salary norms…" (send)="ask()" (action)="manage($event)" />
 *   <ats-amplify-chat-prompt-card scheduled title="Morning Review" [entity]="null"
 *       [tags]="['Recruiting', 'Scheduled', 'Productivity']" description="Set up a recurring morning review…"
 *       (schedule)="startScheduling()" />
 */
@Component({
  selector: 'ats-amplify-chat-prompt-card',
  imports: [Dropdown, DropdownTrigger, DropdownOptgroup, DropdownOption, Icon, IconButtonNoContainer, ItemAvatar, ItemData, ItemField, NovoChip],
  template: `
    <div class="ats-amplify-chat-prompt-card__list-item">
      <div class="ats-amplify-chat-prompt-card__header-row">
        <div class="ats-amplify-chat-prompt-card__header">
          <ats-item-avatar [icon]="iconName()" color="var(--list-color-content-icon)" />
          <button type="button" class="ats-amplify-chat-prompt-card__title" [title]="title()"
            [attr.aria-label]="isScheduled() ? title() + ', set up a scheduled prompt' : null" (click)="activate()">{{ title() }}</button>
        </div>
        <button ats-icon-button-no-container class="ats-amplify-chat-prompt-card__star" [icon]="isFavorite() ? '' : 'submission'"
          [attr.aria-pressed]="isFavorite()" [attr.aria-label]="isFavorite() ? 'Remove ' + title() + ' from favorites' : 'Add ' + title() + ' to favorites'"
          (click)="favorite.set(!isFavorite())">
          @if (isFavorite()) { <ats-icon name="placement" [size]="12" color="var(--color-icon-utility-positive)" /> }
        </button>
        <span class="ats-amplify-chat-prompt-card__menu">
          <button ats-icon-button-no-container icon="kebab-menu" [attr.aria-label]="'More actions for ' + title()" [atsDropdownTrigger]="dd"></button>
          <ats-dropdown #dd role="menu" placement="bottom-end" [(open)]="menuOpen" (chosen)="action.emit($any($event))">
            <ats-optgroup>
              <button ats-option value="edit">Edit</button>
              <button ats-option value="share">Share</button>
              <button ats-option value="delete" class="ats-amplify-chat-prompt-card__delete">Delete</button>
            </ats-optgroup>
          </ats-dropdown>
        </span>
      </div>
      <div class="ats-amplify-chat-prompt-card__content">
        <ats-item-data>
          @if (entityName(); as e) {
            <ats-item-field class="ats-amplify-chat-prompt-card__entity" [icon]="e" [text]="entityLabel()"
              [style.--ats-prompt-card-entity]="'var(--color-entity-' + e + ')'" />
          }
          @if (tagList().length) {
            <span class="ats-item-field ats-amplify-chat-prompt-card__tags">
              <ats-icon name="category-tags" [size]="12" />
              <span class="ats-amplify-chat-prompt-card__chips">
                @for (t of tagList(); track t) { <ats-novo-chip size="small" [label]="t" /> }
              </span>
            </span>
          }
        </ats-item-data>
        @if (description()) { <p class="ats-amplify-chat-prompt-card__description">{{ description() }}</p> }
      </div>
    </div>
  `,
  styleUrl: './prompt-card.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-prompt-card',
    '[attr.data-state]': 'state() ?? null',
    '[class.is-menu-open]': '!!menuOpen()',
  },
})
export class AmplifyChatPromptCard {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly title = input<string>('');
  /** Header icon, a name from the icon set. Chosen per prompt (or by Amplify when generated).
   *  Default search-menu, or clock-arrow for a scheduled suggestion. */
  readonly icon = input<string | undefined>();
  /** The record type the prompt runs on. Unset → candidate; `null` → none (the field is hidden). */
  readonly entity = input<NovoListEntity | null | undefined>('candidate');
  /** A suggestion for a scheduled prompt: clock-arrow icon, Scheduled tag, and click → `schedule`. */
  readonly scheduled = input(false, { transform: booleanAttribute });
  /** Category tags, one chip each. A scheduled suggestion always includes Scheduled. */
  readonly tags = input<string[] | undefined>([]);
  readonly description = input<string>();
  /** Favorited (two-way). */
  readonly favorite = model<boolean | undefined>(false);
  /** Forces a visual state for docs. */
  readonly state = input<AmplifyChatPromptCardState | undefined>();
  /** Docs: show the kebab menu open. */
  readonly menu = input(false, { transform: booleanAttribute });

  /** The card was clicked, or Enter on the focused card: send the prompt to chat. */
  readonly send = output<void>();
  /** A scheduled suggestion was clicked: start setting up the scheduled prompt. */
  readonly schedule = output<void>();
  /** A kebab menu action. */
  readonly action = output<AmplifyChatPromptCardAction>();

  /** Kebab menu open (two-way with the Dropdown); starts from `menu` for docs. */
  protected readonly menuOpen = linkedSignal<boolean | undefined>(() => this.menu());
  protected readonly isScheduled = computed(() => this.scheduled());
  protected readonly iconName = computed(() => this.icon() || (this.isScheduled() ? 'clock-arrow' : 'search-menu'));
  protected readonly entityName = computed(() => (this.entity() === null ? null : (this.entity() ?? 'candidate')));
  protected readonly entityLabel = computed(() => { const e = this.entityName(); return e ? ENTITY_LABEL[e] : ''; });
  protected readonly tagList = computed(() => {
    const t = this.tags() ?? [];
    return this.isScheduled() && !t.includes('Scheduled') ? [...t, 'Scheduled'] : t;
  });

  protected activate(): void {
    if (this.isScheduled()) this.schedule.emit(); else this.send.emit();
  }
  protected readonly isFavorite = computed(() => !!this.favorite());

  /** Whether an element is inside this card. */
  contains(el: Element | null): boolean {
    return !!el && this.host.nativeElement.contains(el);
  }

  /** Moves focus to the card (its send button). Used by the library's arrow-key navigation. */
  focus(): void {
    this.host.nativeElement.querySelector<HTMLButtonElement>('.ats-amplify-chat-prompt-card__title')?.focus();
  }
}
