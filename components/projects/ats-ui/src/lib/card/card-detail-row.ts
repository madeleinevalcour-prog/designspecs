import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

export type CardDetailRowKind = 'text' | 'multi' | 'select' | 'link';

/**
 * CardDetailRow — a value-with-label row for the card "details" body: uppercase
 * label on the left, value on the right, hairline between rows. Port of the
 * prototype repo's `card/CardDetailRow.astro`.
 *
 *   <ats-card-detail-row label="Location" value="Boston, MA" />
 *   <ats-card-detail-row label="Skills" kind="multi" [values]="['React', 'SQL']" />
 *   <ats-card-detail-row label="Employee Type" kind="select" value="W2" />
 *   <ats-card-detail-row label="Owner" kind="link" value="Chloe Davis" dot="var(--color-entity-candidate)" href="/owner/1" />
 *
 * `kind`: text (default) · multi (stacked values) · select (value + chevron) ·
 * link (link-colored, optional leading dot).
 */
@Component({
  selector: 'ats-card-detail-row',
  imports: [Icon],
  template: `
    <span class="ats-card-detail-row__label">{{ label() }}</span>
    @switch (resolvedKind()) {
      @case ('multi') {
        <span class="ats-card-detail-row__value ats-card-detail-row__value--multi">
          @for (v of multiValues(); track $index) { <span>{{ v }}</span> }
        </span>
      }
      @case ('select') {
        <span class="ats-card-detail-row__value ats-card-detail-row__value--select">{{ value() }}<ats-icon name="chevron-down" [size]="12" color="var(--color-icon-subtle)" /></span>
      }
      @case ('link') {
        <span class="ats-card-detail-row__value ats-card-detail-row__value--link">
          @if (dot(); as d) { <span class="ats-card-detail-row__dot" [style.--dot]="d"></span> }
          <a [attr.href]="href() ?? '#'">{{ value() }}</a>
        </span>
      }
      @default {
        <span class="ats-card-detail-row__value">{{ value() }}</span>
      }
    }
  `,
  styleUrl: './card-detail-row.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-card-detail-row',
    '[class.ats-card-detail-row--multi]': "resolvedKind() === 'multi'",
  },
})
export class CardDetailRow {
  readonly label = input.required<string>();
  readonly value = input<string>();
  /** Values for kind="multi" (falls back to `value`). */
  readonly values = input<string[]>();
  readonly kind = input<CardDetailRowKind>();
  /** Leading dot color for kind="link" (any CSS color or var()). */
  readonly dot = input<string>();
  readonly href = input<string>();

  protected readonly resolvedKind = computed<CardDetailRowKind>(() => this.kind() ?? 'text');
  protected readonly multiValues = computed(() => this.values() ?? [this.value() ?? '']);
}
