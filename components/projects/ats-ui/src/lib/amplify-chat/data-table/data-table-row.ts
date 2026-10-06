import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, model, output } from '@angular/core';
import { Checkbox } from '../../checkbox/checkbox';
import { Icon } from '../../icon/icon';
import { NovoDataTableCell } from '../../novo-data-table/novo-data-table-cell';
import { AMPLIFY_CHAT_PROSPECT_COLUMNS, AmplifyChatProspect, AmplifyChatProspectColumn, AmplifyChatRevealField, amplifyChatInitials } from './models';

/** Figma row hover is live; `state` forces it for docs. */
export type AmplifyChatDataTableRowState = 'hover';

/**
 * AmplifyChatDataTableRow (Figma: "novo-data-table-row-chat", 6174:165788).
 * One prospect row of a chat data table, built from novo-data-table cells:
 *  - checkbox cell (row selection, two-way `selected`)
 *  - preview cell: binoculars button that opens the record slideout (`preview`)
 *  - name: 24px avatar (photo, else initials) + the record-name link (`open`)
 *  - in Bullhorn?: 10px circle + "Existing Contact" (color/entity/contact) or
 *    "Not in Bullhorn" (color/entity/task); text, not color alone
 *  - job title, mobile phone, email: plain values. A missing phone / email shows an
 *    Amplify "Reveal …" link when the prospect isn't in Bullhorn (`reveal`), else
 *    "Not on file" in color/text/disabled.
 * Figma's two variants ("prospect - existing content", "prospect - not in BH") are data
 * examples: both come from one `record` (see AmplifyChatProspect.inBullhorn).
 *
 * Applied to a native <tr> inside the table's <tbody>:
 *
 *   <tr ats-amplify-chat-data-table-row [record]="p" [(selected)]="sel[p.id]"
 *       (open)="openRecord($event)" (preview)="slideout($event)" (reveal)="reveal($event)"></tr>
 *   <tr ats-amplify-chat-data-table-row [record]="p" [selectable]="false"
 *       [columns]="['name', 'inBullhorn', 'title', 'email']"></tr>
 */
@Component({
  selector: 'tr[ats-amplify-chat-data-table-row]',
  imports: [Checkbox, Icon, NovoDataTableCell],
  template: `
    @if (isSelectable()) {
      <td class="ats-ndt-td ats-ndt-td--check">
        <div class="ats-ndt-cell ats-ndt-cell--check">
          <input
            ats-checkbox
            [attr.aria-label]="'Select ' + record().name"
            [checked]="selected()"
            [disabled]="disabled()"
            (change)="selected.set($any($event.target).checked)"
          />
        </div>
      </td>
    }
    @if (hasPreview()) {
      <td class="ats-ndt-td ats-ndt-td--icon">
        <div class="ats-ndt-cell ats-ndt-cell--icon">
          <button type="button" class="ats-amplify-chat-data-table-row__preview" [attr.aria-label]="'Preview ' + record().name" (click)="preview.emit(record())">
            <ats-icon class="ats-ndt-preview" name="preview" [size]="16" />
          </button>
        </div>
      </td>
    }
    @for (col of cols(); track col) {
      @switch (col) {
        @case ('name') {
          <td ats-novo-data-table-cell class="ats-amplify-chat-data-table-row__name">
            @if (record().avatarUrl; as src) {
              <img class="ats-amplify-chat-data-table-row__avatar" [src]="src" alt="" />
            } @else {
              <span class="ats-amplify-chat-data-table-row__avatar ats-amplify-chat-data-table-row__avatar--initials" aria-hidden="true">{{ initials() }}</span>
            }
            <button type="button" class="ats-amplify-chat-data-table-row__link" (click)="open.emit(record())">{{ record().name }}</button>
          </td>
        }
        @case ('inBullhorn') {
          <td ats-novo-data-table-cell>
            <span class="ats-amplify-chat-data-table-row__status" [attr.data-in-bullhorn]="record().inBullhorn">
              <ats-icon name="circle" [size]="10" [color]="record().inBullhorn ? existingColor : notInBhColor" />
              {{ record().inBullhorn ? 'Existing Contact' : 'Not in Bullhorn' }}
            </span>
          </td>
        }
        @case ('title') {
          @if (record().title) {
            <td ats-novo-data-table-cell [value]="record().title"></td>
          } @else {
            <td ats-novo-data-table-cell><span class="ats-ndt-cell__text ats-amplify-chat-data-table-row__empty">Not on file</span></td>
          }
        }
        @default {
          @if (fieldValue(col)) {
            <td ats-novo-data-table-cell [value]="fieldValue(col)"></td>
          } @else if (!record().inBullhorn) {
            <td ats-novo-data-table-cell>
              <button type="button" class="ats-amplify-chat-data-table-row__reveal" (click)="reveal.emit({ record: record(), field: $any(col) })">
                <ats-icon class="ats-amplify-chat-data-table-row__sparkle" name="amplify" [size]="10" />
                {{ col === 'email' ? 'Reveal Email' : 'Reveal Phone Number' }}
              </button>
            </td>
          } @else {
            <td ats-novo-data-table-cell><span class="ats-ndt-cell__text ats-amplify-chat-data-table-row__empty">Not on file</span></td>
          }
        }
      }
    }
  `,
  styleUrl: './data-table.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-amplify-chat-data-table-row ats-ndt-row',
    '[class.is-selected]': 'selected()',
    '[class.is-hover]': "state() === 'hover'",
  },
})
export class AmplifyChatDataTableRow {
  readonly record = input.required<AmplifyChatProspect>();
  /** Row selection (two-way). */
  readonly selected = model(false);
  /** Locks the checkbox, e.g. once the record has been added to Bullhorn. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Columns to show, in order. Default: all five Figma columns. */
  readonly columns = input<AmplifyChatProspectColumn[]>();
  /** Checkbox column. Default true; off when the reply offers no bulk action. */
  readonly selectable = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Preview (binoculars) column. Default true. */
  readonly showPreview = input<boolean | undefined, unknown>(true, { transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)) });
  /** Forces the row hover background, for docs. */
  readonly state = input<AmplifyChatDataTableRowState>();

  /** The record-name link was clicked: open the record's full page. */
  readonly open = output<AmplifyChatProspect>();
  /** The binoculars were clicked: open the record slideout beside the chat. */
  readonly preview = output<AmplifyChatProspect>();
  /** A "Reveal …" link was clicked (prospect not in Bullhorn, value unknown). */
  readonly reveal = output<{ record: AmplifyChatProspect; field: AmplifyChatRevealField }>();

  protected readonly existingColor = 'var(--amplify-chat-data-table-row-novo-data-table-cell-link-text-circle-vector-color-content-icon-color-entity-contact)';
  protected readonly notInBhColor = 'var(--amplify-chat-data-table-row-novo-data-table-cell-link-text-circle-vector-color-content-icon-color-entity-task)';

  protected readonly cols = computed(() => this.columns() ?? AMPLIFY_CHAT_PROSPECT_COLUMNS);
  protected readonly isSelectable = computed(() => this.selectable() ?? true);
  protected readonly hasPreview = computed(() => this.showPreview() ?? true);
  protected readonly initials = computed(() => amplifyChatInitials(this.record().name));

  protected fieldValue(col: AmplifyChatProspectColumn): string | null | undefined {
    const r = this.record();
    return col === 'mobilePhone' ? r.mobilePhone : col === 'email' ? r.email : undefined;
  }
}
