import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, numberAttribute } from '@angular/core';
import { ValueWithLabel } from './value-with-label';

export interface RecordDetailsField {
  label: string;
  value: string;
  /** Use the input/value/default text style (dates, yes/no). */
  plain?: boolean;
  /** Trailing icon name from the icon set. */
  icon?: string;
}

/**
 * RecordDetailsList (Figma: record-details-list, Component Migration 576:6589) — a
 * multi-column grid of ValueWithLabel blocks. Use as a "columns" details body.
 * Port of the prototype repo's `card/RecordDetailsList.astro`.
 *
 *   <ats-card variant="details" title="Record Details">
 *     <div class="ats-card__pad"><ats-record-details-list [fields]="fields" [columns]="3" /></div>
 *   </ats-card>
 */
@Component({
  selector: 'ats-record-details-list',
  imports: [ValueWithLabel],
  template: `
    @for (f of fields(); track $index) {
      <ats-value-with-label [label]="f.label" [value]="f.value" [plain]="!!f.plain" [icon]="f.icon" />
    }
  `,
  styleUrl: './record-details-list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-record-details-list',
    '[style.--rdl-cols]': 'cols()',
  },
})
export class RecordDetailsList {
  readonly fields = input.required<RecordDetailsField[]>();
  /** Grid columns (default 3). */
  readonly columns = input(undefined, { transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)) });

  protected readonly cols = computed(() => this.columns() ?? 3);
}
