import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { Icon } from '../icon/icon';
import { EntityTabs } from './entity-tabs';
import { MainTabs } from './main-tabs';
import { RailController } from './rail-controller';
import { RecordTabsDivider } from './record-tabs-divider';

/**
 * Rail (Figma: "Bowling Alley") — the main-navigation rail: logo + collapse toggle,
 * MainTabs, RecordTabsDivider, EntityTabs, and the foot (Parse Resume, Help,
 * Privacy, user). Collapsed / hover / open states and the three hover options are
 * styled from the shell's data-* attributes. Must sit inside `<ats-rail-shell>`.
 *
 *   <ats-rail-shell>
 *     <ats-rail userName="Chloe Davis" userInitials="CD" />
 *     …page content…
 *   </ats-rail-shell>
 */
@Component({
  selector: 'ats-rail',
  imports: [Icon, MainTabs, RecordTabsDivider, EntityTabs],
  templateUrl: './rail.html',
  styleUrl: './rail.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-rail',
    role: 'navigation',
    'aria-label': 'Main navigation',
    '[attr.data-collapsed-foot]': "userOnlyCollapsed() ? 'user' : null",
    '(mouseenter)': 'ctrl.railEnter()',
    '(mouseleave)': 'ctrl.railLeave()',
  },
})
export class Rail {
  protected readonly ctrl = inject(RailController);

  /** Collapsed foot shows only the user avatar (Help / Privacy hidden). */
  readonly userOnlyCollapsed = input(false, { transform: booleanAttribute });
  readonly userName = input('Chloe Davis');
  readonly userInitials = input('CD');

  /** open → will collapse (contract-left); otherwise → will expand (expand-right). */
  protected readonly toggleIcon = computed(() => (this.ctrl.nav() === 'open' ? 'contract-left' : 'expand-right'));

  constructor() {
    this.ctrl.rail = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  }
}
