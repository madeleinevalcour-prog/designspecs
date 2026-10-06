import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../../icon/icon';
import { ItemData, ItemField, LinkText, NovoListEntity, NovoListField } from '../../novo-list/parts';
import { AmplifyChatClarifyKey, AmplifyChatClarifyKeyState } from './clarify-key';

export type AmplifyChatClarifyOptionType = 'text' | 'record';
/** Figma clarify-option `state`. `active` (hover / keyboard focus) is also live; set it to force the look. */
export type AmplifyChatClarifyOptionState = 'default' | 'active' | 'selected';

// Figma binds the job entity color through the amplify-chat tokens; other entities use the semantic token.
const RECORD_JOB = 'var(--amplify-chat-clarify-option-record-item-header-link-text-circle-vector-color-content-icon-color-entity-job)';
const LINK_JOB = 'var(--amplify-chat-clarify-option-content-label-row-recommended-group-record-link-circle-vector-color-content-icon-color-entity-job)';
const entityColor = (e: NovoListEntity, job: string) => (e === 'job' ? job : `var(--color-entity-${e})`);

/**
 * AmplifyChatClarifyOption (Figma: "clarify-option", set 6335:28257). One answer row
 * in a clarifying question: a clarify-key (the 1–4 shortcut), then the content, in a
 * 1px color/border/subtle row (padding 8, gap 16). The key is centered on the first
 * line, so it stays beside the answer when the row grows.
 *  - type `text` (6335:28233 / 28241 / 28249): `label` (body/default), optional
 *    `recommended` note (input/label/field-label, subtle) with an optional
 *    `recordLink` entity link ("Recommended · from ● JO-4821"), optional `description`.
 *  - type `record` (6341:28605 / 28645 / 28685): the list-item content (6342:211711):
 *    `label` as a LinkText (size default) with the `entity` dot, `fields` as an
 *    ItemData row, and `recommended` as the header caption (top right).
 *  - state `default`; `active` = hover or keyboard focus (color/background/subtle,
 *    key active); `selected` = the answer already chosen (key selected + label
 *    Medium; never color alone). Hover / focus are live; `state` forces them.
 *
 * A native button with role="radio" (aria-checked = selected): put the options in a
 * `role="radiogroup"` labelled by the question; the parent handles ↑ ↓ and 1–4.
 * Extra projected content goes at the end of the content column.
 *
 *   <button ats-amplify-chat-clarify-option number="1" label="Within 25 mi of Boston" recommended="Recommended · from" recordLink="JO-4821"></button>
 *   <button ats-amplify-chat-clarify-option type="record" number="2" state="selected" label="425 | Software Engineer"
 *     [fields]="[{ type: 'company', text: 'Verizon' }, { type: 'date', text: 'May 23, 2024' }]"></button>
 */
@Component({
  selector: 'button[ats-amplify-chat-clarify-option]',
  imports: [Icon, LinkText, ItemData, ItemField, AmplifyChatClarifyKey],
  template: `
    <span class="ats-amplify-chat-clarify-option__key-slot">
      <ats-amplify-chat-clarify-key [number]="number() ?? '1'" [state]="keyState()" />
    </span>
    <span class="ats-amplify-chat-clarify-option__content">
      @if (typeName() === 'record') {
        <span class="ats-amplify-chat-clarify-option__record-header">
          <ats-link-text size="default" [text]="label() ?? 'Option'" [circle]="recordColor()" />
          @if (recommended()) { <ats-item-field type="caption" [text]="recommended()" /> }
        </span>
        @if (fieldList().length) { <ats-item-data [fields]="fieldList()" /> }
      } @else {
        <span class="ats-amplify-chat-clarify-option__label-row">
          <span class="ats-amplify-chat-clarify-option__label">{{ label() ?? 'Option' }}</span>
          @if (recommended()) {
            <span class="ats-amplify-chat-clarify-option__recommended">
              <span>{{ recommended() }}</span>
              @if (recordLink()) {
                <span class="ats-amplify-chat-clarify-option__record-link">
                  <ats-icon name="circle" [size]="10" [color]="linkColor()" />{{ recordLink() }}
                </span>
              }
            </span>
          }
        </span>
        @if (description()) { <span class="ats-amplify-chat-clarify-option__description">{{ description() }}</span> }
      }
      <ng-content />
    </span>
  `,
  styleUrl: './clarify-option.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-clarify-option',
    type: 'button',
    role: 'radio',
    '[attr.aria-checked]': "state() === 'selected'",
    '[attr.aria-keyshortcuts]': 'number() ?? null',
    '[attr.data-type]': 'typeName()',
    '[class.is-active]': "state() === 'active'",
    '[class.is-selected]': "state() === 'selected'",
  },
})
export class AmplifyChatClarifyOption {
  readonly type = input<AmplifyChatClarifyOptionType | undefined>('text');
  readonly state = input<AmplifyChatClarifyOptionState>();
  /** The key's shortcut number (1–4). */
  readonly number = input<string | number | undefined>('1');
  /** The answer (text) or the record title (record). */
  readonly label = input<string>();
  /** The "Recommended · …" note; omit to hide it. */
  readonly recommended = input<string>();
  /** text only: record shown as an entity link after the recommended note, e.g. "JO-4821". */
  readonly recordLink = input<string>();
  /** text only: entity of `recordLink` (dot color). Default job. */
  readonly recordLinkEntity = input<NovoListEntity | undefined>('job');
  /** text only: supporting line under the label. */
  readonly description = input<string>();
  /** record only: the record's entity (title dot color). Default job. */
  readonly entity = input<NovoListEntity | undefined>('job');
  /** record only: the details that tell the records apart (company, date, status…). */
  readonly fields = input<NovoListField[] | undefined>([]);

  protected readonly typeName = computed(() => this.type() ?? 'text');
  protected readonly fieldList = computed(() => this.fields() ?? []);
  protected readonly recordColor = computed(() => entityColor(this.entity() ?? 'job', RECORD_JOB));
  protected readonly linkColor = computed(() => entityColor(this.recordLinkEntity() ?? 'job', LINK_JOB));
  // Hover / focus switch the key in CSS; only forced states are passed down.
  protected readonly keyState = computed<AmplifyChatClarifyKeyState | undefined>(() => {
    const s = this.state();
    return s === 'selected' || s === 'active' ? s : undefined;
  });
}
