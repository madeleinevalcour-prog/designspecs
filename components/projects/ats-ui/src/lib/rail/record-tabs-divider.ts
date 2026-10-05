import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { RailController } from './rail-controller';

/**
 * RecordTabsDivider (Figma: "record-tabs-divider") — separates the main tabs from
 * the entity tabs. Hovering it while the rail is expanded reveals "Clear All",
 * which clears the open record tabs.
 */
@Component({
  selector: 'ats-record-tabs-divider',
  imports: [Icon],
  template: `
    <span class="ats-rail-divider__line"></span>
    <button class="ats-rail-divider__clear" type="button" (click)="clear()">
      <span>Clear All</span>
      <ats-icon name="close" [size]="12" color="var(--color-icon-subtle)" />
    </button>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-rail-divider',
    '[class.is-hovering]': 'hovering()',
    '(mouseenter)': 'hovering.set(ctrl.nav() !== "collapsed")',
    '(mouseleave)': 'hovering.set(false)',
    '(focusin)': 'hovering.set(ctrl.nav() !== "collapsed")',
    '(focusout)': 'hovering.set(false)',
  },
})
export class RecordTabsDivider {
  protected readonly ctrl = inject(RailController);
  protected readonly hovering = signal(false);
  readonly cleared = output<void>();

  protected clear() {
    this.ctrl.clearTabs();
    this.cleared.emit();
  }
}
