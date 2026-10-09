import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model, output } from '@angular/core';
import { Checkbox } from '../../checkbox/checkbox';
import { ItemAvatar, ItemComment, ItemField, ItemHeader, LinkText, NovoListEntity, NovoListField } from '../../novo-list/parts';
import { amplifyChatInitials } from '../data-table/models';

/** Figma chat-list-item `theme`. */
export type AmplifyChatListItemTheme = 'entity-record' | 'prospect-contact';

/**
 * AmplifyChatChatListItem (Figma: "amplify-chat/chat-list-item", 6171:162369). One record
 * card in a chat card stack (amplify-chat/chat-cards), built on the Modern UI list-item:
 * a selection checkbox, then the list-item (header + content slot), in a card (card border,
 * 8px radius, 0 2 4 charcoal-04 shadow).
 *  - theme `entity-record` (default; 6223:173284): any ATS record (candidate, job, company…):
 *    an item-header (entity icon-container + title), then the item comment (fields + summary).
 *    The content slot holds a chip group (e.g. skills). `entity` sets the icon (default candidate).
 *  - theme `prospect-contact` (6223:172861): a contact found by Prospect: 40px initials avatar
 *    (or photo), the name as a link-text with the contact circle (neutral grey when not in the
 *    ATS), then the job title + item fields (email). The content slot holds
 *    <ats-amplify-chat-relevance-signals>.
 * Selection is two-way (`[(selected)]`); the checkbox lines up with the header (4px down for
 * the entity-record's 24px header, 12px for the prospect-contact's 40px avatar).
 *
 *   <ats-amplify-chat-chat-list-item theme="prospect-contact" name="Marie Smith" jobTitle="Head of HR"
 *       [fields]="[{ type: 'email', text: 'marie.smith@nexusdynamics.com' }]" [(selected)]="sel">
 *     <ats-amplify-chat-relevance-signals [signals]="['Director-level', 'Previously contacted']" />
 *   </ats-amplify-chat-chat-list-item>
 *
 *   <ats-amplify-chat-chat-list-item theme="entity-record" name="2034 | Tyler Brooks" [fields]="fields" body="Senior Software Engineer…">
 *     <div class="chips"><ats-novo-chip label="JavaScript" /> …</div>
 *   </ats-amplify-chat-chat-list-item>
 */
@Component({
  selector: 'ats-amplify-chat-chat-list-item',
  imports: [Checkbox, ItemAvatar, ItemComment, ItemField, ItemHeader, LinkText],
  template: `
    @if (isSelectable()) {
      <span class="ats-amplify-chat-chat-list-item__check">
        <input ats-checkbox [attr.aria-label]="'Select ' + name()" [checked]="selected()" [disabled]="disabled()"
          (change)="selected.set($any($event.target).checked)" />
      </span>
    }
    <div class="ats-amplify-chat-chat-list-item__list-item">
      @if (themeName() === 'prospect-contact') {
        <div class="ats-amplify-chat-chat-list-item__header-section">
          @if (avatarUrl(); as src) {
            <img class="ats-amplify-chat-chat-list-item__avatar" [src]="src" alt="" />
          } @else {
            <span class="ats-amplify-chat-chat-list-item__avatar ats-amplify-chat-chat-list-item__avatar--initials" aria-hidden="true">{{ initials() }}</span>
          }
          <div class="ats-amplify-chat-chat-list-item__details">
            <button type="button" class="ats-amplify-chat-chat-list-item__name" (click)="open.emit()">
              <ats-link-text [text]="name()" [circle]="circle()" />
            </button>
            <div class="ats-amplify-chat-chat-list-item__data">
              @if (jobTitle()) { <span class="ats-amplify-chat-chat-list-item__job-title">{{ jobTitle() }}</span> }
              @for (f of fieldList(); track $index) { <ats-item-field [type]="f.type" [icon]="f.icon" [text]="f.text" /> }
            </div>
          </div>
        </div>
      } @else {
        <ats-item-header [title]="name()"><ats-item-avatar avatar option="entity" [entity]="entity()" /></ats-item-header>
      }
      <div class="ats-amplify-chat-chat-list-item__content">
        @if (themeName() === 'entity-record' && (fieldList().length || body())) {
          <ats-item-comment [fields]="fieldList()" [body]="body()" />
        }
        <div class="ats-amplify-chat-chat-list-item__slot"><ng-content /></div>
      </div>
    </div>
  `,
  styleUrl: './chat-list-item.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-chat-list-item',
    '[attr.data-theme]': 'themeName()',
    '[class.is-selected]': 'selected()',
  },
})
export class AmplifyChatChatListItem {
  readonly theme = input<AmplifyChatListItemTheme | undefined>('entity-record');
  /** Selection (two-way). */
  readonly selected = model(false);
  /** Checkbox. Default true; off when the reply offers no bulk action. */
  readonly selectable = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Locks the checkbox, e.g. once the record has been added to Bullhorn. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** prospect-contact: the name link ("Marie Smith"). entity-record: the header title ("2034 | Tyler Brooks"). */
  readonly name = input<string>('');
  /** prospect-contact: photo URL; without one the avatar shows the name's initials. */
  readonly avatarUrl = input<string>();
  /** prospect-contact: job title, first in the data row ("Head of HR"). */
  readonly jobTitle = input<string>();
  /** prospect-contact: fields after the job title. entity-record: the comment's data row. */
  readonly fields = input<NovoListField[] | undefined>([]);
  /** entity-record: summary paragraph. */
  readonly body = input<string>();
  /** entity-record: the header icon-container entity. Default candidate. */
  readonly entity = input<NovoListEntity | undefined>('candidate');

  /** prospect-contact: already saved as a Contact in the ATS (contact circle) or not (neutral grey). Default true. */
  readonly inBullhorn = input<boolean | undefined>(true);

  /** prospect-contact: the name link was clicked (open the record). */
  readonly open = output<void>();

  // Same rule as the data table: contact color once saved as a Contact, neutral grey otherwise.
  protected readonly circle = computed(() => (this.inBullhorn() ?? true) ? 'var(--color-entity-contact)' : 'var(--color-entity-task)');
  protected readonly themeName = computed(() => this.theme() ?? 'entity-record');
  protected readonly isSelectable = computed(() => this.selectable() ?? true);
  protected readonly fieldList = computed(() => this.fields() ?? []);
  protected readonly initials = computed(() => amplifyChatInitials(this.name()));
}
