import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * Tooltip (Figma: "tooltip", size=Small, position=bottom-right) — the arrow points up
 * at the anchor, the box sits below it. Presentational: position it yourself, or let
 * `<ats-rail-shell>` render it for the entity-tab pin buttons.
 *
 *   <ats-tooltip text="Pin" />
 */
@Component({
  selector: 'ats-tooltip',
  template: `<span class="ats-tooltip__arrow"></span><div class="ats-tooltip__box">{{ text() }}</div>`,
  styleUrl: './tooltip.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'ats-tooltip', role: 'tooltip' },
})
export class Tooltip {
  readonly text = input.required<string>();
}
