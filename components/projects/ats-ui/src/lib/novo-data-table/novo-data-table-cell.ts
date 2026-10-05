import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, input, numberAttribute } from '@angular/core';

/**
 * NovoDataTableCell (Figma: "novo-data-table-cell", Component Migration 254:487).
 * A body cell: one line of value text, or the hyperlink style with `link`.
 * Port of the prototype repo's NovoDataTableCell.astro.
 *
 * Applied to a native <td> so table semantics stay intact:
 *
 *   <td ats-novo-data-table-cell value="District Security Director"></td>
 *   <td ats-novo-data-table-cell value="name@email.com" link [width]="240"></td>
 *   <td ats-novo-data-table-cell><my-status-chip /></td>   (projected content)
 *
 * `width` (px) fixes the column width; otherwise the cell is at least 128px wide
 * (data-table/spacing/min-width) and grows to fit. Styles live in novo-data-table.css.
 */
@Component({
  selector: 'td[ats-novo-data-table-cell]',
  template: `
    <div class="ats-ndt-cell" [style.width.px]="width()">
      @if (value() != null) {
        <span class="ats-ndt-cell__text" [class.ats-ndt-cell__text--link]="link()">{{ value() }}</span>
      }
      <ng-content />
    </div>
  `,
  styleUrl: './novo-data-table.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-ndt-td' },
})
export class NovoDataTableCell {
  /** The text to show. Leave unset to project custom content instead. */
  readonly value = input<string | number | null>();
  /** Render the value in the hyperlink style. */
  readonly link = input(false, { transform: booleanAttribute });
  /** Fixed column width in px. */
  readonly width = input<number | undefined, unknown>(undefined, {
    transform: (v: unknown) => (v == null || v === '' ? undefined : numberAttribute(v)),
  });
}
