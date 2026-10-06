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
import { BowlingAlleyController } from './bowling-alley-controller';
import { EntityTabs } from './entity-tabs';
import { MainTabs } from './main-tabs';
import { RecordTabsDivider } from './record-tabs-divider';

/**
 * BowlingAlley (Figma: "Bowling Alley", 157:2575) — the main navigation: header
 * (logo + collapse toggle), MainTabs, RecordTabsDivider, EntityTabs and the footer
 * (Parse Resume, Help, Privacy, user). States collapsed / hover / open, plus Fast Find
 * mode, are styled from the shell's data-* attributes. Must sit inside
 * `<ats-bowling-alley-shell>`.
 *
 *   <ats-bowling-alley-shell>
 *     <ats-bowling-alley userName="Chloe Davis" userInitials="CD" />
 *     …page content…
 *   </ats-bowling-alley-shell>
 */
@Component({
  selector: 'ats-bowling-alley',
  imports: [Icon, MainTabs, RecordTabsDivider, EntityTabs],
  templateUrl: './bowling-alley.html',
  styleUrl: './bowling-alley.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ats-bowling-alley',
    role: 'navigation',
    'aria-label': 'Main navigation',
    '[attr.data-collapsed-foot]': "userOnlyCollapsed() ? 'user' : null",
    '(mouseenter)': 'ctrl.pointerEnter()',
    '(mouseleave)': 'ctrl.pointerLeave()',
  },
})
export class BowlingAlley {
  protected readonly ctrl = inject(BowlingAlleyController);

  /** Collapsed footer shows only the user avatar (Help / Privacy hidden). */
  readonly userOnlyCollapsed = input(false, { transform: booleanAttribute });
  readonly userName = input('Chloe Davis');
  readonly userInitials = input('CD');

  /** Expanded → collapse (contract-left); collapsed → expand (expand-right). */
  // Pinned open → collapse; collapsed or hover (floating card) → expand-right.
  protected readonly toggleIcon = computed(() => (this.ctrl.nav() === 'open' ? 'contract-left' : 'expand-right'));

  constructor() {
    this.ctrl.alley = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  }
}
